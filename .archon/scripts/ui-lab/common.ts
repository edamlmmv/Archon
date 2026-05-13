import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';

export type QueueStatus = 'pending' | 'in_progress' | 'implemented' | 'verified' | 'forge-ready' | 'done' | 'blocked';

export interface VariantMatrix {
  density: string[];
  surface: string[];
  state: string[];
  mode: string[];
}

export interface QueueItem {
  id: string;
  component: string;
  officialName: string;
  source: string;
  category: string;
  targetFile: string;
  variants: VariantMatrix;
  storybookStoryId: string;
  playwrightTestId: string;
  registryItemPath: string;
  registryDependencies: string[];
  forgeEvidencePath: string;
  status: QueueStatus;
  attempts: number;
  lastFailure: string | null;
  artifacts: string[];
  lastUpdated: string;
}

export interface QueueDocument {
  schemaVersion: number;
  updatedAt: string;
  items: QueueItem[];
}

export interface LockDocument {
  schemaVersion: 1;
  workflowId: string;
  pid: number;
  cwd: string;
  createdAt: string;
  artifactsDir: string | null;
  currentItemId: string | null;
}

export interface QueueCounts {
  pending: number;
  in_progress: number;
  implemented: number;
  verified: number;
  'forge-ready': number;
  done: number;
  blocked: number;
  total: number;
}

export interface CompletionResult {
  component: string;
  status: 'done' | 'forge-ready' | 'blocked';
  summary: string;
  variantMatrix: unknown;
  validation: unknown;
  artifacts: string[];
  failureReason: string | null;
}

export interface RalphArtifacts {
  jsonPath: string;
  markdownPath: string;
}

export const queuePath = resolve(process.cwd(), '.archon/bmad/ui-lab-components.queue.json');
export const lockPath = resolve(process.cwd(), '.archon/bmad/ui-lab-components.queue.lock');
export const ralphComponentsDir = resolve(process.cwd(), '.archon/ralph/ui-lab/components');
export const evidenceRunsDir = resolve(process.cwd(), '.archon/bmad/evidence/ui-lab-component-runs');

const componentIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function nowIso(): string {
  return new Date().toISOString();
}

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function getFlagValue(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

export function hasFlag(argv: string[], flag: string): boolean {
  return argv.includes(flag);
}

export function resolveWorkflowId(argv: string[]): string {
  const value = getFlagValue(argv, '--workflow-id') ?? process.env.ARCHON_WORKFLOW_ID;
  if (!value || value.trim() === '') {
    throw new Error('--workflow-id or ARCHON_WORKFLOW_ID is required');
  }
  return value.trim();
}

export function resolveArtifactsDir(argv: string[]): string | null {
  const value = getFlagValue(argv, '--artifacts-dir') ?? process.env.ARTIFACTS_DIR;
  if (!value || value.trim() === '') return null;
  return resolve(value);
}

export function currentItemArtifactPath(artifactsDir: string | null): string | null {
  if (!artifactsDir) return null;
  return resolve(artifactsDir, 'ui-lab/current-item.json');
}

export function currentResultArtifactPath(artifactsDir: string | null): string | null {
  if (!artifactsDir) return null;
  return resolve(artifactsDir, 'ui-lab/current-result.json');
}

export function sanitizeFilePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export function assertComponentId(id: string): void {
  if (!componentIdPattern.test(id)) {
    throw new Error(`Invalid component id: ${id}`);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(entry => typeof entry === 'string');
}

function parseNullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value === 'string') return value;
  throw new Error(`${field} must be a string or null`);
}

function parseQueueStatus(value: unknown, field: string): QueueStatus {
  if (
    value === 'pending' ||
    value === 'in_progress' ||
    value === 'implemented' ||
    value === 'verified' ||
    value === 'forge-ready' ||
    value === 'done' ||
    value === 'blocked'
  ) {
    return value;
  }
  throw new Error(`${field} must be pending, in_progress, implemented, verified, forge-ready, done, or blocked`);
}

function parseVariantMatrix(value: unknown, field: string): VariantMatrix {
  if (!isObject(value)) throw new Error(`${field} must be an object`);
  const density = value.density;
  const surface = value.surface;
  const state = value.state;
  const mode = value.mode;
  if (!isStringArray(density)) throw new Error(`${field}.density must be string[]`);
  if (!isStringArray(surface)) throw new Error(`${field}.surface must be string[]`);
  if (!isStringArray(state)) throw new Error(`${field}.state must be string[]`);
  if (!isStringArray(mode)) throw new Error(`${field}.mode must be string[]`);
  return { density, surface, state, mode };
}

function parseQueueItem(value: unknown, index: number): QueueItem {
  if (!isObject(value)) throw new Error(`items[${index}] must be an object`);
  const id = value.id;
  const component = value.component;
  const officialName = value.officialName;
  const source = value.source;
  const category = value.category;
  const targetFile = value.targetFile;
  const storybookStoryId = value.storybookStoryId;
  const playwrightTestId = value.playwrightTestId;
  const registryItemPath = value.registryItemPath;
  const registryDependencies = value.registryDependencies;
  const forgeEvidencePath = value.forgeEvidencePath;
  const attempts = value.attempts;
  const artifacts = value.artifacts;
  const lastUpdated = value.lastUpdated;
  if (typeof id !== 'string' || id.trim() === '') throw new Error(`items[${index}].id must be a string`);
  if (typeof component !== 'string' || component.trim() === '') {
    throw new Error(`items[${index}].component must be a string`);
  }
  for (const [field, fieldValue] of Object.entries({
    officialName,
    source,
    category,
    targetFile,
    storybookStoryId,
    playwrightTestId,
    registryItemPath,
    forgeEvidencePath,
  })) {
    if (typeof fieldValue !== 'string' || fieldValue.trim() === '') {
      throw new Error(`items[${index}].${field} must be a non-empty string`);
    }
  }
  assertComponentId(id);
  assertComponentId(component);
  if (!isStringArray(registryDependencies)) {
    throw new Error(`items[${index}].registryDependencies must be string[]`);
  }
  if (typeof attempts !== 'number' || !Number.isInteger(attempts) || attempts < 0) {
    throw new Error(`items[${index}].attempts must be a non-negative integer`);
  }
  if (!isStringArray(artifacts)) throw new Error(`items[${index}].artifacts must be string[]`);
  if (typeof lastUpdated !== 'string' || lastUpdated.trim() === '') {
    throw new Error(`items[${index}].lastUpdated must be a string`);
  }
  return {
    id,
    component,
    officialName,
    source,
    category,
    targetFile,
    variants: parseVariantMatrix(value.variants, `items[${index}].variants`),
    storybookStoryId,
    playwrightTestId,
    registryItemPath,
    registryDependencies,
    forgeEvidencePath,
    status: parseQueueStatus(value.status, `items[${index}].status`),
    attempts,
    lastFailure: parseNullableString(value.lastFailure, `items[${index}].lastFailure`),
    artifacts,
    lastUpdated,
  };
}

export function loadQueue(): QueueDocument {
  const parsed: unknown = JSON.parse(readFileSync(queuePath, 'utf8'));
  if (!isObject(parsed)) throw new Error('queue must be an object');
  if (parsed.schemaVersion !== 1) throw new Error('queue schemaVersion must be 1');
  if (typeof parsed.updatedAt !== 'string' || parsed.updatedAt.trim() === '') {
    throw new Error('queue updatedAt must be a string');
  }
  if (!Array.isArray(parsed.items)) throw new Error('queue items must be an array');
  return {
    schemaVersion: parsed.schemaVersion,
    updatedAt: parsed.updatedAt,
    items: parsed.items.map(parseQueueItem),
  };
}

export function writeQueue(queue: QueueDocument): void {
  ensureDir(dirname(queuePath));
  const nextQueue: QueueDocument = { ...queue, updatedAt: nowIso() };
  const tempPath = `${queuePath}.${process.pid}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(nextQueue, null, 2)}\n`, 'utf8');
  renameSync(tempPath, queuePath);
}

export function countQueue(queue: QueueDocument): QueueCounts {
  const counts: QueueCounts = {
    pending: 0,
    in_progress: 0,
    implemented: 0,
    verified: 0,
    'forge-ready': 0,
    done: 0,
    blocked: 0,
    total: queue.items.length,
  };
  for (const item of queue.items) {
    counts[item.status] += 1;
  }
  return counts;
}

export function readLock(): LockDocument | null {
  if (!existsSync(lockPath)) return null;
  const parsed: unknown = JSON.parse(readFileSync(lockPath, 'utf8'));
  if (!isObject(parsed)) throw new Error('lock must be an object');
  if (parsed.schemaVersion !== 1) throw new Error('lock schemaVersion must be 1');
  const workflowId = parsed.workflowId;
  const pid = parsed.pid;
  const cwd = parsed.cwd;
  const createdAt = parsed.createdAt;
  if (typeof workflowId !== 'string' || workflowId.trim() === '') {
    throw new Error('lock workflowId must be a string');
  }
  if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 0) {
    throw new Error('lock pid must be a positive integer');
  }
  if (typeof cwd !== 'string' || cwd.trim() === '') throw new Error('lock cwd must be a string');
  if (typeof createdAt !== 'string' || createdAt.trim() === '') {
    throw new Error('lock createdAt must be a string');
  }
  return {
    schemaVersion: 1,
    workflowId,
    pid,
    cwd,
    createdAt,
    artifactsDir: parseNullableString(parsed.artifactsDir, 'lock artifactsDir'),
    currentItemId: parseNullableString(parsed.currentItemId, 'lock currentItemId'),
  };
}

export function createLock(workflowId: string, artifactsDir: string | null): LockDocument {
  ensureDir(dirname(lockPath));
  const lock: LockDocument = {
    schemaVersion: 1,
    workflowId,
    pid: process.pid,
    cwd: process.cwd(),
    createdAt: nowIso(),
    artifactsDir,
    currentItemId: null,
  };
  let fd = -1;
  try {
    fd = openSync(lockPath, 'wx');
    writeFileSync(fd, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
    return lock;
  } catch (error) {
    if (existsSync(lockPath)) {
      const existing = readLock();
      throw new Error(
        `Queue lock already exists at ${lockPath}. Owner workflow: ${existing?.workflowId ?? 'unknown'}; current item: ${
          existing?.currentItemId ?? 'unknown'
        }. Inspect before releasing.`
      );
    }
    throw error;
  } finally {
    if (fd >= 0) closeSync(fd);
  }
}

export function writeLock(lock: LockDocument): void {
  ensureDir(dirname(lockPath));
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
}

export function assertLockOwner(workflowId: string): LockDocument {
  const lock = readLock();
  if (!lock) throw new Error(`Queue lock does not exist at ${lockPath}`);
  if (lock.workflowId !== workflowId) {
    throw new Error(`Queue lock is owned by ${lock.workflowId}; refusing to mutate from ${workflowId}`);
  }
  return lock;
}

export function releaseLock(workflowId: string): 'released' | 'no_lock' {
  const lock = readLock();
  if (!lock) return 'no_lock';
  if (lock.workflowId !== workflowId) {
    throw new Error(`Queue lock is owned by ${lock.workflowId}; refusing to release from ${workflowId}`);
  }
  unlinkSync(lockPath);
  return 'released';
}

export function findItem(queue: QueueDocument, itemId: string): QueueItem | undefined {
  return queue.items.find(item => item.id === itemId);
}

export function writeCurrentItemArtifact(
  artifactsDir: string | null,
  payload: Record<string, unknown>
): string | null {
  const artifactPath = currentItemArtifactPath(artifactsDir);
  if (!artifactPath) return null;
  ensureDir(dirname(artifactPath));
  writeFileSync(artifactPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return artifactPath;
}

export function writeRalphArtifacts(item: QueueItem, workflowId: string): RalphArtifacts {
  ensureDir(ralphComponentsDir);
  const jsonPath = resolve(ralphComponentsDir, `${item.id}.json`);
  const markdownPath = resolve(ralphComponentsDir, `${item.id}.md`);
  const contract = {
    schemaVersion: 1,
    generatedAt: nowIso(),
    workflowId,
    component: item.component,
    officialName: item.officialName,
    queueItemId: item.id,
    source: item.source,
    targetFile: item.targetFile,
    storybookStoryId: item.storybookStoryId,
    playwrightTestId: item.playwrightTestId,
    registryItemPath: item.registryItemPath,
    registryDependencies: item.registryDependencies,
    forgeEvidencePath: item.forgeEvidencePath,
    variantFamilies: item.variants,
    successCriteria: [
      'Generic shadcn/Radix wrapper preserves existing component API compatibility.',
      'Reusable variant props are added only when they are broadly useful.',
      'Storybook covers density, surface, state, and mode variant families.',
      'Playwright validates visible canvas, console cleanliness, axe accessibility, and relevant keyboard flow.',
      'shadcn registry metadata is valid and dependencies are encoded before Forge uses this item.',
      'Queue completion artifact records validation evidence before the item is marked done.',
    ],
    validationCommands: [
      'bun --filter @archon/ui-lab type-check',
      'bun --filter @archon/ui-lab test-storybook',
      'bun --filter @archon/ui-lab test:e2e',
      'bun --filter @archon/ui-lab registry:build',
      'bun .archon/scripts/ui-lab/validate.ts',
    ],
  };
  const markdown = [
    `# UI-Lab Component Story: ${item.component}`,
    '',
    `Queue item: \`${item.id}\``,
    `Official component: \`${item.officialName}\``,
    `Generated by workflow: \`${workflowId}\``,
    `Target file: \`${item.targetFile}\``,
    `Registry item: \`${item.registryItemPath}\``,
    `Forge evidence: \`${item.forgeEvidencePath}\``,
    '',
    '## Variant Families',
    '',
    `- density: ${item.variants.density.map(value => `\`${value}\``).join(', ')}`,
    `- surface: ${item.variants.surface.map(value => `\`${value}\``).join(', ')}`,
    `- state: ${item.variants.state.map(value => `\`${value}\``).join(', ')}`,
    `- mode: ${item.variants.mode.map(value => `\`${value}\``).join(', ')}`,
    '',
    '## Done Criteria',
    '',
    '- Component implementation is generic and typed.',
    '- Storybook matrix renders all variant families.',
    '- Relevant interaction and keyboard behavior is covered.',
    '- Playwright reports no console errors and no axe violations for tested stories.',
    '- Registry metadata is valid and Forge can resolve the component from declared evidence.',
    '- Completion evidence is written before the queue item is marked done.',
    '',
  ].join('\n');
  writeFileSync(jsonPath, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
  writeFileSync(markdownPath, markdown, 'utf8');
  return { jsonPath, markdownPath };
}

export function loadCompletionResult(resultPath: string): CompletionResult {
  const parsed: unknown = JSON.parse(readFileSync(resultPath, 'utf8'));
  if (!isObject(parsed)) throw new Error('completion result must be an object');
  const component = parsed.component;
  const status = parsed.status;
  const summary = parsed.summary;
  const artifacts = parsed.artifacts;
  if (typeof component !== 'string' || component.trim() === '') {
    throw new Error('completion result component must be a string');
  }
  assertComponentId(component);
  if (status !== 'done' && status !== 'forge-ready' && status !== 'blocked') {
    throw new Error('completion result status must be done, forge-ready, or blocked');
  }
  if (typeof summary !== 'string' || summary.trim() === '') {
    throw new Error('completion result summary must be a non-empty string');
  }
  if (!isStringArray(artifacts)) throw new Error('completion result artifacts must be string[]');
  const failureReason = parseNullableString(parsed.failureReason, 'completion result failureReason');
  if (status === 'blocked' && (!failureReason || failureReason.trim() === '')) {
    throw new Error('blocked completion result requires failureReason');
  }
  return {
    component,
    status,
    summary,
    variantMatrix: parsed.variantMatrix ?? null,
    validation: parsed.validation ?? null,
    artifacts,
    failureReason,
  };
}
