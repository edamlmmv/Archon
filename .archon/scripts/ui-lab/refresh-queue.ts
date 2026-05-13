import { existsSync, writeFileSync } from 'node:fs';
import {
  defaultVariantFamilies,
  officialComponents,
  officialShadcnSnapshotDate,
  officialShadcnSource,
  playwrightTestIdFor,
  storybookStoryIdFor,
  targetFileFor,
} from './manifest';
import { loadQueue, queuePath, type QueueDocument, type QueueItem, type QueueStatus } from './common';

function existingItemsById(): Map<string, QueueItem> {
  try {
    return new Map(loadQueue().items.map(item => [item.id, item]));
  } catch {
    return new Map();
  }
}

function resolveStatus(current: QueueItem | undefined, targetFile: string): QueueStatus {
  if (current?.status === 'in_progress' || current?.status === 'verified' || current?.status === 'forge-ready') {
    return current.status;
  }
  if (current?.status === 'blocked') return 'blocked';
  return existsSync(targetFile) ? 'implemented' : 'pending';
}

function buildQueue(): QueueDocument {
  const existing = existingItemsById();
  const items: QueueItem[] = officialComponents.map(component => {
    const current = existing.get(component.id);
    const targetFile = targetFileFor(component.id);
    return {
      id: component.id,
      component: component.id,
      officialName: component.officialName,
      source: `${officialShadcnSource}#${component.id}`,
      category: component.category,
      targetFile,
      variants: {
        density: [...defaultVariantFamilies.density],
        surface: [...defaultVariantFamilies.surface],
        state: [...defaultVariantFamilies.state],
        mode: [...defaultVariantFamilies.mode],
      },
      storybookStoryId: storybookStoryIdFor(component.id),
      playwrightTestId: playwrightTestIdFor(component.id),
      registryItemPath: 'packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json',
      registryDependencies: [...component.registryDependencies],
      forgeEvidencePath: `.archon/bmad/evidence/ui-lab-component-runs/${component.id}.json`,
      status: resolveStatus(current, targetFile),
      attempts: current?.attempts ?? 0,
      lastFailure: current?.lastFailure ?? null,
      artifacts: current?.artifacts ?? [],
      lastUpdated: current?.lastUpdated ?? `${officialShadcnSnapshotDate}T00:00:00.000Z`,
    };
  });
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    items,
  };
}

function main(): void {
  writeFileSync(queuePath, `${JSON.stringify(buildQueue(), null, 2)}\n`, 'utf8');
  process.stdout.write(`Refreshed ${queuePath} with ${officialComponents.length} official shadcn components.\n`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
