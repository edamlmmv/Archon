import {
  assertLockOwner,
  countQueue,
  createLock,
  findItem,
  getFlagValue,
  hasFlag,
  loadQueue,
  queuePath,
  readLock,
  releaseLock,
  resolveArtifactsDir,
  resolveWorkflowId,
  writeCurrentItemArtifact,
  writeLock,
  writeQueue,
  writeRalphArtifacts,
  type LockDocument,
  type QueueDocument,
  type QueueItem,
  type QueueStatus,
} from './common';

interface SelectionPayload {
  status: 'selected' | 'resumed' | 'empty';
  workflowId: string;
  queuePath: string;
  item: QueueItem | null;
  currentItemArtifactPath: string | null;
  resultFile: string | null;
  ralphArtifacts: { jsonPath: string; markdownPath: string } | null;
  counts: ReturnType<typeof countQueue>;
  dryRun?: boolean;
}

function resultFilePath(artifactsDir: string | null): string | null {
  if (!artifactsDir) return null;
  return `${artifactsDir}/ui-lab/current-result.json`;
}

function writeSelectionArtifact(
  artifactsDir: string | null,
  payload: SelectionPayload
): string | null {
  return writeCurrentItemArtifact(artifactsDir, payload as unknown as Record<string, unknown>);
}

function resumeOwnedLock(
  workflowId: string,
  lock: LockDocument,
  queue: QueueDocument,
  artifactsDir: string | null
): SelectionPayload {
  if (lock.workflowId !== workflowId) {
    throw new Error(`Queue lock is owned by ${lock.workflowId}; refusing to pick for ${workflowId}`);
  }
  if (!lock.currentItemId) {
    throw new Error('Queue lock is owned by this workflow but has no currentItemId; inspect before continuing');
  }
  const item = findItem(queue, lock.currentItemId);
  if (!item) throw new Error(`Locked item ${lock.currentItemId} is missing from queue`);
  if (item.status !== 'in_progress') {
    throw new Error(`Locked item ${item.id} has status ${item.status}; expected in_progress`);
  }
  const ralphArtifacts = writeRalphArtifacts(item, workflowId);
  const payload: SelectionPayload = {
    status: 'resumed',
    workflowId,
    queuePath,
    item,
    currentItemArtifactPath: null,
    resultFile: resultFilePath(artifactsDir),
    ralphArtifacts,
    counts: countQueue(queue),
  };
  payload.currentItemArtifactPath = writeSelectionArtifact(artifactsDir, payload);
  return payload;
}

const selectableStatuses: ReadonlySet<QueueStatus> = new Set(['pending', 'implemented', 'verified', 'done']);

function isSelectableItem(item: QueueItem): boolean {
  return selectableStatuses.has(item.status);
}

function pickNextItem(
  queue: QueueDocument,
  workflowId: string,
  artifactsDir: string | null,
  dryRun: boolean
): SelectionPayload {
  const item = queue.items.find(isSelectableItem) ?? null;
  if (!item) {
    return {
      status: 'empty',
      workflowId,
      queuePath,
      item: null,
      currentItemArtifactPath: null,
      resultFile: null,
      ralphArtifacts: null,
      counts: countQueue(queue),
      ...(dryRun ? { dryRun: true } : {}),
    };
  }
  if (dryRun) {
    return {
      status: 'selected',
      workflowId,
      queuePath,
      item,
      currentItemArtifactPath: null,
      resultFile: resultFilePath(artifactsDir),
      ralphArtifacts: null,
      counts: countQueue(queue),
      dryRun: true,
    };
  }

  createLock(workflowId, artifactsDir);
  try {
    const lockedQueue = loadQueue();
    const lockedItem = lockedQueue.items.find(isSelectableItem);
    if (!lockedItem) {
      releaseLock(workflowId);
      return {
        status: 'empty',
        workflowId,
        queuePath,
        item: null,
        currentItemArtifactPath: null,
        resultFile: null,
        ralphArtifacts: null,
        counts: countQueue(lockedQueue),
      };
    }

    lockedItem.status = 'in_progress';
    lockedItem.attempts += 1;
    lockedItem.lastFailure = null;
    lockedItem.lastUpdated = new Date().toISOString();

    const lock = assertLockOwner(workflowId);
    writeLock({ ...lock, currentItemId: lockedItem.id });
    const ralphArtifacts = writeRalphArtifacts(lockedItem, workflowId);
    writeQueue(lockedQueue);

    const payload: SelectionPayload = {
      status: 'selected',
      workflowId,
      queuePath,
      item: lockedItem,
      currentItemArtifactPath: null,
      resultFile: resultFilePath(artifactsDir),
      ralphArtifacts,
      counts: countQueue(lockedQueue),
    };
    payload.currentItemArtifactPath = writeSelectionArtifact(artifactsDir, payload);
    return payload;
  } catch (error) {
    try {
      const lock = readLock();
      if (lock?.workflowId === workflowId && !lock.currentItemId) {
        releaseLock(workflowId);
      }
    } catch {
      // Preserve the original failure. A remaining lock is safer than guessing state.
    }
    throw error;
  }
}

function main(): void {
  const argv = Bun.argv.slice(2);
  const dryRun = hasFlag(argv, '--dry-run');
  const workflowId = dryRun ? getFlagValue(argv, '--workflow-id') ?? 'dry-run' : resolveWorkflowId(argv);
  const artifactsDir = resolveArtifactsDir(argv);
  const queue = loadQueue();
  const lock = readLock();

  const payload = lock
    ? resumeOwnedLock(workflowId, lock, queue, artifactsDir)
    : pickNextItem(queue, workflowId, artifactsDir, dryRun);

  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
