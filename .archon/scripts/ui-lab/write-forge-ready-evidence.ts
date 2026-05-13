import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadQueue, nowIso, writeQueue, type QueueItem } from './common';
import {
  uiLabDependencyProfilePath,
  uiLabProductizationEvidencePath,
  uiLabProductizationItems,
  uiLabProductizationQueuePath,
  uiLabWebAdoptionEvidencePath,
  uiLabTemplateEvidencePath,
  uiLabTemplates,
  uiUxPracticeEvidencePath,
  uiUxPracticeProfilePath,
  officialComponents,
  officialShadcnSnapshotDate,
  officialShadcnSource,
  playwrightTestIdFor,
  storybookStoryIdFor,
  uiUxPractices,
  uiUxPracticeSourceBasis,
  uiUxPracticeSourceLabel,
} from './manifest';

type UiUxPracticeId = (typeof uiUxPractices)[number]['id'];

interface CoverageEntry {
  id: string;
  officialName: string;
  category: string;
  source: string;
  targetFile: string;
  storybookStoryId: string;
  playwrightTestId: string;
  registryItemPath: string;
  registryDependencies: string[];
  variants: QueueItem['variants'];
  practiceProfilePath: string;
  practiceEvidencePath: string;
  uiUxPractices: UiUxPracticeId[];
}

interface AgenticSearchIndex {
  schemaVersion: 1;
  generatedAt: string;
  mode: 'advisory-evidence-index';
  authority: 'queue-registry-storybook-playwright-forge-evidence';
  components: Array<{
    id: string;
    officialName: string;
    category: string;
    status: 'forge-ready';
    source: string;
    variants: QueueItem['variants'];
    registryDependencies: string[];
    evidenceRefs: {
      queueItemPath: string;
      registryItemPath: string;
      forgeEvidencePath: string;
      storybookStoryId: string;
      playwrightTestId: string;
      practiceProfilePath: string;
      practiceEvidencePath: string;
    };
    uiUxPractices: UiUxPracticeId[];
  }>;
  templates: Array<{
    id: string;
    name: string;
    category: string;
    templateKind: string;
    status: 'forge-ready';
    targetFile: string;
    registryItemPath: string;
    storybookStoryIds: string[];
    dependencies: string[];
    variantFamilies: QueueItem['variants'];
    evidenceRefs: {
      registryItemPath: string;
      templateEvidencePath: string;
      dependencyProfilePath: string;
      practiceProfilePath: string;
      practiceEvidencePath: string;
      productizationQueuePath: string;
      productizationEvidencePath: string;
    };
    uiUxPractices: UiUxPracticeId[];
  }>;
  productization: Array<{
    id: string;
    kind: string;
    title: string;
    target: string;
    status: string;
    registryItemPath: string;
    dependencies: string[];
    storybookStoryIds: string[];
    playwrightTestIds: string[];
    forgeEvidencePath: string;
    agenticSearchTags: string[];
    webAdoption?: {
      parentId?: string;
      targetFiles: string[];
      requiredImports: string[];
      evidenceState: string;
      currentGate: boolean;
      visualEvidenceRequired: boolean;
      stateEvidence: string[];
    };
  }>;
}

interface UiUxPracticeProfile {
  schemaVersion: 1;
  generatedAt: string;
  mode: 'templating-practice-profile';
  authority: 'general-ui-ux-practices-plus-ui-lab-validation';
  source: {
    label: string;
    basis: string;
    fetchedAt: string;
    evidenceFiles: string[];
  };
  uiLab: {
    officialSnapshotDate: string;
    officialSource: string;
    registryItemPath: string;
    coverageQueuePath: string;
  };
  practices: Array<{
    id: UiUxPracticeId;
    name: string;
    sourceRefs: string[];
    uiLabRule: string;
    forgeTemplateUse: string;
  }>;
  forge: {
    consumption: 'practice-profile-plus-registry-evidence';
    sourceInspectionRequired: false;
    templateUse: string[];
  };
}

interface ForgeEvidence {
  schemaVersion: 1;
  generatedAt: string;
  componentId: string;
  officialName: string;
  status: 'forge-ready';
  storybookStoryId: string;
  playwrightTestId: string;
  registryItemPath: string;
  registryDependencies: string[];
  variants: QueueItem['variants'];
  uiUxPractices: UiUxPracticeId[];
  practiceRefs: {
    profilePath: string;
    evidencePath: string;
  };
  agenticSearch: {
    status: 'indexed';
    indexPath: string;
    evidenceBoundary: 'advisory';
  };
  forge: {
    consumption: 'registry-evidence';
    sourceInspectionRequired: false;
    templateInputs: string[];
    templatePolicies: string[];
  };
  validation: {
    commands: string[];
  };
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface DependencyMap {
  schemaVersion: 1;
  generatedAt: string;
  mode: 'ui-lab-template-dependency-map';
  comparedPackages: string[];
  authority: 'package-json-plus-template-source';
  currentUiLabDependencies: Record<string, string>;
  currentUiLabDevDependencies: Record<string, string>;
  sharedRuntimeDependencies: string[];
  templateDependencies: Array<{
    name: string;
    version: string;
    use: string;
    source: 'ui-lab-package-json';
  }>;
  deferredRuntimeDependencies: Array<{
    name: string;
    version: string;
    source: string;
    reason: string;
  }>;
}

const metadataPath = 'packages/ui-lab/src/metadata/component-coverage.generated.ts';
const storyPath = 'packages/ui-lab/src/stories/full-coverage.stories.tsx';
const agenticSearchIndexPath = '.archon/bmad/ui-lab-agentic-search.index.json';
const queueDocumentPath = '.archon/bmad/ui-lab-components.queue.json';
const uiUxPracticeIds = uiUxPractices.map(practice => practice.id);
const validationCommands = [
  'bun .archon/scripts/ui-lab/validate-web-adoption.ts',
  'bun .archon/scripts/ui-lab/productization-status.ts --require-current-gate',
  'bun run check:ui-lab',
  'bun --filter @archon/ui-lab type-check',
  'bun --filter @archon/ui-lab test-storybook',
  'bun --filter @archon/ui-lab test:e2e',
  'bun --filter @archon/ui-lab registry:build',
  'bun run validate',
];

function ensureParent(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
}

function pascalCase(componentId: string): string {
  return componentId
    .split('-')
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
}

function buildCoverageEntries(items: QueueItem[]): CoverageEntry[] {
  const byId = new Map(items.map(item => [item.id, item]));
  return officialComponents.map(component => {
    const item = byId.get(component.id);
    if (!item) throw new Error(`Queue missing ${component.id}`);
    return {
      id: item.id,
      officialName: item.officialName,
      category: item.category,
      source: item.source,
      targetFile: item.targetFile,
      storybookStoryId: storybookStoryIdFor(item.id),
      playwrightTestId: playwrightTestIdFor(item.id),
      registryItemPath: item.registryItemPath,
      registryDependencies: [...item.registryDependencies],
      variants: item.variants,
      practiceProfilePath: uiUxPracticeProfilePath,
      practiceEvidencePath: uiUxPracticeEvidencePath,
      uiUxPractices: [...uiUxPracticeIds],
    };
  });
}

function writeMetadata(entries: CoverageEntry[]): void {
  const source = `export interface ComponentCoverageEntry {
  id: string;
  officialName: string;
  category: string;
  source: string;
  targetFile: string;
  storybookStoryId: string;
  playwrightTestId: string;
  registryItemPath: string;
  registryDependencies: string[];
  variants: {
    density: string[];
    surface: string[];
    state: string[];
    mode: string[];
  };
  practiceProfilePath: string;
  practiceEvidencePath: string;
  uiUxPractices: string[];
}

export const componentCoverageEntries = ${JSON.stringify(entries, null, 2)} as const satisfies readonly ComponentCoverageEntry[];

export type ComponentCoverageId = (typeof componentCoverageEntries)[number]['id'];

export function getComponentCoverageEntry(componentId: ComponentCoverageId): ComponentCoverageEntry {
  const entry = componentCoverageEntries.find(candidate => candidate.id === componentId);
  if (!entry) throw new Error(\`Unknown component coverage id: \${componentId}\`);
  return entry;
}
`;
  ensureParent(metadataPath);
  writeFileSync(metadataPath, source, 'utf8');
}

function writeStory(entries: CoverageEntry[]): void {
  const exports = entries
    .map(entry => `export const ${pascalCase(entry.id)}: Story = makeCoverageStory('${entry.id}');`)
    .join('\n');
  const source = `import type { Meta, StoryObj } from '@storybook/react-vite';
import { Boxes, Database, FileJson, SearchCheck } from 'lucide-react';

import { Badge as UiBadge } from '@/components/ui/badge';
import { Button as UiButton } from '@/components/ui/button';
import {
  Card as UiCard,
  CardAction as UiCardAction,
  CardContent as UiCardContent,
  CardDescription as UiCardDescription,
  CardFooter as UiCardFooter,
  CardHeader as UiCardHeader,
  CardTitle as UiCardTitle,
} from '@/components/ui/card';
import {
  componentCoverageEntries,
  getComponentCoverageEntry,
  type ComponentCoverageId,
} from '@/metadata/component-coverage.generated';

const meta = {
  title: 'UI Lab/Full Coverage',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function VariantBadges({ values, family }: { values: readonly string[]; family: string }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label={\`\${family} variants\`}>
      {values.map(value => (
        <UiBadge key={value} variant="outline">
          {family}:{value}
        </UiBadge>
      ))}
    </div>
  );
}

function CoverageCard({ componentId }: { componentId: ComponentCoverageId }) {
  const entry = getComponentCoverageEntry(componentId);
  return (
    <UiCard
      data-testid={entry.playwrightTestId}
      data-ui-component={entry.id}
      data-agentic-search="indexed"
      data-registry-item-path={entry.registryItemPath}
      data-storybook-story-id={entry.storybookStoryId}
      data-practice-profile-path={entry.practiceProfilePath}
      data-practice-evidence-path={entry.practiceEvidencePath}
      data-ui-ux-practices={entry.uiUxPractices.join(',')}
      data-variant-density={entry.variants.density.join(',')}
      data-variant-surface={entry.variants.surface.join(',')}
      data-variant-state={entry.variants.state.join(',')}
      data-variant-mode={entry.variants.mode.join(',')}
      className="max-w-3xl"
    >
      <UiCardHeader>
        <UiCardTitle>{entry.officialName}</UiCardTitle>
        <UiCardDescription>
          Generic shadcn registry component with bounded variant metadata, Playwright id, and Forge evidence refs.
        </UiCardDescription>
        <UiCardAction>
          <UiBadge>{entry.category}</UiBadge>
        </UiCardAction>
      </UiCardHeader>
      <UiCardContent className="grid gap-4">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Boxes className="size-4" aria-hidden="true" />
            <span>{entry.targetFile}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileJson className="size-4" aria-hidden="true" />
            <span>{entry.registryItemPath}</span>
          </div>
          <div className="flex items-center gap-2">
            <SearchCheck className="size-4" aria-hidden="true" />
            <span>Agentic Search indexed as advisory evidence.</span>
          </div>
          <div className="flex items-center gap-2">
            <SearchCheck className="size-4" aria-hidden="true" />
            <span>{entry.practiceProfilePath}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="UI/UX practices">
          {entry.uiUxPractices.map(practice => (
            <UiBadge key={practice} variant="outline">
              practice:{practice}
            </UiBadge>
          ))}
        </div>
        <div className="grid gap-3">
          <VariantBadges family="density" values={entry.variants.density} />
          <VariantBadges family="surface" values={entry.variants.surface} />
          <VariantBadges family="state" values={entry.variants.state} />
          <VariantBadges family="mode" values={entry.variants.mode} />
        </div>
        <div className="flex flex-wrap gap-2" aria-label="registry dependencies">
          {entry.registryDependencies.length > 0 ? (
            entry.registryDependencies.map(dependency => (
              <UiBadge key={dependency} variant="secondary">
                dep:{dependency}
              </UiBadge>
            ))
          ) : (
            <UiBadge variant="secondary">dep:none</UiBadge>
          )}
        </div>
      </UiCardContent>
      <UiCardFooter>
        <UiButton variant="outline" size="sm">
          <Database />
          {entry.playwrightTestId}
        </UiButton>
      </UiCardFooter>
    </UiCard>
  );
}

function makeCoverageStory(componentId: ComponentCoverageId): Story {
  const entry = getComponentCoverageEntry(componentId);
  return {
    name: entry.officialName,
    render: () => <CoverageCard componentId={componentId} />,
  };
}

export const AllComponents: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {componentCoverageEntries.map(entry => (
        <CoverageCard key={entry.id} componentId={entry.id} />
      ))}
    </div>
  ),
};

${exports}
`;
  ensureParent(storyPath);
  writeFileSync(storyPath, source, 'utf8');
}

function buildAgenticSearchIndex(entries: CoverageEntry[], items: QueueItem[], generatedAt: string): AgenticSearchIndex {
  const byId = new Map(items.map(item => [item.id, item]));
  return {
    schemaVersion: 1,
    generatedAt,
    mode: 'advisory-evidence-index',
    authority: 'queue-registry-storybook-playwright-forge-evidence',
    components: entries.map(entry => {
      const item = byId.get(entry.id);
      if (!item) throw new Error(`Queue missing ${entry.id}`);
      return {
        id: entry.id,
        officialName: entry.officialName,
        category: entry.category,
        status: 'forge-ready',
        source: entry.source,
        variants: entry.variants,
        registryDependencies: entry.registryDependencies,
        evidenceRefs: {
          queueItemPath: queueDocumentPath,
          registryItemPath: entry.registryItemPath,
          forgeEvidencePath: item.forgeEvidencePath,
          storybookStoryId: entry.storybookStoryId,
          playwrightTestId: entry.playwrightTestId,
          practiceProfilePath: entry.practiceProfilePath,
          practiceEvidencePath: entry.practiceEvidencePath,
        },
        uiUxPractices: entry.uiUxPractices,
      };
    }),
    templates: uiLabTemplates.map(template => ({
      id: template.id,
      name: template.name,
      category: template.category,
      templateKind: template.templateKind,
      status: 'forge-ready',
      targetFile: template.targetFile,
      registryItemPath: template.registryItemPath,
      storybookStoryIds: [...template.storybookStoryIds],
      dependencies: [...template.dependencies],
      variantFamilies: template.variantFamilies,
      evidenceRefs: {
        registryItemPath: template.registryItemPath,
        templateEvidencePath: uiLabTemplateEvidencePath,
        dependencyProfilePath: uiLabDependencyProfilePath,
        practiceProfilePath: uiUxPracticeProfilePath,
        practiceEvidencePath: uiUxPracticeEvidencePath,
        productizationQueuePath: uiLabProductizationQueuePath,
        productizationEvidencePath: uiLabProductizationEvidencePath,
      },
      uiUxPractices: [...uiUxPracticeIds],
    })),
    productization: uiLabProductizationItems.map(item => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      target: item.target,
      status: item.status,
      registryItemPath: item.registryItemPath,
      dependencies: [...item.dependencies],
      storybookStoryIds: [...item.storybookStoryIds],
      playwrightTestIds: [...item.playwrightTestIds],
      forgeEvidencePath: item.forgeEvidencePath,
      agenticSearchTags: [...item.agenticSearchTags],
      webAdoption: item.webAdoption
        ? {
            ...item.webAdoption,
            targetFiles: [...item.webAdoption.targetFiles],
            requiredImports: [...item.webAdoption.requiredImports],
            stateEvidence: [...item.webAdoption.stateEvidence],
          }
        : undefined,
    })),
  };
}

function readPackageJson(path: string): PackageJson {
  return JSON.parse(readFileSync(path, 'utf8')) as PackageJson;
}

function deferredDependencyReason(name: string): string {
  const reasons: Record<string, string> = {
    '@dagrejs/dagre': 'Add when UI-lab ships graph layout templates.',
    '@tanstack/react-query': 'Add when UI-lab ships remote async query/cache templates.',
    '@tanstack/react-virtual': 'Add when UI-lab ships large virtualized list/table templates.',
    '@xyflow/react': 'Add when UI-lab ships editable workflow graph canvas templates.',
    'escape-string-regexp': 'Keep text parsing in app/runtime package until template needs search highlighting.',
    'highlight.js': 'Add with code or markdown preview templates.',
    'mdast-util-find-and-replace': 'Add with markdown editing templates.',
    'mdast-util-from-markdown': 'Add with markdown editing templates.',
    'mdast-util-gfm': 'Add with markdown editing templates.',
    'mdast-util-gfm-autolink-literal': 'Add with markdown editing templates.',
    'mdast-util-gfm-footnote': 'Add with markdown editing templates.',
    'mdast-util-gfm-strikethrough': 'Add with markdown editing templates.',
    'mdast-util-gfm-table': 'Add with markdown editing templates.',
    'mdast-util-gfm-task-list-item': 'Add with markdown editing templates.',
    'mdast-util-newline-to-break': 'Add with markdown editing templates.',
    'mdast-util-to-markdown': 'Add with markdown editing templates.',
    'react-markdown': 'Add with markdown preview templates.',
    'react-router': 'Keep routing in consuming app; registry templates stay router-agnostic.',
    'rehype-highlight': 'Add with code or markdown preview templates.',
    'remark-breaks': 'Add with markdown preview templates.',
    'remark-gfm': 'Add with markdown preview templates.',
    zustand: 'Add when template state must persist across independent blocks.',
  };

  return reasons[name] ?? 'Defer until a template imports and proves this dependency through Storybook and Playwright evidence.';
}

function buildDependencyMap(generatedAt: string): DependencyMap {
  const uiLabPackage = readPackageJson('packages/ui-lab/package.json');
  const runtimePackage = readPackageJson('packages/web/package.json');
  const uiLabDependencies = uiLabPackage.dependencies ?? {};
  const runtimeDependencies = runtimePackage.dependencies ?? {};
  const sharedRuntimeDependencies = Object.keys(runtimeDependencies)
    .filter(name => name in uiLabDependencies)
    .sort();
  const templateDependencyNames = [
    'class-variance-authority',
    'clsx',
    'cmdk',
    'lucide-react',
    'radix-ui',
    'react-hook-form',
    'tailwind-merge',
    'zod',
  ];

  return {
    schemaVersion: 1,
    generatedAt,
    mode: 'ui-lab-template-dependency-map',
    comparedPackages: ['packages/ui-lab/package.json', 'packages/web/package.json'],
    authority: 'package-json-plus-template-source',
    currentUiLabDependencies: uiLabDependencies,
    currentUiLabDevDependencies: uiLabPackage.devDependencies ?? {},
    sharedRuntimeDependencies,
    templateDependencies: templateDependencyNames.map(name => ({
      name,
      version: uiLabDependencies[name] ?? 'missing',
      use:
        name === 'react-hook-form' || name === 'zod'
          ? 'validated form templates'
          : name === 'cmdk'
            ? 'command palette templates'
          : name === 'lucide-react'
            ? 'central icon registry and template actions'
            : name === 'radix-ui'
              ? 'accessible primitive wrappers used by forms and overlays'
              : 'variant/class composition utilities',
      source: 'ui-lab-package-json',
    })),
    deferredRuntimeDependencies: Object.entries(runtimeDependencies)
      .filter(([name]) => !(name in uiLabDependencies) && name !== '@archon/ui-lab')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, version]) => ({
        name,
        version,
        source: 'packages/web/package.json',
        reason: deferredDependencyReason(name),
      })),
  };
}

function writeTemplateEvidence(dependencyMap: DependencyMap): void {
  const templateRows = uiLabTemplates
    .map(
      template =>
        `| \`${template.id}\` | ${template.templateKind} | ${template.storybookStoryIds.map(id => `\`${id}\``).join(', ')} | ${template.playwrightTestIds.map(id => `\`${id}\``).join(', ')} | ${template.dependencies.map(dependency => `\`${dependency}\``).join(', ')} |`
    )
    .join('\n');
  const dependencyRows = dependencyMap.templateDependencies
    .map(dependency => `| \`${dependency.name}\` | ${dependency.version} | ${dependency.use} |`)
    .join('\n');
  const markdown = `# UI-lab Template Pattern Evidence

## Template Registry

| Template | Kind | Storybook evidence | Playwright evidence | Dependencies |
| --- | --- | --- | --- | --- |
${templateRows}

## Dependency Profile

Forge may use \`${uiLabDependencyProfilePath}\` to decide which dependencies are required now and which runtime-package dependencies stay deferred until a template imports them.

| Dependency | Version | Use |
| --- | --- | --- |
${dependencyRows}

## Forge Boundary

Templates expose registry items, Storybook ids, Playwright ids, dependency profile refs, productization queue refs, and UI/UX practice refs. Forge must use those declared refs instead of reading component internals.
`;
  ensureParent(uiLabTemplateEvidencePath);
  writeFileSync(uiLabTemplateEvidencePath, markdown, 'utf8');
}

function writeProductizationEvidence(generatedAt: string): void {
  const queue = {
    schemaVersion: 1,
    generatedAt,
    mode: 'ui-lab-productization-queue',
    authority: 'registry-storybook-playwright-forge-evidence',
    items: uiLabProductizationItems,
  };
  const byKind = uiLabProductizationItems.reduce<Record<string, number>>((counts, item) => {
    counts[item.kind] = (counts[item.kind] ?? 0) + 1;
    return counts;
  }, {});
  const rows = uiLabProductizationItems
    .map(
      item =>
        `| \`${item.id}\` | ${item.kind} | \`${item.target}\` | ${item.webAdoption?.parentId ?? 'root'} | ${item.webAdoption?.evidenceState ?? 'template-ready'} | ${String(item.webAdoption?.currentGate ?? false)} | ${item.storybookStoryIds.map(id => `\`${id}\``).join(', ')} | ${item.status} |`
    )
    .join('\n');
  const markdown = `# UI-lab Productization Evidence

Generated: ${generatedAt}

## Counts

| Kind | Count |
| --- | ---: |
${Object.entries(byKind)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([kind, count]) => `| ${kind} | ${count} |`)
  .join('\n')}

## Queue

| Item | Kind | Target | Parent | Evidence state | Current gate | Storybook evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## Evidence State Labels

- \`template-ready\`: UI-lab template exists and has declared registry/metadata.
- \`lab-proven\`: Storybook, Playwright, registry, or shim evidence proves reusable lab readiness.
- \`web-adopted\`: A Web route consumes approved public UI-lab exports.
- \`not-proven\`: Declared future Web adoption item with no route-level proof yet.

## Forge Boundary

Forge reads \`${uiLabProductizationQueuePath}\`, registry items, Storybook ids, Playwright ids, and dependency evidence. Source internals remain implementation detail.
`;
  ensureParent(uiLabProductizationQueuePath);
  writeFileSync(uiLabProductizationQueuePath, `${JSON.stringify(queue, null, 2)}\n`, 'utf8');
  ensureParent(uiLabProductizationEvidencePath);
  writeFileSync(uiLabProductizationEvidencePath, markdown, 'utf8');
}

function writeWebAdoptionEvidence(generatedAt: string): void {
  const webItems = uiLabProductizationItems.filter(item => item.kind === 'web-adoption');
  const currentGateSummary =
    webItems
      .filter(item => item.webAdoption?.currentGate === true)
      .map(item => `\`${item.id}\``)
      .join(', ') || 'none';
  const rows = webItems
    .map(
      item =>
        `| \`${item.id}\` | ${item.status} | ${item.webAdoption?.evidenceState ?? 'not-proven'} | ${item.webAdoption?.parentId ?? 'rollup'} | ${String(item.webAdoption?.currentGate ?? false)} | ${item.webAdoption?.targetFiles.map(path => `\`${path}\``).join(', ') ?? ''} | ${item.webAdoption?.requiredImports.map(importName => `\`${importName}\``).join(', ') ?? ''} |`
    )
    .join('\n');
  const stateRows = webItems
    .flatMap(item =>
      (item.webAdoption?.stateEvidence ?? []).map(
        state => `| \`${item.id}\` | ${item.webAdoption?.evidenceState ?? 'not-proven'} | ${state} |`
      )
    )
    .join('\n');
  const markdown = `# UI-lab Web Adoption Evidence

Generated: ${generatedAt}

## Scope

This evidence distinguishes reusable UI-lab readiness from actual Web route adoption. The parent \`web-ui-wrapper-adoption\` remains a lab-proven rollup for primitive shims. Current Web adoption gate: ${currentGateSummary}. Workflow builder, workflow execution review, and command palette remain declared future work.

## Adoption Queue

| Item | Status | Evidence state | Parent | Current gate | Target files | Required imports |
| --- | --- | --- | --- | --- | --- | --- |
${rows}

## Settings Route Proof

- Target: \`packages/web/src/routes/SettingsPage.tsx\`
- Approved import source: \`@archon/ui-lab\`
- Approved imports: \`FormShell\`, \`FormSection\`, \`FormRow\`, \`FormActions\`, \`FormSummary\`, \`StatusChip\`, \`useFormProgress\`

## Dashboard Route Proof

- Target: \`packages/web/src/routes/DashboardPage.tsx\`
- Approved import source: \`@archon/ui-lab\`
- Approved imports: \`DashboardShell\`
- Validator: \`bun .archon/scripts/ui-lab/validate-web-adoption.ts\`
- Type gate: \`bun --filter @archon/web type-check\`

## Captured Visual Evidence

- Desktop viewport: \`.archon/bmad/evidence/ui-lab-web-adoption-desktop.png\`
- Mobile viewport: \`.archon/bmad/evidence/ui-lab-web-adoption-mobile.png\`
- Dirty form/readiness state: \`.archon/bmad/evidence/ui-lab-web-adoption-dirty-form.png\`
- Loading and error state: captured during Vite-only Settings route run with API calls unavailable.
- Saved/success state: not forced in the visual run because the backend API was not started; mutation behavior remains owned by Web and is covered by \`bun --filter @archon/web type-check\`.

## State Evidence Requirements

| Item | Evidence state | State evidence |
| --- | --- | --- |
${stateRows}

## Authority Boundary

Agentic Search may index this file as advisory metadata. Forge may consume the queue, evidence labels, target refs, and approved imports. Runtime behavior remains proven by Web validation, UI-lab registry evidence, Storybook, and Playwright artifacts rather than source-internal inference.
`;

  ensureParent(uiLabWebAdoptionEvidencePath);
  writeFileSync(uiLabWebAdoptionEvidencePath, markdown, 'utf8');
}

function buildPracticeProfile(generatedAt: string): UiUxPracticeProfile {
  return {
    schemaVersion: 1,
    generatedAt,
    mode: 'templating-practice-profile',
    authority: 'general-ui-ux-practices-plus-ui-lab-validation',
    source: {
      label: uiUxPracticeSourceLabel,
      basis: uiUxPracticeSourceBasis,
      fetchedAt: generatedAt,
      evidenceFiles: [
        'ui-lab full shadcn coverage queue',
        'ui-lab Storybook full coverage stories',
        'ui-lab Playwright catalog and keyboard tests',
        'ui-lab shadcn registry metadata',
        'ui-lab template pattern evidence',
        'ui-lab dependency profile',
        'ui-lab productization queue',
        'ui-lab productization evidence',
        'ui-lab Web adoption evidence',
        'Capability Pack Forge evidence contract',
      ],
    },
    uiLab: {
      officialSnapshotDate: officialShadcnSnapshotDate,
      officialSource: officialShadcnSource,
      registryItemPath: 'packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json',
      coverageQueuePath: queueDocumentPath,
    },
    practices: uiUxPractices.map(practice => ({
      id: practice.id,
      name: practice.name,
      sourceRefs: [...practice.sourceRefs],
      uiLabRule: practice.uiLabRule,
      forgeTemplateUse: practice.forgeTemplateUse,
    })),
    forge: {
      consumption: 'practice-profile-plus-registry-evidence',
      sourceInspectionRequired: false,
      templateUse: uiUxPractices.map(practice => practice.forgeTemplateUse),
    },
  };
}

function writePracticeEvidence(profile: UiUxPracticeProfile): void {
  const practiceRows = profile.practices
    .map(
      practice =>
        `| \`${practice.id}\` | ${practice.name} | ${practice.uiLabRule} | ${practice.forgeTemplateUse} |`
    )
    .join('\n');
  const markdown = `# UI-lab UI/UX Practice Evidence

## Source

- Source: ${profile.source.label}
- Basis: ${profile.source.basis}
- Fetched at: ${profile.source.fetchedAt}
- Practice profile: \`${uiUxPracticeProfilePath}\`

## Applied UI-lab Contract

This profile captures broad UI/UX practices for component and template generation. It is cross-library guidance backed by UI-lab registry, Storybook, Playwright, and Forge evidence.

| Practice id | Name | UI-lab rule | Forge template use |
| --- | --- | --- | --- |
${practiceRows}

## Forge Boundary

Forge may consume the practice profile, queue, registry, Storybook ids, Playwright ids, and per-component evidence. Forge must not read UI-lab source internals to infer template readiness.
`;
  ensureParent(uiUxPracticeEvidencePath);
  writeFileSync(uiUxPracticeEvidencePath, markdown, 'utf8');
}

function buildForgeEvidence(entry: CoverageEntry, item: QueueItem, generatedAt: string): ForgeEvidence {
  return {
    schemaVersion: 1,
    generatedAt,
    componentId: entry.id,
    officialName: entry.officialName,
    status: 'forge-ready',
    storybookStoryId: entry.storybookStoryId,
    playwrightTestId: entry.playwrightTestId,
    registryItemPath: entry.registryItemPath,
    registryDependencies: entry.registryDependencies,
    variants: entry.variants,
    uiUxPractices: entry.uiUxPractices,
    practiceRefs: {
      profilePath: entry.practiceProfilePath,
      evidencePath: entry.practiceEvidencePath,
    },
    agenticSearch: {
      status: 'indexed',
      indexPath: agenticSearchIndexPath,
      evidenceBoundary: 'advisory',
    },
    forge: {
      consumption: 'registry-evidence',
      sourceInspectionRequired: false,
      templateInputs: [
        item.targetFile,
        entry.registryItemPath,
        entry.storybookStoryId,
        entry.playwrightTestId,
        agenticSearchIndexPath,
        entry.practiceProfilePath,
        entry.practiceEvidencePath,
      ],
      templatePolicies: uiUxPractices.map(practice => practice.forgeTemplateUse),
    },
    validation: {
      commands: validationCommands,
    },
  };
}

function markQueueReady(items: QueueItem[], generatedAt: string): void {
  for (const item of items) {
    item.storybookStoryId = storybookStoryIdFor(item.id);
    item.playwrightTestId = playwrightTestIdFor(item.id);
    item.status = 'forge-ready';
    item.lastFailure = null;
    item.lastUpdated = generatedAt;
    item.artifacts = [
      item.forgeEvidencePath,
      agenticSearchIndexPath,
      metadataPath,
      storyPath,
      'packages/ui-lab/tests/storybook-catalog.test.ts',
      uiUxPracticeProfilePath,
      uiUxPracticeEvidencePath,
      uiLabDependencyProfilePath,
      uiLabTemplateEvidencePath,
      uiLabProductizationQueuePath,
      uiLabProductizationEvidencePath,
      uiLabWebAdoptionEvidencePath,
    ];
  }
}

function main(): void {
  const queue = loadQueue();
  const generatedAt = nowIso();
  const entries = buildCoverageEntries(queue.items);
  writeMetadata(entries);
  writeStory(entries);
  const practiceProfile = buildPracticeProfile(generatedAt);
  ensureParent(uiUxPracticeProfilePath);
  writeFileSync(uiUxPracticeProfilePath, `${JSON.stringify(practiceProfile, null, 2)}\n`, 'utf8');
  writePracticeEvidence(practiceProfile);
  const dependencyMap = buildDependencyMap(generatedAt);
  ensureParent(uiLabDependencyProfilePath);
  writeFileSync(uiLabDependencyProfilePath, `${JSON.stringify(dependencyMap, null, 2)}\n`, 'utf8');
  writeTemplateEvidence(dependencyMap);
  writeProductizationEvidence(generatedAt);
  writeWebAdoptionEvidence(generatedAt);
  const index = buildAgenticSearchIndex(entries, queue.items, generatedAt);
  writeFileSync(agenticSearchIndexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  for (const entry of entries) {
    const item = queue.items.find(candidate => candidate.id === entry.id);
    if (!item) throw new Error(`Queue missing ${entry.id}`);
    ensureParent(item.forgeEvidencePath);
    writeFileSync(item.forgeEvidencePath, `${JSON.stringify(buildForgeEvidence(entry, item, generatedAt), null, 2)}\n`, 'utf8');
  }
  markQueueReady(queue.items, generatedAt);
  queue.updatedAt = generatedAt;
  writeQueue(queue);
  process.stdout.write(`UI-lab Forge-ready evidence written for ${entries.length} components.\n`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
