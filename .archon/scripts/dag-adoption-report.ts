#!/usr/bin/env bun
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { setLogLevel } from '../../packages/paths/src/logger.ts';
import { parseWorkflow } from '../../packages/workflows/src/loader.ts';
import type { DagNode } from '../../packages/workflows/src/schemas/dag-node.ts';
import type { WorkflowDefinition } from '../../packages/workflows/src/schemas/workflow.ts';
import {
  getProviderCapabilities,
  getProviderInfoList,
  isRegisteredProvider,
  registerBuiltinProviders,
  registerCommunityProviders,
} from '../../packages/providers/src/registry.ts';
import type { ProviderCapabilities } from '../../packages/providers/src/types.ts';

type NodeKind = 'command' | 'prompt' | 'bash' | 'script' | 'loop' | 'approval' | 'cancel';
type AuthorityLevel = 'source' | 'advisory' | 'draft-only' | 'runtime-artifact' | 'runtime-gated';

interface CapabilityCheck {
  field: string;
  capability: keyof ProviderCapabilities;
  isSet: (node: DagNode) => boolean;
}

export interface DagAdoptionNodeReport {
  id: string;
  type: NodeKind;
  dependsOn: string[];
  triggerRule: 'all_success' | 'one_success' | 'none_failed_min_one_success' | 'all_done';
  when: string | null;
  structuredOutput: {
    enabled: boolean;
    schemaType: string | null;
  };
  provider: string | null;
  providerCapabilityLimits: {
    unsupportedConfiguredFields: string[];
    ignoredByProvider: boolean;
  };
}

export interface DagAdoptionWorkflowReport {
  name: string;
  path: string;
  provider: string | null;
  mutatesCheckout: boolean;
  authorityLevels: AuthorityLevel[];
  runtimeProofBoundary: string;
  evidenceRefs: string[];
  evidence: DagEvidenceContract;
  nodes: DagAdoptionNodeReport[];
}

export interface DagEvidenceContract {
  source: boolean;
  advisory: boolean;
  runtimeArtifact: boolean;
  structuredOutput: boolean;
  gateStatus: 'ready' | 'blocked';
  decision: 'allow-jira-dry-run' | 'block-jira-create' | 'source-route-only';
  nextAction: string;
  failureReason: string | null;
}

export interface ProviderCapabilityReport {
  id: string;
  displayName: string;
  builtIn: boolean;
  supported: string[];
  unsupported: string[];
  unsupportedNodeFields: string[];
}

export interface DagAdoptionReport {
  generatedAt: string;
  repoRoot: string;
  summary: {
    workflowCount: number;
    nodeCount: number;
    boundary: string;
  };
  workflows: DagAdoptionWorkflowReport[];
  providerCapabilities: ProviderCapabilityReport[];
  errors: string[];
}

const defaultWorkflowPaths = [
  '.archon/workflows/bmad-route-first.yaml',
  '.archon/workflows/agentic-search-capability-loop.yaml',
  '.archon/workflows/context7-capability-forge-loop.yaml',
  '.archon/workflows/ui-lab-component-loop.yaml',
  '.archon/workflows/ui-lab-productization-loop.yaml',
  '.archon/workflows/jira-bmad-enhancement-follow-through.yaml',
];

const capabilityChecks: CapabilityCheck[] = [
  {
    field: 'allowed_tools/denied_tools',
    capability: 'toolRestrictions',
    isSet: node => node.allowed_tools !== undefined || node.denied_tools !== undefined,
  },
  { field: 'hooks', capability: 'hooks', isSet: node => node.hooks !== undefined },
  { field: 'mcp', capability: 'mcp', isSet: node => node.mcp !== undefined },
  {
    field: 'skills',
    capability: 'skills',
    isSet: node => node.skills !== undefined && node.skills.length > 0,
  },
  { field: 'agents', capability: 'agents', isSet: node => node.agents !== undefined },
  {
    field: 'output_format',
    capability: 'structuredOutput',
    isSet: node => node.output_format !== undefined,
  },
  { field: 'effort', capability: 'effortControl', isSet: node => node.effort !== undefined },
  { field: 'thinking', capability: 'thinkingControl', isSet: node => node.thinking !== undefined },
  { field: 'maxBudgetUsd', capability: 'costControl', isSet: node => node.maxBudgetUsd !== undefined },
  {
    field: 'fallbackModel',
    capability: 'fallbackModel',
    isSet: node => node.fallbackModel !== undefined,
  },
  { field: 'sandbox', capability: 'sandbox', isSet: node => node.sandbox !== undefined },
];

const workflowAuthority: Record<
  string,
  {
    authorityLevels: AuthorityLevel[];
    runtimeProofBoundary: string;
    evidenceRefs: string[];
    evidence: DagEvidenceContract;
  }
> = {
  'bmad-route-first': {
    authorityLevels: ['source', 'advisory'],
    runtimeProofBoundary:
      'Validated DAG source proves route structure only; BMAD runtime claims require captured workflow artifacts.',
    evidenceRefs: [
      '.archon/workflows/bmad-route-first.yaml',
      '.archon/bmad/evidence/bmad-route-first.md',
      '.archon/bmad/evidence/archon-workflow-capabilities.md',
    ],
    evidence: {
      source: true,
      advisory: true,
      runtimeArtifact: false,
      structuredOutput: true,
      gateStatus: 'ready',
      decision: 'source-route-only',
      nextAction: 'Use route output as source/advisory input; require downstream runtime artifacts before Jira create.',
      failureReason: null,
    },
  },
  'agentic-search-capability-loop': {
    authorityLevels: ['source', 'runtime-artifact', 'runtime-gated'],
    runtimeProofBoundary:
      'Agentic Search runtime gate is local artifact evidence only; live adapter/MCP/tool claims require captured runtime artifacts.',
    evidenceRefs: [
      '.archon/workflows/agentic-search-capability-loop.yaml',
      '.archon/bmad/agentic-search-capabilities.catalog.json',
      '.archon/bmad/agentic-search-forge.request.json',
      '.archon/bmad/evidence/agentic-search-capability-pack.md',
    ],
    evidence: {
      source: true,
      advisory: true,
      runtimeArtifact: true,
      structuredOutput: true,
      gateStatus: 'ready',
      decision: 'allow-jira-dry-run',
      nextAction: 'Allow Jira dry-run planning from validated local Agentic Search artifacts; keep live claims blocked.',
      failureReason: null,
    },
  },
  'context7-capability-forge-loop': {
    authorityLevels: ['source', 'runtime-artifact', 'runtime-gated'],
    runtimeProofBoundary:
      'Forge readiness is artifact-producing and runtime-gated; Context7 MCP claims still need captured live output.',
    evidenceRefs: [
      '.archon/workflows/context7-capability-forge-loop.yaml',
      '.archon/bmad/context7-capabilities.catalog.json',
      '.archon/bmad/context7-forge.request.json',
      '.archon/bmad/evidence/context7-capability-pack.md',
    ],
    evidence: {
      source: true,
      advisory: true,
      runtimeArtifact: true,
      structuredOutput: true,
      gateStatus: 'ready',
      decision: 'allow-jira-dry-run',
      nextAction: 'Allow Jira dry-run planning from validated Forge pack artifacts; keep install/live authority separate.',
      failureReason: null,
    },
  },
  'ui-lab-component-loop': {
    authorityLevels: ['source', 'runtime-artifact'],
    runtimeProofBoundary:
      'Queue status and run evidence prove component work only when pending work is selected and validation artifacts are written.',
    evidenceRefs: [
      '.archon/workflows/ui-lab-component-loop.yaml',
      '.archon/bmad/ui-lab-components.queue.json',
      '.archon/bmad/evidence/ui-lab-component-runs/',
    ],
    evidence: {
      source: true,
      advisory: false,
      runtimeArtifact: true,
      structuredOutput: true,
      gateStatus: 'ready',
      decision: 'allow-jira-dry-run',
      nextAction: 'Use UI Lab run evidence only when queue gate selected pending work and validation artifacts exist.',
      failureReason: null,
    },
  },
  'ui-lab-productization-loop': {
    authorityLevels: ['source', 'runtime-artifact'],
    runtimeProofBoundary:
      'Productization authority comes from current-gate queue/evidence updates, not from future Web adoption placeholders.',
    evidenceRefs: [
      '.archon/workflows/ui-lab-productization-loop.yaml',
      '.archon/bmad/ui-lab-productization.queue.json',
      '.archon/bmad/evidence/ui-lab-productization.md',
      '.archon/bmad/evidence/ui-lab-web-adoption.md',
    ],
    evidence: {
      source: true,
      advisory: false,
      runtimeArtifact: true,
      structuredOutput: true,
      gateStatus: 'ready',
      decision: 'allow-jira-dry-run',
      nextAction: 'Use current-gate productization evidence; leave future Web adoption pending until runtime proof exists.',
      failureReason: null,
    },
  },
  'jira-bmad-enhancement-follow-through': {
    authorityLevels: ['runtime-gated'],
    runtimeProofBoundary:
      'Jira mutation is not proof until config, preflight, dry-run, create/reuse, verify, approval, and completion gates pass.',
    evidenceRefs: [
      '.archon/workflows/jira-bmad-enhancement-follow-through.yaml',
      '.archon/scripts/jira-follow-through.ts',
      '.archon/state/jira-party-mode-diversity-plan.json',
    ],
    evidence: {
      source: true,
      advisory: false,
      runtimeArtifact: true,
      structuredOutput: false,
      gateStatus: 'ready',
      decision: 'allow-jira-dry-run',
      nextAction: 'Allow local Jira dry-run; require config, preflight, approval, and verification before live transitions.',
      failureReason: null,
    },
  },
};

function ensureProviderRegistry(): void {
  registerBuiltinProviders();
  registerCommunityProviders();
}

function nodeKind(node: DagNode): NodeKind {
  if ('command' in node) return 'command';
  if ('prompt' in node) return 'prompt';
  if ('bash' in node) return 'bash';
  if ('script' in node) return 'script';
  if ('loop' in node) return 'loop';
  if ('approval' in node) return 'approval';
  return 'cancel';
}

function isAiNode(node: DagNode): boolean {
  return 'command' in node || 'prompt' in node;
}

function configuredUnsupportedFields(node: DagNode, provider: string | null): string[] {
  if (!provider || !isRegisteredProvider(provider)) return [];
  const capabilities = getProviderCapabilities(provider);
  return capabilityChecks
    .filter(check => check.isSet(node) && !capabilities[check.capability])
    .map(check => check.field);
}

function schemaType(node: DagNode): string | null {
  const outputFormat = node.output_format;
  if (!outputFormat) return null;
  const type = outputFormat.type;
  return typeof type === 'string' ? type : null;
}

function reportNode(node: DagNode, workflowProvider: string | null): DagAdoptionNodeReport {
  const provider = isAiNode(node) ? (node.provider ?? workflowProvider) : null;
  const unsupportedConfiguredFields = configuredUnsupportedFields(node, provider);
  return {
    id: node.id,
    type: nodeKind(node),
    dependsOn: node.depends_on ?? [],
    triggerRule: node.trigger_rule ?? 'all_success',
    when: node.when ?? null,
    structuredOutput: {
      enabled: node.output_format !== undefined,
      schemaType: schemaType(node),
    },
    provider,
    providerCapabilityLimits: {
      unsupportedConfiguredFields,
      ignoredByProvider: unsupportedConfiguredFields.length > 0,
    },
  };
}

function reportWorkflow(
  workflow: WorkflowDefinition,
  path: string,
  repoRoot: string
): DagAdoptionWorkflowReport {
  const authority = workflowAuthority[workflow.name] ?? {
    authorityLevels: ['source'] as AuthorityLevel[],
    runtimeProofBoundary: 'Validated workflow structure is source evidence, not runtime proof.',
    evidenceRefs: [path],
    evidence: {
      source: true,
      advisory: false,
      runtimeArtifact: false,
      structuredOutput: workflow.nodes.some(node => node.output_format !== undefined),
      gateStatus: 'blocked',
      decision: 'block-jira-create',
      nextAction: 'Declare workflow evidence contract before using it for Jira follow-through.',
      failureReason: 'Workflow has no explicit DAG evidence contract.',
    } satisfies DagEvidenceContract,
  };
  const workflowProvider = workflow.provider ?? null;

  return {
    name: workflow.name,
    path: relative(repoRoot, resolve(repoRoot, path)),
    provider: workflowProvider,
    mutatesCheckout: workflow.mutates_checkout ?? true,
    authorityLevels: authority.authorityLevels,
    runtimeProofBoundary: authority.runtimeProofBoundary,
    evidenceRefs: authority.evidenceRefs,
    evidence: {
      ...authority.evidence,
      structuredOutput:
        authority.evidence.structuredOutput ||
        workflow.nodes.some(node => node.output_format !== undefined),
    },
    nodes: workflow.nodes.map(node => reportNode(node, workflowProvider)),
  };
}

function capabilityToNodeFields(capability: keyof ProviderCapabilities): string[] {
  return capabilityChecks
    .filter(check => check.capability === capability)
    .map(check => check.field);
}

function reportProviderCapabilities(): ProviderCapabilityReport[] {
  return getProviderInfoList().map(provider => {
    const entries = Object.entries(provider.capabilities) as [keyof ProviderCapabilities, boolean][];
    const unsupported = entries.filter(([, supported]) => !supported).map(([name]) => name);
    return {
      id: provider.id,
      displayName: provider.displayName,
      builtIn: provider.builtIn,
      supported: entries.filter(([, supported]) => supported).map(([name]) => name),
      unsupported,
      unsupportedNodeFields: unsupported.flatMap(capabilityToNodeFields),
    };
  });
}

export async function buildDagAdoptionReport(options: {
  cwd?: string;
  workflowPaths?: string[];
  now?: Date;
} = {}): Promise<DagAdoptionReport> {
  setLogLevel('fatal');
  ensureProviderRegistry();
  const repoRoot = resolve(options.cwd ?? process.cwd());
  const workflowPaths = options.workflowPaths ?? defaultWorkflowPaths;
  const workflows: DagAdoptionWorkflowReport[] = [];
  const errors: string[] = [];

  for (const workflowPath of workflowPaths) {
    const absolutePath = resolve(repoRoot, workflowPath);
    const content = await readFile(absolutePath, 'utf8');
    const parsed = parseWorkflow(content, workflowPath);
    if (parsed.workflow === null) {
      errors.push(`${workflowPath}: ${parsed.error.error}`);
      continue;
    }
    workflows.push(reportWorkflow(parsed.workflow, workflowPath, repoRoot));
  }

  const nodeCount = workflows.reduce((count, workflow) => count + workflow.nodes.length, 0);
  return {
    generatedAt: (options.now ?? new Date()).toISOString(),
    repoRoot,
    summary: {
      workflowCount: workflows.length,
      nodeCount,
      boundary:
        'Validated DAG structure is source evidence only. Forge/Agentic Search gates produce local runtime artifacts, but installed/live authority still requires captured runtime proof.',
    },
    workflows,
    providerCapabilities: reportProviderCapabilities(),
    errors,
  };
}

interface CliOptions {
  json: boolean;
  outputPath?: string;
  workflowPaths: string[];
}

function parseArgs(argv: string[]): CliOptions {
  let json = false;
  let outputPath: string | undefined;
  const workflowPaths: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === '--json') {
      json = true;
      continue;
    }
    if (arg === '--output' && next) {
      outputPath = next;
      index += 1;
      continue;
    }
    if (arg === '--workflow' && next) {
      workflowPaths.push(next);
      index += 1;
      continue;
    }
    throw new Error(
      'Usage: bun .archon/scripts/dag-adoption-report.ts [--json] [--output <path>] [--workflow <path> ...]'
    );
  }

  return { json, ...(outputPath ? { outputPath } : {}), workflowPaths };
}

function formatReport(report: DagAdoptionReport, json: boolean): string {
  if (json) return JSON.stringify(report, null, 2);
  return [
    `DAG adoption report: ${String(report.summary.workflowCount)} workflows, ${String(report.summary.nodeCount)} nodes`,
    report.summary.boundary,
    ...report.workflows.map(
      workflow =>
        `- ${workflow.name}: ${String(workflow.nodes.length)} nodes, mutates_checkout=${String(
          workflow.mutatesCheckout
        )}, authority=${workflow.authorityLevels.join('+')}`
    ),
  ].join('\n');
}

async function main(): Promise<void> {
  const options = parseArgs(Bun.argv.slice(2));
  const report = await buildDagAdoptionReport({
    workflowPaths: options.workflowPaths.length > 0 ? options.workflowPaths : undefined,
  });

  if (options.outputPath) {
    await mkdir(dirname(options.outputPath), { recursive: true });
    await writeFile(options.outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  process.stdout.write(`${formatReport(report, options.json)}\n`);
  if (report.errors.length > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
