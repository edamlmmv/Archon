import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'bun:test';
import { formatReport, parseArgs, runMcpUsageReport } from '../mcp-usage-report.ts';

let tempRoot: string | undefined;

function makeTempRoot(): string {
  tempRoot = mkdtempSync(join(tmpdir(), 'archon-mcp-usage-'));
  return tempRoot;
}

function writeFixtureFile(path: string, content: string): void {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

afterEach(() => {
  if (tempRoot) {
    rmSync(tempRoot, { recursive: true, force: true });
    tempRoot = undefined;
  }
});

describe('MCP usage report', () => {
  it('summarizes requested MCPs, mapped capabilities, and MCP-looking tool calls from logs and artifacts', () => {
    const root = makeTempRoot();
    const logPath = join(root, 'owner', 'repo', 'logs', 'run-1.jsonl');
    const artifactPath = join(root, 'owner', 'repo', 'artifacts', 'runs', 'run-1', 'bmad-route.json');

    writeFixtureFile(
      logPath,
      [
        JSON.stringify({
          type: 'assistant',
          workflow_id: 'run-1',
          ts: '2026-05-12T10:00:00.000Z',
          content: JSON.stringify({
            mcpAwareness: {
              mentionMode: 'multiple',
              requestedMcps: ['Storybook', 'Playwright'],
              advisoryOnly: true,
            },
            mappedCapabilities: [
              {
                capability: 'host.mcp.storybook.local-preview',
              },
            ],
          }),
        }),
        JSON.stringify({
          type: 'tool',
          workflow_id: 'run-1',
          ts: '2026-05-12T10:01:00.000Z',
          tool_name: '/bin/zsh -lc "rg MCP README.md"',
          tool_input: {},
        }),
        JSON.stringify({
          type: 'tool',
          workflow_id: 'run-1',
          ts: '2026-05-12T10:02:00.000Z',
          tool_name: 'mcp__storybook__get_stories',
          tool_input: {},
        }),
      ].join('\n'),
    );

    writeFixtureFile(
      artifactPath,
      JSON.stringify(
        {
          mcpAwareness: {
            mentionMode: 'single',
            requestedMcps: ['OfficeJS'],
            advisoryOnly: true,
          },
          evidenceRefs: [
            {
              capabilityId: 'host.mcp.context7.office-js-live.docs',
            },
          ],
        },
        null,
        2,
      ),
    );

    const report = runMcpUsageReport({ root });

    expect(report.filesScanned).toBe(2);
    expect(report.jsonlEventsScanned).toBe(3);
    expect(report.requestedMcps.map((metric) => metric.name).sort()).toEqual(['OfficeJS', 'Playwright', 'Storybook']);
    expect(report.capabilityIds.map((metric) => metric.name).sort()).toEqual([
      'host.mcp.context7.office-js-live.docs',
      'host.mcp.storybook.local-preview',
    ]);
    expect(report.toolCalls.map((metric) => metric.name)).toEqual(['mcp__storybook__get_stories']);
    expect(report.boundaries.join('\n')).toContain('advisory route evidence');
  });

  it('formats text output with source paths and boundary language', () => {
    const root = makeTempRoot();
    const artifactPath = join(root, 'owner', 'repo', 'artifacts', 'runs', 'run-2', 'bmad-route.json');

    writeFixtureFile(
      artifactPath,
      JSON.stringify({
        mcpAwareness: {
          requestedMcps: ['WebGL2'],
          advisoryOnly: true,
        },
        evidenceRefs: [{ capability: 'host.mcp.context7.webgl-fundamentals.docs' }],
      }),
    );

    const output = formatReport(runMcpUsageReport({ root }));

    expect(output).toContain('Requested MCP names:');
    expect(output).toContain('WebGL2: 1');
    expect(output).toContain('host.mcp.context7.webgl-fundamentals.docs: 1');
    expect(output).toContain('artifacts/runs/run-2/bmad-route.json');
    expect(output).toContain('does not prove install, authorization, live MCP calls, or runtime availability');
  });

  it('keeps scanning when an artifact JSON file is malformed', () => {
    const root = makeTempRoot();
    const artifactPath = join(root, 'owner', 'repo', 'artifacts', 'runs', 'run-3', 'broken.json');

    writeFixtureFile(artifactPath, '{\n  // operator note\n  "capability": "host.mcp.playwright.official"\n');

    const report = runMcpUsageReport({ root });

    expect(report.filesScanned).toBe(1);
    expect(report.capabilityIds.map((metric) => metric.name)).toEqual(['host.mcp.playwright.official']);
  });

  it('parses CLI roots and JSON mode', () => {
    const options = parseArgs(['--root', '/tmp/archon-workspaces', '--json', '--max-sources', '5']);

    expect(options.root).toBe('/tmp/archon-workspaces');
    expect(options.json).toBe(true);
    expect(options.maxSourcesPerMetric).toBe(5);
  });
});
