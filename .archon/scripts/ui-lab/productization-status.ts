import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { uiLabProductizationItems, uiLabProductizationQueuePath } from './manifest';

interface ProductizationQueue {
  schemaVersion: 1;
  items: Array<{
    id: string;
    kind: string;
    status: string;
    webAdoption?: {
      parentId?: string;
      evidenceState: string;
      currentGate: boolean;
    };
  }>;
}

function readQueue(): ProductizationQueue {
  const path = resolve(uiLabProductizationQueuePath);
  if (!existsSync(path)) {
    throw new Error(`Productization queue missing: ${uiLabProductizationQueuePath}`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as ProductizationQueue;
}

function main(): void {
  const argv = Bun.argv.slice(2);
  const requireAllDone = argv.includes('--require-all-done');
  const requireCurrentGate = argv.includes('--require-current-gate');
  const queue = readQueue();
  const counts = queue.items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.status] = (accumulator[item.status] ?? 0) + 1;
    return accumulator;
  }, {});
  const kinds = queue.items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.kind] = (accumulator[item.kind] ?? 0) + 1;
    return accumulator;
  }, {});
  const expectedIds = new Set(uiLabProductizationItems.map(item => item.id));
  const actualIds = new Set(queue.items.map(item => item.id));
  const missing = uiLabProductizationItems.filter(item => !actualIds.has(item.id)).map(item => item.id);
  const unexpected = queue.items.filter(item => !expectedIds.has(item.id)).map(item => item.id);
  const allDone =
    missing.length === 0 &&
    unexpected.length === 0 &&
    queue.items.every(item => item.status === 'forge-ready');
  const coreItems = queue.items.filter(
    item => item.kind !== 'web-adoption' || item.id === 'web-ui-wrapper-adoption'
  );
  const webItems = queue.items.filter(item => item.kind === 'web-adoption');
  const currentGateItems = webItems.filter(item => item.webAdoption?.currentGate === true);
  const futureChildItems = webItems.filter(
    item => item.webAdoption?.parentId === 'web-ui-wrapper-adoption' && item.webAdoption?.currentGate === false
  );
  const coreComplete =
    missing.length === 0 &&
    unexpected.length === 0 &&
    coreItems.every(item => item.status === 'forge-ready');
  const currentGateComplete =
    currentGateItems.length > 0 &&
    currentGateItems.every(
      item => item.status === 'forge-ready' && item.webAdoption?.evidenceState === 'web-adopted'
    );
  const futureChildrenValid = futureChildItems.every(
    item => item.status === 'pending' && item.webAdoption?.evidenceState === 'not-proven'
  );
  const webAdoptionComplete =
    webItems.length > 0 &&
    webItems.every(
      item =>
        item.status === 'forge-ready' &&
        (item.webAdoption?.evidenceState === 'web-adopted' ||
          item.webAdoption?.evidenceState === 'lab-proven')
    );
  const payload = {
    status: allDone ? 'complete' : coreComplete && currentGateComplete ? 'current-gate-complete' : 'active',
    coreProductizationStatus: coreComplete ? 'complete' : 'incomplete',
    webAdoptionStatus: webAdoptionComplete ? 'complete' : 'partial',
    currentGateStatus: coreComplete && currentGateComplete && futureChildrenValid ? 'complete' : 'blocked',
    expected: uiLabProductizationItems.length,
    actual: queue.items.length,
    counts,
    kinds,
    missing,
    unexpected,
    currentGateIds: currentGateItems.map(item => item.id).sort(),
    pendingWebAdoptionIds: webItems.filter(item => item.status === 'pending').map(item => item.id).sort(),
  };

  if (requireAllDone && !allDone) {
    process.stdout.write(`UI_LAB_PRODUCTIZATION_INCOMPLETE\n${JSON.stringify(payload, null, 2)}\n`);
    process.exitCode = 1;
    return;
  }

  if (requireCurrentGate && payload.currentGateStatus !== 'complete') {
    process.stdout.write(`UI_LAB_PRODUCTIZATION_CURRENT_GATE_BLOCKED\n${JSON.stringify(payload, null, 2)}\n`);
    process.exitCode = 1;
    return;
  }

  if (requireCurrentGate) {
    process.stdout.write(`UI_LAB_PRODUCTIZATION_CURRENT_GATE_VALID\n${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  process.stdout.write(`UI_LAB_PRODUCTIZATION_${payload.status.toUpperCase()}\n${JSON.stringify(payload, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
