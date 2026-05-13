/**
 * Profile command - Safely sync team-shareable Archon home profile files.
 *
 * This command intentionally handles only the safe home-scope surfaces:
 * workflows, commands, scripts, and a small allowlist of global config fields.
 * It never reads or writes ~/.archon/.env, archon.db, workspaces, logs, or artifacts.
 */
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'path';
import { getArchonHome } from '@archon/paths';

const PROFILE_CONFIG_FILENAME = 'config.template.yaml';
const BACKUP_MANIFEST_FILENAME = 'manifest.json';
const SAFE_DIRS = ['workflows', 'commands', 'scripts'] as const;
const SAFE_TOP_LEVEL = new Set<string>([
  PROFILE_CONFIG_FILENAME,
  '.env.example',
  'README.md',
  ...SAFE_DIRS,
]);
const IGNORED_FILENAMES = new Set<string>(['.DS_Store', '.gitkeep']);
const PLACEHOLDER_VALUES = new Set<string>([
  '',
  '""',
  "''",
  '<value>',
  '<token>',
  '<secret>',
  '<key>',
  'changeme',
  'change-me',
  'replace-me',
  'replace_me',
  'placeholder',
  'example',
]);

type SafeDir = (typeof SAFE_DIRS)[number];

export interface ProfileIssue {
  level: 'error' | 'warning';
  file: string;
  message: string;
  line?: number;
}

export interface ProfileValidationResult {
  valid: boolean;
  profilePath: string;
  issues: ProfileIssue[];
  files: string[];
}

export interface ProfilePlanEntry {
  action: 'copy' | 'symlink' | 'write-config' | 'backup' | 'restore' | 'remove';
  source?: string;
  target: string;
}

export interface ProfileSyncResult {
  valid: boolean;
  dryRun: boolean;
  backupId?: string;
  actions: ProfilePlanEntry[];
  issues: ProfileIssue[];
}

export interface ProfileRestoreResult {
  dryRun: boolean;
  backupId: string;
  actions: ProfilePlanEntry[];
}

interface SafeConfig {
  defaultAssistant?: string;
  assistants?: Record<string, Record<string, string>>;
  streaming?: {
    telegram?: 'stream' | 'batch';
    discord?: 'stream' | 'batch';
    slack?: 'stream' | 'batch';
  };
  concurrency?: {
    maxConversations?: number;
  };
}

interface BackupManifestEntry {
  path: 'config.yaml' | SafeDir;
  exists: boolean;
}

interface BackupManifest {
  createdAt: string;
  sourceProfilePath?: string;
  entries: BackupManifestEntry[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeProfilePath(cwd: string, profilePath?: string): string {
  return resolve(cwd, profilePath ?? join('.archon', 'team-profile'));
}

function toRelativeFile(profilePath: string, filePath: string): string {
  return relative(profilePath, filePath).split(sep).join('/');
}

function listFiles(root: string): string[] {
  if (!existsSync(root)) return [];

  const stat = lstatSync(root);
  if (stat.isFile()) return [root];
  if (!stat.isDirectory()) return [];

  const files: string[] = [];
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_FILENAMES.has(entry.name)) continue;
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function topLevelName(relativePath: string): string {
  return relativePath.split('/')[0] ?? relativePath;
}

function isSecretKey(key: string): boolean {
  const normalized = key.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  return (
    normalized === 'DATABASE_URL' ||
    normalized.includes('OAUTH') ||
    normalized.endsWith('_TOKEN') ||
    normalized.endsWith('_KEY') ||
    normalized.endsWith('_SECRET') ||
    normalized.endsWith('_PASSWORD') ||
    normalized.includes('_TOKEN_') ||
    normalized.includes('_KEY_') ||
    normalized.includes('_SECRET_') ||
    normalized.includes('_PASSWORD_')
  );
}

function isPlaceholderValue(value: string): boolean {
  const trimmed = value.trim();
  if (PLACEHOLDER_VALUES.has(trimmed.toLowerCase())) return true;
  if (/^<[^>]+>$/.test(trimmed)) return true;
  if (/^\$\{[A-Z0-9_]+}$/.test(trimmed)) return true;
  if (/^__[^_]+__$/.test(trimmed)) return true;
  return false;
}

function cleanInlineValue(raw: string): string {
  const hashIndex = raw.indexOf('#');
  const withoutComment = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
  return withoutComment.trim();
}

function detectSecretAssignments(
  relativePath: string,
  content: string,
  issues: ProfileIssue[]
): void {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const envMatch = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    const yamlMatch = /^\s*([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(line);
    const match = envMatch ?? yamlMatch;
    if (!match) return;

    const key = match[1] ?? '';
    const rawValue = match[2] ?? '';
    const value = cleanInlineValue(rawValue);
    if (isSecretKey(key) && !isPlaceholderValue(value)) {
      issues.push({
        level: 'error',
        file: relativePath,
        line: index + 1,
        message: `Secret-looking key '${key}' has a non-placeholder value`,
      });
    }
  });
}

function detectPersonalPaths(relativePath: string, content: string, issues: ProfileIssue[]): void {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes('local-only')) return;
    if (/(^|["':\s])(\/Users\/|\/home\/[A-Za-z0-9._-]+\/|[A-Za-z]:\\Users\\)/.test(line)) {
      issues.push({
        level: 'error',
        file: relativePath,
        line: index + 1,
        message: 'Personal absolute path found; mark local-only or remove it from team profile',
      });
    }
  });
}

function collectSafeConfig(raw: unknown): SafeConfig {
  const safe: SafeConfig = {};
  if (!isRecord(raw)) return safe;

  if (typeof raw.defaultAssistant === 'string' && raw.defaultAssistant.trim()) {
    safe.defaultAssistant = raw.defaultAssistant.trim();
  }

  if (isRecord(raw.assistants)) {
    const assistants: Record<string, Record<string, string>> = {};
    for (const [providerId, value] of Object.entries(raw.assistants)) {
      if (!isRecord(value)) continue;
      const provider: Record<string, string> = {};
      for (const field of ['model', 'modelReasoningEffort', 'webSearchMode']) {
        const fieldValue = value[field];
        if (typeof fieldValue === 'string' && fieldValue.trim()) {
          provider[field] = fieldValue.trim();
        }
      }
      if (Object.keys(provider).length > 0) {
        assistants[providerId] = provider;
      }
    }
    if (Object.keys(assistants).length > 0) safe.assistants = assistants;
  }

  if (isRecord(raw.streaming)) {
    const streaming: SafeConfig['streaming'] = {};
    for (const platform of ['telegram', 'discord', 'slack'] as const) {
      const value = raw.streaming[platform];
      if (value === 'stream' || value === 'batch') {
        streaming[platform] = value;
      }
    }
    if (Object.keys(streaming).length > 0) safe.streaming = streaming;
  }

  if (isRecord(raw.concurrency)) {
    const maxConversations = raw.concurrency.maxConversations;
    if (
      typeof maxConversations === 'number' &&
      Number.isInteger(maxConversations) &&
      maxConversations > 0
    ) {
      safe.concurrency = { maxConversations };
    }
  }

  return safe;
}

function loadYamlFile(path: string): unknown {
  const content = readFileSync(path, 'utf-8');
  return Bun.YAML.parse(content);
}

function loadSafeConfig(profilePath: string): SafeConfig | undefined {
  const configPath = join(profilePath, PROFILE_CONFIG_FILENAME);
  if (!existsSync(configPath)) return undefined;
  return collectSafeConfig(loadYamlFile(configPath));
}

function mergeSafeConfig(current: unknown, safe: SafeConfig): Record<string, unknown> {
  const base = isRecord(current) ? { ...current } : {};
  if (safe.defaultAssistant !== undefined) base.defaultAssistant = safe.defaultAssistant;
  if (safe.assistants !== undefined) {
    const assistants = isRecord(base.assistants) ? { ...base.assistants } : {};
    for (const [providerId, providerSafe] of Object.entries(safe.assistants)) {
      const existing = isRecord(assistants[providerId]) ? assistants[providerId] : {};
      assistants[providerId] = { ...existing, ...providerSafe };
    }
    base.assistants = assistants;
  }
  if (safe.streaming !== undefined) {
    base.streaming = {
      ...(isRecord(base.streaming) ? base.streaming : {}),
      ...safe.streaming,
    };
  }
  if (safe.concurrency !== undefined) {
    base.concurrency = {
      ...(isRecord(base.concurrency) ? base.concurrency : {}),
      ...safe.concurrency,
    };
  }
  return base;
}

function timestampId(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, '-');
}

function backupPath(archonHome: string, backupId: string): string {
  return join(archonHome, 'backups', backupId);
}

function writeBackup(archonHome: string, profilePath: string): string {
  const backupId = timestampId();
  const destination = backupPath(archonHome, backupId);
  mkdirSync(destination, { recursive: true });

  const entries: BackupManifestEntry[] = [{ path: 'config.yaml', exists: false }];
  const configPath = join(archonHome, 'config.yaml');
  if (existsSync(configPath)) {
    cpSync(configPath, join(destination, 'config.yaml'));
    entries[0] = { path: 'config.yaml', exists: true };
  }

  for (const dir of SAFE_DIRS) {
    const source = join(archonHome, dir);
    const exists = existsSync(source);
    entries.push({ path: dir, exists });
    if (exists) {
      cpSync(source, join(destination, dir), { recursive: true, dereference: false });
    }
  }

  const manifest: BackupManifest = {
    createdAt: new Date().toISOString(),
    sourceProfilePath: profilePath,
    entries,
  };
  writeFileSync(join(destination, BACKUP_MANIFEST_FILENAME), JSON.stringify(manifest, null, 2));
  return backupId;
}

function readBackupManifest(archonHome: string, backupId: string): BackupManifest {
  const manifestPath = join(backupPath(archonHome, backupId), BACKUP_MANIFEST_FILENAME);
  if (!existsSync(manifestPath)) {
    throw new Error(`Backup manifest not found: ${manifestPath}`);
  }
  const parsed = JSON.parse(readFileSync(manifestPath, 'utf-8')) as unknown;
  if (!isRecord(parsed) || typeof parsed.createdAt !== 'string' || !Array.isArray(parsed.entries)) {
    throw new Error(`Invalid backup manifest: ${manifestPath}`);
  }
  return {
    createdAt: parsed.createdAt,
    sourceProfilePath:
      typeof parsed.sourceProfilePath === 'string' ? parsed.sourceProfilePath : undefined,
    entries: parsed.entries.map((entry: unknown) => {
      if (!isRecord(entry) || typeof entry.path !== 'string' || typeof entry.exists !== 'boolean') {
        throw new Error(`Invalid backup manifest entry: ${manifestPath}`);
      }
      if (entry.path !== 'config.yaml' && !SAFE_DIRS.includes(entry.path as SafeDir)) {
        throw new Error(`Unsupported backup manifest path '${entry.path}': ${manifestPath}`);
      }
      return { path: entry.path as BackupManifestEntry['path'], exists: entry.exists };
    }),
  };
}

function planProfileFiles(
  profilePath: string,
  archonHome: string,
  link: boolean
): ProfilePlanEntry[] {
  const actions: ProfilePlanEntry[] = [];
  for (const dir of SAFE_DIRS) {
    const sourceRoot = join(profilePath, dir);
    for (const source of listFiles(sourceRoot)) {
      const rel = relative(sourceRoot, source);
      const target = join(archonHome, dir, rel);
      actions.push({ action: link ? 'symlink' : 'copy', source, target });
    }
  }
  return actions;
}

function applyFileActions(actions: ProfilePlanEntry[]): void {
  for (const action of actions) {
    if (!action.source) continue;
    mkdirSync(dirname(action.target), { recursive: true });
    rmSync(action.target, { force: true, recursive: true });
    if (action.action === 'symlink') {
      symlinkSync(action.source, action.target);
    } else if (action.action === 'copy') {
      cpSync(action.source, action.target, { recursive: true, dereference: false });
    }
  }
}

function writeMergedConfig(profilePath: string, archonHome: string): ProfilePlanEntry | undefined {
  const safeConfig = loadSafeConfig(profilePath);
  if (!safeConfig) return undefined;

  const configPath = join(archonHome, 'config.yaml');
  const current = existsSync(configPath) ? loadYamlFile(configPath) : {};
  const merged = mergeSafeConfig(current, safeConfig);
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, Bun.YAML.stringify(merged));
  return {
    action: 'write-config',
    source: join(profilePath, PROFILE_CONFIG_FILENAME),
    target: configPath,
  };
}

export function validateTeamProfile(cwd: string, profilePathArg?: string): ProfileValidationResult {
  const profilePath = normalizeProfilePath(cwd, profilePathArg);
  const issues: ProfileIssue[] = [];

  if (!existsSync(profilePath)) {
    return {
      valid: false,
      profilePath,
      files: [],
      issues: [
        { level: 'error', file: '.', message: `Profile directory not found: ${profilePath}` },
      ],
    };
  }

  const files = listFiles(profilePath);
  for (const fullPath of files) {
    const relativePath = toRelativeFile(profilePath, fullPath);
    const top = topLevelName(relativePath);
    if (!SAFE_TOP_LEVEL.has(top)) {
      issues.push({
        level: 'error',
        file: relativePath,
        message: `Unsupported top-level profile entry '${top}'`,
      });
      continue;
    }

    const content = readFileSync(fullPath, 'utf-8');
    detectSecretAssignments(relativePath, content, issues);
    detectPersonalPaths(relativePath, content, issues);
  }

  const configPath = join(profilePath, PROFILE_CONFIG_FILENAME);
  if (existsSync(configPath)) {
    try {
      loadSafeConfig(profilePath);
    } catch (error) {
      issues.push({
        level: 'error',
        file: PROFILE_CONFIG_FILENAME,
        message: `Invalid YAML: ${(error as Error).message}`,
      });
    }
  }

  return {
    valid: !issues.some(issue => issue.level === 'error'),
    profilePath,
    issues,
    files: files.map(file => toRelativeFile(profilePath, file)),
  };
}

export function syncTeamProfile(options: {
  cwd: string;
  profilePath?: string;
  archonHome?: string;
  dryRun?: boolean;
  link?: boolean;
}): ProfileSyncResult {
  const archonHome = options.archonHome ?? getArchonHome();
  const profilePath = normalizeProfilePath(options.cwd, options.profilePath);
  const validation = validateTeamProfile(options.cwd, options.profilePath);
  const fileActions = planProfileFiles(profilePath, archonHome, Boolean(options.link));
  const actions: ProfilePlanEntry[] = [
    { action: 'backup', source: archonHome, target: join(archonHome, 'backups', '<timestamp>') },
    ...fileActions,
  ];

  const safeConfig = loadSafeConfig(profilePath);
  if (safeConfig) {
    actions.push({
      action: 'write-config',
      source: join(profilePath, PROFILE_CONFIG_FILENAME),
      target: join(archonHome, 'config.yaml'),
    });
  }

  if (!validation.valid || options.dryRun) {
    return {
      valid: validation.valid,
      dryRun: Boolean(options.dryRun),
      actions,
      issues: validation.issues,
    };
  }

  const backupId = writeBackup(archonHome, profilePath);
  applyFileActions(fileActions);
  writeMergedConfig(profilePath, archonHome);

  return {
    valid: true,
    dryRun: false,
    backupId,
    actions: actions.map(action =>
      action.action === 'backup'
        ? { ...action, target: join(archonHome, 'backups', backupId) }
        : action
    ),
    issues: [],
  };
}

export function restoreTeamProfile(options: {
  backupId: string;
  archonHome?: string;
  dryRun?: boolean;
}): ProfileRestoreResult {
  const archonHome = options.archonHome ?? getArchonHome();
  const manifest = readBackupManifest(archonHome, options.backupId);
  const root = backupPath(archonHome, options.backupId);
  const actions: ProfilePlanEntry[] = [];

  for (const entry of manifest.entries) {
    const target = join(archonHome, entry.path);
    if (!entry.exists) {
      actions.push({ action: 'remove', target });
      continue;
    }
    actions.push({ action: 'restore', source: join(root, entry.path), target });
  }

  if (!options.dryRun) {
    for (const action of actions) {
      rmSync(action.target, { recursive: true, force: true });
      if (action.action === 'restore' && action.source) {
        mkdirSync(dirname(action.target), { recursive: true });
        cpSync(action.source, action.target, { recursive: true, dereference: false });
      }
    }
  }

  return { dryRun: Boolean(options.dryRun), backupId: options.backupId, actions };
}

function printIssues(issues: ProfileIssue[]): void {
  for (const issue of issues) {
    const line = issue.line !== undefined ? `:${String(issue.line)}` : '';
    console.error(`${issue.level.toUpperCase()} ${issue.file}${line} ${issue.message}`);
  }
}

function printActions(actions: ProfilePlanEntry[]): void {
  for (const action of actions) {
    const source = action.source ? `${action.source} -> ` : '';
    console.log(`${action.action.padEnd(12, ' ')} ${source}${action.target}`);
  }
}

function assertSafeBackupId(backupId: string): void {
  if (isAbsolute(backupId) || backupId.includes('..') || basename(backupId) !== backupId) {
    throw new Error(`Invalid backup id: ${backupId}`);
  }
}

export async function profileCommand(
  cwd: string,
  subcommand: string | undefined,
  args: string[],
  options: { json?: boolean; dryRun?: boolean; link?: boolean }
): Promise<number> {
  switch (subcommand) {
    case 'validate': {
      const profilePath = args[0];
      const result = validateTeamProfile(cwd, profilePath);
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Validating Archon team profile: ${result.profilePath}`);
        if (result.valid) {
          console.log(`OK (${String(result.files.length)} file(s))`);
        } else {
          printIssues(result.issues);
        }
      }
      return result.valid ? 0 : 1;
    }

    case 'sync': {
      const profilePath = args[0];
      const result = syncTeamProfile({
        cwd,
        profilePath,
        dryRun: options.dryRun,
        link: options.link,
      });
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else if (!result.valid) {
        printIssues(result.issues);
      } else {
        if (result.dryRun) console.log('Dry run: no files written.');
        if (result.backupId) console.log(`Backup: ${result.backupId}`);
        printActions(result.actions);
      }
      return result.valid ? 0 : 1;
    }

    case 'restore': {
      const backupId = args[0];
      if (!backupId) {
        console.error('Usage: archon profile restore <backup-id>');
        return 1;
      }
      assertSafeBackupId(backupId);
      const result = restoreTeamProfile({ backupId, dryRun: options.dryRun });
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (result.dryRun) console.log('Dry run: no files restored.');
        printActions(result.actions);
      }
      return 0;
    }

    default:
      if (subcommand === undefined) {
        console.error('Missing profile subcommand');
      } else {
        console.error(`Unknown profile subcommand: ${subcommand}`);
      }
      console.error('Available: validate, sync, restore');
      return 1;
  }
}
