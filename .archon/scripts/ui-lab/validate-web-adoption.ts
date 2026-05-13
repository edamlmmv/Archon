import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import {
  dashboardWebAdoptionRequiredImports,
  dashboardWebAdoptionTarget,
  settingsWebAdoptionRequiredImports,
  settingsWebAdoptionTarget,
  uiLabProductizationItems,
  type UiLabProductizationItem,
} from './manifest';

export interface UiShimEntry {
  path: string;
  content: string;
}

export interface WebAdoptionValidationResult {
  shimCount: number;
  currentGateIds: string[];
  pendingChildIds: string[];
}

export interface ValidateWebAdoptionOptions {
  repoRoot?: string;
  productizationItems?: readonly UiLabProductizationItem[];
  shimEntries?: readonly UiShimEntry[];
  readTextFile?: (relativePath: string) => string;
}

const webUiShimDir = 'packages/web/src/components/ui';
const webAdoptionParentId = 'web-ui-wrapper-adoption';
const webAdoptionChildIds = [
  'web-settings-form-adoption',
  'web-dashboard-shell-adoption',
  'web-workflow-builder-shell-adoption',
  'web-workflow-execution-review-adoption',
  'web-command-palette-adoption',
] as const;

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function normalizeSource(source: string): string {
  return source.replace(/\r\n/g, '\n').trim();
}

function componentIdFromShimPath(path: string): string {
  return basename(path, extname(path));
}

export function expectedUiShimExport(componentId: string): string {
  return `export * from '@archon/ui-lab/components/ui/${componentId}';`;
}

export function isPureUiShim(path: string, content: string): boolean {
  return normalizeSource(content) === expectedUiShimExport(componentIdFromShimPath(path));
}

function readDefaultTextFile(repoRoot: string, relativePath: string): string {
  return readFileSync(resolve(repoRoot, relativePath), 'utf8');
}

function defaultShimEntries(repoRoot: string): UiShimEntry[] {
  const absoluteDir = resolve(repoRoot, webUiShimDir);
  assert(existsSync(absoluteDir), `Web UI shim directory missing: ${webUiShimDir}`);

  return readdirSync(absoluteDir)
    .filter(fileName => fileName.endsWith('.tsx'))
    .sort()
    .map(fileName => {
      const relativePath = `${webUiShimDir}/${fileName}`;
      return {
        path: relativePath,
        content: readFileSync(resolve(repoRoot, relativePath), 'utf8'),
      };
    });
}

function extractUiLabRootImportSpecifiers(source: string): Set<string> {
  const specifiers = new Set<string>();
  const importPattern = /import\s*\{([^}]*)\}\s*from\s*['"]@archon\/ui-lab['"]/g;
  let match = importPattern.exec(source);

  while (match) {
    const rawSpecifiers = match[1] ?? '';
    for (const rawSpecifier of rawSpecifiers.split(',')) {
      const normalized = rawSpecifier
        .replace(/\btype\s+/g, '')
        .trim()
        .split(/\s+as\s+/)[0]
        ?.trim();
      if (normalized) specifiers.add(normalized);
    }
    match = importPattern.exec(source);
  }

  return specifiers;
}

function assertRouteAdoptsUiLab(
  routeName: string,
  source: string,
  requiredImports: readonly string[]
): void {
  assert(
    !source.includes('packages/ui-lab/src/') && !source.includes('@archon/ui-lab/src/'),
    `${routeName} route must not import UI-lab source internals`
  );

  const rootImports = extractUiLabRootImportSpecifiers(source);
  for (const requiredImport of requiredImports) {
    assert(
      rootImports.has(requiredImport),
      `${routeName} route must import ${requiredImport} from @archon/ui-lab`
    );
  }
}

export function assertSettingsRouteAdoptsUiLab(source: string): void {
  assertRouteAdoptsUiLab('Settings', source, settingsWebAdoptionRequiredImports);
}

export function assertDashboardRouteAdoptsUiLab(source: string): void {
  assertRouteAdoptsUiLab('Dashboard', source, dashboardWebAdoptionRequiredImports);
}

function assertWebAdoptionMetadata(items: readonly UiLabProductizationItem[]): void {
  const byId = new Map(items.map(item => [item.id, item]));
  const parent = byId.get(webAdoptionParentId);
  assert(Boolean(parent), `Productization manifest missing ${webAdoptionParentId}`);
  assert(parent?.status === 'forge-ready', `${webAdoptionParentId} must remain forge-ready`);
  assert(
    parent?.webAdoption?.evidenceState === 'lab-proven',
    `${webAdoptionParentId} must remain lab-proven`
  );

  for (const childId of webAdoptionChildIds) {
    const child = byId.get(childId);
    assert(Boolean(child), `Productization manifest missing ${childId}`);
    assert(child?.kind === 'web-adoption', `${childId} must be a web-adoption item`);
    assert(child?.webAdoption?.parentId === webAdoptionParentId, `${childId} must point to parent rollup`);
  }

  const settings = byId.get('web-settings-form-adoption');
  assert(settings?.status === 'forge-ready', 'web-settings-form-adoption must be forge-ready');
  assert(
    settings?.webAdoption?.evidenceState === 'web-adopted',
    'web-settings-form-adoption must be web-adopted'
  );
  assert(
    settings?.webAdoption?.currentGate === false,
    'web-settings-form-adoption must no longer be the current gate'
  );
  assert(
    settings?.webAdoption?.targetFiles.includes(settingsWebAdoptionTarget) ?? false,
    `web-settings-form-adoption must target ${settingsWebAdoptionTarget}`
  );

  const dashboard = byId.get('web-dashboard-shell-adoption');
  assert(dashboard?.status === 'forge-ready', 'web-dashboard-shell-adoption must be forge-ready');
  assert(
    dashboard?.webAdoption?.evidenceState === 'web-adopted',
    'web-dashboard-shell-adoption must be web-adopted'
  );
  assert(
    dashboard?.webAdoption?.currentGate === true,
    'web-dashboard-shell-adoption must be the current gate'
  );
  assert(
    dashboard?.webAdoption?.targetFiles.includes(dashboardWebAdoptionTarget) ?? false,
    `web-dashboard-shell-adoption must target ${dashboardWebAdoptionTarget}`
  );

  for (const childId of webAdoptionChildIds.filter(
    id => id !== 'web-settings-form-adoption' && id !== 'web-dashboard-shell-adoption'
  )) {
    const child = byId.get(childId);
    assert(child?.status === 'pending', `${childId} must remain pending until migrated`);
    assert(
      child?.webAdoption?.evidenceState === 'not-proven',
      `${childId} must remain not-proven until migrated`
    );
    assert(child?.webAdoption?.currentGate === false, `${childId} must not be the current gate`);
  }
}

export function validateWebAdoption(
  options: ValidateWebAdoptionOptions = {}
): WebAdoptionValidationResult {
  const repoRoot = options.repoRoot ?? process.cwd();
  const readTextFile =
    options.readTextFile ?? ((relativePath: string): string => readDefaultTextFile(repoRoot, relativePath));
  const items = options.productizationItems ?? uiLabProductizationItems;
  const shimEntries = options.shimEntries ?? defaultShimEntries(repoRoot);

  assert(shimEntries.length > 0, 'Web UI shim directory must contain shim files');
  for (const entry of shimEntries) {
    assert(isPureUiShim(entry.path, entry.content), `${entry.path} must be a pure UI-lab primitive shim`);
  }

  assertWebAdoptionMetadata(items);
  assertSettingsRouteAdoptsUiLab(readTextFile(settingsWebAdoptionTarget));
  assertDashboardRouteAdoptsUiLab(readTextFile(dashboardWebAdoptionTarget));

  return {
    shimCount: shimEntries.length,
    currentGateIds: items
      .filter(item => item.webAdoption?.currentGate === true)
      .map(item => item.id)
      .sort(),
    pendingChildIds: items
      .filter(item => item.webAdoption?.parentId === webAdoptionParentId && item.status === 'pending')
      .map(item => item.id)
      .sort(),
  };
}

if (import.meta.main) {
  try {
    const result = validateWebAdoption();
    process.stdout.write(`UI_LAB_WEB_ADOPTION_VALID\n${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
