import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadQueue } from './common';
import { validateWebAdoption } from './validate-web-adoption';
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
  targetFileFor,
  uiUxPractices,
  uiUxPracticeSourceBasis,
  uiUxPracticeSourceLabel,
} from './manifest';

interface RegistryItemFile {
  path: string;
  type: string;
  target?: string;
}

interface RegistryItem {
  name: string;
  type: string;
  files?: RegistryItemFile[];
  registryDependencies?: string[];
}

interface RegistryIndex {
  name: string;
  items: RegistryItem[];
}

interface AgenticSearchEvidenceRefs {
  queueItemPath: string;
  registryItemPath: string;
  forgeEvidencePath: string;
  storybookStoryId: string;
  playwrightTestId: string;
  practiceProfilePath: string;
  practiceEvidencePath: string;
}

interface AgenticSearchComponent {
  id: string;
  officialName: string;
  category: string;
  status: 'forge-ready';
  source: string;
  variants: {
    density: string[];
    surface: string[];
    state: string[];
    mode: string[];
  };
  registryDependencies: string[];
  evidenceRefs: AgenticSearchEvidenceRefs;
  uiUxPractices: string[];
}

interface AgenticSearchIndex {
  schemaVersion: 1;
  mode: 'advisory-evidence-index';
  authority: 'queue-registry-storybook-playwright-forge-evidence';
  components: AgenticSearchComponent[];
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
    variantFamilies: {
      density: string[];
      surface: string[];
      state: string[];
      mode: string[];
    };
    evidenceRefs: {
      registryItemPath: string;
      templateEvidencePath: string;
      dependencyProfilePath: string;
      practiceProfilePath: string;
      practiceEvidencePath: string;
      productizationQueuePath: string;
      productizationEvidencePath: string;
    };
    uiUxPractices: string[];
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

interface ForgeEvidence {
  schemaVersion: 1;
  componentId: string;
  status: 'forge-ready';
  storybookStoryId: string;
  playwrightTestId: string;
  registryItemPath: string;
  uiUxPractices: string[];
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

interface UiUxPracticeProfile {
  schemaVersion: 1;
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
    id: string;
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

interface DependencyMap {
  schemaVersion: 1;
  mode: 'ui-lab-template-dependency-map';
  comparedPackages: string[];
  authority: 'package-json-plus-template-source';
  currentUiLabDependencies: Record<string, string>;
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

interface ProductizationQueue {
  schemaVersion: 1;
  mode: 'ui-lab-productization-queue';
  authority: 'registry-storybook-playwright-forge-evidence';
  items: Array<{
    id: string;
    kind: string;
    target: string;
    registryItemPath: string;
    registryDependencies: string[];
    dependencies: string[];
    storybookStoryIds: string[];
    playwrightTestIds: string[];
    forgeEvidencePath: string;
    agenticSearchTags: string[];
    status: string;
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

const uiUxPracticeIds = uiUxPractices.map(practice => practice.id);

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort();
}

function sameStringSet(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify(sorted(left)) === JSON.stringify(sorted(right));
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function assertQueueCoverage(): void {
  const queue = loadQueue();
  const expectedIds = officialComponents.map(component => component.id).sort();
  const actualIds = queue.items.map(item => item.id).sort();
  assert(actualIds.length === expectedIds.length, `queue must contain ${expectedIds.length} items, found ${actualIds.length}`);
  assert(JSON.stringify(actualIds) === JSON.stringify(expectedIds), 'queue ids must match official shadcn snapshot exactly');

  const seen = new Set<string>();
  for (const item of queue.items) {
    const official = officialComponents.find(component => component.id === item.id);
    assert(Boolean(official), `queue item ${item.id} is not in official shadcn snapshot`);
    assert(!seen.has(item.id), `duplicate queue item ${item.id}`);
    seen.add(item.id);
    assert(item.component === item.id, `${item.id} component must match id`);
    assert(item.targetFile === targetFileFor(item.id), `${item.id} targetFile must be ${targetFileFor(item.id)}`);
    assert(existsSync(resolve(item.targetFile)), `${item.id} target file missing: ${item.targetFile}`);
    assert(item.status !== 'pending', `${item.id} has stale pending status even though its target file exists`);
    assert(item.status !== 'done', `${item.id} uses stale done status; use forge-ready after evidence is written`);
    assert(item.status === 'forge-ready', `${item.id} must be forge-ready before UI-lab full-coverage validation passes`);
    assert(item.storybookStoryId === storybookStoryIdFor(item.id), `${item.id} storybookStoryId must be ${storybookStoryIdFor(item.id)}`);
    assert(item.playwrightTestId === playwrightTestIdFor(item.id), `${item.id} playwrightTestId must be ${playwrightTestIdFor(item.id)}`);
    assert(item.registryItemPath.endsWith('archon-ui-core/registry-item.json'), `${item.id} registryItemPath must point to archon-ui-core`);
    assert(item.forgeEvidencePath.includes(item.id), `${item.id} forgeEvidencePath must include component id`);
    assert(
      sameStringSet(item.registryDependencies, official?.registryDependencies ?? []),
      `${item.id} registryDependencies must match manifest metadata`
    );
    if (item.status === 'forge-ready') {
      assert(existsSync(resolve(item.forgeEvidencePath)), `${item.id} forge-ready evidence missing: ${item.forgeEvidencePath}`);
    }
  }
}

function assertRegistryCoverage(): void {
  const registry = readJson<RegistryIndex>('packages/ui-lab/registry.json');
  const core = readJson<RegistryItem>('packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json');
  assert(registry.name === 'archon-ui-lab', 'registry name must be archon-ui-lab');
  assert(registry.items.some(item => item.name === 'archon-ui-core'), 'registry must expose archon-ui-core');
  for (const template of uiLabTemplates) {
    assert(registry.items.some(item => item.name === template.id), `registry must expose template ${template.id}`);
    assert(existsSync(resolve(template.targetFile)), `${template.id} target file missing: ${template.targetFile}`);
    assert(existsSync(resolve(template.registryItemPath)), `${template.id} registry item missing: ${template.registryItemPath}`);
  }
  assert(Array.isArray(core.files), 'archon-ui-core registry item must declare files');
  const expectedRegistryDependencies = sorted([...new Set(officialComponents.flatMap(component => component.registryDependencies))]);
  assert(
    sameStringSet(core.registryDependencies ?? [], expectedRegistryDependencies),
    'archon-ui-core registryDependencies must cover all component dependency metadata'
  );
  const filePaths = new Set(core.files?.map(file => file.path));
  for (const component of officialComponents) {
    const targetFile = `src/components/ui/${component.id}.tsx`;
    assert(filePaths.has(targetFile), `archon-ui-core registry item missing ${targetFile}`);
  }
  for (const expectedFile of [
    'src/components/common/form-layout.tsx',
    'src/components/common/status-chip.tsx',
    'src/components/icons/ui-lab-icons.tsx',
    'src/hooks/use-disclosure.ts',
    'src/hooks/use-form-progress.ts',
    'src/hooks/use-mobile.ts',
  ]) {
    assert(filePaths.has(expectedFile), `archon-ui-core registry item missing ${expectedFile}`);
  }
}

function assertUiUxPracticeProfile(): void {
  assert(existsSync(resolve(uiUxPracticeProfilePath)), `UI/UX practice profile missing: ${uiUxPracticeProfilePath}`);
  assert(existsSync(resolve(uiUxPracticeEvidencePath)), `UI/UX practice evidence missing: ${uiUxPracticeEvidencePath}`);

  const profile = readJson<UiUxPracticeProfile>(uiUxPracticeProfilePath);
  assert(profile.schemaVersion === 1, 'UI/UX practice profile schemaVersion must be 1');
  assert(profile.mode === 'templating-practice-profile', 'UI/UX practice profile mode mismatch');
  assert(
    profile.authority === 'general-ui-ux-practices-plus-ui-lab-validation',
    'UI/UX practice profile authority mismatch'
  );
  assert(profile.source.label === uiUxPracticeSourceLabel, 'UI/UX practice profile source label mismatch');
  assert(profile.source.basis === uiUxPracticeSourceBasis, 'UI/UX practice profile source basis mismatch');
  assert(
    profile.source.evidenceFiles.includes('ui-lab Storybook full coverage stories'),
    'UI/UX practice profile must reference Storybook evidence'
  );
  assert(
    profile.source.evidenceFiles.includes('ui-lab Playwright catalog and keyboard tests'),
    'UI/UX practice profile must reference Playwright evidence'
  );
  assert(
    profile.source.evidenceFiles.includes('ui-lab template pattern evidence'),
    'UI/UX practice profile must reference template pattern evidence'
  );
  assert(
    profile.source.evidenceFiles.includes('ui-lab dependency profile'),
    'UI/UX practice profile must reference dependency profile'
  );
  assert(profile.uiLab.officialSnapshotDate === officialShadcnSnapshotDate, 'UI/UX practice profile snapshot date mismatch');
  assert(profile.uiLab.officialSource === officialShadcnSource, 'UI/UX practice profile official source mismatch');
  assert(
    profile.uiLab.registryItemPath === 'packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json',
    'UI/UX practice profile registry item path mismatch'
  );
  assert(profile.uiLab.coverageQueuePath === '.archon/bmad/ui-lab-components.queue.json', 'UI/UX practice profile queue path mismatch');
  assert(sameStringSet(profile.practices.map(practice => practice.id), uiUxPracticeIds), 'UI/UX practice ids mismatch');
  for (const manifestPractice of uiUxPractices) {
    const profilePractice = profile.practices.find(practice => practice.id === manifestPractice.id);
    assert(Boolean(profilePractice), `UI/UX practice profile missing ${manifestPractice.id}`);
    assert(profilePractice?.name === manifestPractice.name, `${manifestPractice.id} practice name mismatch`);
    assert(
      sameStringSet(profilePractice?.sourceRefs ?? [], manifestPractice.sourceRefs),
      `${manifestPractice.id} source refs mismatch`
    );
    assert(profilePractice?.uiLabRule === manifestPractice.uiLabRule, `${manifestPractice.id} UI-lab rule mismatch`);
    assert(
      profilePractice?.forgeTemplateUse === manifestPractice.forgeTemplateUse,
      `${manifestPractice.id} Forge template use mismatch`
    );
  }
  assert(
    profile.forge.consumption === 'practice-profile-plus-registry-evidence',
    'UI/UX practice profile Forge consumption mismatch'
  );
  assert(profile.forge.sourceInspectionRequired === false, 'UI/UX practice profile must not require source inspection');
  assert(profile.forge.templateUse.length === uiUxPracticeIds.length, 'UI/UX practice profile templateUse coverage mismatch');
}

function assertTemplateAndDependencyEvidence(): void {
  assert(existsSync(resolve(uiLabDependencyProfilePath)), `UI-lab dependency profile missing: ${uiLabDependencyProfilePath}`);
  assert(existsSync(resolve(uiLabTemplateEvidencePath)), `UI-lab template evidence missing: ${uiLabTemplateEvidencePath}`);
  assert(
    existsSync(resolve(uiLabProductizationQueuePath)),
    `UI-lab productization queue missing: ${uiLabProductizationQueuePath}`
  );
  assert(
    existsSync(resolve(uiLabProductizationEvidencePath)),
    `UI-lab productization evidence missing: ${uiLabProductizationEvidencePath}`
  );
  assert(
    existsSync(resolve(uiLabWebAdoptionEvidencePath)),
    `UI-lab Web adoption evidence missing: ${uiLabWebAdoptionEvidencePath}`
  );

  const dependencyMap = readJson<DependencyMap>(uiLabDependencyProfilePath);
  assert(dependencyMap.schemaVersion === 1, 'dependency profile schemaVersion must be 1');
  assert(dependencyMap.mode === 'ui-lab-template-dependency-map', 'dependency profile mode mismatch');
  assert(dependencyMap.authority === 'package-json-plus-template-source', 'dependency profile authority mismatch');
  assert(
    dependencyMap.comparedPackages.includes('packages/web/package.json'),
    'dependency profile must compare runtime UI package dependencies'
  );
  for (const requiredDependency of ['react-hook-form', 'zod', 'lucide-react']) {
    assert(
      dependencyMap.templateDependencies.some(dependency => dependency.name === requiredDependency),
      `dependency profile missing required template dependency ${requiredDependency}`
    );
  }
  assert(
    dependencyMap.templateDependencies.some(dependency => dependency.name === 'cmdk'),
    'dependency profile missing command palette dependency cmdk'
  );
  assert(
    dependencyMap.deferredRuntimeDependencies.some(dependency => dependency.name === '@tanstack/react-query'),
    'dependency profile must explicitly defer query dependency until async templates use it'
  );

  const productizationQueue = readJson<ProductizationQueue>(uiLabProductizationQueuePath);
  assert(productizationQueue.schemaVersion === 1, 'productization queue schemaVersion must be 1');
  assert(productizationQueue.mode === 'ui-lab-productization-queue', 'productization queue mode mismatch');
  assert(
    productizationQueue.authority === 'registry-storybook-playwright-forge-evidence',
    'productization queue authority mismatch'
  );
  assert(
    productizationQueue.items.length === uiLabProductizationItems.length,
    'productization queue must match manifest item count'
  );
  const queueById = new Map(productizationQueue.items.map(item => [item.id, item]));
  for (const expected of uiLabProductizationItems) {
    const actual = queueById.get(expected.id);
    assert(Boolean(actual), `productization queue missing ${expected.id}`);
    assert(actual?.kind === expected.kind, `${expected.id} productization kind mismatch`);
    assert(actual?.target === expected.target, `${expected.id} productization target mismatch`);
    assert(actual?.status === expected.status, `${expected.id} productization status mismatch`);
    assert(actual?.registryItemPath === expected.registryItemPath, `${expected.id} productization registry path mismatch`);
    assert(
      sameStringSet(actual?.registryDependencies ?? [], expected.registryDependencies),
      `${expected.id} productization registryDependencies mismatch`
    );
    assert(
      sameStringSet(actual?.dependencies ?? [], expected.dependencies),
      `${expected.id} productization dependencies mismatch`
    );
    assert(
      sameStringSet(actual?.storybookStoryIds ?? [], expected.storybookStoryIds),
      `${expected.id} productization Storybook ids mismatch`
    );
    assert(
      sameStringSet(actual?.playwrightTestIds ?? [], expected.playwrightTestIds),
      `${expected.id} productization Playwright ids mismatch`
    );
    assert(
      actual?.forgeEvidencePath === expected.forgeEvidencePath,
      `${expected.id} productization Forge evidence path mismatch`
    );
    assert(
      sameStringSet(actual?.agenticSearchTags ?? [], expected.agenticSearchTags),
      `${expected.id} productization Agentic Search tags mismatch`
    );

    if (expected.webAdoption) {
      assert(Boolean(actual?.webAdoption), `${expected.id} productization web adoption metadata missing`);
      assert(
        actual?.webAdoption?.parentId === expected.webAdoption.parentId,
        `${expected.id} productization web adoption parent mismatch`
      );
      assert(
        sameStringSet(actual?.webAdoption?.targetFiles ?? [], expected.webAdoption.targetFiles),
        `${expected.id} productization web adoption targets mismatch`
      );
      assert(
        sameStringSet(actual?.webAdoption?.requiredImports ?? [], expected.webAdoption.requiredImports),
        `${expected.id} productization web adoption imports mismatch`
      );
      assert(
        actual?.webAdoption?.evidenceState === expected.webAdoption.evidenceState,
        `${expected.id} productization web adoption evidence state mismatch`
      );
      assert(
        actual?.webAdoption?.currentGate === expected.webAdoption.currentGate,
        `${expected.id} productization web adoption current gate mismatch`
      );
      assert(
        actual?.webAdoption?.visualEvidenceRequired === expected.webAdoption.visualEvidenceRequired,
        `${expected.id} productization web adoption visual evidence flag mismatch`
      );
      assert(
        sameStringSet(actual?.webAdoption?.stateEvidence ?? [], expected.webAdoption.stateEvidence),
        `${expected.id} productization web adoption state evidence mismatch`
      );

      if (expected.webAdoption.currentGate) {
        assert(expected.status === 'forge-ready', `${expected.id} current gate must be forge-ready`);
        assert(
          expected.webAdoption.evidenceState === 'web-adopted',
          `${expected.id} current gate must be web-adopted`
        );
      } else if (
        expected.webAdoption.parentId === 'web-ui-wrapper-adoption' &&
        expected.webAdoption.evidenceState === 'web-adopted'
      ) {
        assert(expected.status === 'forge-ready', `${expected.id} adopted web item must be forge-ready`);
      } else if (expected.webAdoption.parentId === 'web-ui-wrapper-adoption') {
        assert(expected.status === 'pending', `${expected.id} future web adoption item must remain pending`);
        assert(
          expected.webAdoption.evidenceState === 'not-proven',
          `${expected.id} future web adoption item must remain not-proven`
        );
      }
    }
  }
}

function assertForgeAwareness(): void {
  const forgeRequest = readJson<{ evidenceRefs?: string[]; guardrails?: string[] }>('.archon/bmad/ui-stack-forge.request.json');
  const registry = readJson<{ profiles?: Array<{ capabilityId?: string; evidenceRefs?: string[] }> }>(
    '.archon/bmad/capability-profile-registry.ui-stack.json'
  );
  assert(forgeRequest.evidenceRefs?.includes('packages/ui-lab/registry.json') ?? false, 'Forge request must reference UI-lab registry');
  assert(
    forgeRequest.evidenceRefs?.includes('.archon/bmad/evidence/ui-lab-coverage.md') ?? false,
    'Forge request must reference UI-lab coverage evidence'
  );
  assert(
    forgeRequest.evidenceRefs?.includes('.archon/bmad/ui-lab-agentic-search.index.json') ?? false,
    'Forge request must reference UI-lab Agentic Search index'
  );
  assert(
    forgeRequest.evidenceRefs?.includes(uiUxPracticeProfilePath) ?? false,
    'Forge request must reference UI-lab UI/UX practice profile'
  );
  assert(
    forgeRequest.evidenceRefs?.includes(uiUxPracticeEvidencePath) ?? false,
    'Forge request must reference UI-lab UI/UX practice evidence'
  );
  assert(
    forgeRequest.evidenceRefs?.includes(uiLabDependencyProfilePath) ?? false,
    'Forge request must reference UI-lab dependency profile'
  );
  assert(
    forgeRequest.evidenceRefs?.includes(uiLabTemplateEvidencePath) ?? false,
    'Forge request must reference UI-lab template evidence'
  );
  assert(
    forgeRequest.evidenceRefs?.includes(uiLabProductizationQueuePath) ?? false,
    'Forge request must reference UI-lab productization queue'
  );
  assert(
    forgeRequest.evidenceRefs?.includes(uiLabProductizationEvidencePath) ?? false,
    'Forge request must reference UI-lab productization evidence'
  );
  assert(
    forgeRequest.evidenceRefs?.includes(uiLabWebAdoptionEvidencePath) ?? false,
    'Forge request must reference UI-lab Web adoption evidence'
  );
  assert(
    forgeRequest.guardrails?.some(guardrail => guardrail.includes('No custom UI-lab MCP')) ?? false,
    'Forge guardrails must defer custom UI-lab MCP'
  );
  assert(
    registry.profiles?.some(profile => profile.capabilityId === 'archon.ui-lab.registry.full-coverage') ?? false,
    'Capability registry must expose full UI-lab registry coverage'
  );
  assert(
    registry.profiles?.some(profile => profile.capabilityId === 'archon.ui-lab.templating-practices.ui-ux') ?? false,
    'Capability registry must expose UI-lab UI/UX templating practices'
  );
}

function assertAgenticSearchIndex(): void {
  const queue = loadQueue();
  const indexPath = '.archon/bmad/ui-lab-agentic-search.index.json';
  const index = readJson<AgenticSearchIndex>(indexPath);
  assert(index.schemaVersion === 1, 'Agentic Search index schemaVersion must be 1');
  assert(index.mode === 'advisory-evidence-index', 'Agentic Search index must be advisory evidence');
  assert(
    index.authority === 'queue-registry-storybook-playwright-forge-evidence',
    'Agentic Search index authority must name queue, registry, Storybook, Playwright, and Forge evidence'
  );
  assert(index.components.length === officialComponents.length, 'Agentic Search index must cover all official components');
  assert(index.templates.length === uiLabTemplates.length, 'Agentic Search index must cover all UI-lab templates');
  assert(
    index.productization.length === uiLabProductizationItems.length,
    'Agentic Search index must cover all UI-lab productization items'
  );

  const indexedById = new Map(index.components.map(component => [component.id, component]));
  for (const item of queue.items) {
    const indexed = indexedById.get(item.id);
    assert(Boolean(indexed), `Agentic Search index missing ${item.id}`);
    assert(indexed?.officialName === item.officialName, `${item.id} Agentic Search officialName mismatch`);
    assert(indexed?.category === item.category, `${item.id} Agentic Search category mismatch`);
    assert(indexed?.status === 'forge-ready', `${item.id} Agentic Search status must be forge-ready`);
    assert(
      sameStringSet(indexed?.registryDependencies ?? [], item.registryDependencies),
      `${item.id} Agentic Search registryDependencies mismatch`
    );
    assert(
      JSON.stringify(indexed?.variants) === JSON.stringify(item.variants),
      `${item.id} Agentic Search variants must match queue variants`
    );
    assert(
      sameStringSet(indexed?.uiUxPractices ?? [], uiUxPracticeIds),
      `${item.id} Agentic Search UI/UX practices mismatch`
    );
    assert(
      indexed?.evidenceRefs.queueItemPath === '.archon/bmad/ui-lab-components.queue.json',
      `${item.id} Agentic Search queue evidence path mismatch`
    );
    assert(
      indexed?.evidenceRefs.registryItemPath === item.registryItemPath,
      `${item.id} Agentic Search registry evidence path mismatch`
    );
    assert(
      indexed?.evidenceRefs.forgeEvidencePath === item.forgeEvidencePath,
      `${item.id} Agentic Search forge evidence path mismatch`
    );
    assert(
      indexed?.evidenceRefs.storybookStoryId === item.storybookStoryId,
      `${item.id} Agentic Search Storybook evidence mismatch`
    );
    assert(
      indexed?.evidenceRefs.playwrightTestId === item.playwrightTestId,
      `${item.id} Agentic Search Playwright evidence mismatch`
    );
    assert(
      indexed?.evidenceRefs.practiceProfilePath === uiUxPracticeProfilePath,
      `${item.id} Agentic Search practice profile evidence mismatch`
    );
    assert(
      indexed?.evidenceRefs.practiceEvidencePath === uiUxPracticeEvidencePath,
      `${item.id} Agentic Search practice markdown evidence mismatch`
    );

    const evidence = readJson<ForgeEvidence>(item.forgeEvidencePath);
    assert(evidence.schemaVersion === 1, `${item.id} forge evidence schemaVersion must be 1`);
    assert(evidence.componentId === item.id, `${item.id} forge evidence componentId mismatch`);
    assert(evidence.status === 'forge-ready', `${item.id} forge evidence status must be forge-ready`);
    assert(evidence.storybookStoryId === item.storybookStoryId, `${item.id} forge evidence Storybook id mismatch`);
    assert(evidence.playwrightTestId === item.playwrightTestId, `${item.id} forge evidence Playwright id mismatch`);
    assert(evidence.registryItemPath === item.registryItemPath, `${item.id} forge evidence registry path mismatch`);
    assert(sameStringSet(evidence.uiUxPractices, uiUxPracticeIds), `${item.id} forge evidence UI/UX practices mismatch`);
    assert(evidence.practiceRefs.profilePath === uiUxPracticeProfilePath, `${item.id} forge evidence practice profile mismatch`);
    assert(evidence.practiceRefs.evidencePath === uiUxPracticeEvidencePath, `${item.id} forge evidence practice evidence mismatch`);
    assert(evidence.agenticSearch.status === 'indexed', `${item.id} forge evidence must mark Agentic Search indexed`);
    assert(evidence.agenticSearch.indexPath === indexPath, `${item.id} forge evidence Agentic Search index path mismatch`);
    assert(evidence.agenticSearch.evidenceBoundary === 'advisory', `${item.id} Agentic Search boundary must be advisory`);
    assert(evidence.forge.consumption === 'registry-evidence', `${item.id} Forge consumption must be registry-evidence`);
    assert(evidence.forge.sourceInspectionRequired === false, `${item.id} Forge must not require source inspection`);
    assert(
      evidence.forge.templateInputs.includes(uiUxPracticeProfilePath),
      `${item.id} Forge template inputs must include UI/UX practice profile`
    );
    assert(
      evidence.forge.templateInputs.includes(uiUxPracticeEvidencePath),
      `${item.id} Forge template inputs must include UI/UX practice evidence`
    );
    assert(
      evidence.forge.templatePolicies.length === uiUxPracticeIds.length,
      `${item.id} Forge template policies must cover all UI/UX practices`
    );
    assert(
      evidence.validation.commands.includes('bun --filter @archon/ui-lab test:e2e'),
      `${item.id} forge evidence must include Playwright validation command`
    );
  }

  const indexedTemplatesById = new Map(index.templates.map(template => [template.id, template]));
  for (const template of uiLabTemplates) {
    const indexed = indexedTemplatesById.get(template.id);
    assert(Boolean(indexed), `Agentic Search index missing template ${template.id}`);
    assert(indexed?.name === template.name, `${template.id} template name mismatch`);
    assert(indexed?.templateKind === template.templateKind, `${template.id} template kind mismatch`);
    assert(indexed?.status === 'forge-ready', `${template.id} template status must be forge-ready`);
    assert(indexed?.targetFile === template.targetFile, `${template.id} template target file mismatch`);
    assert(indexed?.registryItemPath === template.registryItemPath, `${template.id} template registry path mismatch`);
    assert(
      sameStringSet(indexed?.storybookStoryIds ?? [], template.storybookStoryIds),
      `${template.id} template Storybook ids mismatch`
    );
    assert(
      sameStringSet(indexed?.dependencies ?? [], template.dependencies),
      `${template.id} template dependencies mismatch`
    );
    assert(
      JSON.stringify(indexed?.variantFamilies) === JSON.stringify(template.variantFamilies),
      `${template.id} template variant families mismatch`
    );
    assert(
      sameStringSet(indexed?.uiUxPractices ?? [], uiUxPracticeIds),
      `${template.id} template UI/UX practices mismatch`
    );
    assert(
      indexed?.evidenceRefs.templateEvidencePath === uiLabTemplateEvidencePath,
      `${template.id} template evidence path mismatch`
    );
    assert(
      indexed?.evidenceRefs.dependencyProfilePath === uiLabDependencyProfilePath,
      `${template.id} template dependency profile path mismatch`
    );
    assert(
      indexed?.evidenceRefs.productizationQueuePath === uiLabProductizationQueuePath,
      `${template.id} template productization queue path mismatch`
    );
    assert(
      indexed?.evidenceRefs.productizationEvidencePath === uiLabProductizationEvidencePath,
      `${template.id} template productization evidence path mismatch`
    );
  }

  const indexedProductizationById = new Map(index.productization.map(item => [item.id, item]));
  for (const item of uiLabProductizationItems) {
    const indexed = indexedProductizationById.get(item.id);
    assert(Boolean(indexed), `Agentic Search index missing productization item ${item.id}`);
    assert(indexed?.kind === item.kind, `${item.id} productization index kind mismatch`);
    assert(indexed?.title === item.title, `${item.id} productization index title mismatch`);
    assert(indexed?.target === item.target, `${item.id} productization index target mismatch`);
    assert(indexed?.status === item.status, `${item.id} productization index status mismatch`);
    assert(
      indexed?.registryItemPath === item.registryItemPath,
      `${item.id} productization index registry path mismatch`
    );
    assert(
      sameStringSet(indexed?.dependencies ?? [], item.dependencies),
      `${item.id} productization index dependencies mismatch`
    );
    assert(
      sameStringSet(indexed?.storybookStoryIds ?? [], item.storybookStoryIds),
      `${item.id} productization index Storybook ids mismatch`
    );
    assert(
      sameStringSet(indexed?.playwrightTestIds ?? [], item.playwrightTestIds),
      `${item.id} productization index Playwright ids mismatch`
    );
    assert(
      indexed?.forgeEvidencePath === item.forgeEvidencePath,
      `${item.id} productization index Forge evidence path mismatch`
    );
    assert(
      sameStringSet(indexed?.agenticSearchTags ?? [], item.agenticSearchTags),
      `${item.id} productization index tags mismatch`
    );
    assert(
      sameJson(indexed?.webAdoption ?? null, item.webAdoption ?? null),
      `${item.id} productization index web adoption metadata mismatch`
    );
  }
}

function assertProductizationWorkflow(): void {
  for (const requiredPath of [
    '.archon/workflows/ui-lab-productization-loop.yaml',
    '.archon/commands/ui-lab-productization-loop.md',
  ]) {
    assert(existsSync(resolve(requiredPath)), `productization workflow surface missing: ${requiredPath}`);
  }
}

export function validateUiLab(): void {
  assertQueueCoverage();
  assertRegistryCoverage();
  assertUiUxPracticeProfile();
  assertTemplateAndDependencyEvidence();
  assertForgeAwareness();
  assertAgenticSearchIndex();
  assertProductizationWorkflow();
  validateWebAdoption();
}

if (import.meta.main) {
  try {
    validateUiLab();
    process.stdout.write('UI_LAB_VALID\n');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
