#!/usr/bin/env bun
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  selectPartyModeRoster,
  type PartyModeRosterSelection,
  type PartyModeToolVoice,
} from './party-mode-roster';

export const PARTY_MODE_PLAN_MARKER = '<!-- archon-bmad-party-mode-plan -->';
const DEFAULT_LABEL = 'archon-bmad-next-improvements';

export interface PartyModePlanTaskSpec {
  id: string;
  summary: string;
  description: string;
}

export interface PartyModePlanStorySpec {
  id: string;
  summary: string;
  description: string;
  evidenceWorkflows: string[];
  tasks: PartyModePlanTaskSpec[];
}

export interface PartyModePlanBuildInput {
  topic: string;
  label?: string;
  seed?: string;
  now?: Date;
}

export interface PartyModePlanArtifact {
  marker: typeof PARTY_MODE_PLAN_MARKER;
  createdAt: string;
  topic: string;
  partyMode: PartyModeRosterSelection;
  toolEvidence: {
    activeVoiceIds: string[];
    inertVoiceIds: string[];
    evidenceRefs: string[];
  };
  consensus: {
    decisionId: 'artifact-driven-jira-follow-through';
    decision: string;
    rationale: string[];
    votes: {
      voiceId: string;
      voice: string;
      stance: string;
      evidenceRefs: string[];
    }[];
  };
  jira: {
    label: string;
    epicSummary: string;
    epicDescription: string;
    stories: PartyModePlanStorySpec[];
  };
  verification: {
    requiredCommands: string[];
    acceptance: string[];
  };
}

interface CliOptions {
  topic: string;
  outputPath: string;
  label?: string;
  seed?: string;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function toolEvidenceRefs(toolVoices: PartyModeToolVoice[]): string[] {
  return unique(toolVoices.flatMap(voice => voice.evidenceRefs)).sort();
}

function buildStories(): PartyModePlanStorySpec[] {
  return [
    {
      id: 'story-party-mode-consensus-artifact',
      summary: 'Generate reusable Party Mode consensus artifacts',
      description:
        'Persist BMAD votes, tool voice evidence, final attribution, and the selected enhancement plan so Party Mode output can drive downstream workflows.',
      evidenceWorkflows: ['bmad-route-first', 'jira-bmad-enhancement-follow-through'],
      tasks: [
        {
          id: 'task-party-mode-plan-cli',
          summary: 'Implementation: Party Mode plan artifact CLI',
          description:
            'Add deterministic CLI generation for Party Mode consensus artifacts, including active/inert tool voice evidence and final attribution.',
        },
        {
          id: 'task-party-mode-plan-tests',
          summary: 'Tests: Party Mode plan artifact contract',
          description:
            'Cover selected BMAD voices, non-voting tool voices, active evidence refs, Jira issue specs, and stable artifact path behavior.',
        },
      ],
    },
    {
      id: 'story-jira-plan-artifact-input',
      summary: 'Drive Jira follow-through from Party Mode plan artifacts',
      description:
        'Let Jira follow-through consume a Party Mode plan artifact instead of relying on a single hardcoded enhancement graph.',
      evidenceWorkflows: ['jira-bmad-enhancement-follow-through', 'agentic-search-capability-loop'],
      tasks: [
        {
          id: 'task-jira-plan-input',
          summary: 'Implementation: Jira plan artifact input',
          description:
            'Add explicit --plan support so dry-run and create/reuse use the artifact label, Epic, Stories, Tasks, and evidence workflow refs.',
        },
        {
          id: 'task-jira-plan-input-tests',
          summary: 'Tests: artifact-driven Jira idempotency',
          description:
            'Prove custom plan graphs produce the expected dry-run issue graph and live create/reuse hierarchy without changing legacy defaults.',
        },
      ],
    },
    {
      id: 'story-party-mode-operator-entrypoint',
      summary: 'Expose Party Mode plan follow-through entrypoints',
      description:
        'Document the operator path from Party Mode plan generation to Jira dry-run, create/reuse, verify, complete, and validation gates.',
      evidenceWorkflows: ['jira-bmad-enhancement-follow-through', 'ui-lab-productization-loop'],
      tasks: [
        {
          id: 'task-party-mode-entrypoint-docs',
          summary: 'Implementation: operator entrypoint wiring',
          description:
            'Surface the plan artifact path in CLI usage and workflow-facing docs so operators can run follow-through for future Party Mode decisions.',
        },
        {
          id: 'task-party-mode-entrypoint-tests',
          summary: 'Tests: plan path parsing and validation',
          description:
            'Verify the Jira CLI accepts explicit plan artifacts and reports the source plan path in dry-run output.',
        },
      ],
    },
  ];
}

export function defaultPartyModePlanArtifactPath(): string {
  return join(process.cwd(), '.archon', 'state', 'party-mode-next-improvements-plan.json');
}

export function buildPartyModePlan(input: PartyModePlanBuildInput): PartyModePlanArtifact {
  const partyMode = selectPartyModeRoster({
    topic: input.topic,
    minVoices: 4,
    maxVoices: 4,
    ...(input.seed ? { seed: input.seed } : {}),
  });
  const activeToolVoices = partyMode.participant_selection.toolVoices.filter(
    voice => voice.status === 'active'
  );
  const inertToolVoices = partyMode.participant_selection.toolVoices.filter(
    voice => voice.status === 'inert'
  );
  const votes = partyMode.participant_selection.selected.map(voice => ({
    voiceId: voice.id,
    voice: voice.voice,
    stance: voice.stance,
    evidenceRefs: voice.evidenceRefs,
  }));
  const evidenceRefs = toolEvidenceRefs(activeToolVoices);

  return {
    marker: PARTY_MODE_PLAN_MARKER,
    createdAt: (input.now ?? new Date()).toISOString(),
    topic: input.topic,
    partyMode,
    toolEvidence: {
      activeVoiceIds: activeToolVoices.map(voice => voice.id),
      inertVoiceIds: inertToolVoices.map(voice => voice.id),
      evidenceRefs,
    },
    consensus: {
      decisionId: 'artifact-driven-jira-follow-through',
      decision:
        'Add a reusable Party Mode consensus artifact and let Jira follow-through consume it for future enhancement graphs.',
      rationale: [
        'BMAD voices can now participate, but their decision is not yet a reusable workflow input.',
        'Tool voices provide evidence refs; Jira needs those refs bound to a concrete issue graph.',
        'Hardcoded Jira specs block future Party Mode decisions from creating distinct, idempotent Jira work.',
      ],
      votes,
    },
    jira: {
      label: input.label ?? DEFAULT_LABEL,
      epicSummary: 'Party Mode Consensus-To-Jira Improvements',
      epicDescription:
        'Party Mode consensus: make BMAD/tool-voice decisions reusable by persisting a plan artifact and feeding that artifact into Jira follow-through.',
      stories: buildStories(),
    },
    verification: {
      requiredCommands: [
        'bun test ./.archon/scripts/__tests__/party-mode-plan.test.ts ./.archon/scripts/__tests__/jira-follow-through.test.ts',
        'bun run test:mcp',
        'bun run type-check',
        'bun run lint --max-warnings 0',
        'bun run format:check',
        'bun run test',
        'bun run validate',
      ],
      acceptance: [
        'Party Mode plan artifact includes BMAD votes, active/inert tool voices, evidence refs, and Jira issue specs.',
        'Jira follow-through can dry-run and create/reuse from an explicit Party Mode plan artifact.',
        'Legacy Party Mode diversity Jira defaults still work without --plan.',
      ],
    },
  };
}

export async function writePartyModePlanArtifact(
  path: string,
  artifact: PartyModePlanArtifact
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
}

export async function readPartyModePlanArtifact(path: string): Promise<PartyModePlanArtifact> {
  const parsed = JSON.parse(await readFile(path, 'utf8')) as PartyModePlanArtifact;
  if (parsed.marker !== PARTY_MODE_PLAN_MARKER) {
    throw new Error(`Artifact ${path} is not an Archon BMAD Party Mode plan artifact`);
  }
  return parsed;
}

function parseCli(argv: string[]): CliOptions {
  let topic = '';
  let outputPath = defaultPartyModePlanArtifactPath();
  let label: string | undefined;
  let seed: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === '--topic' && next) {
      topic = next;
      index += 1;
      continue;
    }
    if (arg === '--output' && next) {
      outputPath = next;
      index += 1;
      continue;
    }
    if (arg === '--label' && next) {
      label = next;
      index += 1;
      continue;
    }
    if (arg === '--seed' && next) {
      seed = next;
      index += 1;
      continue;
    }
    throw new Error(
      'Usage: bun .archon/scripts/party-mode-plan.ts --topic <text> [--output <path>] [--label <label>] [--seed <seed>]'
    );
  }

  if (!topic.trim()) {
    throw new Error('Missing required --topic');
  }
  return { topic, outputPath, ...(label ? { label } : {}), ...(seed ? { seed } : {}) };
}

async function main(): Promise<void> {
  const options = parseCli(Bun.argv.slice(2));
  const artifact = buildPartyModePlan({
    topic: options.topic,
    ...(options.label ? { label: options.label } : {}),
    ...(options.seed ? { seed: options.seed } : {}),
  });
  await writePartyModePlanArtifact(options.outputPath, artifact);
  process.stdout.write(`${JSON.stringify({ artifactPath: options.outputPath, artifact }, null, 2)}\n`);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
