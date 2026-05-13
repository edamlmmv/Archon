import { existsSync } from 'node:fs';
import { countQueue, loadQueue, lockPath, readLock } from './common';

interface StatusPayload {
  status: 'complete' | 'drained_with_blockers' | 'active';
  counts: ReturnType<typeof countQueue>;
  lock: ReturnType<typeof readLock>;
}

function buildPayload(): StatusPayload {
  const queue = loadQueue();
  const counts = countQueue(queue);
  const lock = readLock();
  const activeCount = counts.pending + counts.in_progress + counts.implemented + counts.verified + counts.done;
  const status =
    activeCount === 0 && counts.blocked === 0 && !lock
      ? 'complete'
      : activeCount === 0 && counts.blocked > 0 && !lock
        ? 'drained_with_blockers'
        : 'active';
  return { status, counts, lock };
}

function main(): void {
  const argv = Bun.argv.slice(2);
  const completeWhenDrained = argv.includes('--complete-when-drained');
  const requireAllDone = argv.includes('--require-all-done');
  const requirePending = argv.includes('--require-pending');
  const payload = buildPayload();

  if (requirePending) {
    if (payload.lock) {
      process.stdout.write(`UI_LAB_QUEUE_LOCKED\n${JSON.stringify(payload, null, 2)}\n`);
      process.exitCode = 1;
      return;
    }
    if (payload.counts.pending > 0) {
      process.stdout.write(`UI_LAB_QUEUE_HAS_PENDING\n${JSON.stringify(payload, null, 2)}\n`);
      return;
    }
    process.stdout.write(`UI_LAB_QUEUE_NO_PENDING\n${JSON.stringify(payload, null, 2)}\n`);
    process.exitCode = 1;
    return;
  }

  if (completeWhenDrained) {
    const activeCount =
      payload.counts.pending +
      payload.counts.in_progress +
      payload.counts.implemented +
      payload.counts.verified +
      payload.counts.done;
    if (activeCount === 0 && !existsSync(lockPath)) {
      process.stdout.write(`UI_LAB_QUEUE_DRAINED\n${JSON.stringify(payload, null, 2)}\n`);
      return;
    }
    process.stdout.write(`UI_LAB_QUEUE_ACTIVE\n${JSON.stringify(payload, null, 2)}\n`);
    process.exitCode = 1;
    return;
  }

  if (requireAllDone) {
    if (payload.status === 'complete') {
      process.stdout.write(`UI_LAB_QUEUE_COMPLETE\n${JSON.stringify(payload, null, 2)}\n`);
      return;
    }
    process.stdout.write(`UI_LAB_QUEUE_INCOMPLETE\n${JSON.stringify(payload, null, 2)}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
