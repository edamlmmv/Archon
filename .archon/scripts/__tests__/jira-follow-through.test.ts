import { describe, expect, it } from 'bun:test';
import {
  buildJiraFollowThroughDryRunPlan,
  completeJiraFollowThroughPlan,
  createJiraFollowThroughPlan,
  evaluateJiraFollowThroughEvidenceGate,
  parseArgs,
  preflightJiraFollowThrough,
  readJiraFollowThroughConfig,
  readJiraFollowThroughConfigStatus,
  verifyJiraFollowThroughPlan,
  type JiraFollowThroughAdapter,
  type JiraFollowThroughConfig,
  type JiraFollowThroughEvidenceGate,
  type JiraFollowThroughIssuePlan,
} from '../jira-follow-through.ts';
import type { DagEvidenceContract } from '../dag-adoption-report';
import type {
  JiraCreateIssueInput,
  JiraCreatedIssue,
  JiraIssueDetails,
  JiraIssueSearchResult,
  JiraIssueTypeDetails,
  JiraTransition,
} from '../../../packages/adapters/src/community/forge/jira/index';

function makeConfig(overrides: Partial<JiraFollowThroughConfig> = {}): JiraFollowThroughConfig {
  return {
    siteUrl: 'https://example.atlassian.net',
    email: 'bot@example.com',
    apiToken: 'token',
    webhookSecret: 'secret',
    projectKey: 'SCRUM',
    projectCodebaseMap: { SCRUM: '/repo' },
    epicIssueTypeId: '10001',
    storyIssueTypeId: '10002',
    taskIssueTypeId: '10003',
    inProgressStatus: 'In Progress',
    doneStatus: 'Done',
    transitionProbeIssueKey: 'SCRUM-1',
    label: 'archon-bmad-jira-enhancement-plan',
    ...overrides,
  };
}

function readyEvidence(): DagEvidenceContract {
  return {
    source: true,
    advisory: false,
    runtimeArtifact: true,
    structuredOutput: true,
    gateStatus: 'ready',
    decision: 'allow-jira-dry-run',
    nextAction: 'test evidence ready',
    failureReason: null,
  };
}

function advisoryOnlyEvidence(): DagEvidenceContract {
  return {
    source: false,
    advisory: true,
    runtimeArtifact: false,
    structuredOutput: true,
    gateStatus: 'blocked',
    decision: 'block-jira-create',
    nextAction: 'capture runtime artifact first',
    failureReason: 'advisory-only evidence cannot unlock Jira create',
  };
}

function readyEvidenceContracts(): Record<string, DagEvidenceContract> {
  return {
    'bmad-route-first': { ...readyEvidence(), runtimeArtifact: false },
    'agentic-search-capability-loop': readyEvidence(),
    'context7-capability-forge-loop': readyEvidence(),
    'ui-lab-component-loop': readyEvidence(),
    'ui-lab-productization-loop': readyEvidence(),
    'jira-bmad-enhancement-follow-through': readyEvidence(),
  };
}

function readyGate(): JiraFollowThroughEvidenceGate {
  return evaluateJiraFollowThroughEvidenceGate(readyEvidenceContracts());
}

function customIssuePlan(): JiraFollowThroughIssuePlan {
  return {
    label: 'archon-bmad-next-improvements',
    epic: {
      summary: 'Party Mode Consensus-To-Jira Improvements',
      description:
        'Use a generated Party Mode plan artifact as the source of truth for reusable Jira follow-through.',
    },
    stories: [
      {
        id: 'story-consensus-artifact',
        summary: 'Generate reusable Party Mode consensus artifacts',
        description:
          'Persist BMAD votes, tool evidence, consensus decision, and Jira-ready issue specs.',
        evidenceWorkflows: ['jira-bmad-enhancement-follow-through'],
        tasks: [
          {
            id: 'task-consensus-artifact-cli',
            summary: 'Implementation: Party Mode plan artifact CLI',
            description: 'Add deterministic CLI output for Party Mode consensus plans.',
          },
        ],
      },
    ],
    sourcePlanArtifactPath: '/tmp/party-mode-plan.json',
  };
}

class FakeJiraAdapter implements JiraFollowThroughAdapter {
  createdInputs: JiraCreateIssueInput[] = [];
  sprintAdds: { sprintId: number; issueKeys: string[] }[] = [];
  messages: { conversationId: string; message: string }[] = [];
  transitions: { issueKey: string; statusName: string }[] = [];
  details = new Map<string, JiraIssueDetails>();
  issueTypes: JiraIssueTypeDetails[] = [
    { id: '10001', name: 'Epic', subtask: false, hierarchyLevel: 1 },
    { id: '10002', name: 'Story', subtask: false, hierarchyLevel: 0 },
    { id: '10003', name: 'Task', subtask: false, hierarchyLevel: 0 },
  ];
  availableTransitions: JiraTransition[] = [
    { id: '11', name: 'Start Progress', to: 'In Progress' },
    { id: '21', name: 'Resolve', to: 'Done' },
  ];
  private nextIssueNumber = 2;

  constructor(private readonly config: JiraFollowThroughConfig = makeConfig()) {
    this.details.set(config.transitionProbeIssueKey, {
      key: config.transitionProbeIssueKey,
      summary: 'Probe issue',
      issueType: 'Task',
      status: 'To Do',
      parentKey: null,
      labels: [config.label],
    });
  }

  async createIssue(input: JiraCreateIssueInput): Promise<JiraCreatedIssue> {
    this.createdInputs.push(input);
    const key = `${input.projectKey}-${String(this.nextIssueNumber)}`;
    this.nextIssueNumber += 1;
    const issueType =
      input.issueTypeId === this.config.epicIssueTypeId
        ? 'Epic'
        : input.issueTypeId === this.config.storyIssueTypeId
          ? 'Story'
          : 'Task';
    this.details.set(key, {
      key,
      summary: input.summary,
      issueType,
      status: 'To Do',
      parentKey: input.parentKey ?? null,
      labels: input.labels ?? [],
    });
    return {
      id: `id-${key}`,
      key,
      summary: input.summary,
      url: `${this.config.siteUrl}/browse/${key}`,
    };
  }

  async addIssuesToSprint(sprintId: number, issueKeys: string[]): Promise<void> {
    this.sprintAdds.push({ sprintId, issueKeys });
  }

  async getIssueDetails(issueKey: string): Promise<JiraIssueDetails> {
    const details = this.details.get(issueKey);
    if (!details) throw new Error(`missing issue ${issueKey}`);
    return details;
  }

  async getProjectIssueTypes(_projectKey: string): Promise<JiraIssueTypeDetails[]> {
    return this.issueTypes;
  }

  async searchIssuesByLabel(
    _projectKey: string,
    label: string
  ): Promise<JiraIssueSearchResult[]> {
    return [...this.details.values()]
      .filter(issue => issue.labels.includes(label))
      .map(issue => ({
        id: `id-${issue.key}`,
        key: issue.key,
        url: `${this.config.siteUrl}/browse/${issue.key}`,
        summary: issue.summary,
        issueType: issue.issueType,
        status: issue.status,
        parentKey: issue.parentKey,
        labels: issue.labels,
      }));
  }

  async getAvailableTransitions(_issueKey: string): Promise<JiraTransition[]> {
    return this.availableTransitions;
  }

  async transitionIssue(issueKey: string, targetStatusName: string): Promise<JiraTransition> {
    this.transitions.push({ issueKey, statusName: targetStatusName });
    const transition = this.availableTransitions.find(
      item => item.name === targetStatusName || item.to === targetStatusName
    );
    if (!transition) throw new Error(`missing transition ${targetStatusName}`);
    const details = await this.getIssueDetails(issueKey);
    this.details.set(issueKey, { ...details, status: transition.to });
    return transition;
  }

  async sendMessage(conversationId: string, message: string): Promise<void> {
    this.messages.push({ conversationId, message });
  }
}

describe('Jira follow-through config and preflight', () => {
  it('defaults to the Party Mode diversity artifact path', () => {
    expect(parseArgs(['verify', '--json']).artifactPath).toBe(
      `${process.cwd()}/.archon/state/jira-party-mode-diversity-plan.json`
    );
  });

  it('accepts config and dry-run as first-class CLI commands', () => {
    expect(parseArgs(['config', '--json']).command).toBe('config');
    expect(parseArgs(['dry-run', '--json']).command).toBe('dry-run');
  });

  it('accepts an explicit Party Mode plan artifact path', () => {
    expect(parseArgs(['dry-run', '--plan', '/tmp/party-mode-plan.json']).planArtifactPath).toBe(
      '/tmp/party-mode-plan.json'
    );
  });

  it('reports non-secret config status with SCRUM follow-through defaults', () => {
    const status = readJiraFollowThroughConfigStatus(
      {
        JIRA_SITE_URL: 'https://example.atlassian.net',
        JIRA_EMAIL: 'bot@example.com',
        JIRA_API_TOKEN: 'token',
        JIRA_WEBHOOK_SECRET: 'secret',
        JIRA_PROJECT_CODEBASE_MAP: '{"SCRUM":"/repo"}',
      },
      '/tmp/archon-jira-follow-through-test'
    );

    expect(status.projectMapKeys).toEqual(['SCRUM']);
    expect(status.projectKey).toBe('SCRUM');
    expect(
      status.requiredKeys.find(
        item => item.name === 'JIRA_FOLLOW_THROUGH_PROJECT_KEY or JIRA_PROJECT_KEY'
      )?.present
    ).toBe(true);
    expect(
      status.requiredKeys.find(item => item.name === 'JIRA_API_TOKEN')?.present
    ).toBe(true);
    expect(JSON.stringify(status)).not.toContain('token');
    expect(status.errors).toEqual([]);
  });

  it('reports missing project mapping before live Jira mutation', () => {
    const result = readJiraFollowThroughConfig({
      JIRA_SITE_URL: 'https://example.atlassian.net',
      JIRA_EMAIL: 'bot@example.com',
      JIRA_API_TOKEN: 'token',
      JIRA_WEBHOOK_SECRET: 'secret',
      JIRA_FOLLOW_THROUGH_PROJECT_KEY: 'SCRUM',
      JIRA_PROJECT_CODEBASE_MAP: '{"OTHER":"/repo"}',
      JIRA_FOLLOW_THROUGH_EPIC_ISSUE_TYPE_ID: '10001',
      JIRA_FOLLOW_THROUGH_STORY_ISSUE_TYPE_ID: '10002',
      JIRA_FOLLOW_THROUGH_TASK_ISSUE_TYPE_ID: '10003',
      JIRA_FOLLOW_THROUGH_IN_PROGRESS_STATUS: 'In Progress',
      JIRA_FOLLOW_THROUGH_DONE_STATUS: 'Done',
      JIRA_FOLLOW_THROUGH_TRANSITION_PROBE_ISSUE_KEY: 'SCRUM-1',
    });

    expect(result.config).toBeUndefined();
    expect(result.errors).toContain('JIRA_PROJECT_CODEBASE_MAP must include SCRUM');
  });

  it('fails preflight when required transition names are unavailable', async () => {
    const config = makeConfig();
    const adapter = new FakeJiraAdapter(config);
    adapter.availableTransitions = [{ id: '11', name: 'Start Progress', to: 'In Progress' }];

    const result = await preflightJiraFollowThrough(config, adapter);

    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain("Missing Jira transition 'Done'");
  });

  it('fails preflight when configured issue type ids are unavailable', async () => {
    const config = makeConfig({ storyIssueTypeId: 'missing-story-type' });
    const adapter = new FakeJiraAdapter(config);

    const result = await preflightJiraFollowThrough(config, adapter);

    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain(
      'Missing Jira Story issue type id missing-story-type for project SCRUM'
    );
  });

  it('builds a passing dry-run Jira plan from SCRUM defaults and ready evidence', () => {
    const plan = buildJiraFollowThroughDryRunPlan(
      {
        JIRA_SITE_URL: 'https://example.atlassian.net',
        JIRA_EMAIL: 'bot@example.com',
        JIRA_API_TOKEN: 'token',
        JIRA_WEBHOOK_SECRET: 'secret',
        JIRA_PROJECT_CODEBASE_MAP: '{"SCRUM":"/repo"}',
      },
      '/tmp/archon-jira-follow-through-test',
      '/tmp/jira-artifact.json',
      '/tmp/dag-adoption-report.json',
      readyEvidenceContracts()
    );

    expect(plan.ok).toBe(true);
    expect(plan.mutatesJira).toBe(false);
    expect(plan.artifactPath).toBe('/tmp/jira-artifact.json');
    expect(plan.dagAdoptionReportPath).toBe('/tmp/dag-adoption-report.json');
    expect(plan.blockedBy).toEqual([]);
    expect(plan.issues.filter(issue => issue.issueType === 'Epic')).toHaveLength(1);
    expect(plan.issues.filter(issue => issue.issueType === 'Story')).toHaveLength(4);
    expect(plan.issues.filter(issue => issue.issueType === 'Task')).toHaveLength(8);
    expect(plan.jiraRestEndpoints).toContain('POST /rest/api/3/issue');
    expect(plan.evidenceGate.ok).toBe(true);
    expect(plan.lifecycle.configReady).toBe(true);
    expect(plan.lifecycle.evidenceReady).toBe(true);
    expect(plan.lifecycle.dryRunPassed).toBe(true);
    expect(plan.authority.dagStructure).toBe('source-validation-not-runtime-proof');
    expect(plan.authority.forge).toBe('artifact-producing-not-live-authority');
    expect(plan.authority.agenticSearchAndMcp).toBe('runtime-artifact-required-for-jira-create');
    expect(plan.authority.jiraMutation).toBe('preflight-gated');
  });

  it('builds a dry-run Jira plan from a supplied Party Mode issue graph', () => {
    const issuePlan = customIssuePlan();
    const plan = buildJiraFollowThroughDryRunPlan(
      {
        JIRA_SITE_URL: 'https://example.atlassian.net',
        JIRA_EMAIL: 'bot@example.com',
        JIRA_API_TOKEN: 'token',
        JIRA_WEBHOOK_SECRET: 'secret',
        JIRA_PROJECT_CODEBASE_MAP: '{"SCRUM":"/repo"}',
      },
      '/tmp/archon-jira-follow-through-test',
      '/tmp/jira-artifact.json',
      '/tmp/dag-adoption-report.json',
      readyEvidenceContracts(),
      issuePlan
    );

    expect(plan.ok).toBe(true);
    expect(plan.label).toBe('archon-bmad-next-improvements');
    expect(plan.sourcePlanArtifactPath).toBe('/tmp/party-mode-plan.json');
    expect(plan.issues.filter(issue => issue.issueType === 'Story')).toHaveLength(1);
    expect(plan.issues.filter(issue => issue.issueType === 'Task')).toHaveLength(1);
    expect(plan.issues.map(issue => issue.summary)).toContain(
      'Generate reusable Party Mode consensus artifacts'
    );
  });

  it('blocks Jira dry-run gate when BMAD evidence remains advisory-only', () => {
    const contracts = readyEvidenceContracts();
    contracts['agentic-search-capability-loop'] = advisoryOnlyEvidence();

    const gate = evaluateJiraFollowThroughEvidenceGate(contracts);

    expect(gate.ok).toBe(false);
    expect(gate.blockedBy.join('\n')).toContain('story-party-mode-rotation-policy');
    expect(gate.blockedBy.join('\n')).toContain('advisory-only evidence cannot unlock Jira create');
  });

  it('allows Jira dry-run gate when every Story has source or runtime artifacts', () => {
    const gate = evaluateJiraFollowThroughEvidenceGate(readyEvidenceContracts());

    expect(gate.ok).toBe(true);
    expect(gate.stories).toHaveLength(4);
    expect(gate.stories.every(story => story.gateStatus === 'ready')).toBe(true);
  });
});

describe('Jira follow-through execution', () => {
  it('creates the Epic/Stories/Tasks hierarchy with labels, comments, sprint items, and In Progress task transitions', async () => {
    const config = makeConfig({ sprintId: 42 });
    const adapter = new FakeJiraAdapter(config);

    const artifact = await createJiraFollowThroughPlan(
      config,
      adapter,
      new Date('2026-05-13T12:00:00.000Z'),
      readyGate()
    );

    expect(artifact.epic.summary).toBe('Archon BMAD/Jira Enhancement Plan');
    expect(artifact.stories).toHaveLength(4);
    expect(artifact.tasks).toHaveLength(8);
    expect(adapter.createdInputs.every(input => input.labels?.includes(config.label))).toBe(true);
    expect(
      adapter.createdInputs
        .filter(input => input.issueTypeId === config.taskIssueTypeId)
        .every(input => input.parentKey === artifact.epic.key)
    ).toBe(true);
    expect(adapter.createdInputs[0].description).toContain(
      '<!-- archon-bmad-jira-enhancement-plan -->'
    );
    expect(adapter.sprintAdds).toEqual([
      { sprintId: 42, issueKeys: [...artifact.stories, ...artifact.tasks].map(issue => issue.key) },
    ]);
    expect(adapter.transitions).toEqual(
      artifact.tasks.map(task => ({ issueKey: task.key, statusName: 'In Progress' }))
    );
    expect(adapter.messages[0].message).toContain('<!-- archon-bmad-jira-enhancement-plan -->');
  });

  it('creates Jira hierarchy from a supplied Party Mode issue plan', async () => {
    const config = makeConfig();
    const adapter = new FakeJiraAdapter(config);
    const issuePlan = customIssuePlan();

    const artifact = await createJiraFollowThroughPlan(
      config,
      adapter,
      new Date('2026-05-13T12:00:00.000Z'),
      readyGate(),
      issuePlan
    );

    expect(artifact.label).toBe('archon-bmad-next-improvements');
    expect(artifact.epic.summary).toBe('Party Mode Consensus-To-Jira Improvements');
    expect(artifact.stories).toHaveLength(1);
    expect(artifact.tasks).toHaveLength(1);
    expect(adapter.createdInputs.every(input => input.labels?.includes(issuePlan.label))).toBe(
      true
    );
    expect(adapter.createdInputs.map(input => input.summary)).toContain(
      'Implementation: Party Mode plan artifact CLI'
    );
  });

  it('recovers existing labeled Jira work items before creating missing items', async () => {
    const config = makeConfig();
    const adapter = new FakeJiraAdapter(config);
    adapter.details.set('SCRUM-13', {
      key: 'SCRUM-13',
      summary: 'Archon BMAD/Jira Enhancement Plan',
      issueType: 'Epic',
      status: 'To Do',
      parentKey: null,
      labels: [config.label],
    });
    adapter.details.set('SCRUM-14', {
      key: 'SCRUM-14',
      summary: 'Instrument Party Mode roster selection evidence',
      issueType: 'Story',
      status: 'To Do',
      parentKey: 'SCRUM-13',
      labels: [config.label],
    });
    adapter.details.set('SCRUM-15', {
      key: 'SCRUM-15',
      summary: 'Implementation: Party Mode selection artifact',
      issueType: 'Task',
      status: 'Done',
      parentKey: 'SCRUM-13',
      labels: [config.label],
    });

    const artifact = await createJiraFollowThroughPlan(config, adapter, new Date(), readyGate());

    expect(artifact.epic.key).toBe('SCRUM-13');
    expect(artifact.stories[0].key).toBe('SCRUM-14');
    expect(artifact.tasks[0].key).toBe('SCRUM-15');
    expect(adapter.createdInputs.map(input => input.summary)).not.toContain(
      'Archon BMAD/Jira Enhancement Plan'
    );
    expect(adapter.createdInputs.map(input => input.summary)).not.toContain(
      'Instrument Party Mode roster selection evidence'
    );
    expect(adapter.createdInputs.map(input => input.summary)).not.toContain(
      'Implementation: Party Mode selection artifact'
    );
    expect(adapter.transitions.some(transition => transition.issueKey === 'SCRUM-15')).toBe(false);
  });

  it('verifies hierarchy and labels through Jira issue details', async () => {
    const config = makeConfig();
    const adapter = new FakeJiraAdapter(config);
    const artifact = await createJiraFollowThroughPlan(config, adapter, new Date(), readyGate());

    const verification = await verifyJiraFollowThroughPlan(artifact, adapter);

    expect(verification.ok).toBe(true);
    expect(verification.errors).toEqual([]);
  });

  it('does not transition tasks to Done when verification failed', async () => {
    const config = makeConfig();
    const adapter = new FakeJiraAdapter(config);
    const artifact = await createJiraFollowThroughPlan(config, adapter, new Date(), readyGate());
    adapter.transitions = [];

    await expect(
      completeJiraFollowThroughPlan(config, artifact, adapter, {
        ok: false,
        summary: 'bun run validate failed',
      })
    ).rejects.toThrow('Refusing to mark Jira tasks Done');

    expect(adapter.transitions).toEqual([]);
  });

  it('does not create Jira issues when evidence gate is blocked', async () => {
    const config = makeConfig();
    const adapter = new FakeJiraAdapter(config);
    const blockedGate = evaluateJiraFollowThroughEvidenceGate({
      ...readyEvidenceContracts(),
      'context7-capability-forge-loop': advisoryOnlyEvidence(),
    });

    await expect(
      createJiraFollowThroughPlan(config, adapter, new Date(), blockedGate)
    ).rejects.toThrow('Jira follow-through evidence gate failed');

    expect(adapter.createdInputs).toEqual([]);
    expect(adapter.transitions).toEqual([]);
  });

  it('posts verification comments before transitioning every tracked task and story to Done', async () => {
    const config = makeConfig();
    const adapter = new FakeJiraAdapter(config);
    const artifact = await createJiraFollowThroughPlan(config, adapter, new Date(), readyGate());
    adapter.transitions = [];
    adapter.messages = [];

    const result = await completeJiraFollowThroughPlan(config, artifact, adapter, {
      ok: true,
      summary: 'Targeted tests and bun run validate passed.',
    });

    expect(result.transitionedTasks).toEqual(artifact.tasks.map(task => task.key));
    expect(result.transitionedStories).toEqual(artifact.stories.map(story => story.key));
    expect(result.transitioned).toEqual([
      ...artifact.tasks.map(task => task.key),
      ...artifact.stories.map(story => story.key),
    ]);
    expect(adapter.transitions).toEqual(
      [...artifact.tasks, ...artifact.stories].map(issue => ({
        issueKey: issue.key,
        statusName: 'Done',
      }))
    );
    expect(adapter.messages).toHaveLength(artifact.tasks.length + artifact.stories.length);
    expect(adapter.messages[0].message).toContain('Verification passed');
  });
});
