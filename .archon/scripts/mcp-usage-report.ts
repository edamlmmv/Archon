import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, extname, join, relative, resolve } from 'node:path';

type SourceKind = 'artifact' | 'log' | 'text';

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

export interface McpUsageReport {
  scannedRoot: string;
  generatedAt: string;
  filesScanned: number;
  jsonlEventsScanned: number;
  requestedMcps: UsageMetric[];
  capabilityIds: UsageMetric[];
  toolCalls: UsageMetric[];
  boundaries: string[];
}

interface ScanOptions {
  root: string;
  maxSourcesPerMetric?: number;
}

interface CliOptions extends ScanOptions {
  json: boolean;
}

interface CollectContext {
  source: SourceHit;
  requestedMcps: Map<string, UsageMetric>;
  capabilityIds: Map<string, UsageMetric>;
  toolCalls: Map<string, UsageMetric>;
  maxSourcesPerMetric: number;
}

const SCANNED_EXTENSIONS = new Set(['.json', '.jsonl', '.md', '.txt']);
const HOST_MCP_PATTERN = /\bhost\.mcp(?:[./][A-Za-z0-9_-]+)+\b/g;
const DEFAULT_MAX_SOURCES = 20;

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

  existing.count += 1;
  const alreadyRecorded = existing.sources.some(
    (candidate) => candidate.file === source.file && candidate.detail === source.detail && candidate.timestamp === source.timestamp,
  );
  if (!alreadyRecorded && existing.sources.length < maxSourcesPerMetric) {
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

function shouldScanFile(filePath: string): boolean {
  return SCANNED_EXTENSIONS.has(extname(filePath)) && (filePath.includes('/logs/') || filePath.includes('/artifacts/runs/'));
}

function listScanFiles(root: string): string[] {
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

    if (stat.isFile() && shouldScanFile(current)) {
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

function collectFromJsonValue(value: unknown, context: CollectContext): void {
  if (typeof value === 'string') {
    collectCapabilityIdsFromText(value, context);
    const trimmed = value.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        collectFromJsonValue(JSON.parse(trimmed), context);
      } catch {
        // Intentional: log content often mixes prose and JSON fragments.
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

function isMcpToolName(toolName: string): boolean {
  return /^mcp(?:__|[._:-])/i.test(toolName) || /^host\.mcp[./]/i.test(toolName) || toolName.includes('mcp__');
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

export function runMcpUsageReport(options: ScanOptions): McpUsageReport {
  const root = resolve(options.root);
  const maxSourcesPerMetric = options.maxSourcesPerMetric ?? DEFAULT_MAX_SOURCES;
  const requestedMcps = new Map<string, UsageMetric>();
  const capabilityIds = new Map<string, UsageMetric>();
  const toolCalls = new Map<string, UsageMetric>();
  let jsonlEventsScanned = 0;

  const files = listScanFiles(root);
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
    generatedAt: new Date().toISOString(),
    filesScanned: files.length,
    jsonlEventsScanned,
    requestedMcps: metricList(requestedMcps),
    capabilityIds: metricList(capabilityIds),
    toolCalls: metricList(toolCalls),
    boundaries: [
      'MCP usage report reads local Archon logs and artifacts only.',
      'mcpAwareness is advisory route evidence; it does not prove install, authorization, live MCP calls, or runtime availability.',
      'Tool-call metrics are evidence only when workflow logs contain MCP-looking tool names.',
    ],
  };
}

function defaultRoot(): string {
  return join(process.env.ARCHON_HOME ?? join(homedir(), '.archon'), 'workspaces');
}

export function parseArgs(argv: string[]): CliOptions {
  let root = defaultRoot();
  let json = false;
  let maxSourcesPerMetric: number | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--root' && next) {
      root = next;
      index += 1;
      continue;
    }

    if (arg === '--archon-home' && next) {
      root = join(next, 'workspaces');
      index += 1;
      continue;
    }

    if (arg === '--json') {
      json = true;
      continue;
    }

    if (arg === '--max-sources' && next) {
      const parsed = Number.parseInt(next, 10);
      if (!Number.isFinite(parsed) || parsed < 1) {
        throw new Error('--max-sources must be a positive integer');
      }
      maxSourcesPerMetric = parsed;
      index += 1;
      continue;
    }

    throw new Error('Usage: bun .archon/scripts/mcp-usage-report.ts [--root <dir>|--archon-home <dir>] [--json] [--max-sources <n>]');
  }

  return { root, json, ...(maxSourcesPerMetric ? { maxSourcesPerMetric } : {}) };
}

function formatMetricSection(title: string, metrics: UsageMetric[]): string {
  const lines = [`${title}:`];
  if (metrics.length === 0) {
    lines.push('  none found');
    return lines.join('\n');
  }

  for (const metric of metrics) {
    lines.push(`  ${metric.name}: ${metric.count}`);
    for (const source of metric.sources.slice(0, 3)) {
      const suffix = source.timestamp ? ` @ ${source.timestamp}` : '';
      lines.push(`    - ${source.kind}: ${source.file} (${source.detail})${suffix}`);
    }
  }

  return lines.join('\n');
}

export function formatReport(report: McpUsageReport): string {
  return [
    'MCP usage evidence',
    `Scanned root: ${report.scannedRoot}`,
    `Files scanned: ${report.filesScanned}`,
    `JSONL events scanned: ${report.jsonlEventsScanned}`,
    '',
    formatMetricSection('Requested MCP names', report.requestedMcps),
    '',
    formatMetricSection('Mapped host.mcp capability IDs', report.capabilityIds),
    '',
    formatMetricSection('MCP-looking tool calls', report.toolCalls),
    '',
    'Boundaries:',
    ...report.boundaries.map((boundary) => `  - ${boundary}`),
  ].join('\n');
}

if (import.meta.main) {
  try {
    const options = parseArgs(Bun.argv.slice(2));
    const report = runMcpUsageReport(options);
    process.stdout.write(`${options.json ? JSON.stringify(report, null, 2) : formatReport(report)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
