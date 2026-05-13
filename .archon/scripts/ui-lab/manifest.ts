export interface OfficialComponent {
  id: string;
  officialName: string;
  category: string;
  registryDependencies: string[];
}

export interface UiUxPractice {
  id: string;
  name: string;
  sourceRefs: string[];
  uiLabRule: string;
  forgeTemplateUse: string;
}

export interface UiLabTemplate {
  id: string;
  name: string;
  category: string;
  targetFile: string;
  registryItemPath: string;
  storybookStoryIds: string[];
  playwrightTestIds: string[];
  dependencies: string[];
  templateKind: string;
  variantFamilies: typeof defaultVariantFamilies;
}

export type ProductizationKind = 'template' | 'web-adoption' | 'dependency' | 'workflow' | 'evidence';
export type UiLabProductizationStatus = 'forge-ready' | 'pending';
export type UiLabAdoptionEvidenceState =
  | 'template-ready'
  | 'lab-proven'
  | 'web-adopted'
  | 'not-proven';

export interface UiLabWebAdoptionMetadata {
  parentId?: string;
  targetFiles: string[];
  requiredImports: string[];
  evidenceState: UiLabAdoptionEvidenceState;
  currentGate: boolean;
  visualEvidenceRequired: boolean;
  stateEvidence: string[];
}

export interface UiLabProductizationItem {
  id: string;
  kind: ProductizationKind;
  title: string;
  target: string;
  variantFamilies: typeof defaultVariantFamilies;
  registryItemPath: string;
  registryDependencies: string[];
  dependencies: string[];
  storybookStoryIds: string[];
  playwrightTestIds: string[];
  forgeEvidencePath: string;
  agenticSearchTags: string[];
  status: UiLabProductizationStatus;
  webAdoption?: UiLabWebAdoptionMetadata;
}

export const officialShadcnSnapshotDate = '2026-05-12';
export const officialShadcnSource = 'https://ui.shadcn.com/docs/components';
export const uiUxPracticeSourceLabel = 'general-ui-ux-practice-profile';
export const uiUxPracticeSourceBasis = 'Cross-library UI/UX heuristics plus UI-lab registry, Storybook, Playwright, and Forge evidence.';
export const uiUxPracticeProfilePath = '.archon/bmad/ui-lab-ui-ux-practices.json';
export const uiUxPracticeEvidencePath = '.archon/bmad/evidence/ui-lab-ui-ux-practices.md';
export const uiLabDependencyProfilePath = '.archon/bmad/ui-lab-dependency-map.json';
export const uiLabTemplateEvidencePath = '.archon/bmad/evidence/ui-lab-template-patterns.md';
export const uiLabProductizationQueuePath = '.archon/bmad/ui-lab-productization.queue.json';
export const uiLabProductizationEvidencePath = '.archon/bmad/evidence/ui-lab-productization.md';
export const uiLabWebAdoptionEvidencePath = '.archon/bmad/evidence/ui-lab-web-adoption.md';
export const settingsWebAdoptionTarget = 'packages/web/src/routes/SettingsPage.tsx';
export const dashboardWebAdoptionTarget = 'packages/web/src/routes/DashboardPage.tsx';
export const settingsWebAdoptionRequiredImports = [
  'FormActions',
  'FormRow',
  'FormSection',
  'FormShell',
  'FormSummary',
  'StatusChip',
  'useFormProgress',
] as const;
export const settingsWebAdoptionStateEvidence = [
  'desktop viewport',
  'mobile viewport',
  'loading state',
  'error state or recorded deterministic blocker',
  'dirty form state',
  'saved/success state',
  'validation summary/readiness state',
  'keyboard/focus order',
] as const;
export const dashboardWebAdoptionRequiredImports = ['DashboardShell'] as const;
export const dashboardWebAdoptionStateEvidence = [
  'desktop viewport',
  'mobile viewport',
  'loading state',
  'error state or recorded deterministic blocker',
  'empty state',
  'active workflow state',
  'history state',
  'filter and pagination state',
] as const;

export const defaultVariantFamilies = {
  density: ['compact', 'default', 'comfortable'],
  surface: ['flat', 'outline', 'elevated', 'ghost'],
  state: ['default', 'focus', 'disabled', 'invalid', 'loading', 'empty'],
  mode: ['dark', 'high-contrast', 'reduced-motion', 'responsive'],
} as const;

export const uiUxPractices = [
  {
    id: 'accessibility-first-interactions',
    name: 'Accessibility first interactions',
    sourceRefs: ['ui-ux:accessibility', 'ui-lab:playwright-keyboard-flows'],
    uiLabRule: 'Every interactive surface needs keyboard, focus, label, and screen-reader behavior represented in evidence.',
    forgeTemplateUse: 'Template generators should carry accessibility states and keyboard evidence into generated task packets.',
  },
  {
    id: 'bounded-variant-matrix',
    name: 'Bounded variant matrix',
    sourceRefs: ['ui-ux:variant-systems', 'ui-lab:component-coverage'],
    uiLabRule: 'Expose reusable density, surface, state, and mode axes as bounded metadata, not one-off visual cases.',
    forgeTemplateUse: 'Template generators should derive controls from declared variant axes instead of inspecting source internals.',
  },
  {
    id: 'semantic-theme-tokens',
    name: 'Semantic theme tokens',
    sourceRefs: ['ui-ux:theme-systems', 'ui-lab:styles'],
    uiLabRule: 'Use semantic theme tokens for color, borders, focus rings, and surfaces; avoid hardcoded palette decisions.',
    forgeTemplateUse: 'Template generators should emit theme-token-safe examples that can move across brands.',
  },
  {
    id: 'responsive-layout-integrity',
    name: 'Responsive layout integrity',
    sourceRefs: ['ui-ux:responsive-layout', 'ui-lab:e2e-viewports'],
    uiLabRule: 'Components and templates must keep stable dimensions, readable text, and no incoherent overlap across mobile and desktop.',
    forgeTemplateUse: 'Template generators should preserve responsive constraints and viewport evidence for every block.',
  },
  {
    id: 'clear-information-hierarchy',
    name: 'Clear information hierarchy',
    sourceRefs: ['ui-ux:visual-hierarchy', 'ui-lab:storybook-stories'],
    uiLabRule: 'Use predictable heading, description, action, and supporting metadata structure for scanability.',
    forgeTemplateUse: 'Template generators should keep hierarchy slots explicit when composing templates.',
  },
  {
    id: 'storybook-variant-evidence',
    name: 'Storybook variant evidence',
    sourceRefs: ['ui-lab:storybook-index', 'ui-lab:full-coverage-stories'],
    uiLabRule: 'Expose default, state, mode, and variant matrix stories with stable Storybook ids.',
    forgeTemplateUse: 'Template generators should use Storybook ids as visual evidence anchors for each template input.',
  },
  {
    id: 'browser-and-a11y-proof',
    name: 'Browser and a11y proof',
    sourceRefs: ['ui-lab:playwright', 'ui-lab:axe'],
    uiLabRule: 'Record browser behavior, a11y, visible rendering, console cleanliness, and interaction evidence before marking Forge-ready.',
    forgeTemplateUse: 'Template generators should require test evidence refs for interactive or overlay components.',
  },
  {
    id: 'state-complete-surfaces',
    name: 'State complete surfaces',
    sourceRefs: ['ui-ux:state-design', 'ui-lab:variant-families'],
    uiLabRule: 'Represent default, focus, disabled, invalid, loading, and empty states where the component can reach them.',
    forgeTemplateUse: 'Template generators should include state coverage before marking a template reusable.',
  },
  {
    id: 'motion-with-restraint',
    name: 'Motion with restraint',
    sourceRefs: ['ui-ux:motion', 'ui-lab:reduced-motion-mode'],
    uiLabRule: 'Use motion only to clarify state changes, and keep reduced-motion mode in the evidence model.',
    forgeTemplateUse: 'Template generators should avoid decorative motion and preserve reduced-motion variants.',
  },
  {
    id: 'composition-ready-slots',
    name: 'Composition ready slots',
    sourceRefs: ['ui-ux:composition', 'ui-lab:registry'],
    uiLabRule: 'Keep component parts, slots, registry dependencies, and template-safe examples explicit.',
    forgeTemplateUse: 'Template generators should compose from declared slots, dependencies, and examples.',
  },
] as const satisfies readonly UiUxPractice[];

export const officialComponents = [
  { id: 'accordion', officialName: 'Accordion', category: 'disclosure', registryDependencies: [] },
  { id: 'alert', officialName: 'Alert', category: 'feedback', registryDependencies: [] },
  { id: 'alert-dialog', officialName: 'Alert Dialog', category: 'overlay', registryDependencies: ['button'] },
  { id: 'aspect-ratio', officialName: 'Aspect Ratio', category: 'layout', registryDependencies: [] },
  { id: 'avatar', officialName: 'Avatar', category: 'display', registryDependencies: [] },
  { id: 'badge', officialName: 'Badge', category: 'display', registryDependencies: [] },
  { id: 'breadcrumb', officialName: 'Breadcrumb', category: 'navigation', registryDependencies: [] },
  { id: 'button', officialName: 'Button', category: 'action', registryDependencies: [] },
  { id: 'button-group', officialName: 'Button Group', category: 'action', registryDependencies: ['button'] },
  { id: 'calendar', officialName: 'Calendar', category: 'input', registryDependencies: ['button'] },
  { id: 'card', officialName: 'Card', category: 'layout', registryDependencies: [] },
  { id: 'carousel', officialName: 'Carousel', category: 'display', registryDependencies: ['button'] },
  { id: 'chart', officialName: 'Chart', category: 'data', registryDependencies: [] },
  { id: 'checkbox', officialName: 'Checkbox', category: 'input', registryDependencies: [] },
  { id: 'collapsible', officialName: 'Collapsible', category: 'disclosure', registryDependencies: [] },
  { id: 'combobox', officialName: 'Combobox', category: 'input', registryDependencies: ['button', 'command', 'popover'] },
  { id: 'command', officialName: 'Command', category: 'input', registryDependencies: ['dialog'] },
  { id: 'context-menu', officialName: 'Context Menu', category: 'menu', registryDependencies: [] },
  { id: 'data-table', officialName: 'Data Table', category: 'data', registryDependencies: ['badge', 'table'] },
  { id: 'date-picker', officialName: 'Date Picker', category: 'input', registryDependencies: ['button', 'calendar', 'popover'] },
  { id: 'dialog', officialName: 'Dialog', category: 'overlay', registryDependencies: [] },
  { id: 'direction', officialName: 'Direction', category: 'layout', registryDependencies: [] },
  { id: 'drawer', officialName: 'Drawer', category: 'overlay', registryDependencies: ['button'] },
  { id: 'dropdown-menu', officialName: 'Dropdown Menu', category: 'menu', registryDependencies: [] },
  { id: 'empty', officialName: 'Empty', category: 'feedback', registryDependencies: [] },
  { id: 'field', officialName: 'Field', category: 'input', registryDependencies: ['label'] },
  { id: 'hover-card', officialName: 'Hover Card', category: 'overlay', registryDependencies: [] },
  { id: 'input', officialName: 'Input', category: 'input', registryDependencies: [] },
  { id: 'input-group', officialName: 'Input Group', category: 'input', registryDependencies: ['input'] },
  { id: 'input-otp', officialName: 'Input OTP', category: 'input', registryDependencies: [] },
  { id: 'item', officialName: 'Item', category: 'display', registryDependencies: [] },
  { id: 'kbd', officialName: 'Kbd', category: 'typography', registryDependencies: [] },
  { id: 'label', officialName: 'Label', category: 'input', registryDependencies: [] },
  { id: 'menubar', officialName: 'Menubar', category: 'menu', registryDependencies: [] },
  { id: 'native-select', officialName: 'Native Select', category: 'input', registryDependencies: [] },
  { id: 'navigation-menu', officialName: 'Navigation Menu', category: 'navigation', registryDependencies: [] },
  { id: 'pagination', officialName: 'Pagination', category: 'navigation', registryDependencies: ['button'] },
  { id: 'popover', officialName: 'Popover', category: 'overlay', registryDependencies: [] },
  { id: 'progress', officialName: 'Progress', category: 'feedback', registryDependencies: [] },
  { id: 'radio-group', officialName: 'Radio Group', category: 'input', registryDependencies: [] },
  { id: 'resizable', officialName: 'Resizable', category: 'layout', registryDependencies: [] },
  { id: 'scroll-area', officialName: 'Scroll Area', category: 'layout', registryDependencies: [] },
  { id: 'select', officialName: 'Select', category: 'input', registryDependencies: [] },
  { id: 'separator', officialName: 'Separator', category: 'layout', registryDependencies: [] },
  { id: 'sheet', officialName: 'Sheet', category: 'overlay', registryDependencies: [] },
  { id: 'sidebar', officialName: 'Sidebar', category: 'layout', registryDependencies: ['button', 'separator', 'sheet', 'skeleton', 'tooltip'] },
  { id: 'skeleton', officialName: 'Skeleton', category: 'feedback', registryDependencies: [] },
  { id: 'slider', officialName: 'Slider', category: 'input', registryDependencies: [] },
  { id: 'sonner', officialName: 'Sonner', category: 'feedback', registryDependencies: [] },
  { id: 'spinner', officialName: 'Spinner', category: 'feedback', registryDependencies: [] },
  { id: 'switch', officialName: 'Switch', category: 'input', registryDependencies: [] },
  { id: 'table', officialName: 'Table', category: 'data', registryDependencies: [] },
  { id: 'tabs', officialName: 'Tabs', category: 'navigation', registryDependencies: [] },
  { id: 'textarea', officialName: 'Textarea', category: 'input', registryDependencies: [] },
  { id: 'toast', officialName: 'Toast', category: 'feedback', registryDependencies: ['sonner'] },
  { id: 'toggle', officialName: 'Toggle', category: 'action', registryDependencies: [] },
  { id: 'toggle-group', officialName: 'Toggle Group', category: 'action', registryDependencies: ['toggle'] },
  { id: 'tooltip', officialName: 'Tooltip', category: 'overlay', registryDependencies: [] },
  { id: 'typography', officialName: 'Typography', category: 'typography', registryDependencies: [] },
] as const satisfies OfficialComponent[];

export const uiLabTemplates = [
  {
    id: 'agent-command-center',
    name: 'Agent Command Center',
    category: 'workflow',
    targetFile: 'packages/ui-lab/src/templates/agent-command-center.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/agent-command-center/registry-item.json',
    storybookStoryIds: [
      'ui-lab-templates--agent-command-center',
      'ui-lab-templates--agent-command-center-compact',
    ],
    playwrightTestIds: ['ui-lab-template:agent-command-center'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'agent-workflow-shell',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'workflow-review',
    name: 'Workflow Review',
    category: 'review',
    targetFile: 'packages/ui-lab/src/templates/workflow-review.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/workflow-review/registry-item.json',
    storybookStoryIds: [
      'ui-lab-templates--workflow-review',
      'ui-lab-templates--workflow-review-invalid',
    ],
    playwrightTestIds: ['ui-lab-template:workflow-review'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'evidence-review-shell',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'settings-form-workspace',
    name: 'Settings Form Workspace',
    category: 'form',
    targetFile: 'packages/ui-lab/src/templates/settings-form-workspace.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/settings-form-workspace/registry-item.json',
    storybookStoryIds: [
      'ui-lab-templates--settings-form-workspace',
      'ui-lab-templates--settings-form-workspace-compact',
      'ui-lab-templates--settings-form-workspace-invalid',
    ],
    playwrightTestIds: ['ui-lab-template:settings-form-workspace'],
    dependencies: ['archon-ui-core', 'react-hook-form', 'zod', 'lucide-react'],
    templateKind: 'settings-form',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'dashboard-shell',
    name: 'Dashboard Shell',
    category: 'dashboard',
    targetFile: 'packages/ui-lab/src/templates/productization.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/dashboard-shell/registry-item.json',
    storybookStoryIds: ['ui-lab-templates--dashboard-shell'],
    playwrightTestIds: ['ui-lab-template:dashboard-shell'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'dashboard-shell',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'project-settings-form',
    name: 'Project Settings Form',
    category: 'form',
    targetFile: 'packages/ui-lab/src/templates/productization.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/project-settings-form/registry-item.json',
    storybookStoryIds: ['ui-lab-templates--project-settings-form'],
    playwrightTestIds: ['ui-lab-template:project-settings-form'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'project-settings-form',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'environment-variables-form',
    name: 'Environment Variables Form',
    category: 'form',
    targetFile: 'packages/ui-lab/src/templates/productization.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/environment-variables-form/registry-item.json',
    storybookStoryIds: ['ui-lab-templates--environment-variables-form'],
    playwrightTestIds: ['ui-lab-template:environment-variables-form'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'environment-variables-form',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'workflow-builder-shell',
    name: 'Workflow Builder Shell',
    category: 'workflow',
    targetFile: 'packages/ui-lab/src/templates/productization.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/workflow-builder-shell/registry-item.json',
    storybookStoryIds: ['ui-lab-templates--workflow-builder-shell'],
    playwrightTestIds: ['ui-lab-template:workflow-builder-shell'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'workflow-builder-shell',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'workflow-execution-review',
    name: 'Workflow Execution Review',
    category: 'workflow',
    targetFile: 'packages/ui-lab/src/templates/productization.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/workflow-execution-review/registry-item.json',
    storybookStoryIds: ['ui-lab-templates--workflow-execution-review'],
    playwrightTestIds: ['ui-lab-template:workflow-execution-review'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'workflow-execution-review',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'command-palette-flow',
    name: 'Command Palette Flow',
    category: 'command',
    targetFile: 'packages/ui-lab/src/templates/productization.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/command-palette-flow/registry-item.json',
    storybookStoryIds: ['ui-lab-templates--command-palette-flow'],
    playwrightTestIds: ['ui-lab-template:command-palette-flow'],
    dependencies: ['archon-ui-core', 'cmdk', 'lucide-react'],
    templateKind: 'command-palette-flow',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'data-table-workspace',
    name: 'Data Table Workspace',
    category: 'data',
    targetFile: 'packages/ui-lab/src/templates/productization.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/data-table-workspace/registry-item.json',
    storybookStoryIds: ['ui-lab-templates--data-table-workspace'],
    playwrightTestIds: ['ui-lab-template:data-table-workspace'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'data-table-workspace',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'onboarding-empty-state',
    name: 'Onboarding Empty State',
    category: 'feedback',
    targetFile: 'packages/ui-lab/src/templates/productization.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/onboarding-empty-state/registry-item.json',
    storybookStoryIds: ['ui-lab-templates--onboarding-empty-state'],
    playwrightTestIds: ['ui-lab-template:onboarding-empty-state'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'onboarding-empty-state',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'modal-drawer-crud',
    name: 'Modal Drawer CRUD',
    category: 'crud',
    targetFile: 'packages/ui-lab/src/templates/productization.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/modal-drawer-crud/registry-item.json',
    storybookStoryIds: ['ui-lab-templates--modal-drawer-crud'],
    playwrightTestIds: ['ui-lab-template:modal-drawer-crud'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'modal-drawer-crud',
    variantFamilies: defaultVariantFamilies,
  },
  {
    id: 'sidebar-app-shell',
    name: 'Sidebar App Shell',
    category: 'layout',
    targetFile: 'packages/ui-lab/src/templates/productization.tsx',
    registryItemPath: 'packages/ui-lab/registry/new-york/sidebar-app-shell/registry-item.json',
    storybookStoryIds: ['ui-lab-templates--sidebar-app-shell'],
    playwrightTestIds: ['ui-lab-template:sidebar-app-shell'],
    dependencies: ['archon-ui-core', 'lucide-react'],
    templateKind: 'sidebar-app-shell',
    variantFamilies: defaultVariantFamilies,
  },
] as const satisfies readonly UiLabTemplate[];

const templateProductizationItems = uiLabTemplates.map(template => ({
  id: template.id,
  kind: 'template',
  title: template.name,
  target: template.targetFile,
  variantFamilies: defaultVariantFamilies,
  registryItemPath: template.registryItemPath,
  registryDependencies: ['archon-ui-core'],
  dependencies: [...template.dependencies],
  storybookStoryIds: [...template.storybookStoryIds],
  playwrightTestIds: [...template.playwrightTestIds],
  forgeEvidencePath: uiLabProductizationEvidencePath,
  agenticSearchTags: ['ui-lab', 'template', template.category, template.templateKind],
  status: 'forge-ready',
})) satisfies readonly UiLabProductizationItem[];

export const uiLabProductizationItems = [
  ...templateProductizationItems,
  {
    id: 'web-ui-wrapper-adoption',
    kind: 'web-adoption',
    title: 'Web UI wrapper adoption',
    target: 'packages/web/src/components/ui',
    variantFamilies: defaultVariantFamilies,
    registryItemPath: 'packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json',
    registryDependencies: ['archon-ui-core'],
    dependencies: ['@archon/ui-lab'],
    storybookStoryIds: ['ui-lab-templates--dashboard-shell'],
    playwrightTestIds: ['ui-lab-template:dashboard-shell'],
    forgeEvidencePath: uiLabWebAdoptionEvidencePath,
    agenticSearchTags: ['ui-lab', 'web-adoption', 'wrappers', 'lab-proven'],
    status: 'forge-ready',
    webAdoption: {
      targetFiles: ['packages/web/src/components/ui'],
      requiredImports: ['@archon/ui-lab/components/ui/*'],
      evidenceState: 'lab-proven',
      currentGate: false,
      visualEvidenceRequired: false,
      stateEvidence: ['pure primitive shim coverage'],
    },
  },
  {
    id: 'web-settings-form-adoption',
    kind: 'web-adoption',
    title: 'Web Settings form adoption',
    target: settingsWebAdoptionTarget,
    variantFamilies: defaultVariantFamilies,
    registryItemPath: 'packages/ui-lab/registry/new-york/settings-form-workspace/registry-item.json',
    registryDependencies: ['archon-ui-core'],
    dependencies: ['@archon/ui-lab'],
    storybookStoryIds: ['ui-lab-templates--settings-form-workspace'],
    playwrightTestIds: ['ui-lab-template:settings-form-workspace'],
    forgeEvidencePath: uiLabWebAdoptionEvidencePath,
    agenticSearchTags: ['ui-lab', 'web-adoption', 'settings', 'web-adopted'],
    status: 'forge-ready',
    webAdoption: {
      parentId: 'web-ui-wrapper-adoption',
      targetFiles: [settingsWebAdoptionTarget],
      requiredImports: [...settingsWebAdoptionRequiredImports],
      evidenceState: 'web-adopted',
      currentGate: false,
      visualEvidenceRequired: true,
      stateEvidence: [...settingsWebAdoptionStateEvidence],
    },
  },
  {
    id: 'web-dashboard-shell-adoption',
    kind: 'web-adoption',
    title: 'Web Dashboard shell adoption',
    target: dashboardWebAdoptionTarget,
    variantFamilies: defaultVariantFamilies,
    registryItemPath: 'packages/ui-lab/registry/new-york/dashboard-shell/registry-item.json',
    registryDependencies: ['archon-ui-core'],
    dependencies: ['@archon/ui-lab'],
    storybookStoryIds: ['ui-lab-templates--dashboard-shell'],
    playwrightTestIds: ['ui-lab-template:dashboard-shell'],
    forgeEvidencePath: uiLabWebAdoptionEvidencePath,
    agenticSearchTags: ['ui-lab', 'web-adoption', 'dashboard', 'web-adopted', 'current-gate'],
    status: 'forge-ready',
    webAdoption: {
      parentId: 'web-ui-wrapper-adoption',
      targetFiles: [dashboardWebAdoptionTarget],
      requiredImports: [...dashboardWebAdoptionRequiredImports],
      evidenceState: 'web-adopted',
      currentGate: true,
      visualEvidenceRequired: true,
      stateEvidence: [...dashboardWebAdoptionStateEvidence],
    },
  },
  {
    id: 'web-workflow-builder-shell-adoption',
    kind: 'web-adoption',
    title: 'Web Workflow Builder shell adoption',
    target: 'packages/web/src/routes/WorkflowBuilderPage.tsx',
    variantFamilies: defaultVariantFamilies,
    registryItemPath: 'packages/ui-lab/registry/new-york/workflow-builder-shell/registry-item.json',
    registryDependencies: ['archon-ui-core'],
    dependencies: ['@archon/ui-lab'],
    storybookStoryIds: ['ui-lab-templates--workflow-builder-shell'],
    playwrightTestIds: ['ui-lab-template:workflow-builder-shell'],
    forgeEvidencePath: uiLabWebAdoptionEvidencePath,
    agenticSearchTags: ['ui-lab', 'web-adoption', 'workflow-builder', 'not-proven'],
    status: 'pending',
    webAdoption: {
      parentId: 'web-ui-wrapper-adoption',
      targetFiles: ['packages/web/src/routes/WorkflowBuilderPage.tsx'],
      requiredImports: ['WorkflowBuilderShell'],
      evidenceState: 'not-proven',
      currentGate: false,
      visualEvidenceRequired: true,
      stateEvidence: [],
    },
  },
  {
    id: 'web-workflow-execution-review-adoption',
    kind: 'web-adoption',
    title: 'Web Workflow Execution review adoption',
    target: 'packages/web/src/routes/WorkflowExecutionPage.tsx',
    variantFamilies: defaultVariantFamilies,
    registryItemPath: 'packages/ui-lab/registry/new-york/workflow-execution-review/registry-item.json',
    registryDependencies: ['archon-ui-core'],
    dependencies: ['@archon/ui-lab'],
    storybookStoryIds: ['ui-lab-templates--workflow-execution-review'],
    playwrightTestIds: ['ui-lab-template:workflow-execution-review'],
    forgeEvidencePath: uiLabWebAdoptionEvidencePath,
    agenticSearchTags: ['ui-lab', 'web-adoption', 'workflow-execution', 'not-proven'],
    status: 'pending',
    webAdoption: {
      parentId: 'web-ui-wrapper-adoption',
      targetFiles: ['packages/web/src/routes/WorkflowExecutionPage.tsx'],
      requiredImports: ['WorkflowExecutionReview'],
      evidenceState: 'not-proven',
      currentGate: false,
      visualEvidenceRequired: true,
      stateEvidence: [],
    },
  },
  {
    id: 'web-command-palette-adoption',
    kind: 'web-adoption',
    title: 'Web Command Palette adoption',
    target: 'packages/web/src/components/workflows/CommandPicker.tsx',
    variantFamilies: defaultVariantFamilies,
    registryItemPath: 'packages/ui-lab/registry/new-york/command-palette-flow/registry-item.json',
    registryDependencies: ['archon-ui-core'],
    dependencies: ['@archon/ui-lab', 'cmdk'],
    storybookStoryIds: ['ui-lab-templates--command-palette-flow'],
    playwrightTestIds: ['ui-lab-template:command-palette-flow'],
    forgeEvidencePath: uiLabWebAdoptionEvidencePath,
    agenticSearchTags: ['ui-lab', 'web-adoption', 'command-palette', 'not-proven'],
    status: 'pending',
    webAdoption: {
      parentId: 'web-ui-wrapper-adoption',
      targetFiles: ['packages/web/src/components/workflows/CommandPicker.tsx'],
      requiredImports: ['CommandPaletteFlow'],
      evidenceState: 'not-proven',
      currentGate: false,
      visualEvidenceRequired: true,
      stateEvidence: [],
    },
  },
  {
    id: 'dependency-drift-profile',
    kind: 'dependency',
    title: 'Dependency drift profile',
    target: uiLabDependencyProfilePath,
    variantFamilies: defaultVariantFamilies,
    registryItemPath: 'packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json',
    registryDependencies: ['archon-ui-core'],
    dependencies: ['packages/ui-lab/package.json', 'packages/web/package.json'],
    storybookStoryIds: ['ui-lab-templates--data-table-workspace'],
    playwrightTestIds: ['ui-lab-template:data-table-workspace'],
    forgeEvidencePath: uiLabProductizationEvidencePath,
    agenticSearchTags: ['ui-lab', 'dependency', 'drift-control'],
    status: 'forge-ready',
  },
  {
    id: 'ui-lab-productization-loop',
    kind: 'workflow',
    title: 'UI-lab productization loop',
    target: '.archon/workflows/ui-lab-productization-loop.yaml',
    variantFamilies: defaultVariantFamilies,
    registryItemPath: 'packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json',
    registryDependencies: ['archon-ui-core'],
    dependencies: ['bmad-help', 'bmad-capability-pack-forge', 'bmad-loop'],
    storybookStoryIds: ['ui-lab-templates--workflow-execution-review'],
    playwrightTestIds: ['ui-lab-template:workflow-execution-review'],
    forgeEvidencePath: uiLabProductizationEvidencePath,
    agenticSearchTags: ['ui-lab', 'workflow', 'archon-persisted'],
    status: 'forge-ready',
  },
  {
    id: 'forge-template-evidence-pack',
    kind: 'evidence',
    title: 'Forge template evidence pack',
    target: uiLabProductizationEvidencePath,
    variantFamilies: defaultVariantFamilies,
    registryItemPath: 'packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json',
    registryDependencies: ['archon-ui-core'],
    dependencies: [uiLabTemplateEvidencePath, uiLabProductizationQueuePath],
    storybookStoryIds: ['ui-lab-templates--command-palette-flow'],
    playwrightTestIds: ['ui-lab-template:command-palette-flow'],
    forgeEvidencePath: uiLabProductizationEvidencePath,
    agenticSearchTags: ['ui-lab', 'forge', 'evidence'],
    status: 'forge-ready',
  },
] as const satisfies readonly UiLabProductizationItem[];

export function storybookStoryIdFor(componentId: string): string {
  return `ui-lab-full-coverage--${componentId}`;
}

export function playwrightTestIdFor(componentId: string): string {
  return `ui-lab:${componentId}`;
}

export function targetFileFor(componentId: string): string {
  return `packages/ui-lab/src/components/ui/${componentId}.tsx`;
}
