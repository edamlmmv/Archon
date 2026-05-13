import { dirname } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  assertLockOwner,
  countQueue,
  currentResultArtifactPath,
  evidenceRunsDir,
  findItem,
  getFlagValue,
  loadCompletionResult,
  loadQueue,
  releaseLock,
  resolveArtifactsDir,
  resolveWorkflowId,
  sanitizeFilePart,
  writeQueue,
  type CompletionResult,
  type QueueItem,
} from './common';

interface CompletionRecord {
  schemaVersion: 1;
  completedAt: string;
  workflowId: string;
  component: string;
  queueItem: QueueItem;
  result: CompletionResult;
}

function resolveResultPath(argv: string[], artifactsDir: string | null): string {
  const explicit = getFlagValue(argv, '--result-file');
  if (explicit) return explicit;
  const inferred = currentResultArtifactPath(artifactsDir);
  if (!inferred) {
    throw new Error('--result-file is required when ARTIFACTS_DIR is unavailable');
  }
  return inferred;
}

function writeEvidence(record: CompletionRecord): string {
  mkdirSync(evidenceRunsDir, { recursive: true });
  const timestamp = record.completedAt.replace(/[:.]/g, '-');
  const filename = `${sanitizeFilePart(record.component)}-${sanitizeFilePart(record.workflowId)}-attempt${record.queueItem.attempts}-${timestamp}.json`;
  const path = `${evidenceRunsDir}/${filename}`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return path;
}

function uniqueArtifacts(paths: string[]): string[] {
  return Array.from(new Set(paths.filter(path => path.trim() !== '')));
}

function main(): void {
  const argv = Bun.argv.slice(2);
  const workflowId = resolveWorkflowId(argv);
  const artifactsDir = resolveArtifactsDir(argv);
  const resultPath = resolveResultPath(argv, artifactsDir);
  const lock = assertLockOwner(workflowId);
  if (!lock.currentItemId) {
    throw new Error('Queue lock has no currentItemId; cannot complete an unknown item');
  }

  const result = loadCompletionResult(resultPath);
  const queue = loadQueue();
  const item = findItem(queue, lock.currentItemId);
  if (!item) throw new Error(`Locked item ${lock.currentItemId} is missing from queue`);
  if (item.component !== result.component) {
    throw new Error(`Completion result component ${result.component} does not match locked component ${item.component}`);
  }

  item.status = result.status === 'done' ? 'forge-ready' : result.status;
  item.lastFailure = result.status === 'blocked' ? result.failureReason : null;
  item.lastUpdated = new Date().toISOString();

  const record: CompletionRecord = {
    schemaVersion: 1,
    completedAt: item.lastUpdated,
    workflowId,
    component: item.component,
    queueItem: { ...item, artifacts: [...item.artifacts] },
    result,
  };
  const evidencePath = writeEvidence(record);
  item.artifacts = uniqueArtifacts([...item.artifacts, resultPath, evidencePath, ...result.artifacts]);

  writeQueue(queue);
  releaseLock(workflowId);

  process.stdout.write(
    `${JSON.stringify(
      {
        status: 'recorded',
        workflowId,
        component: item.component,
        itemStatus: item.status,
        evidencePath,
        counts: countQueue(queue),
      },
      null,
      2
    )}\n`
  );
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
