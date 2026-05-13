/**
 * Unit tests for Jira Cloud community forge adapter.
 *
 * Runs in its own test batch to avoid mock.module pollution with other adapters.
 */
import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import type { JiraBmadSprintExerciseCreated } from './types';

const mockLogger = {
  fatal: mock(() => undefined),
  error: mock(() => undefined),
  warn: mock(() => undefined),
  info: mock(() => undefined),
  debug: mock(() => undefined),
  trace: mock(() => undefined),
  child: mock(function (this: unknown) {
    return this;
  }),
  bindings: mock(() => ({ module: 'test' })),
  isLevelEnabled: mock(() => true),
  level: 'info',
};

mock.module('@archon/paths', () => ({
  createLogger: mock(() => mockLogger),
}));

const mockConversation = {
  id: 'conv-db-id',
  platform_type: 'jira',
  platform_conversation_id: 'jira:sylvainedamtheodore.atlassian.net:SCRUM:SCRUM-42',
  codebase_id: null,
  cwd: null,
  isolation_env_id: null,
  ai_assistant_type: 'codex',
  title: null,
  hidden: false,
  deleted_at: null,
  last_activity_at: null,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockCodebase = {
  id: 'cb-1',
  name: 'TODA/Archon',
  repository_url: 'https://github.com/TODA/Archon',
  default_cwd: '/Users/edam/Documents/TODA/Archon',
  ai_assistant_type: 'codex',
  commands: {},
  created_at: new Date(),
  updated_at: new Date(),
};

const mockGetOrCreateConversation = mock(async () => mockConversation);
const mockUpdateConversation = mock(async () => undefined);

mock.module('@archon/core/db/conversations', () => ({
  getOrCreateConversation: mockGetOrCreateConversation,
  updateConversation: mockUpdateConversation,
}));

const mockGetCodebase = mock(async (id: string) => (id === mockCodebase.id ? mockCodebase : null));
const mockFindCodebaseByDefaultCwd = mock(async (cwd: string) =>
  cwd === mockCodebase.default_cwd ? mockCodebase : null
);
const mockFindCodebaseByName = mock(async (name: string) =>
  name === mockCodebase.name ? mockCodebase : null
);

mock.module('@archon/core/db/codebases', () => ({
  getCodebase: mockGetCodebase,
  findCodebaseByDefaultCwd: mockFindCodebaseByDefaultCwd,
  findCodebaseByName: mockFindCodebaseByName,
}));

const mockHandleMessage = mock(async () => undefined);

mock.module('@archon/core', () => ({
  handleMessage: mockHandleMessage,
  classifyAndFormatError: mock((err: Error) => err.message),
  toError: mock((e: unknown) => (e instanceof Error ? e : new Error(String(e)))),
  ConversationNotFoundError: class extends Error {},
  ConversationLockManager: class {
    async acquireLock(_id: string, fn: () => Promise<void>): Promise<void> {
      await fn();
    }
  },
}));

const { JiraAdapter } = await import('./adapter');
const { flattenAdfText, toAdfDocument } = await import('./adf');
const { ConversationLockManager } = await import('@archon/core');

function createAdapter(options?: {
  projectCodebaseMap?: Record<string, string>;
  allowedAccountIds?: string[];
  botAccountId?: string;
}): InstanceType<typeof JiraAdapter> {
  return new JiraAdapter(
    'https://sylvainedamtheodore.atlassian.net',
    'edam@example.com',
    'api-token',
    'webhook-secret',
    new ConversationLockManager() as never,
    'archon',
    {
      projectCodebaseMap: options?.projectCodebaseMap ?? {
        SCRUM: mockCodebase.default_cwd,
      },
      allowedAccountIds: options?.allowedAccountIds,
      botAccountId: options?.botAccountId,
      retryDelayMs: () => 1,
    }
  );
}

function adfText(text: string): unknown {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  };
}

function jsonResponse(value: unknown, status = 200, statusText = 'OK'): Promise<Response> {
  return Promise.resolve(new Response(JSON.stringify(value), { status, statusText }));
}

function emptyResponse(): Promise<Response> {
  return Promise.resolve(new Response(null, { status: 204, statusText: 'No Content' }));
}

function createIssueDetails(options: {
  key: string;
  issueType: string;
  status: string;
  parentKey?: string;
  labels?: string[];
}): unknown {
  return {
    key: options.key,
    fields: {
      summary: `${options.key} summary`,
      issuetype: { name: options.issueType },
      status: { name: options.status },
      parent: options.parentKey ? { key: options.parentKey } : undefined,
      labels: options.labels ?? ['bmad-sandbox'],
    },
  };
}

function createBmadIssueSet(): JiraBmadSprintExerciseCreated {
  return {
    epic: {
      id: '10006',
      key: 'SCRUM-6',
      url: 'https://sylvainedamtheodore.atlassian.net/browse/SCRUM-6',
      summary: 'BMAD Sandbox Exercise - Jira sprint planning drill',
    },
    stories: [
      {
        id: '10007',
        key: 'SCRUM-7',
        url: 'https://sylvainedamtheodore.atlassian.net/browse/SCRUM-7',
        summary: 'BMAD Sandbox Exercise - Story 1',
      },
      {
        id: '10008',
        key: 'SCRUM-8',
        url: 'https://sylvainedamtheodore.atlassian.net/browse/SCRUM-8',
        summary: 'BMAD Sandbox Exercise - Story 2',
      },
    ],
    tasks: [
      {
        id: '10009',
        key: 'SCRUM-9',
        url: 'https://sylvainedamtheodore.atlassian.net/browse/SCRUM-9',
        summary: 'BMAD Sandbox Exercise - Task 1',
      },
      {
        id: '10010',
        key: 'SCRUM-10',
        url: 'https://sylvainedamtheodore.atlassian.net/browse/SCRUM-10',
        summary: 'BMAD Sandbox Exercise - Task 2',
      },
      {
        id: '10011',
        key: 'SCRUM-11',
        url: 'https://sylvainedamtheodore.atlassian.net/browse/SCRUM-11',
        summary: 'BMAD Sandbox Exercise - Task 3',
      },
      {
        id: '10012',
        key: 'SCRUM-12',
        url: 'https://sylvainedamtheodore.atlassian.net/browse/SCRUM-12',
        summary: 'BMAD Sandbox Exercise - Task 4',
      },
    ],
  };
}

function createBmadVerificationFetch(options?: {
  sprintIssueKeys?: string[];
  doneTaskKeys?: string[];
}): ReturnType<typeof mock> {
  const created = createBmadIssueSet();
  const doneTaskKeys = new Set(options?.doneTaskKeys ?? ['SCRUM-9']);
  const sprintIssueKeys = options?.sprintIssueKeys ?? [
    'SCRUM-7',
    'SCRUM-8',
    'SCRUM-9',
    'SCRUM-10',
    'SCRUM-11',
    'SCRUM-12',
  ];

  return mock((url: string) => {
    const path = new URL(url).pathname;
    const key = decodeURIComponent(path.split('/').at(-1) ?? '');
    if (path.includes('/rest/agile/1.0/sprint/2/issue')) {
      return jsonResponse({ issues: sprintIssueKeys.map(issueKey => ({ key: issueKey })) });
    }
    if (key === created.epic.key) {
      return jsonResponse(createIssueDetails({ key, issueType: 'Epic', status: 'To Do' }));
    }
    if (created.stories.some(story => story.key === key)) {
      return jsonResponse(
        createIssueDetails({
          key,
          issueType: 'Story',
          status: 'To Do',
          parentKey: created.epic.key,
        })
      );
    }
    if (created.tasks.some(task => task.key === key)) {
      return jsonResponse(
        createIssueDetails({
          key,
          issueType: 'Task',
          status: doneTaskKeys.has(key) ? 'Done' : 'To Do',
          parentKey: created.epic.key,
        })
      );
    }
    return jsonResponse({ error: 'not found' }, 404, 'Not Found');
  });
}

function createCommentPayload(overrides?: {
  body?: unknown;
  accountId?: string;
  issueKey?: string;
  projectKey?: string;
  summary?: string;
}): string {
  const issueKey = overrides?.issueKey ?? 'SCRUM-42';
  const projectKey = overrides?.projectKey ?? 'SCRUM';

  return JSON.stringify({
    webhookEvent: 'comment_created',
    user: {
      accountId: overrides?.accountId ?? 'acct-1',
      displayName: 'Requester',
    },
    issue: {
      id: '10042',
      key: issueKey,
      fields: {
        summary: overrides?.summary ?? 'Fix failing adapter test',
        description: adfText('Issue description'),
        project: { key: projectKey, name: 'My Software Team' },
        status: { name: 'To Do' },
        labels: ['bug'],
        components: [{ name: 'server' }],
        reporter: { accountId: 'reporter-1', displayName: 'Reporter' },
        assignee: null,
      },
    },
    comment: {
      id: 'comment-1',
      body: overrides?.body ?? adfText('@archon fix this'),
      author: {
        accountId: overrides?.accountId ?? 'acct-1',
        displayName: 'Requester',
      },
    },
  });
}

describe('JiraAdapter', () => {
  let originalFetch: typeof fetch;
  let mockFetch: ReturnType<typeof mock>;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    mockFetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ id: '10000' }), { status: 201 }))
    );
    globalThis.fetch = mockFetch as typeof fetch;
    mockLogger.error.mockClear();
    mockLogger.warn.mockClear();
    mockHandleMessage.mockClear();
    mockGetOrCreateConversation.mockClear();
    mockUpdateConversation.mockClear();
    mockGetCodebase.mockClear();
    mockFindCodebaseByDefaultCwd.mockClear();
    mockFindCodebaseByName.mockClear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('returns batch streaming mode and jira platform type', () => {
    const adapter = createAdapter();
    expect(adapter.getStreamingMode()).toBe('batch');
    expect(adapter.getPlatformType()).toBe('jira');
  });

  test('handles mention comment by linking SCRUM issue to mapped codebase and sending to Archon', async () => {
    const adapter = createAdapter();
    await adapter.handleWebhook(createCommentPayload(), 'webhook-secret');

    expect(mockUpdateConversation).toHaveBeenCalledWith('conv-db-id', {
      codebase_id: 'cb-1',
      cwd: '/Users/edam/Documents/TODA/Archon',
    });
    expect(mockHandleMessage).toHaveBeenCalledTimes(1);
    const [, conversationId, message, context] = mockHandleMessage.mock.calls[0] as [
      unknown,
      string,
      string,
      {
        issueContext?: string;
        isolationHints?: { workflowType?: string; workflowId?: string; suggestedBranch?: string };
      },
    ];
    expect(conversationId).toBe('jira:sylvainedamtheodore.atlassian.net:SCRUM:SCRUM-42');
    expect(message).toBe('fix this');
    expect(context.issueContext).toContain('Issue SCRUM-42');
    expect(context.issueContext).toContain(
      'https://sylvainedamtheodore.atlassian.net/browse/SCRUM-42'
    );
    expect(context.isolationHints).toEqual({
      workflowType: 'issue',
      workflowId: 'SCRUM-42',
      suggestedBranch: 'jira/SCRUM-42-fix-failing-adapter-test',
    });
  });

  test('rejects invalid webhook token without side effects', async () => {
    const adapter = createAdapter();
    await adapter.handleWebhook(createCommentPayload(), 'wrong-secret');

    expect(mockHandleMessage).not.toHaveBeenCalled();
    expect(mockGetOrCreateConversation).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('ignores comments without bot mention', async () => {
    const adapter = createAdapter();
    await adapter.handleWebhook(
      createCommentPayload({ body: adfText('regular comment') }),
      'webhook-secret'
    );

    expect(mockHandleMessage).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('rejects unauthorized account IDs when allowlist is set', async () => {
    const adapter = createAdapter({ allowedAccountIds: ['allowed-account'] });
    await adapter.handleWebhook(
      createCommentPayload({ accountId: 'blocked-account' }),
      'webhook-secret'
    );

    expect(mockHandleMessage).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('ignores bot account comments', async () => {
    const adapter = createAdapter({ botAccountId: 'bot-account' });
    await adapter.handleWebhook(
      createCommentPayload({ accountId: 'bot-account' }),
      'webhook-secret'
    );

    expect(mockHandleMessage).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('posts setup error when project mapping is missing', async () => {
    const adapter = createAdapter({ projectCodebaseMap: {} });
    await adapter.handleWebhook(createCommentPayload(), 'webhook-secret');

    expect(mockHandleMessage).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string) as { body: { content: unknown[] } };
    expect(JSON.stringify(body.body)).toContain('Jira project SCRUM is not mapped');
  });

  test('sends ADF comment to Jira REST API', async () => {
    const adapter = createAdapter();
    await adapter.sendMessage(
      'jira:sylvainedamtheodore.atlassian.net:SCRUM:SCRUM-42',
      'Hello\n\n```ts\nconst x = 1;\n```'
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://sylvainedamtheodore.atlassian.net/rest/api/3/issue/SCRUM-42/comment');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body as string) as { body: ReturnType<typeof toAdfDocument> };
    expect(body.body.type).toBe('doc');
    expect(body.body.version).toBe(1);
    expect(JSON.stringify(body.body)).toContain('codeBlock');
    expect(JSON.stringify(body.body)).toContain('archon-bot-response');
  });

  test('creates issue with ADF description, parent, and labels', async () => {
    mockFetch = mock(() =>
      jsonResponse(
        {
          id: '10009',
          key: 'SCRUM-9',
          self: 'https://sylvainedamtheodore.atlassian.net/rest/api/3/issue/10009',
        },
        201,
        'Created'
      )
    );
    globalThis.fetch = mockFetch as typeof fetch;
    const adapter = createAdapter();

    const issue = await adapter.createIssue({
      projectKey: 'SCRUM',
      issueTypeId: '10003',
      parentKey: 'SCRUM-6',
      summary: 'BMAD Sandbox Exercise - Task',
      description: 'Write acceptance criteria',
      labels: ['bmad-sandbox'],
    });

    expect(issue.key).toBe('SCRUM-9');
    expect(issue.url).toBe('https://sylvainedamtheodore.atlassian.net/browse/SCRUM-9');
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://sylvainedamtheodore.atlassian.net/rest/api/3/issue');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body as string) as {
      fields: {
        project: { key: string };
        issuetype: { id: string };
        parent: { key: string };
        labels: string[];
        description: ReturnType<typeof toAdfDocument>;
      };
    };
    expect(body.fields.project.key).toBe('SCRUM');
    expect(body.fields.issuetype.id).toBe('10003');
    expect(body.fields.parent.key).toBe('SCRUM-6');
    expect(body.fields.labels).toEqual(['bmad-sandbox']);
    expect(body.fields.description).toEqual(toAdfDocument('Write acceptance criteria'));
  });

  test('adds issues to sprint through Jira Agile API', async () => {
    mockFetch = mock(() => emptyResponse());
    globalThis.fetch = mockFetch as typeof fetch;
    const adapter = createAdapter();

    await adapter.addIssuesToSprint(2, ['SCRUM-7', 'SCRUM-9']);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://sylvainedamtheodore.atlassian.net/rest/agile/1.0/sprint/2/issue');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body as string)).toEqual({ issues: ['SCRUM-7', 'SCRUM-9'] });
  });

  test('transitions issue by resolving available transition name first', async () => {
    mockFetch = mock((url: string, options?: RequestInit) => {
      if (url.endsWith('/transitions?expand=transitions.fields')) {
        return jsonResponse({
          transitions: [
            { id: '21', name: 'In Progress', to: { name: 'In Progress' } },
            { id: '41', name: 'Done', to: { name: 'Done', statusCategory: { key: 'done' } } },
          ],
        });
      }
      if (url.endsWith('/transitions') && options?.method === 'POST') {
        return emptyResponse();
      }
      return jsonResponse({ error: 'unexpected' }, 500, 'Unexpected');
    });
    globalThis.fetch = mockFetch as typeof fetch;
    const adapter = createAdapter();

    const transition = await adapter.transitionIssue('SCRUM-9', 'Done');

    expect(transition).toEqual({ id: '41', name: 'Done', to: 'Done', statusCategory: 'done' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [, options] = mockFetch.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(options.body as string)).toEqual({ transition: { id: '41' } });
  });

  test('BMAD exercise operation creates graph, assigns sprint items, transitions one task, and verifies', async () => {
    const createdKeys = [
      'SCRUM-6',
      'SCRUM-7',
      'SCRUM-8',
      'SCRUM-9',
      'SCRUM-10',
      'SCRUM-11',
      'SCRUM-12',
    ];
    let createIndex = 0;
    mockFetch = mock((url: string, options?: RequestInit) => {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      if (path === '/rest/api/3/issue' && options?.method === 'POST') {
        const key = createdKeys[createIndex];
        createIndex += 1;
        return jsonResponse({ id: `id-${key}`, key }, 201, 'Created');
      }
      if (path === '/rest/agile/1.0/sprint/2/issue' && options?.method === 'POST') {
        expect(JSON.parse(options.body as string)).toEqual({
          issues: ['SCRUM-7', 'SCRUM-8', 'SCRUM-9', 'SCRUM-10', 'SCRUM-11', 'SCRUM-12'],
        });
        return emptyResponse();
      }
      if (path === '/rest/api/3/issue/SCRUM-9/transitions' && options?.method !== 'POST') {
        return jsonResponse({
          transitions: [
            { id: '21', name: 'In Progress', to: { name: 'In Progress' } },
            { id: '41', name: 'Done', to: { name: 'Done' } },
          ],
        });
      }
      if (path === '/rest/api/3/issue/SCRUM-9/transitions' && options?.method === 'POST') {
        return emptyResponse();
      }
      if (path === '/rest/agile/1.0/sprint/2/issue' && options?.method !== 'POST') {
        return jsonResponse({
          issues: ['SCRUM-7', 'SCRUM-8', 'SCRUM-9', 'SCRUM-10', 'SCRUM-11', 'SCRUM-12'].map(
            key => ({ key })
          ),
        });
      }
      const key = decodeURIComponent(path.split('/').at(-1) ?? '');
      if (key === 'SCRUM-6') {
        return jsonResponse(createIssueDetails({ key, issueType: 'Epic', status: 'To Do' }));
      }
      if (key === 'SCRUM-7' || key === 'SCRUM-8') {
        return jsonResponse(
          createIssueDetails({ key, issueType: 'Story', status: 'To Do', parentKey: 'SCRUM-6' })
        );
      }
      if (['SCRUM-9', 'SCRUM-10', 'SCRUM-11', 'SCRUM-12'].includes(key)) {
        return jsonResponse(
          createIssueDetails({
            key,
            issueType: 'Task',
            status: key === 'SCRUM-9' ? 'Done' : 'To Do',
            parentKey: 'SCRUM-6',
          })
        );
      }
      return jsonResponse({ error: 'unexpected' }, 500, 'Unexpected');
    });
    globalThis.fetch = mockFetch as typeof fetch;
    const adapter = createAdapter();

    const result = await adapter.runBmadSprintExercise({ projectKey: 'SCRUM', sprintId: 2 });

    expect(result.created.epic.key).toBe('SCRUM-6');
    expect(result.completedTaskKey).toBe('SCRUM-9');
    expect(result.verification.ok).toBe(true);
    expect(result.verification.epicInSprint).toBe(false);
    expect(result.verification.doneTaskKeys).toEqual(['SCRUM-9']);
  });

  test('BMAD exercise verification fails when epic appears in sprint', async () => {
    const created = createBmadIssueSet();
    mockFetch = createBmadVerificationFetch({
      sprintIssueKeys: [
        'SCRUM-6',
        'SCRUM-7',
        'SCRUM-8',
        'SCRUM-9',
        'SCRUM-10',
        'SCRUM-11',
        'SCRUM-12',
      ],
    });
    globalThis.fetch = mockFetch as typeof fetch;
    const adapter = createAdapter();

    const result = await adapter.verifyBmadSprintExercise({
      created,
      sprintId: 2,
      label: 'bmad-sandbox',
      completedTaskKey: 'SCRUM-9',
    });

    expect(result.ok).toBe(false);
    expect(result.epicInSprint).toBe(true);
    expect(result.errors).toContain('SCRUM-6 epic should not be in sprint 2');
  });

  test('BMAD exercise verification fails when more than one generated task is Done', async () => {
    const created = createBmadIssueSet();
    mockFetch = createBmadVerificationFetch({ doneTaskKeys: ['SCRUM-9', 'SCRUM-10'] });
    globalThis.fetch = mockFetch as typeof fetch;
    const adapter = createAdapter();

    const result = await adapter.verifyBmadSprintExercise({
      created,
      sprintId: 2,
      label: 'bmad-sandbox',
      completedTaskKey: 'SCRUM-9',
    });

    expect(result.ok).toBe(false);
    expect(result.doneTaskKeys).toEqual(['SCRUM-9', 'SCRUM-10']);
    expect(result.errors).toContain('Expected exactly SCRUM-9 to be Done; got SCRUM-9, SCRUM-10');
  });

  test('rejects invalid conversation ID without calling Jira API', async () => {
    const adapter = createAdapter();
    await adapter.sendMessage('invalid', 'No-op');

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      { conversationId: 'invalid' },
      'jira.invalid_conversation_id'
    );
  });

  test('surfaces non-retryable Jira API errors', async () => {
    mockFetch = mock(() =>
      Promise.resolve(new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' }))
    );
    globalThis.fetch = mockFetch as typeof fetch;
    const adapter = createAdapter();

    await expect(
      adapter.sendMessage('jira:sylvainedamtheodore.atlassian.net:SCRUM:SCRUM-42', 'Hello')
    ).rejects.toThrow('Jira API error: 401 Unauthorized - Unauthorized');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('surfaces Jira API errors from work-item operations without fallback', async () => {
    mockFetch = mock(() =>
      Promise.resolve(new Response('Bad request', { status: 400, statusText: 'Bad Request' }))
    );
    globalThis.fetch = mockFetch as typeof fetch;
    const adapter = createAdapter();

    await expect(
      adapter.createIssue({
        projectKey: 'SCRUM',
        issueTypeId: '10003',
        summary: 'Broken request',
      })
    ).rejects.toThrow('Jira API error: 400 Bad Request - Bad request');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('flattens Jira ADF comment text', () => {
    expect(flattenAdfText(adfText('@archon fix this')).trim()).toBe('@archon fix this');
  });

  test('creates ADF bullet lists', () => {
    const doc = toAdfDocument('- one\n- two');
    expect(doc.content[0]?.type).toBe('bulletList');
  });
});
