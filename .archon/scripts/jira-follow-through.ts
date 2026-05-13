import '../../packages/paths/src/strip-cwd-env-boot';
import { loadArchonEnv } from '../../packages/paths/src/env-loader';
import { getArchonEnvPath, getRepoArchonEnvPath } from '../../packages/paths/src/archon-paths';

import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { ConversationLockManager } from '../../packages/core/src/index';
import {
  JiraAdapter,
  parseProjectCodebaseMap,
} from '../../packages/adapters/src/community/forge/jira/index';
import {
  readPartyModePlanArtifact,
  type PartyModePlanArtifact,
} from './party-mode-plan';
import type {
  JiraCreateIssueInput,
  JiraCreatedIssue,
  JiraIssueDetails,
  JiraIssueSearchResult,
  JiraIssueTypeDetails,
  JiraTransition,
} from '../../packages/adapters/src/community/forge/jira/index';
import type { DagAdoptionReport, DagEvidenceContract } from './dag-adoption-report';

const DEFAULT_LABEL = 'archon-bmad-jira-enhancement-plan';
const MARKER = '<!-- archon-bmad-jira-enhancement-plan -->';
const EPIC_SUMMARY = 'Archon BMAD/Jira Enhancement Plan';
const DEFAULT_PROJECT_KEY = 'SCRUM';
const DEFAULT_EPIC_ISSUE_TYPE_ID = '10001';
const DEFAULT_STORY_ISSUE_TYPE_ID = '10004';
const DEFAULT_TASK_ISSUE_TYPE_ID = '10003';
const DEFAULT_IN_PROGRESS_STATUS = 'In Progress';
const DEFAULT_DONE_STATUS = 'Done';
const DEFAULT_TRANSITION_PROBE_ISSUE_KEY = 'SCRUM-13';

export interface TaskSpec {
  id: string;
  summary: string;
  description: string;
}

export interface StorySpec {
  id: string;
  summary: string;
  description: string;
  evidenceWorkflows: string[];
  tasks: TaskSpec[];
}

export interface JiraFollowThroughIssuePlan {
  label: string;
  epic: {
    summary: string;
    description: string;
  };
  stories: StorySpec[];
  sourcePlanArtifactPath?: string;
}

export interface JiraFollowThroughConfig {
  siteUrl: string;
  email: string;
  apiToken: string;
  webhookSecret: string;
  projectKey: string;
  projectCodebaseMap: Record<string, string>;
  epicIssueTypeId: string;
  storyIssueTypeId: string;
  taskIssueTypeId: string;
  inProgressStatus: string;
  doneStatus: string;
  transitionProbeIssueKey: string;
  label: string;
  sprintId?: number;
}

export interface JiraFollowThroughConfigResult {
  config?: JiraFollowThroughConfig;
  errors: string[];
}

export interface JiraFollowThroughAdapter {
  createIssue(input: JiraCreateIssueInput): Promise<JiraCreatedIssue>;
  addIssuesToSprint(sprintId: number, issueKeys: string[]): Promise<void>;
  getIssueDetails(issueKey: string): Promise<JiraIssueDetails>;
  getProjectIssueTypes(projectKey: string): Promise<JiraIssueTypeDetails[]>;
  searchIssuesByLabel(projectKey: string, label: string): Promise<JiraIssueSearchResult[]>;
  getAvailableTransitions(issueKey: string): Promise<JiraTransition[]>;
  transitionIssue(issueKey: string, targetStatusName: string): Promise<JiraTransition>;
  sendMessage(conversationId: string, message: string): Promise<void>;
}

export interface JiraFollowThroughArtifact {
  marker: typeof MARKER;
  createdAt: string;
  projectKey: string;
  label: string;
  epic: JiraCreatedIssue;
  stories: JiraCreatedIssue[];
  tasks: JiraCreatedIssue[];
  storyTaskKeys: Record<string, string[]>;
  sprintId?: number;
}

export interface JiraFollowThroughPreflight {
  ok: boolean;
  errors: string[];
  probeIssue?: JiraIssueDetails;
  issueTypes?: JiraIssueTypeDetails[];
  transitions?: JiraTransition[];
}

interface JiraFollowThroughDryRunIssue {
  localId: string;
  issueType: 'Epic' | 'Story' | 'Task';
  issueTypeId: string;
  summary: string;
  description: string;
  parentLocalId: string | null;
  labels: string[];
  transitionAfterCreate?: string;
}

export interface JiraFollowThroughDryRunPlan {
  ok: boolean;
  mutatesJira: false;
  artifactPath: string;
  sourcePlanArtifactPath?: string;
  dagAdoptionReportPath: string | null;
  projectKey: string | null;
  label: string;
  sprintId?: number;
  blockedBy: string[];
  requiredConfig: { name: string; present: boolean }[];
  jiraRestEndpoints: string[];
  evidenceGate: JiraFollowThroughEvidenceGate;
  lifecycle: {
    draft: 'ready';
    configReady: boolean;
    evidenceReady: boolean;
    dryRunPassed: boolean;
    createApproved: false;
    created: false;
    inProgress: false;
    review: false;
    done: false;
  };
  issues: JiraFollowThroughDryRunIssue[];
  storyTaskLocalIds: Record<string, string[]>;
  completionGate: {
    requiresVerificationOk: boolean;
    requiresHumanApproval: boolean;
    doneTransition: string | null;
  };
  authority: {
    dagStructure: 'source-validation-not-runtime-proof';
    forge: 'artifact-producing-not-live-authority';
    agenticSearchAndMcp: 'runtime-artifact-required-for-jira-create';
    jiraMutation: 'preflight-gated';
    doneTransition: 'verification-gated';
  };
}

export interface JiraFollowThroughStoryEvidence {
  storyId: string;
  summary: string;
  workflowNames: string[];
  evidenceRefs: string[];
  gateStatus: 'ready' | 'blocked';
  blockers: string[];
}

export interface JiraFollowThroughEvidenceGate {
  ok: boolean;
  blockedBy: string[];
  stories: JiraFollowThroughStoryEvidence[];
}

interface CliOptions {
  command: 'config' | 'preflight' | 'dry-run' | 'create' | 'verify' | 'complete';
  artifactPath: string;
  planArtifactPath?: string;
  json: boolean;
  verificationOk: boolean;
  verificationSummary?: string;
}

const STORY_SPECS: StorySpec[] = [
  {
    id: 'story-party-mode-instrumentation',
    summary: 'Instrument Party Mode roster selection evidence',
    description:
      'Persist selected Party Mode voices, role labels, selection reasons, recent-voice checks, and run metadata so agent diversity is observable and auditable.',
    evidenceWorkflows: [
      'bmad-route-first',
      'jira-bmad-enhancement-follow-through',
    ],
    tasks: [
      {
        id: 'task-party-mode-selection-artifact',
        summary: 'Implementation: Party Mode selection artifact',
        description:
          'Record selected voices, roles, reasons, recent roster check, rotation result, run id, topic, and source refs for each Party Mode run.',
      },
      {
        id: 'task-party-mode-selection-reporting',
        summary: 'Tests: roster selection reporting',
        description:
          'Verify Party Mode output includes participant_selection with names, roles, reasons, recent voices checked, and any repeat override.',
      },
    ],
  },
  {
    id: 'story-party-mode-rotation-policy',
    summary: 'Implement Party Mode rotation and mission-fit policy',
    description:
      'Replace fixed default-heavy voice selection with a mission-fit policy, recent-use penalty, max-repeat guard, and explicit override reason for repeated rosters.',
    evidenceWorkflows: ['bmad-route-first', 'agentic-search-capability-loop'],
    tasks: [
      {
        id: 'task-party-mode-rotation-implementation',
        summary: 'Implementation: deterministic roster rotation',
        description:
          'Choose 2-4 qualified voices, preserve explicit user-pinned agents, rotate at least one seat on adjacent comparable runs, and keep selection deterministic for tests.',
      },
      {
        id: 'task-party-mode-mission-fit-tests',
        summary: 'Tests: mission-fit overrides repetition',
        description:
          'Cover repeated-run rotation, explicit pinned-agent override, evidence-heavy Mary inclusion, UX/UI Lab Sally inclusion, and deterministic seed behavior.',
      },
    ],
  },
  {
    id: 'story-party-mode-ux-visibility',
    summary: 'Expose Party Mode roster rationale in UI Lab/Web surfaces',
    description:
      'Make selected voices, resting recent voices, mode intent, and contribution attribution visible so repeated or changed rosters feel intentional.',
    evidenceWorkflows: ['ui-lab-component-loop', 'ui-lab-productization-loop'],
    tasks: [
      {
        id: 'task-party-mode-roster-ui-contract',
        summary: 'Implementation: roster rationale UI contract',
        description:
          'Define roster strip, selected voices panel, recently-used/resting indicators, rotate request control, and final attribution fields for future UI adoption.',
      },
      {
        id: 'task-party-mode-ui-lab-tests',
        summary: 'Tests: roster visibility and perceived variety',
        description:
          'Add UI Lab/snapshot coverage for roster visibility, selected voice count, rationale text, resting voices state, and UX-scoped Sally inclusion.',
      },
    ],
  },
  {
    id: 'story-jira-party-mode-evidence-linking',
    summary: 'Link Jira completion to Party Mode diversity evidence',
    description:
      'Keep Jira mutation behind config, dry-run, evidence, approval, and completion gates while requiring roster-selection evidence before tasks move to Done.',
    evidenceWorkflows: [
      'jira-bmad-enhancement-follow-through',
      'agentic-search-capability-loop',
      'context7-capability-forge-loop',
    ],
    tasks: [
      {
        id: 'task-jira-party-mode-gates',
        summary: 'Implementation: Jira Party Mode completion gates',
        description:
          'Require verified participant_selection evidence, targeted tests, and human approval before transitioning Jira tasks to Done.',
      },
      {
        id: 'task-jira-party-mode-idempotency-tests',
        summary: 'Tests: Jira evidence linking and idempotency',
        description:
          'Prove labeled Jira issues are reused, duplicate Party Mode enhancement issues are refused, and Done transitions require verification success.',
      },
    ],
  },
];

export function defaultJiraFollowThroughIssuePlan(
  label: string = DEFAULT_LABEL
): JiraFollowThroughIssuePlan {
  return {
    label,
    epic: {
      summary: EPIC_SUMMARY,
      description:
        'Party Mode consensus: use the existing BMAD roster better before adding agents. Make roster selection observable, mission-fit, rotated, and Jira-gated through completion evidence.',
    },
    stories: STORY_SPECS,
  };
}

export function issuePlanFromPartyModePlanArtifact(
  artifact: PartyModePlanArtifact,
  sourcePlanArtifactPath?: string
): JiraFollowThroughIssuePlan {
  return {
    label: artifact.jira.label,
    epic: {
      summary: artifact.jira.epicSummary,
      description: artifact.jira.epicDescription,
    },
    stories: artifact.jira.stories,
    ...(sourcePlanArtifactPath ? { sourcePlanArtifactPath } : {}),
  };
}

function envValue(env: NodeJS.ProcessEnv, primary: string, fallback?: string): string | undefined {
  return env[primary] ?? (fallback ? env[fallback] : undefined);
}

function envValueOrDefault(
  env: NodeJS.ProcessEnv,
  primary: string,
  fallback: string | undefined,
  defaultValue: string
): string {
  return envValue(env, primary, fallback) ?? defaultValue;
}

function requireString(errors: string[], name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    errors.push(`Missing required Jira configuration: ${name}`);
    return '';
  }
  return value.trim();
}

function parseSprintId(errors: string[], raw: string | undefined): number | undefined {
  if (!raw || raw.trim() === '') return undefined;
  const parsed = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    errors.push('JIRA_FOLLOW_THROUGH_SPRINT_ID must be a positive integer when provided');
    return undefined;
  }
  return parsed;
}

function hasValue(value: string | undefined): boolean {
  return value !== undefined && value.trim() !== '';
}

export function readJiraFollowThroughConfigStatus(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd()
): {
  envFiles: { path: string; exists: boolean }[];
  requiredKeys: { name: string; present: boolean }[];
  projectKey: string | null;
  projectMapKeys: string[];
  errors: string[];
} {
  const projectCodebaseRaw = env.JIRA_PROJECT_CODEBASE_MAP;
  let projectMapKeys: string[] = [];
  if (hasValue(projectCodebaseRaw)) {
    try {
      projectMapKeys = Object.keys(parseProjectCodebaseMap(projectCodebaseRaw)).sort();
    } catch {
      projectMapKeys = [];
    }
  }

  return {
    envFiles: [
      { path: getArchonEnvPath(), exists: existsSync(getArchonEnvPath()) },
      { path: getRepoArchonEnvPath(cwd), exists: existsSync(getRepoArchonEnvPath(cwd)) },
    ],
    requiredKeys: [
      { name: 'JIRA_SITE_URL', present: hasValue(env.JIRA_SITE_URL) },
      { name: 'JIRA_EMAIL', present: hasValue(env.JIRA_EMAIL) },
      { name: 'JIRA_API_TOKEN', present: hasValue(env.JIRA_API_TOKEN) },
      { name: 'JIRA_WEBHOOK_SECRET', present: hasValue(env.JIRA_WEBHOOK_SECRET) },
      {
        name: 'JIRA_FOLLOW_THROUGH_PROJECT_KEY or JIRA_PROJECT_KEY',
        present: true,
      },
      {
        name: 'JIRA_FOLLOW_THROUGH_EPIC_ISSUE_TYPE_ID or JIRA_EPIC_ISSUE_TYPE_ID',
        present: true,
      },
      {
        name: 'JIRA_FOLLOW_THROUGH_STORY_ISSUE_TYPE_ID or JIRA_STORY_ISSUE_TYPE_ID',
        present: true,
      },
      {
        name: 'JIRA_FOLLOW_THROUGH_TASK_ISSUE_TYPE_ID or JIRA_TASK_ISSUE_TYPE_ID',
        present: true,
      },
      {
        name: 'JIRA_FOLLOW_THROUGH_IN_PROGRESS_STATUS',
        present: true,
      },
      {
        name: 'JIRA_FOLLOW_THROUGH_DONE_STATUS',
        present: true,
      },
      {
        name: 'JIRA_FOLLOW_THROUGH_TRANSITION_PROBE_ISSUE_KEY',
        present: true,
      },
      { name: 'JIRA_PROJECT_CODEBASE_MAP', present: hasValue(env.JIRA_PROJECT_CODEBASE_MAP) },
    ],
    projectKey: envValueOrDefault(
      env,
      'JIRA_FOLLOW_THROUGH_PROJECT_KEY',
      'JIRA_PROJECT_KEY',
      DEFAULT_PROJECT_KEY
    ).toUpperCase(),
    projectMapKeys,
    errors: readJiraFollowThroughConfig(env).errors,
  };
}

export function readJiraFollowThroughConfig(
  env: NodeJS.ProcessEnv = process.env
): JiraFollowThroughConfigResult {
  const errors: string[] = [];
  const siteUrl = requireString(errors, 'JIRA_SITE_URL', env.JIRA_SITE_URL);
  const email = requireString(errors, 'JIRA_EMAIL', env.JIRA_EMAIL);
  const apiToken = requireString(errors, 'JIRA_API_TOKEN', env.JIRA_API_TOKEN);
  const webhookSecret = requireString(errors, 'JIRA_WEBHOOK_SECRET', env.JIRA_WEBHOOK_SECRET);
  const projectKey = requireString(
    errors,
    'JIRA_FOLLOW_THROUGH_PROJECT_KEY or JIRA_PROJECT_KEY',
    envValueOrDefault(
      env,
      'JIRA_FOLLOW_THROUGH_PROJECT_KEY',
      'JIRA_PROJECT_KEY',
      DEFAULT_PROJECT_KEY
    )
  ).toUpperCase();
  const epicIssueTypeId = requireString(
    errors,
    'JIRA_FOLLOW_THROUGH_EPIC_ISSUE_TYPE_ID or JIRA_EPIC_ISSUE_TYPE_ID',
    envValueOrDefault(
      env,
      'JIRA_FOLLOW_THROUGH_EPIC_ISSUE_TYPE_ID',
      'JIRA_EPIC_ISSUE_TYPE_ID',
      DEFAULT_EPIC_ISSUE_TYPE_ID
    )
  );
  const storyIssueTypeId = requireString(
    errors,
    'JIRA_FOLLOW_THROUGH_STORY_ISSUE_TYPE_ID or JIRA_STORY_ISSUE_TYPE_ID',
    envValueOrDefault(
      env,
      'JIRA_FOLLOW_THROUGH_STORY_ISSUE_TYPE_ID',
      'JIRA_STORY_ISSUE_TYPE_ID',
      DEFAULT_STORY_ISSUE_TYPE_ID
    )
  );
  const taskIssueTypeId = requireString(
    errors,
    'JIRA_FOLLOW_THROUGH_TASK_ISSUE_TYPE_ID or JIRA_TASK_ISSUE_TYPE_ID',
    envValueOrDefault(
      env,
      'JIRA_FOLLOW_THROUGH_TASK_ISSUE_TYPE_ID',
      'JIRA_TASK_ISSUE_TYPE_ID',
      DEFAULT_TASK_ISSUE_TYPE_ID
    )
  );
  const inProgressStatus = requireString(
    errors,
    'JIRA_FOLLOW_THROUGH_IN_PROGRESS_STATUS',
    env.JIRA_FOLLOW_THROUGH_IN_PROGRESS_STATUS ?? DEFAULT_IN_PROGRESS_STATUS
  );
  const doneStatus = requireString(
    errors,
    'JIRA_FOLLOW_THROUGH_DONE_STATUS',
    env.JIRA_FOLLOW_THROUGH_DONE_STATUS ?? DEFAULT_DONE_STATUS
  );
  const transitionProbeIssueKey = requireString(
    errors,
    'JIRA_FOLLOW_THROUGH_TRANSITION_PROBE_ISSUE_KEY',
    env.JIRA_FOLLOW_THROUGH_TRANSITION_PROBE_ISSUE_KEY ?? DEFAULT_TRANSITION_PROBE_ISSUE_KEY
  );
  const projectCodebaseRaw = requireString(
    errors,
    'JIRA_PROJECT_CODEBASE_MAP',
    env.JIRA_PROJECT_CODEBASE_MAP
  );

  let projectCodebaseMap: Record<string, string> = {};
  if (projectCodebaseRaw) {
    try {
      projectCodebaseMap = parseProjectCodebaseMap(projectCodebaseRaw);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (projectKey && !projectCodebaseMap[projectKey]) {
    errors.push(`JIRA_PROJECT_CODEBASE_MAP must include ${projectKey}`);
  }

  const sprintId = parseSprintId(errors, env.JIRA_FOLLOW_THROUGH_SPRINT_ID);
  const label = (env.JIRA_FOLLOW_THROUGH_LABEL ?? DEFAULT_LABEL).trim() || DEFAULT_LABEL;

  if (errors.length > 0) return { errors };
  return {
    errors,
    config: {
      siteUrl,
      email,
      apiToken,
      webhookSecret,
      projectKey,
      projectCodebaseMap,
      epicIssueTypeId,
      storyIssueTypeId,
      taskIssueTypeId,
      inProgressStatus,
      doneStatus,
      transitionProbeIssueKey,
      label,
      ...(sprintId ? { sprintId } : {}),
    },
  };
}

export async function preflightJiraFollowThrough(
  config: JiraFollowThroughConfig,
  adapter: JiraFollowThroughAdapter
): Promise<JiraFollowThroughPreflight> {
  const errors: string[] = [];
  let probeIssue: JiraIssueDetails | undefined;
  let issueTypes: JiraIssueTypeDetails[] | undefined;
  let transitions: JiraTransition[] | undefined;

  try {
    probeIssue = await adapter.getIssueDetails(config.transitionProbeIssueKey);
  } catch (error) {
    errors.push(
      `Jira credential/probe issue check failed for ${config.transitionProbeIssueKey}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  try {
    issueTypes = await adapter.getProjectIssueTypes(config.projectKey);
    const available = new Map(issueTypes.map(issueType => [issueType.id, issueType]));
    const requiredIssueTypes = [
      { id: config.epicIssueTypeId, label: 'Epic' },
      { id: config.storyIssueTypeId, label: 'Story' },
      { id: config.taskIssueTypeId, label: 'Task' },
    ];
    for (const required of requiredIssueTypes) {
      if (!available.has(required.id)) {
        errors.push(
          `Missing Jira ${required.label} issue type id ${required.id} for project ${config.projectKey}. Available issue types: ${issueTypes
            .map(issueType => `${issueType.id}:${issueType.name}`)
            .join(', ')}`
        );
      }
    }
  } catch (error) {
    errors.push(
      `Jira issue type metadata check failed for project ${config.projectKey}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  try {
    transitions = await adapter.getAvailableTransitions(config.transitionProbeIssueKey);
    for (const statusName of [config.inProgressStatus, config.doneStatus]) {
      const found = transitions.some(item => item.name === statusName || item.to === statusName);
      if (!found) {
        errors.push(
          `Missing Jira transition '${statusName}' for ${config.transitionProbeIssueKey}. Available: ${transitions
            .map(item => `${item.id}:${item.name}->${item.to}`)
            .join(', ')}`
        );
      }
    }
  } catch (error) {
    errors.push(
      `Jira transition preflight failed for ${config.transitionProbeIssueKey}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return { ok: errors.length === 0, errors, probeIssue, issueTypes, transitions };
}

function issueTypeIdFor(config: JiraFollowThroughConfig | undefined, issueType: 'Epic' | 'Story' | 'Task'): string {
  if (!config) return `<missing-${issueType.toLowerCase()}-issue-type-id>`;
  if (issueType === 'Epic') return config.epicIssueTypeId;
  if (issueType === 'Story') return config.storyIssueTypeId;
  return config.taskIssueTypeId;
}

function buildDryRunIssues(
  config: JiraFollowThroughConfig | undefined,
  issuePlan: JiraFollowThroughIssuePlan
): { issues: JiraFollowThroughDryRunIssue[]; storyTaskLocalIds: Record<string, string[]> } {
  const labels = [issuePlan.label];
  const issues: JiraFollowThroughDryRunIssue[] = [
    {
      localId: 'epic-archon-bmad-jira-enhancement-plan',
      issueType: 'Epic',
      issueTypeId: issueTypeIdFor(config, 'Epic'),
      summary: issuePlan.epic.summary,
      description: issueDescription(issuePlan.epic.description),
      parentLocalId: null,
      labels,
    },
  ];
  const storyTaskLocalIds: Record<string, string[]> = {};

  for (const storySpec of issuePlan.stories) {
    const storyLocalId = storySpec.id;
    storyTaskLocalIds[storyLocalId] = [];
    issues.push({
      localId: storyLocalId,
      issueType: 'Story',
      issueTypeId: issueTypeIdFor(config, 'Story'),
      summary: storySpec.summary,
      description: issueDescription(storySpec.description),
      parentLocalId: 'epic-archon-bmad-jira-enhancement-plan',
      labels,
    });

    for (const taskSpec of storySpec.tasks) {
      const taskLocalId = taskSpec.id;
      storyTaskLocalIds[storyLocalId].push(taskLocalId);
      issues.push({
        localId: taskLocalId,
        issueType: 'Task',
        issueTypeId: issueTypeIdFor(config, 'Task'),
        summary: taskSpec.summary,
        description: issueDescription(`Supports ${storyLocalId}: ${taskSpec.description}`),
        parentLocalId: 'epic-archon-bmad-jira-enhancement-plan',
        labels,
        transitionAfterCreate: config?.inProgressStatus ?? '<missing-in-progress-status>',
      });
    }
  }

  return { issues, storyTaskLocalIds };
}

function loadEvidenceContractsFromDagReportPath(
  dagAdoptionReportPath: string | null
): Record<string, DagEvidenceContract> {
  if (!dagAdoptionReportPath || !existsSync(dagAdoptionReportPath)) return {};
  const raw = readFileSync(dagAdoptionReportPath, 'utf8');
  const report = JSON.parse(raw) as DagAdoptionReport;
  return Object.fromEntries(report.workflows.map(workflow => [workflow.name, workflow.evidence]));
}

function evidenceAllowsJiraPlanning(evidence: DagEvidenceContract | undefined): boolean {
  return evidence?.gateStatus === 'ready' && (evidence.source || evidence.runtimeArtifact);
}

export function evaluateJiraFollowThroughEvidenceGate(
  evidenceContracts: Record<string, DagEvidenceContract>,
  issuePlan: JiraFollowThroughIssuePlan = defaultJiraFollowThroughIssuePlan()
): JiraFollowThroughEvidenceGate {
  const stories = issuePlan.stories.map(storySpec => {
    const blockers: string[] = [];
    const evidenceRefs: string[] = [];

    for (const workflowName of storySpec.evidenceWorkflows) {
      const evidence = evidenceContracts[workflowName];
      if (!evidence) {
        blockers.push(`${workflowName} has no DAG evidence contract`);
        continue;
      }
      if (!evidenceAllowsJiraPlanning(evidence)) {
        blockers.push(
          `${workflowName} evidence is ${evidence.gateStatus}/${evidence.decision}; ${evidence.failureReason ?? 'source/runtime artifact required'}`
        );
        continue;
      }
      evidenceRefs.push(...evidence.nextAction.split('\n').filter(Boolean));
    }

    return {
      storyId: storySpec.id,
      summary: storySpec.summary,
      workflowNames: storySpec.evidenceWorkflows,
      evidenceRefs,
      gateStatus: blockers.length === 0 ? 'ready' : 'blocked',
      blockers,
    };
  });
  const blockedBy = stories.flatMap(story =>
    story.blockers.map(blocker => `${story.storyId}: ${blocker}`)
  );

  return { ok: blockedBy.length === 0, blockedBy, stories };
}

export function buildJiraFollowThroughDryRunPlan(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
  artifactPath: string = defaultArtifactPath(),
  dagAdoptionReportPath: string | null = null,
  evidenceContracts?: Record<string, DagEvidenceContract>,
  issuePlanInput?: JiraFollowThroughIssuePlan
): JiraFollowThroughDryRunPlan {
  const configResult = readJiraFollowThroughConfig(env);
  const status = readJiraFollowThroughConfigStatus(env, cwd);
  const config = configResult.config;
  const issuePlan =
    issuePlanInput ??
    defaultJiraFollowThroughIssuePlan(
      config?.label ?? ((env.JIRA_FOLLOW_THROUGH_LABEL ?? DEFAULT_LABEL).trim() || DEFAULT_LABEL)
    );
  const label = issuePlan.label;
  const sprintId = parseSprintId([], env.JIRA_FOLLOW_THROUGH_SPRINT_ID);
  const { issues, storyTaskLocalIds } = buildDryRunIssues(config, issuePlan);
  const evidenceGate = evaluateJiraFollowThroughEvidenceGate(
    evidenceContracts ?? loadEvidenceContractsFromDagReportPath(dagAdoptionReportPath),
    issuePlan
  );
  const configReady = configResult.errors.length === 0;

  return {
    ok: configReady && evidenceGate.ok,
    mutatesJira: false,
    artifactPath,
    ...(issuePlan.sourcePlanArtifactPath
      ? { sourcePlanArtifactPath: issuePlan.sourcePlanArtifactPath }
      : {}),
    dagAdoptionReportPath,
    projectKey: config?.projectKey ?? status.projectKey,
    label,
    ...(sprintId !== undefined ? { sprintId } : {}),
    blockedBy: [...configResult.errors, ...evidenceGate.blockedBy],
    requiredConfig: status.requiredKeys,
    jiraRestEndpoints: [
      'POST /rest/api/3/issue',
      'POST /rest/api/3/search/jql',
      'GET /rest/api/3/issue/{key}/transitions',
      'POST /rest/api/3/issue/{key}/transitions',
      'POST /rest/agile/1.0/sprint/{sprintId}/issue',
    ],
    evidenceGate,
    lifecycle: {
      draft: 'ready',
      configReady,
      evidenceReady: evidenceGate.ok,
      dryRunPassed: configReady && evidenceGate.ok,
      createApproved: false,
      created: false,
      inProgress: false,
      review: false,
      done: false,
    },
    issues,
    storyTaskLocalIds,
    completionGate: {
      requiresVerificationOk: true,
      requiresHumanApproval: true,
      doneTransition: config?.doneStatus ?? null,
    },
    authority: {
      dagStructure: 'source-validation-not-runtime-proof',
      forge: 'artifact-producing-not-live-authority',
      agenticSearchAndMcp: 'runtime-artifact-required-for-jira-create',
      jiraMutation: 'preflight-gated',
      doneTransition: 'verification-gated',
    },
  };
}

function issueDescription(body: string): string {
  return `${MARKER}\n\n${body}`;
}

function issueTypeName(
  preflight: JiraFollowThroughPreflight,
  issueTypeId: string,
  fallback: string
): string {
  return preflight.issueTypes?.find(issueType => issueType.id === issueTypeId)?.name ?? fallback;
}

function toCreatedIssue(issue: JiraIssueSearchResult): JiraCreatedIssue {
  return {
    id: issue.id,
    key: issue.key,
    url: issue.url,
    summary: issue.summary,
  };
}

function findExistingIssue(
  issues: JiraIssueSearchResult[],
  issueType: string,
  summary: string
): JiraIssueSearchResult | undefined {
  const matches = issues.filter(issue => issue.issueType === issueType && issue.summary === summary);
  if (matches.length > 1) {
    throw new Error(
      `Found ${String(matches.length)} Jira issues with type ${issueType} and summary '${summary}'. Refusing to choose between duplicates.`
    );
  }
  return matches[0];
}

function assertExistingParent(
  issue: JiraIssueSearchResult,
  expectedParentKey: string,
  parentLabel: string
): void {
  if (issue.parentKey !== expectedParentKey) {
    throw new Error(
      `Existing Jira issue ${issue.key} is not parented to ${parentLabel} ${expectedParentKey}; found ${issue.parentKey ?? 'none'}`
    );
  }
}

function siteHost(siteUrl: string): string {
  return new URL(siteUrl).host;
}

function conversationId(config: JiraFollowThroughConfig, issueKey: string): string {
  return `jira:${siteHost(config.siteUrl)}:${config.projectKey}:${issueKey}`;
}

async function postTrackingComment(
  adapter: JiraFollowThroughAdapter,
  config: JiraFollowThroughConfig,
  issueKey: string,
  message: string
): Promise<void> {
  await adapter.sendMessage(conversationId(config, issueKey), `${MARKER}\n${message}`);
}

export async function createJiraFollowThroughPlan(
  config: JiraFollowThroughConfig,
  adapter: JiraFollowThroughAdapter,
  now: Date = new Date(),
  evidenceGate: JiraFollowThroughEvidenceGate = evaluateJiraFollowThroughEvidenceGate(
    loadEvidenceContractsFromDagReportPath(process.env.ARCHON_DAG_ADOPTION_REPORT_PATH ?? null)
  ),
  issuePlan: JiraFollowThroughIssuePlan = defaultJiraFollowThroughIssuePlan(config.label)
): Promise<JiraFollowThroughArtifact> {
  if (!evidenceGate.ok) {
    throw new Error(`Jira follow-through evidence gate failed:\n${evidenceGate.blockedBy.join('\n')}`);
  }

  const preflight = await preflightJiraFollowThrough(config, adapter);
  if (!preflight.ok) {
    throw new Error(`Jira follow-through preflight failed:\n${preflight.errors.join('\n')}`);
  }

  const labels = [issuePlan.label];
  const existingIssues = await adapter.searchIssuesByLabel(config.projectKey, issuePlan.label);
  const epicIssueType = issueTypeName(preflight, config.epicIssueTypeId, 'Epic');
  const storyIssueType = issueTypeName(preflight, config.storyIssueTypeId, 'Story');
  const taskIssueType = issueTypeName(preflight, config.taskIssueTypeId, 'Task');
  const existingEpic = findExistingIssue(existingIssues, epicIssueType, issuePlan.epic.summary);
  const epic =
    existingEpic !== undefined
      ? toCreatedIssue(existingEpic)
      : await adapter.createIssue({
          projectKey: config.projectKey,
          issueTypeId: config.epicIssueTypeId,
          summary: issuePlan.epic.summary,
          description: issueDescription(issuePlan.epic.description),
          labels,
        });

  const stories: JiraCreatedIssue[] = [];
  const tasks: JiraCreatedIssue[] = [];
  const storyTaskKeys: Record<string, string[]> = {};
  const taskKeysToTransition: string[] = [];

  for (const storySpec of issuePlan.stories) {
    const existingStory = findExistingIssue(existingIssues, storyIssueType, storySpec.summary);
    if (existingStory !== undefined) assertExistingParent(existingStory, epic.key, 'epic');

    const story =
      existingStory !== undefined
        ? toCreatedIssue(existingStory)
        : await adapter.createIssue({
            projectKey: config.projectKey,
            issueTypeId: config.storyIssueTypeId,
            parentKey: epic.key,
            summary: storySpec.summary,
            description: issueDescription(storySpec.description),
            labels,
          });
    stories.push(story);
    storyTaskKeys[story.key] = [];

    for (const taskSpec of storySpec.tasks) {
      const existingTask = findExistingIssue(existingIssues, taskIssueType, taskSpec.summary);
      if (existingTask !== undefined) assertExistingParent(existingTask, epic.key, 'epic');

      const task =
        existingTask !== undefined
          ? toCreatedIssue(existingTask)
          : await adapter.createIssue({
              projectKey: config.projectKey,
              issueTypeId: config.taskIssueTypeId,
              parentKey: epic.key,
              summary: taskSpec.summary,
              description: issueDescription(`Supports ${story.key}: ${taskSpec.description}`),
              labels,
            });
      tasks.push(task);
      storyTaskKeys[story.key].push(task.key);

      if (
        existingTask === undefined ||
        ![config.inProgressStatus, config.doneStatus].includes(existingTask.status)
      ) {
        taskKeysToTransition.push(task.key);
      }
    }
  }

  if (config.sprintId !== undefined) {
    await adapter.addIssuesToSprint(
      config.sprintId,
      [...stories, ...tasks].map(issue => issue.key)
    );
  }

  for (const taskKey of taskKeysToTransition) {
    await adapter.transitionIssue(taskKey, config.inProgressStatus);
  }

  await postTrackingComment(
    adapter,
    config,
    epic.key,
    `Created real Jira tracking graph for ${issuePlan.epic.summary} at ${now.toISOString()}. Tasks are in execution and must not move to ${config.doneStatus} until verification is recorded.`
  );

  return {
    marker: MARKER,
    createdAt: now.toISOString(),
    projectKey: config.projectKey,
    label: issuePlan.label,
    epic,
    stories,
    tasks,
    storyTaskKeys,
    ...(config.sprintId !== undefined ? { sprintId: config.sprintId } : {}),
  };
}

export async function verifyJiraFollowThroughPlan(
  artifact: JiraFollowThroughArtifact,
  adapter: JiraFollowThroughAdapter
): Promise<{ ok: boolean; errors: string[]; issues: Record<string, JiraIssueDetails> }> {
  const errors: string[] = [];
  const issues: Record<string, JiraIssueDetails> = {};
  const expected = [artifact.epic, ...artifact.stories, ...artifact.tasks];

  for (const issue of expected) {
    try {
      const details = await adapter.getIssueDetails(issue.key);
      issues[issue.key] = details;
      if (!details.labels.includes(artifact.label)) {
        errors.push(`${issue.key} is missing label ${artifact.label}`);
      }
    } catch (error) {
      errors.push(
        `Could not fetch ${issue.key}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  for (const story of artifact.stories) {
    if (issues[story.key]?.parentKey !== artifact.epic.key) {
      errors.push(`${story.key} is not parented to epic ${artifact.epic.key}`);
    }
  }

  for (const [storyKey, taskKeys] of Object.entries(artifact.storyTaskKeys)) {
    if (!artifact.stories.some(story => story.key === storyKey)) {
      errors.push(`${storyKey} is not a tracked story in the artifact`);
    }
    for (const taskKey of taskKeys) {
      if (issues[taskKey]?.parentKey !== artifact.epic.key) {
        errors.push(`${taskKey} is not parented to epic ${artifact.epic.key}`);
      }
    }
  }

  return { ok: errors.length === 0, errors, issues };
}

export async function completeJiraFollowThroughPlan(
  config: JiraFollowThroughConfig,
  artifact: JiraFollowThroughArtifact,
  adapter: JiraFollowThroughAdapter,
  verification: { ok: boolean; summary: string }
): Promise<{ transitioned: string[]; transitionedTasks: string[]; transitionedStories: string[] }> {
  if (!verification.ok) {
    throw new Error('Refusing to mark Jira tasks Done because verification did not pass');
  }

  const transitionedTasks: string[] = [];
  for (const task of artifact.tasks) {
    await postTrackingComment(
      adapter,
      config,
      task.key,
      `Verification passed. ${verification.summary}`
    );
    await adapter.transitionIssue(task.key, config.doneStatus);
    transitionedTasks.push(task.key);
  }

  const transitionedStories: string[] = [];
  for (const story of artifact.stories) {
    await postTrackingComment(
      adapter,
      config,
      story.key,
      `All tracked child tasks passed verification. ${verification.summary}`
    );
    await adapter.transitionIssue(story.key, config.doneStatus);
    transitionedStories.push(story.key);
  }
  return {
    transitioned: [...transitionedTasks, ...transitionedStories],
    transitionedTasks,
    transitionedStories,
  };
}

function defaultArtifactPath(): string {
  return join(process.cwd(), '.archon', 'state', 'jira-party-mode-diversity-plan.json');
}

export function parseArgs(argv: string[]): CliOptions {
  const command = argv[0] as CliOptions['command'] | undefined;
  if (
    !command ||
    !['config', 'preflight', 'dry-run', 'create', 'verify', 'complete'].includes(command)
  ) {
    throw new Error(
      'Usage: bun .archon/scripts/jira-follow-through.ts <config|preflight|dry-run|create|verify|complete> [--artifact <path>] [--plan <path>] [--json] [--verification-ok] [--verification-summary <text>]'
    );
  }

  let artifactPath = defaultArtifactPath();
  let planArtifactPath: string | undefined;
  let json = false;
  let verificationOk = false;
  let verificationSummary: string | undefined;

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === '--artifact' && next) {
      artifactPath = next;
      index += 1;
      continue;
    }
    if (arg === '--plan' && next) {
      planArtifactPath = next;
      index += 1;
      continue;
    }
    if (arg === '--json') {
      json = true;
      continue;
    }
    if (arg === '--verification-ok') {
      verificationOk = true;
      continue;
    }
    if (arg === '--verification-summary' && next) {
      verificationSummary = next;
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  return {
    command,
    artifactPath,
    ...(planArtifactPath ? { planArtifactPath } : {}),
    json,
    verificationOk,
    verificationSummary,
  };
}

async function readArtifact(path: string): Promise<JiraFollowThroughArtifact> {
  const raw = await readFile(path, 'utf8');
  const parsed = JSON.parse(raw) as JiraFollowThroughArtifact;
  if (parsed.marker !== MARKER) {
    throw new Error(`Artifact ${path} is not an Archon BMAD/Jira enhancement artifact`);
  }
  return parsed;
}

async function writeArtifact(path: string, artifact: JiraFollowThroughArtifact): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
}

async function readIssuePlan(path: string): Promise<JiraFollowThroughIssuePlan> {
  return issuePlanFromPartyModePlanArtifact(await readPartyModePlanArtifact(path), path);
}

function createAdapter(config: JiraFollowThroughConfig): JiraFollowThroughAdapter {
  return new JiraAdapter(
    config.siteUrl,
    config.email,
    config.apiToken,
    config.webhookSecret,
    new ConversationLockManager(),
    process.env.JIRA_BOT_MENTION,
    { projectCodebaseMap: config.projectCodebaseMap }
  );
}

function formatResult(value: unknown, json: boolean): string {
  if (json) return JSON.stringify(value, null, 2);
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

async function main(): Promise<void> {
  loadArchonEnv(process.cwd());

  const options = parseArgs(Bun.argv.slice(2));
  const issuePlan = options.planArtifactPath
    ? await readIssuePlan(options.planArtifactPath)
    : undefined;
  if (options.command === 'config') {
    process.stdout.write(`${formatResult(readJiraFollowThroughConfigStatus(), options.json)}\n`);
    return;
  }
  if (options.command === 'dry-run') {
    const dagAdoptionReportPath = process.env.ARCHON_DAG_ADOPTION_REPORT_PATH ?? null;
    process.stdout.write(
      `${formatResult(
        buildJiraFollowThroughDryRunPlan(
          process.env,
          process.cwd(),
          options.artifactPath,
          dagAdoptionReportPath,
          undefined,
          issuePlan
        ),
        options.json
      )}\n`
    );
    return;
  }

  const configResult = readJiraFollowThroughConfig();
  if (!configResult.config) {
    throw new Error(`Jira follow-through configuration failed:\n${configResult.errors.join('\n')}`);
  }

  const adapter = createAdapter(configResult.config);
  let output: unknown;

  if (options.command === 'preflight') {
    output = await preflightJiraFollowThrough(configResult.config, adapter);
  } else if (options.command === 'create') {
    if (existsSync(options.artifactPath)) {
      output = {
        idempotent: true,
        artifactPath: options.artifactPath,
        artifact: await readArtifact(options.artifactPath),
      };
    } else {
      const evidenceGate = evaluateJiraFollowThroughEvidenceGate(
        loadEvidenceContractsFromDagReportPath(process.env.ARCHON_DAG_ADOPTION_REPORT_PATH ?? null),
        issuePlan
      );
      const artifact = await createJiraFollowThroughPlan(
        configResult.config,
        adapter,
        new Date(),
        evidenceGate,
        issuePlan
      );
      await writeArtifact(options.artifactPath, artifact);
      output = { artifactPath: options.artifactPath, artifact };
    }
  } else if (options.command === 'verify') {
    output = await verifyJiraFollowThroughPlan(await readArtifact(options.artifactPath), adapter);
  } else {
    const artifact = await readArtifact(options.artifactPath);
    output = await completeJiraFollowThroughPlan(configResult.config, artifact, adapter, {
      ok: options.verificationOk,
      summary: options.verificationSummary ?? 'Verification passed.',
    });
  }

  process.stdout.write(`${formatResult(output, options.json)}\n`);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
