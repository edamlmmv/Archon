#!/usr/bin/env bun
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';

export type PartyModeIntent =
  | 'product'
  | 'ux'
  | 'architecture'
  | 'implementation'
  | 'evidence'
  | 'docs'
  | 'process'
  | 'risk'
  | 'general';

export interface PartyModeAgent {
  id: string;
  name: string;
  role: string;
  intents: PartyModeIntent[];
}

export type PartyModeParticipantKind = 'bmad-agent' | 'tool-voice';
export type PartyModeEvidenceAuthority = 'source' | 'advisory' | 'runtime-artifact' | 'runtime-gated';
export type PartyModeParticipantStance = 'accept' | 'change' | 'block' | 'inform';
export type PartyModeToolVoiceStatus = 'active' | 'inert';

export interface PartyModeHistoryEntry {
  createdAt: string;
  topic: string;
  intent: PartyModeIntent;
  selectedAgentIds: string[];
}

export interface PartyModeSelectedVoice {
  id: string;
  name: string;
  role: string;
  kind: 'bmad-agent';
  voice: string;
  scope: string;
  evidenceAllowed: PartyModeEvidenceAuthority[];
  voteAllowed: true;
  handoffRole: string;
  stance: PartyModeParticipantStance;
  evidenceRefs: string[];
  reason: string;
}

export interface PartyModeToolVoiceInput {
  id: string;
  name: string;
  role: string;
  scope: string;
  evidenceAllowed: PartyModeEvidenceAuthority[];
  handoffRole: string;
  evidenceRefs: string[];
}

export interface PartyModeToolVoice {
  id: string;
  name: string;
  role: string;
  kind: 'tool-voice';
  voice: string;
  scope: string;
  evidenceAllowed: PartyModeEvidenceAuthority[];
  voteAllowed: false;
  handoffRole: string;
  stance: PartyModeParticipantStance;
  evidenceRefs: string[];
  status: PartyModeToolVoiceStatus;
  reason: string;
}

export type PartyModeAttributionVoice = PartyModeSelectedVoice | PartyModeToolVoice;

export interface PartyModeParticipantSelection {
  selected: PartyModeSelectedVoice[];
  toolVoices: PartyModeToolVoice[];
  detectedIntents: PartyModeIntent[];
  recentAgentIdsChecked: string[];
  rotationChangedSeat: boolean;
  repeatOverrideReason: string | null;
  historyAvailable: boolean;
}

export interface PartyModeRestingVoice {
  id: string;
  name: string;
  role: string;
}

export interface PartyModeRosterVisibilityContract {
  rosterStrip: {
    intent: PartyModeIntent;
    selectedCount: number;
    historyAvailable: boolean;
  };
  selectedVoices: PartyModeSelectedVoice[];
  toolVoices: PartyModeToolVoice[];
  restingRecentVoices: PartyModeRestingVoice[];
  rotationState: {
    changedSeat: boolean;
    repeatOverrideReason: string | null;
  };
  controls: {
    rotateRequestAvailable: boolean;
    pinOverrideAvailable: boolean;
  };
  finalAttribution: PartyModeAttributionVoice[];
}

export interface PartyModeRosterSelection {
  topic: string;
  intent: PartyModeIntent;
  participant_selection: PartyModeParticipantSelection;
  ui_visibility: PartyModeRosterVisibilityContract;
}

export interface SelectPartyModeRosterInput {
  topic: string;
  intent?: PartyModeIntent;
  agents?: PartyModeAgent[];
  history?: PartyModeHistoryEntry[];
  pinnedAgentIds?: string[];
  minVoices?: number;
  maxVoices?: number;
  seed?: string;
  toolVoices?: PartyModeToolVoiceInput[];
}

interface ScoredAgent {
  agent: PartyModeAgent;
  score: number;
}

const DEFAULT_MIN_VOICES = 2;
const DEFAULT_MAX_VOICES = 4;
const broadIntentOrder: PartyModeIntent[] = [
  'architecture',
  'implementation',
  'ux',
  'evidence',
  'process',
  'docs',
  'product',
  'risk',
];

export const defaultPartyModeAgents: PartyModeAgent[] = [
  { id: 'mary', name: 'Mary', role: 'Business Analyst', intents: ['evidence', 'process', 'product'] },
  { id: 'john', name: 'John', role: 'Product Manager', intents: ['product', 'process', 'risk'] },
  { id: 'sally', name: 'Sally', role: 'UX Designer', intents: ['ux', 'product'] },
  { id: 'winston', name: 'Winston', role: 'System Architect', intents: ['architecture', 'risk'] },
  { id: 'amelia', name: 'Amelia', role: 'Senior Software Engineer', intents: ['implementation', 'risk'] },
  { id: 'paige', name: 'Paige', role: 'Technical Writer', intents: ['docs', 'process', 'architecture'] },
];

const intentKeywords: Record<PartyModeIntent, string[]> = {
  product: ['product', 'scope', 'acceptance', 'priority', 'roadmap', 'jira'],
  ux: ['ux', 'ui', 'user', 'visible', 'workflow builder', 'ui lab', 'experience'],
  architecture: ['architecture', 'dag', 'provider', 'boundary', 'workflow', 'mcp'],
  implementation: ['implement', 'test', 'code', 'fix', 'validation', 'regression'],
  evidence: ['evidence', 'research', 'artifact', 'scan', 'prove', 'jira'],
  docs: ['docs', 'documentation', 'readme', 'skill wording', 'operator'],
  process: ['process', 'lifecycle', 'jira', 'follow-through', 'completion', 'gate'],
  risk: ['risk', 'security', 'failure', 'guard', 'approval', 'rollback'],
  general: [],
};

export const defaultPartyModeToolVoices: PartyModeToolVoiceInput[] = [
  {
    id: 'dag',
    name: 'DAG',
    role: 'Workflow graph evidence',
    scope: 'Validated workflow source, node ordering, provider boundaries, and DAG report output',
    evidenceAllowed: ['source'],
    handoffRole: 'explain workflow shape and source-only boundaries',
    evidenceRefs: [
      '.archon/workflows/bmad-route-first.yaml',
      '.archon/scripts/dag-adoption-report.ts',
    ],
  },
  {
    id: 'capabilities',
    name: 'Capabilities',
    role: 'Capability profile evidence',
    scope: 'Declared capability profiles and advisory-vs-runtime authority',
    evidenceAllowed: ['source', 'advisory', 'runtime-artifact'],
    handoffRole: 'separate declared capability from live support',
    evidenceRefs: [
      '.archon/bmad/capability-profile-registry.agentic-search.json',
      '.archon/bmad/capability-profile-registry.context7.json',
      '.archon/bmad/evidence/archon-workflow-capabilities.md',
    ],
  },
  {
    id: 'agentic-search',
    name: 'Agentic Search',
    role: 'Capability search evidence',
    scope: 'Agentic Search catalogs, Forge request, and runtime-gated local artifacts',
    evidenceAllowed: ['source', 'runtime-artifact'],
    handoffRole: 'surface relevant existing tools before proposing new ones',
    evidenceRefs: [
      '.archon/workflows/agentic-search-capability-loop.yaml',
      '.archon/bmad/agentic-search-capabilities.catalog.json',
      '.archon/bmad/evidence/agentic-search-capability-pack.md',
    ],
  },
  {
    id: 'archon-workflow',
    name: 'Archon Workflow',
    role: 'Archon command/workflow surface',
    scope: 'Local Archon workflow, command, and provider routing evidence',
    evidenceAllowed: ['source', 'runtime-gated'],
    handoffRole: 'map plan steps to runnable Archon workflows and commands',
    evidenceRefs: [
      '.archon/workflows/jira-bmad-enhancement-follow-through.yaml',
      '.archon/commands/bmad-route-first.md',
    ],
  },
  {
    id: 'jira-board',
    name: 'Jira Board',
    role: 'Jira lifecycle evidence',
    scope: 'Existing SCRUM graph, issue hierarchy, labels, statuses, and transition gates',
    evidenceAllowed: ['runtime-artifact', 'runtime-gated'],
    handoffRole: 'prove work item reuse and completion state',
    evidenceRefs: ['.archon/state/jira-party-mode-diversity-plan.json'],
  },
  {
    id: 'ui-lab',
    name: 'UI Lab',
    role: 'Visible roster UX evidence',
    scope: 'UI Lab templates, queues, and Web adoption contracts',
    evidenceAllowed: ['source', 'runtime-artifact'],
    handoffRole: 'make Party Mode roster state visible and testable',
    evidenceRefs: [
      'packages/ui-lab',
      '.archon/bmad/ui-lab-components.queue.json',
      '.archon/bmad/evidence/ui-lab-web-adoption.md',
    ],
  },
  {
    id: 'skills',
    name: 'Skills',
    role: 'Skill contract evidence',
    scope: 'BMAD Party Mode skill wording and installed skill behavior',
    evidenceAllowed: ['source', 'advisory'],
    handoffRole: 'keep operator-facing skill contract aligned with runtime output',
    evidenceRefs: ['.archon/bmad/vendor/bmad-method/src/core-skills/bmad-party-mode/SKILL.md'],
  },
  {
    id: 'commands',
    name: 'Commands',
    role: 'Command surface evidence',
    scope: 'Archon command files used by route-first and capability planning',
    evidenceAllowed: ['source'],
    handoffRole: 'anchor voice claims to command entry points',
    evidenceRefs: ['.archon/commands/bmad-route-first.md', '.archon/commands/bmad-evidence-map.md'],
  },
  {
    id: 'shell',
    name: 'Shell',
    role: 'Deterministic command evidence',
    scope: 'Local script/test output, validation commands, and shell-safe workflow execution',
    evidenceAllowed: ['runtime-artifact', 'runtime-gated'],
    handoffRole: 'provide deterministic pass/fail evidence',
    evidenceRefs: ['package.json', '.archon/scripts/jira-follow-through.ts'],
  },
];

function intentMatches(topic: string): { intent: PartyModeIntent; matches: number }[] {
  const normalized = topic.toLowerCase();
  const priority = new Map(broadIntentOrder.map((intent, index) => [intent, index]));
  return (Object.entries(intentKeywords) as [PartyModeIntent, string[]][])
    .filter(([intent]) => intent !== 'general')
    .map(([intent, keywords]) => ({
      intent,
      matches: keywords.filter(keyword => normalized.includes(keyword)).length,
    }))
    .filter(item => item.matches > 0)
    .sort((a, b) => {
      if (b.matches !== a.matches) return b.matches - a.matches;
      return (priority.get(a.intent) ?? 100) - (priority.get(b.intent) ?? 100);
    });
}

export function detectPartyModeIntents(topic: string): PartyModeIntent[] {
  const matches = intentMatches(topic).map(item => item.intent);
  return matches.length > 0 ? matches : ['general'];
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function inferPartyModeIntent(topic: string): PartyModeIntent {
  return detectPartyModeIntents(topic)[0] ?? 'general';
}

function clampVoiceCount(minVoices: number, maxVoices: number, available: number): number {
  const max = Math.max(1, Math.min(maxVoices, DEFAULT_MAX_VOICES, available));
  return Math.max(1, Math.min(Math.max(minVoices, DEFAULT_MIN_VOICES), max));
}

function recentUsePenalty(agentId: string, history: PartyModeHistoryEntry[]): number {
  const recent = history.slice(-3).reverse();
  return recent.reduce((penalty, entry, index) => {
    if (!entry.selectedAgentIds.includes(agentId)) return penalty;
    return penalty + [18, 10, 5][index];
  }, 0);
}

function scoreAgent(
  agent: PartyModeAgent,
  intent: PartyModeIntent,
  detectedIntents: PartyModeIntent[],
  history: PartyModeHistoryEntry[],
  pinnedAgentIds: Set<string>,
  seed: string
): ScoredAgent {
  const primaryFit = agent.intents.includes(intent) ? 120 : 0;
  const secondaryFit = detectedIntents
    .filter(detectedIntent => detectedIntent !== intent)
    .reduce(
      (score, detectedIntent) => score + (agent.intents.includes(detectedIntent) ? 45 : 0),
      0
    );
  const missionFit = primaryFit + secondaryFit + (agent.intents.includes('process') ? 20 : 0);
  const pinnedBoost = pinnedAgentIds.has(agent.id) ? 1000 : 0;
  const freshnessPenalty = recentUsePenalty(agent.id, history);
  const tieBreak = stableHash(`${seed}:${agent.id}`) / 10_000_000_000;
  return {
    agent,
    score: pinnedBoost + missionFit - freshnessPenalty + tieBreak,
  };
}

function sameRoster(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const normalizedLeft = [...left].sort();
  const normalizedRight = [...right].sort();
  return normalizedLeft.every((value, index) => value === normalizedRight[index]);
}

function reasonFor(agent: PartyModeAgent, intent: PartyModeIntent, pinned: boolean): string {
  if (pinned) return 'explicitly requested by user';
  if (agent.intents.includes(intent)) return `strong fit for ${intent}`;
  if (agent.intents.includes('process')) return 'process coverage and rotation freshness';
  return 'rotation freshness and complementary perspective';
}

function evidenceRefExists(ref: string): boolean {
  return existsSync(isAbsolute(ref) ? ref : join(process.cwd(), ref));
}

function materializeToolVoice(toolVoice: PartyModeToolVoiceInput): PartyModeToolVoice {
  const active = toolVoice.evidenceRefs.some(evidenceRefExists);
  return {
    ...toolVoice,
    kind: 'tool-voice',
    voice: toolVoice.name,
    voteAllowed: false,
    stance: active ? 'inform' : 'block',
    status: active ? 'active' : 'inert',
    reason: active
      ? 'evidence exists in current checkout'
      : 'no current evidence artifact found',
  };
}

function voiceForAgent(agent: PartyModeAgent): string {
  return `${agent.name} (${agent.role})`;
}

function scopeForAgent(agent: PartyModeAgent): string {
  return `BMAD ${agent.role} perspective for ${agent.intents.join(', ')}`;
}

function handoffRoleForAgent(agent: PartyModeAgent): string {
  if (agent.id === 'mary') return 'requirements, evidence, and Jira/process acceptance';
  if (agent.id === 'john') return 'product value, scope, and release slicing';
  if (agent.id === 'sally') return 'visible workflow, UI Lab, and perceived quality';
  if (agent.id === 'winston') return 'architecture, provider boundaries, and DAG risk';
  if (agent.id === 'amelia') return 'implementation plan, tests, and validation gates';
  if (agent.id === 'paige') return 'operator docs, evidence report, and knowledge capture';
  return 'roundtable contribution';
}

function evidenceRefsForAgent(agent: PartyModeAgent): string[] {
  if (agent.id === 'sally') {
    return ['.archon/bmad/evidence/ui-lab-web-adoption.md', 'packages/ui-lab'];
  }
  if (agent.id === 'winston') {
    return ['.archon/scripts/dag-adoption-report.ts', '.archon/workflows/bmad-route-first.yaml'];
  }
  if (agent.id === 'amelia') {
    return ['package.json', '.archon/scripts/__tests__/party-mode-roster.test.ts'];
  }
  if (agent.id === 'mary') {
    return ['.archon/state/jira-party-mode-diversity-plan.json', '.archon/bmad/evidence/bmad-route-first.md'];
  }
  if (agent.id === 'paige') {
    return ['.archon/bmad/vendor/bmad-method/src/core-skills/bmad-party-mode/SKILL.md'];
  }
  return ['.archon/bmad/evidence/bmad-route-first.md'];
}

function stanceForAgent(agent: PartyModeAgent, detectedIntents: PartyModeIntent[]): PartyModeParticipantStance {
  return agent.intents.some(intent => detectedIntents.includes(intent)) ? 'change' : 'inform';
}

function buildSelectedVoice(
  agent: PartyModeAgent,
  intent: PartyModeIntent,
  detectedIntents: PartyModeIntent[],
  pinned: boolean
): PartyModeSelectedVoice {
  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    kind: 'bmad-agent',
    voice: voiceForAgent(agent),
    scope: scopeForAgent(agent),
    evidenceAllowed: ['source', 'advisory', 'runtime-artifact'],
    voteAllowed: true,
    handoffRole: handoffRoleForAgent(agent),
    stance: stanceForAgent(agent, detectedIntents),
    evidenceRefs: evidenceRefsForAgent(agent),
    reason: reasonFor(agent, intent, pinned),
  };
}

function addBroadCoverage(
  selected: PartyModeAgent[],
  scored: ScoredAgent[],
  detectedIntents: PartyModeIntent[],
  voiceCount: number
): PartyModeAgent[] {
  if (detectedIntents.length < 4 || voiceCount < 4) return selected;
  const byId = new Map(scored.map(item => [item.agent.id, item.agent]));
  const requiredIds: string[] = [];
  if (detectedIntents.includes('architecture')) requiredIds.push('winston');
  if (detectedIntents.includes('implementation')) requiredIds.push('amelia');
  if (detectedIntents.includes('ux')) requiredIds.push('sally');
  if (detectedIntents.includes('evidence') || detectedIntents.includes('process')) {
    requiredIds.push('mary');
  }

  const required = requiredIds
    .map(agentId => byId.get(agentId))
    .filter((agent): agent is PartyModeAgent => agent !== undefined);
  const out = [...required];
  for (const agent of selected) {
    if (out.length >= voiceCount) break;
    if (!out.some(existing => existing.id === agent.id)) out.push(agent);
  }
  for (const item of scored) {
    if (out.length >= voiceCount) break;
    if (!out.some(existing => existing.id === item.agent.id)) out.push(item.agent);
  }
  return out.slice(0, voiceCount);
}

function buildVisibilityContract(
  intent: PartyModeIntent,
  agents: PartyModeAgent[],
  participantSelection: PartyModeParticipantSelection
): PartyModeRosterVisibilityContract {
  const selectedIds = new Set(participantSelection.selected.map(agent => agent.id));
  const agentsById = new Map(agents.map(agent => [agent.id, agent]));
  const restingRecentVoices = participantSelection.recentAgentIdsChecked
    .filter(agentId => !selectedIds.has(agentId))
    .map(agentId => agentsById.get(agentId))
    .filter((agent): agent is PartyModeAgent => agent !== undefined)
    .map(agent => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
    }));

  return {
    rosterStrip: {
      intent,
      selectedCount: participantSelection.selected.length,
      historyAvailable: participantSelection.historyAvailable,
    },
    selectedVoices: participantSelection.selected,
    toolVoices: participantSelection.toolVoices,
    restingRecentVoices,
    rotationState: {
      changedSeat: participantSelection.rotationChangedSeat,
      repeatOverrideReason: participantSelection.repeatOverrideReason,
    },
    controls: {
      rotateRequestAvailable: true,
      pinOverrideAvailable: true,
    },
    finalAttribution: [...participantSelection.selected, ...participantSelection.toolVoices],
  };
}

export function selectPartyModeRoster(input: SelectPartyModeRosterInput): PartyModeRosterSelection {
  const agents = input.agents ?? defaultPartyModeAgents;
  const history = input.history ?? [];
  const detectedIntents = input.intent
    ? [input.intent]
    : detectPartyModeIntents(input.topic);
  const intent = input.intent ?? (detectedIntents[0] ?? 'general');
  const toolVoices = (input.toolVoices ?? defaultPartyModeToolVoices).map(materializeToolVoice);
  const pinnedAgentIds = new Set(input.pinnedAgentIds ?? []);
  const defaultMinVoices =
    detectedIntents.length >= DEFAULT_MAX_VOICES ? DEFAULT_MAX_VOICES : DEFAULT_MIN_VOICES;
  const voiceCount = clampVoiceCount(
    input.minVoices ?? defaultMinVoices,
    input.maxVoices ?? DEFAULT_MAX_VOICES,
    agents.length
  );
  const seed = input.seed ?? input.topic;
  const scored = agents
    .map(agent => scoreAgent(agent, intent, detectedIntents, history, pinnedAgentIds, seed))
    .sort((a, b) => b.score - a.score);

  let selected = addBroadCoverage(
    scored.slice(0, voiceCount).map(item => item.agent),
    scored,
    detectedIntents,
    voiceCount
  );
  const previous = history.at(-1)?.selectedAgentIds ?? [];
  let rotationChangedSeat = previous.length > 0 && !sameRoster(selected.map(agent => agent.id), previous);
  let repeatOverrideReason: string | null = null;

  if (previous.length > 0 && sameRoster(selected.map(agent => agent.id), previous)) {
    const replacement = scored.find(item => !selected.some(agent => agent.id === item.agent.id));
    const replaceIndex = selected.findIndex(agent => !pinnedAgentIds.has(agent.id));
    if (replacement && replaceIndex >= 0) {
      selected = selected.map((agent, index) => (index === replaceIndex ? replacement.agent : agent));
      rotationChangedSeat = true;
    } else {
      repeatOverrideReason =
        pinnedAgentIds.size > 0
          ? 'repeated because user-pinned agents fill roster'
          : 'repeated because no alternate voice is available';
    }
  }

  const recentAgentIdsChecked = [...new Set(history.slice(-3).flatMap(entry => entry.selectedAgentIds))];
  const participantSelection: PartyModeParticipantSelection = {
    selected: selected.map(agent =>
      buildSelectedVoice(agent, intent, detectedIntents, pinnedAgentIds.has(agent.id))
    ),
    toolVoices,
    detectedIntents,
    recentAgentIdsChecked,
    rotationChangedSeat,
    repeatOverrideReason,
    historyAvailable: history.length > 0,
  };

  return {
    topic: input.topic,
    intent,
    participant_selection: participantSelection,
    ui_visibility: buildVisibilityContract(intent, agents, participantSelection),
  };
}

async function readHistory(path: string): Promise<PartyModeHistoryEntry[]> {
  if (!existsSync(path)) return [];
  const parsed = JSON.parse(await readFile(path, 'utf8')) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((entry): entry is PartyModeHistoryEntry => {
    if (typeof entry !== 'object' || entry === null) return false;
    const value = entry as PartyModeHistoryEntry;
    return (
      typeof value.createdAt === 'string' &&
      typeof value.topic === 'string' &&
      typeof value.intent === 'string' &&
      Array.isArray(value.selectedAgentIds)
    );
  });
}

async function appendHistory(path: string, selection: PartyModeRosterSelection): Promise<void> {
  const history = await readHistory(path);
  history.push({
    createdAt: new Date().toISOString(),
    topic: selection.topic,
    intent: selection.intent,
    selectedAgentIds: selection.participant_selection.selected.map(agent => agent.id),
  });
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(history, null, 2)}\n`, 'utf8');
}

function defaultHistoryPath(): string {
  return join(process.cwd(), '.archon', 'state', 'bmad-party-mode-history.json');
}

function parseCli(argv: string[]): {
  topic: string;
  historyPath: string;
  write: boolean;
  seed?: string;
} {
  let topic = '';
  let historyPath = defaultHistoryPath();
  let write = false;
  let seed: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === '--topic' && next) {
      topic = next;
      index += 1;
      continue;
    }
    if (arg === '--history' && next) {
      historyPath = next;
      index += 1;
      continue;
    }
    if (arg === '--seed' && next) {
      seed = next;
      index += 1;
      continue;
    }
    if (arg === '--write') {
      write = true;
      continue;
    }
    throw new Error('Usage: bun .archon/scripts/party-mode-roster.ts --topic <text> [--history <path>] [--seed <seed>] [--write]');
  }

  if (!topic.trim()) {
    throw new Error('Missing required --topic');
  }
  return { topic, historyPath, write, ...(seed ? { seed } : {}) };
}

async function main(): Promise<void> {
  const options = parseCli(Bun.argv.slice(2));
  const history = await readHistory(options.historyPath);
  const selection = selectPartyModeRoster({
    topic: options.topic,
    history,
    ...(options.seed ? { seed: options.seed } : {}),
  });
  if (options.write) {
    await appendHistory(options.historyPath, selection);
  }
  process.stdout.write(`${JSON.stringify(selection, null, 2)}\n`);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
