import { readLock, releaseLock, resolveWorkflowId } from './common';

function main(): void {
  const workflowId = resolveWorkflowId(Bun.argv.slice(2));
  const before = readLock();
  const status = releaseLock(workflowId);
  process.stdout.write(
    `${JSON.stringify(
      {
        status,
        workflowId,
        releasedLock: before,
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
