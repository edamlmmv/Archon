import { homedir } from 'node:os';
import { join } from 'node:path';
import { runRuntimeCapabilityScan, type SourceHit, type UsageMetric } from './capability-reference-scanner';

export type { SourceHit, UsageMetric } from './capability-reference-scanner';

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

export function runMcpUsageReport(options: ScanOptions): McpUsageReport {
  const scan = runRuntimeCapabilityScan(options);

  return {
    ...scan,
    generatedAt: new Date().toISOString(),
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
