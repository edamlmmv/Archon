import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';

export type SourceKind = 'artifact' | 'log' | 'text';
export type CapabilityAuthority = 'source' | 'advisory' | 'runtime-check' | 'draft-only';
export type CapabilityReferenceSurface =
  | 'registry'
  | 'command'
  | 'workflow'
  | 'script'
  | 'mcp-profile'
  | 'skill'
  | 'forge-request'
  | 'package-script'
  | 'evidence'
  | 'runtime-artifact'
  | 'runtime-log';

export interface SourceHit {
  file: string;
  kind: SourceKind;
  detail: string;
  workflowId?: string;
  timestamp?: string;
}

export interface UsageMetric {
  name: string;
  count: number;
  sources: SourceHit[];
}

export interface RuntimeCapabilityScan {
  scannedRoot: string;
  filesScanned: number;
  jsonlEventsScanned: number;
  requestedMcps: UsageMetric[];
  capabilityIds: UsageMetric[];
  toolCalls: UsageMetric[];
}

export interface RuntimeScanOptions {
  root: string;
  maxSourcesPerMetric?: number;
}

export interface CapabilityReference {
  surface: CapabilityReferenceSurface;
  path: string;
  authority: CapabilityAuthority;
  matchedTerms: string[];
  detail: string;
}

export interface CapabilityTraceOptions {
  repoRoot?: string;
  query: string;
  capabilityIds?: string[];
  evidenceRefs?: string[];
  includeRuntime?: boolean;
  runtimeRoot?: string;
  maxSourcesPerMetric?: number;
}

export interface CapabilityTraceResult {
  repoRoot: string;
  filesScanned: number;
  referencesBySurface: Record<CapabilityReferenceSurface, CapabilityReference[]>;
  runtime?: RuntimeCapabilityScan;
  boundaries: string[];
}

interface CollectContext {
  source: SourceHit;
  requestedMcps: Map<string, UsageMetric>;
  capabilityIds: Map<string, UsageMetric>;
  toolCalls: Map<string, UsageMetric>;
  maxSourcesPerMetric: number;
}

interface StaticScanFile {
  path: string;
  surface: CapabilityReferenceSurface;
  detail: string;
}

const SCANNED_RUNTIME_EXTENSIONS = new Set(['.json', '.jsonl', '.md', '.txt']);
const SCANNED_STATIC_EXTENSIONS = new Set(['.json', '.md', '.ts', '.js', '.yaml', '.yml', '.toml']);
const GENERIC_BASENAME_TERMS = new Set(['package.json', 'registry.json', 'registry-item.json', 'skill.md', 'source.json']);
const HOST_MCP_PATTERN = /\bhost\.mcp(?:[./][A-Za-z0-9_-]+)+\b/g;
const DEFAULT_MAX_SOURCES = 20;
const TRACE_SURFACES: CapabilityReferenceSurface[] = [
  'registry',
  'command',
  'workflow',
  'script',
  'mcp-profile',
  'skill',
  'forge-request',
  'package-script',
  'evidence',
  'runtime-artifact',
  'runtime-log',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function normalizeMetricName(name: string): string {
  return name.trim();
}

function addMetric(map: Map<string, UsageMetric>, rawName: string, source: SourceHit, maxSourcesPerMetric: number): void {
  const name = normalizeMetricName(rawName);
  if (name === '') {
    return;
  }

  const existing = map.get(name);
  if (!existing) {
    map.set(name, { name, count: 1, sources: [source] });
    return;
  }

  const alreadyRecorded = existing.sources.some(
    (candidate) => candidate.file === source.file && candidate.detail === source.detail && candidate.timestamp === source.timestamp,
  );
  if (alreadyRecorded) {
    return;
  }

  existing.count += 1;
  if (existing.sources.length < maxSourcesPerMetric) {
    existing.sources.push(source);
  }
}

function sourceKindForPath(filePath: string): SourceKind {
  if (filePath.endsWith('.jsonl') || filePath.includes('/logs/')) {
    return 'log';
  }
  if (filePath.includes('/artifacts/')) {
    return 'artifact';
  }
  return 'text';
}

function shouldScanRuntimeFile(filePath: string): boolean {
  return (
    SCANNED_RUNTIME_EXTENSIONS.has(extname(filePath)) && (filePath.includes('/logs/') || filePath.includes('/artifacts/runs/'))
  );
}

function listRuntimeScanFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }

  const files: string[] = [];
  const pending: string[] = [root];
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) {
      continue;
    }

    const stat = statSync(current);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current)) {
        pending.push(join(current, entry));
      }
      continue;
    }

    if (stat.isFile() && shouldScanRuntimeFile(current)) {
      files.push(current);
    }
  }

  return files.sort();
}

function relativeFile(root: string, filePath: string): string {
  const relativePath = relative(root, filePath);
  return relativePath.startsWith('..') ? filePath : relativePath;
}

function sourceForFile(root: string, filePath: string, detail: string, workflowId?: string, timestamp?: string): SourceHit {
  return {
    file: relativeFile(root, filePath),
    kind: sourceKindForPath(filePath),
    detail,
    ...(workflowId ? { workflowId } : {}),
    ...(timestamp ? { timestamp } : {}),
  };
}

function collectCapabilityIdsFromText(text: string, context: CollectContext): void {
  for (const match of text.matchAll(HOST_MCP_PATTERN)) {
    addMetric(context.capabilityIds, match[0], context.source, context.maxSourcesPerMetric);
  }
}

function collectFromMcpAwareness(value: unknown, context: CollectContext): void {
  if (!isRecord(value)) {
    return;
  }

  const requestedMcps = value.requestedMcps;
  if (isStringArray(requestedMcps)) {
    for (const requestedMcp of requestedMcps) {
      addMetric(context.requestedMcps, requestedMcp, context.source, context.maxSourcesPerMetric);
    }
  }

  const mappedCapabilities = value.mappedCapabilities;
  if (isStringArray(mappedCapabilities)) {
    for (const capability of mappedCapabilities) {
      if (capability.startsWith('host.mcp.')) {
        addMetric(context.capabilityIds, capability, context.source, context.maxSourcesPerMetric);
      }
    }
  }
}

function isMcpToolName(toolName: string): boolean {
  return /^mcp(?:__|[._:-])/i.test(toolName) || /^host\.mcp[./]/i.test(toolName) || toolName.includes('mcp__');
}

function collectFromJsonValue(value: unknown, context: CollectContext): void {
  if (typeof value === 'string') {
    collectCapabilityIdsFromText(value, context);
    const trimmed = value.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        collectFromJsonValue(JSON.parse(trimmed), context);
      } catch {
        // Intentional: logs often mix prose and JSON fragments.
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectFromJsonValue(item, context);
    }
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  if (isRecord(value.mcpAwareness)) {
    collectFromMcpAwareness(value.mcpAwareness, context);
  }

  if (isStringArray(value.requestedMcps)) {
    for (const requestedMcp of value.requestedMcps) {
      addMetric(context.requestedMcps, requestedMcp, context.source, context.maxSourcesPerMetric);
    }
  }

  const capability = value.capability;
  if (typeof capability === 'string' && capability.startsWith('host.mcp.')) {
    addMetric(context.capabilityIds, capability, context.source, context.maxSourcesPerMetric);
  }

  const capabilityId = value.capabilityId;
  if (typeof capabilityId === 'string' && capabilityId.startsWith('host.mcp.')) {
    addMetric(context.capabilityIds, capabilityId, context.source, context.maxSourcesPerMetric);
  }

  const toolName = value.tool_name;
  if (typeof toolName === 'string' && isMcpToolName(toolName)) {
    addMetric(context.toolCalls, toolName, context.source, context.maxSourcesPerMetric);
  }

  for (const child of Object.values(value)) {
    collectFromJsonValue(child, context);
  }
}

function metricList(map: Map<string, UsageMetric>): UsageMetric[] {
  return Array.from(map.values()).sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

function parseJsonLine(line: string): unknown | null {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

export function runRuntimeCapabilityScan(options: RuntimeScanOptions): RuntimeCapabilityScan {
  const root = resolve(options.root);
  const maxSourcesPerMetric = options.maxSourcesPerMetric ?? DEFAULT_MAX_SOURCES;
  const requestedMcps = new Map<string, UsageMetric>();
  const capabilityIds = new Map<string, UsageMetric>();
  const toolCalls = new Map<string, UsageMetric>();
  let jsonlEventsScanned = 0;

  const files = listRuntimeScanFiles(root);
  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf8');
    const extension = extname(filePath);
    const source = sourceForFile(root, filePath, basename(filePath));
    const context: CollectContext = {
      source,
      requestedMcps,
      capabilityIds,
      toolCalls,
      maxSourcesPerMetric,
    };

    if (extension === '.json') {
      try {
        collectFromJsonValue(JSON.parse(content), context);
      } catch {
        collectCapabilityIdsFromText(content, context);
      }
      continue;
    }

    if (extension === '.jsonl') {
      for (const line of content.split(/\r?\n/)) {
        if (line.trim() === '') {
          continue;
        }
        jsonlEventsScanned += 1;
        const event = parseJsonLine(line);
        if (!isRecord(event)) {
          continue;
        }
        const workflowId = typeof event.workflow_id === 'string' ? event.workflow_id : undefined;
        const timestamp = typeof event.ts === 'string' ? event.ts : undefined;
        const eventSource = sourceForFile(root, filePath, `${String(event.type ?? 'jsonl')}:${String(event.step ?? '')}`, workflowId, timestamp);
        collectFromJsonValue(event, {
          ...context,
          source: eventSource,
        });
      }
      continue;
    }

    collectCapabilityIdsFromText(content, context);
  }

  return {
    scannedRoot: root,
    filesScanned: files.length,
    jsonlEventsScanned,
    requestedMcps: metricList(requestedMcps),
    capabilityIds: metricList(capabilityIds),
    toolCalls: metricList(toolCalls),
  };
}

function normalizeTerm(term: string): string {
  return term.trim().toLowerCase();
}

function basenameTerm(term: string): string {
  return basename(term).toLowerCase();
}

function buildTraceTerms(options: CapabilityTraceOptions, repoRoot: string): string[] {
  const terms = new Set<string>();
  const addTerm = (term: string): void => {
    const normalized = normalizeTerm(term);
    if (normalized.length >= 3) {
      terms.add(normalized);
    }
  };

  addTerm(options.query);
  for (const capabilityId of options.capabilityIds ?? []) {
    addTerm(capabilityId);
  }
  for (const evidenceRef of options.evidenceRefs ?? []) {
    addTerm(evidenceRef);
    const resolvedRef = isAbsolute(evidenceRef) ? evidenceRef : resolve(repoRoot, evidenceRef);
    const relativeRef = relative(repoRoot, resolvedRef);
    if (!relativeRef.startsWith('..')) {
      addTerm(relativeRef);
    }
    const base = basenameTerm(evidenceRef);
    if (!GENERIC_BASENAME_TERMS.has(base)) {
      addTerm(base);
    } else {
      addTerm(basename(dirname(evidenceRef)));
    }
  }

  return Array.from(terms).sort();
}

function hasUsefulStaticExtension(filePath: string): boolean {
  return SCANNED_STATIC_EXTENSIONS.has(extname(filePath));
}

function classifyBmadFile(repoRoot: string, filePath: string): StaticScanFile | null {
  const relativePath = relative(repoRoot, filePath);
  if (relativePath.includes('/vendor/') && !relativePath.endsWith('/source.json')) {
    return null;
  }
  if (relativePath.includes('/evidence/ui-lab-component-runs/')) {
    return null;
  }
  if (!hasUsefulStaticExtension(filePath)) {
    return null;
  }
  if (relativePath.includes('/evidence/')) {
    return { path: filePath, surface: 'evidence', detail: basename(filePath) };
  }
  if (basename(filePath).startsWith('capability-profile-registry.') || basename(filePath).endsWith('.catalog.json')) {
    return { path: filePath, surface: 'registry', detail: basename(filePath) };
  }
  if (basename(filePath).endsWith('.request.json')) {
    return { path: filePath, surface: 'forge-request', detail: basename(filePath) };
  }
  return { path: filePath, surface: 'registry', detail: basename(filePath) };
}

function classifyStaticFile(repoRoot: string, filePath: string): StaticScanFile | null {
  const relativePath = relative(repoRoot, filePath);
  if (relativePath === 'package.json') {
    return { path: filePath, surface: 'package-script', detail: 'package.json' };
  }
  if (relativePath.startsWith('.archon/commands/')) {
    return hasUsefulStaticExtension(filePath) ? { path: filePath, surface: 'command', detail: basename(filePath) } : null;
  }
  if (relativePath.startsWith('.archon/workflows/')) {
    return hasUsefulStaticExtension(filePath) ? { path: filePath, surface: 'workflow', detail: basename(filePath) } : null;
  }
  if (relativePath.startsWith('.archon/scripts/')) {
    return hasUsefulStaticExtension(filePath) ? { path: filePath, surface: 'script', detail: basename(filePath) } : null;
  }
  if (relativePath.startsWith('.archon/mcp/')) {
    return hasUsefulStaticExtension(filePath) ? { path: filePath, surface: 'mcp-profile', detail: basename(filePath) } : null;
  }
  if (relativePath.startsWith('.agents/skills/') || relativePath.startsWith('.claude/skills/')) {
    return basename(filePath) === 'SKILL.md' ? { path: filePath, surface: 'skill', detail: relativePath.split('/').slice(0, -1).join('/') } : null;
  }
  if (relativePath.startsWith('.archon/bmad/')) {
    return classifyBmadFile(repoRoot, filePath);
  }
  return null;
}

function listStaticScanFiles(repoRoot: string): StaticScanFile[] {
  const roots = ['package.json', '.archon/commands', '.archon/workflows', '.archon/scripts', '.archon/mcp', '.archon/bmad', '.agents/skills', '.claude/skills'];
  const files: StaticScanFile[] = [];

  for (const root of roots) {
    const absoluteRoot = resolve(repoRoot, root);
    if (!existsSync(absoluteRoot)) {
      continue;
    }

    const pending: string[] = [absoluteRoot];
    while (pending.length > 0) {
      const current = pending.pop();
      if (!current) {
        continue;
      }

      const stat = statSync(current);
      if (stat.isDirectory()) {
        const relativePath = relative(repoRoot, current);
        if (['node_modules', '.git', 'dist', 'storybook-static'].some((segment) => relativePath.split('/').includes(segment))) {
          continue;
        }
        for (const entry of readdirSync(current)) {
          pending.push(join(current, entry));
        }
        continue;
      }

      if (!stat.isFile()) {
        continue;
      }

      const classified = classifyStaticFile(repoRoot, current);
      if (classified) {
        files.push(classified);
      }
    }
  }

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function inferAuthority(surface: CapabilityReferenceSurface, path: string, content: string): CapabilityAuthority {
  if (surface === 'runtime-artifact' || surface === 'runtime-log' || surface === 'mcp-profile') {
    return 'runtime-check';
  }
  if (surface === 'forge-request') {
    return 'draft-only';
  }
  if (surface === 'skill' || surface === 'registry') {
    return 'advisory';
  }
  if (surface === 'evidence') {
    const combined = `${path}\n${content}`.toLowerCase();
    if (combined.includes('forge')) {
      return 'draft-only';
    }
    if (combined.includes('agentic-search') || combined.includes('context7') || combined.includes('graphify')) {
      return 'advisory';
    }
    return 'source';
  }
  return 'source';
}

function matchedTermsForText(text: string, terms: string[]): string[] {
  const lowerText = text.toLowerCase();
  return terms.filter((term) => lowerText.includes(term));
}

function emptyReferenceGroups(): Record<CapabilityReferenceSurface, CapabilityReference[]> {
  return Object.fromEntries(TRACE_SURFACES.map((surface) => [surface, []])) as Record<CapabilityReferenceSurface, CapabilityReference[]>;
}

function addReference(
  referencesBySurface: Record<CapabilityReferenceSurface, CapabilityReference[]>,
  reference: CapabilityReference,
): void {
  const alreadyRecorded = referencesBySurface[reference.surface].some(
    (candidate) => candidate.path === reference.path && candidate.detail === reference.detail,
  );
  if (!alreadyRecorded) {
    referencesBySurface[reference.surface].push(reference);
  }
}

function packageScriptReferences(repoRoot: string, terms: string[]): CapabilityReference[] {
  const packageJsonPath = resolve(repoRoot, 'package.json');
  if (!existsSync(packageJsonPath)) {
    return [];
  }

  const parsed = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { scripts?: Record<string, unknown> };
  if (!parsed.scripts || !isRecord(parsed.scripts)) {
    return [];
  }

  const references: CapabilityReference[] = [];
  for (const [scriptName, scriptValue] of Object.entries(parsed.scripts)) {
    if (typeof scriptValue !== 'string') {
      continue;
    }
    const matchedTerms = matchedTermsForText(`${scriptName}\n${scriptValue}`, terms);
    if (matchedTerms.length > 0) {
      references.push({
        surface: 'package-script',
        path: 'package.json',
        authority: 'source',
        matchedTerms,
        detail: `script:${scriptName}`,
      });
    }
  }
  return references;
}

function addRuntimeReferences(
  referencesBySurface: Record<CapabilityReferenceSurface, CapabilityReference[]>,
  runtime: RuntimeCapabilityScan,
): void {
  const metrics = [...runtime.requestedMcps, ...runtime.capabilityIds, ...runtime.toolCalls];
  for (const metric of metrics) {
    for (const source of metric.sources) {
      const surface: CapabilityReferenceSurface = source.kind === 'log' ? 'runtime-log' : 'runtime-artifact';
      addReference(referencesBySurface, {
        surface,
        path: source.file,
        authority: 'runtime-check',
        matchedTerms: [metric.name],
        detail: source.detail,
      });
    }
  }
}

export function traceCapabilityReferences(options: CapabilityTraceOptions): CapabilityTraceResult {
  const repoRoot = resolve(options.repoRoot ?? process.cwd());
  const terms = buildTraceTerms(options, repoRoot);
  const referencesBySurface = emptyReferenceGroups();
  const files = listStaticScanFiles(repoRoot);

  for (const file of files) {
    if (file.surface === 'package-script') {
      continue;
    }
    const relativePath = relative(repoRoot, file.path);
    const content = readFileSync(file.path, 'utf8');
    const matchedTerms = matchedTermsForText(`${relativePath}\n${content}`, terms);
    if (matchedTerms.length === 0) {
      continue;
    }
    addReference(referencesBySurface, {
      surface: file.surface,
      path: relativePath,
      authority: inferAuthority(file.surface, relativePath, content),
      matchedTerms,
      detail: file.detail,
    });
  }

  for (const reference of packageScriptReferences(repoRoot, terms)) {
    addReference(referencesBySurface, reference);
  }

  const runtime =
    options.includeRuntime && options.runtimeRoot
      ? runRuntimeCapabilityScan({ root: options.runtimeRoot, maxSourcesPerMetric: options.maxSourcesPerMetric })
      : undefined;
  if (runtime) {
    addRuntimeReferences(referencesBySurface, runtime);
  }

  return {
    repoRoot,
    filesScanned: files.length,
    referencesBySurface,
    ...(runtime ? { runtime } : {}),
    boundaries: [
      'Trace mode reads declared repository metadata and optional captured runtime logs/artifacts only.',
      'Static references are discovery evidence; they do not prove installs, authorization, live MCP calls, or shell execution.',
      'Forge references remain draft-only until a reviewed Forge run promotes generated artifacts.',
    ],
  };
}
