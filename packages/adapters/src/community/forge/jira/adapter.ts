/**
 * Jira Cloud community forge adapter.
 * Handles Jira issue comments with @mention detection and replies via REST API v3.
 */
import { existsSync } from 'fs';
import type { IPlatformAdapter, MessageMetadata } from '@archon/core';
import {
  ConversationLockManager,
  ConversationNotFoundError,
  classifyAndFormatError,
  handleMessage,
  toError,
} from '@archon/core';
import type { IsolationHints } from '@archon/isolation';
import * as db from '@archon/core/db/conversations';
import * as codebaseDb from '@archon/core/db/codebases';
import { createLogger } from '@archon/paths';
import { splitIntoParagraphChunks } from '../../../utils/message-splitting';
import { flattenAdfText, toAdfDocument } from './adf';
import {
  isJiraAccountAuthorized,
  parseAllowedAccountIds,
  parseProjectCodebaseMap,
  verifyWebhookToken,
} from './auth';
import type {
  JiraBmadSprintExerciseCreated,
  JiraBmadSprintExerciseOptions,
  JiraBmadSprintExerciseResult,
  JiraBmadSprintExerciseVerification,
  JiraBmadSprintExerciseVerificationInput,
  JiraCreateIssueInput,
  JiraCreatedIssue,
  JiraIssue,
  JiraIssueDetails,
  JiraTransition,
  JiraUser,
  JiraWebhookPayload,
} from './types';

let cachedLog: ReturnType<typeof createLogger> | undefined;
function getLog(): ReturnType<typeof createLogger> {
  if (!cachedLog) cachedLog = createLogger('adapter.jira');
  return cachedLog;
}

const MAX_LENGTH = 32000;
const BOT_RESPONSE_MARKER = '<!-- archon-bot-response -->';

interface JiraAdapterOptions {
  retryDelayMs?: (attempt: number) => number;
  allowedAccountIds?: string[];
  projectCodebaseMap?: Record<string, string>;
  botAccountId?: string;
}

interface JiraCodebaseRef {
  id: string;
  name: string;
  default_cwd: string;
}

interface ParsedJiraEvent {
  issue: JiraIssue;
  issueKey: string;
  projectKey: string;
  commentText: string;
  commentAuthor?: JiraUser;
}

interface JiraCreateIssueResponse {
  id: string;
  key: string;
  self?: string;
}

interface JiraTransitionsResponse {
  transitions?: {
    id?: string;
    name?: string;
    to?: {
      name?: string;
      statusCategory?: { key?: string };
    };
  }[];
}

interface JiraSprintIssuesResponse {
  issues?: { key?: string }[];
}

export class JiraAdapter implements IPlatformAdapter {
  private readonly siteUrl: string;
  private readonly siteHost: string;
  private readonly email: string;
  private readonly apiToken: string;
  private readonly webhookSecret: string;
  private readonly allowedAccountIds: string[];
  private readonly projectCodebaseMap: Record<string, string>;
  private readonly botMention: string;
  private readonly botAccountId?: string;
  private readonly lockManager: ConversationLockManager;
  private readonly retryDelayFn: (attempt: number) => number;

  constructor(
    siteUrl: string,
    email: string,
    apiToken: string,
    webhookSecret: string,
    lockManager: ConversationLockManager,
    botMention?: string,
    options?: JiraAdapterOptions
  ) {
    if (!siteUrl) throw new Error('JiraAdapter requires a non-empty siteUrl');
    if (!email) throw new Error('JiraAdapter requires a non-empty email');
    if (!apiToken) throw new Error('JiraAdapter requires a non-empty apiToken');
    if (!webhookSecret) throw new Error('JiraAdapter requires a non-empty webhookSecret');

    const parsedUrl = new URL(siteUrl);
    this.siteUrl = parsedUrl.origin;
    this.siteHost = parsedUrl.host;
    this.email = email;
    this.apiToken = apiToken;
    this.webhookSecret = webhookSecret;
    this.lockManager = lockManager;
    this.botMention = botMention ?? 'archon';
    this.allowedAccountIds =
      options?.allowedAccountIds ?? parseAllowedAccountIds(process.env.JIRA_ALLOWED_ACCOUNT_IDS);
    this.projectCodebaseMap =
      options?.projectCodebaseMap ?? parseProjectCodebaseMap(process.env.JIRA_PROJECT_CODEBASE_MAP);
    this.botAccountId = options?.botAccountId ?? process.env.JIRA_BOT_ACCOUNT_ID;
    this.retryDelayFn = options?.retryDelayMs ?? ((attempt: number): number => 1000 * attempt);

    if (this.allowedAccountIds.length > 0) {
      getLog().info({ accountCount: this.allowedAccountIds.length }, 'jira.whitelist_enabled');
    } else {
      getLog().info('jira.whitelist_disabled');
    }

    getLog().info(
      { siteHost: this.siteHost, botMention: this.botMention },
      'jira.adapter_initialized'
    );
  }

  async sendMessage(
    conversationId: string,
    message: string,
    _metadata?: MessageMetadata
  ): Promise<void> {
    const parsed = this.parseConversationId(conversationId);
    if (!parsed) {
      getLog().error({ conversationId }, 'jira.invalid_conversation_id');
      return;
    }

    const markedMessage = `${message}\n\n${BOT_RESPONSE_MARKER}`;
    if (markedMessage.length <= MAX_LENGTH) {
      await this.postComment(parsed.issueKey, markedMessage);
      return;
    }

    const chunks = splitIntoParagraphChunks(markedMessage, MAX_LENGTH - 500);
    for (let i = 0; i < chunks.length; i++) {
      try {
        await this.postComment(parsed.issueKey, chunks[i]);
      } catch (error) {
        const partialError = new Error(
          `Failed to post Jira comment chunk ${String(i + 1)}/${String(chunks.length)}. ` +
            `${String(i)} chunk(s) were posted before failure.`
        );
        partialError.cause = error;
        throw partialError;
      }
    }
  }

  getStreamingMode(): 'batch' {
    return 'batch';
  }

  getPlatformType(): string {
    return 'jira';
  }

  async start(): Promise<void> {
    getLog().info('jira.webhook_adapter_ready');
  }

  stop(): void {
    getLog().info('jira.adapter_stopped');
  }

  async ensureThread(originalConversationId: string, _messageContext?: unknown): Promise<string> {
    return originalConversationId;
  }

  async createIssue(input: JiraCreateIssueInput): Promise<JiraCreatedIssue> {
    const fields: Record<string, unknown> = {
      project: { key: input.projectKey },
      issuetype: { id: input.issueTypeId },
      summary: input.summary,
      labels: input.labels ?? [],
    };

    if (input.description !== undefined) fields.description = toAdfDocument(input.description);
    if (input.parentKey) fields.parent = { key: input.parentKey };

    const created = await this.jiraRequest<JiraCreateIssueResponse>('/rest/api/3/issue', {
      method: 'POST',
      body: JSON.stringify({ fields }),
    });

    return {
      id: created.id,
      key: created.key,
      self: created.self,
      url: `${this.siteUrl}/browse/${created.key}`,
      summary: input.summary,
    };
  }

  async addIssuesToSprint(sprintId: number, issueKeys: string[]): Promise<void> {
    if (issueKeys.length === 0) return;

    await this.jiraRequest<unknown>(
      `/rest/agile/1.0/sprint/${encodeURIComponent(String(sprintId))}/issue`,
      {
        method: 'POST',
        body: JSON.stringify({ issues: issueKeys }),
      }
    );
  }

  async getIssueDetails(issueKey: string): Promise<JiraIssueDetails> {
    const issue = await this.jiraRequest<JiraIssue>(
      `/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,issuetype,status,parent,labels`
    );
    const fields = issue.fields;

    return {
      key: issue.key,
      summary: fields?.summary ?? '',
      issueType: fields?.issuetype?.name ?? '',
      status: fields?.status?.name ?? '',
      parentKey: fields?.parent?.key ?? null,
      labels: fields?.labels ?? [],
    };
  }

  async getAvailableTransitions(issueKey: string): Promise<JiraTransition[]> {
    const result = await this.jiraRequest<JiraTransitionsResponse>(
      `/rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions?expand=transitions.fields`
    );

    const transitions: JiraTransition[] = [];
    for (const transition of result.transitions ?? []) {
      if (!transition.id || !transition.name || !transition.to?.name) continue;
      transitions.push({
        id: transition.id,
        name: transition.name,
        to: transition.to.name,
        statusCategory: transition.to.statusCategory?.key,
      });
    }
    return transitions;
  }

  async transitionIssue(issueKey: string, targetStatusName: string): Promise<JiraTransition> {
    const transitions = await this.getAvailableTransitions(issueKey);
    const transition = transitions.find(
      item => item.to === targetStatusName || item.name === targetStatusName
    );
    if (!transition) {
      throw new Error(
        `Missing Jira transition to ${targetStatusName} for ${issueKey}. Available transitions: ${transitions
          .map(item => `${item.id}:${item.name}->${item.to}`)
          .join(', ')}`
      );
    }

    await this.jiraRequest<unknown>(
      `/rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions`,
      {
        method: 'POST',
        body: JSON.stringify({ transition: { id: transition.id } }),
      }
    );

    return transition;
  }

  async runBmadSprintExercise(
    options: JiraBmadSprintExerciseOptions
  ): Promise<JiraBmadSprintExerciseResult> {
    const label = options.label ?? 'bmad-sandbox';
    const summaryPrefix = options.summaryPrefix ?? 'BMAD Sandbox Exercise';
    const epicIssueTypeId = options.epicIssueTypeId ?? '10001';
    const storyIssueTypeId = options.storyIssueTypeId ?? '10004';
    const taskIssueTypeId = options.taskIssueTypeId ?? '10003';

    const epic = await this.createIssue({
      projectKey: options.projectKey,
      issueTypeId: epicIssueTypeId,
      summary: `${summaryPrefix} - Jira sprint planning drill`,
      description:
        'Disposable BMAD sandbox exercise. Purpose: demonstrate epics-and-stories breakdown, sprint assignment, and one task completion path.',
      labels: [label],
    });

    const stories = [
      await this.createIssue({
        projectKey: options.projectKey,
        issueTypeId: storyIssueTypeId,
        parentKey: epic.key,
        summary: `${summaryPrefix} - Story 1: Receive Jira comments in Archon`,
        description:
          'As a maintainer, I can receive Jira comments in Archon so Jira discussion can drive Archon/Codex work.',
        labels: [label],
      }),
      await this.createIssue({
        projectKey: options.projectKey,
        issueTypeId: storyIssueTypeId,
        parentKey: epic.key,
        summary: `${summaryPrefix} - Story 2: Trace Jira work to codebase context`,
        description:
          'As a maintainer, I can trace Jira work back to the mapped Archon codebase context so work stays reproducible.',
        labels: [label],
      }),
    ];

    const tasks = [
      await this.createIssue({
        projectKey: options.projectKey,
        issueTypeId: taskIssueTypeId,
        parentKey: epic.key,
        summary: `${summaryPrefix} - Task: Draft acceptance criteria for Jira comment routing (supports ${stories[0].key})`,
        description: `Supports ${stories[0].key}: Receive Jira comments in Archon. Draft acceptance criteria for comment-created webhooks, @archon mention filtering, mapped project routing, and Jira reply behavior.`,
        labels: [label],
      }),
      await this.createIssue({
        projectKey: options.projectKey,
        issueTypeId: taskIssueTypeId,
        parentKey: epic.key,
        summary: `${summaryPrefix} - Task: Verify ${options.projectKey} project maps to Archon codebase (supports ${stories[0].key})`,
        description: `Supports ${stories[0].key}: Receive Jira comments in Archon. Verify ${options.projectKey} maps to the Archon codebase and no repo inference is required from Jira.`,
        labels: [label],
      }),
      await this.createIssue({
        projectKey: options.projectKey,
        issueTypeId: taskIssueTypeId,
        parentKey: epic.key,
        summary: `${summaryPrefix} - Task: Document completion path for Jira-driven work (supports ${stories[1].key})`,
        description: `Supports ${stories[1].key}: Trace Jira work to codebase context. Document the status path and evidence needed to mark a Jira-driven Archon/Codex task complete.`,
        labels: [label],
      }),
      await this.createIssue({
        projectKey: options.projectKey,
        issueTypeId: taskIssueTypeId,
        parentKey: epic.key,
        summary: `${summaryPrefix} - Task: Run one end-to-end @archon mention check (supports ${stories[1].key})`,
        description: `Supports ${stories[1].key}: Trace Jira work to codebase context. Run one controlled @archon mention check and capture the Jira-to-Archon routing evidence.`,
        labels: [label],
      }),
    ];

    const sprintIssueKeys = [...stories.map(story => story.key), ...tasks.map(task => task.key)];
    await this.addIssuesToSprint(options.sprintId, sprintIssueKeys);

    const completedTaskKey = tasks[0].key;
    const toInProgress = await this.transitionIssue(completedTaskKey, 'In Progress');
    const toDone = await this.transitionIssue(completedTaskKey, 'Done');

    const created: JiraBmadSprintExerciseCreated = { epic, stories, tasks };
    const verification = await this.verifyBmadSprintExercise({
      created,
      sprintId: options.sprintId,
      label,
      completedTaskKey,
    });

    return {
      created,
      completedTaskKey,
      transitions: { toInProgress, toDone },
      verification,
    };
  }

  async verifyBmadSprintExercise(
    input: JiraBmadSprintExerciseVerificationInput
  ): Promise<JiraBmadSprintExerciseVerification> {
    const allIssueKeys = [
      input.created.epic.key,
      ...input.created.stories.map(story => story.key),
      ...input.created.tasks.map(task => task.key),
    ];
    const issues: Record<string, JiraIssueDetails> = {};
    for (const issueKey of allIssueKeys) {
      issues[issueKey] = await this.getIssueDetails(issueKey);
    }

    const sprintIssueKeys = await this.getSprintIssueKeys(input.sprintId);
    const sprintIssueKeySet = new Set(sprintIssueKeys);
    const doneTaskKeys = input.created.tasks
      .map(task => task.key)
      .filter(taskKey => issues[taskKey]?.status === 'Done');
    const errors: string[] = [];

    if (issues[input.created.epic.key]?.issueType !== 'Epic') {
      errors.push(`${input.created.epic.key} is not an Epic`);
    }
    if (sprintIssueKeySet.has(input.created.epic.key)) {
      errors.push(
        `${input.created.epic.key} epic should not be in sprint ${String(input.sprintId)}`
      );
    }

    for (const story of input.created.stories) {
      const issue = issues[story.key];
      if (issue?.issueType !== 'Story') errors.push(`${story.key} is not a Story`);
      if (issue?.parentKey !== input.created.epic.key) {
        errors.push(`${story.key} parent is not ${input.created.epic.key}`);
      }
      if (!sprintIssueKeySet.has(story.key)) {
        errors.push(`${story.key} is not in sprint ${String(input.sprintId)}`);
      }
    }

    for (const task of input.created.tasks) {
      const issue = issues[task.key];
      if (issue?.issueType !== 'Task') errors.push(`${task.key} is not a Task`);
      if (issue?.parentKey !== input.created.epic.key) {
        errors.push(`${task.key} parent is not ${input.created.epic.key}`);
      }
      if (!sprintIssueKeySet.has(task.key)) {
        errors.push(`${task.key} is not in sprint ${String(input.sprintId)}`);
      }
      if (!issue?.labels.includes(input.label))
        errors.push(`${task.key} is missing ${input.label}`);
    }

    for (const story of input.created.stories) {
      if (!issues[story.key]?.labels.includes(input.label)) {
        errors.push(`${story.key} is missing ${input.label}`);
      }
    }
    if (!issues[input.created.epic.key]?.labels.includes(input.label)) {
      errors.push(`${input.created.epic.key} is missing ${input.label}`);
    }

    if (doneTaskKeys.length !== 1 || doneTaskKeys[0] !== input.completedTaskKey) {
      errors.push(
        `Expected exactly ${input.completedTaskKey} to be Done; got ${doneTaskKeys.join(', ')}`
      );
    }

    return {
      ok: errors.length === 0,
      errors,
      epicInSprint: sprintIssueKeySet.has(input.created.epic.key),
      sprintIssueKeys: sprintIssueKeys.filter(issueKey => allIssueKeys.includes(issueKey)),
      doneTaskKeys,
      issues,
    };
  }

  async handleWebhook(payload: string, token: string): Promise<void> {
    if (!verifyWebhookToken(token, this.webhookSecret)) {
      getLog().error({ payloadSize: payload.length }, 'jira.invalid_webhook_token');
      return;
    }

    let event: JiraWebhookPayload;
    try {
      event = JSON.parse(payload) as JiraWebhookPayload;
    } catch (error) {
      getLog().error({ err: error, payloadSize: payload.length }, 'jira.webhook_parse_failed');
      return;
    }

    const parsed = this.parseEvent(event);
    if (!parsed) return;

    const { issue, issueKey, projectKey, commentText, commentAuthor } = parsed;
    const authorAccountId = commentAuthor?.accountId ?? event.user?.accountId;

    if (!isJiraAccountAuthorized(authorAccountId, this.allowedAccountIds)) {
      const maskedAccount = authorAccountId ? `${authorAccountId.slice(0, 6)}***` : 'unknown';
      getLog().info({ maskedAccount }, 'jira.unauthorized_webhook');
      return;
    }

    if (commentText.includes(BOT_RESPONSE_MARKER)) {
      getLog().debug({ issueKey }, 'jira.ignoring_marked_comment');
      return;
    }

    if (this.botAccountId && authorAccountId === this.botAccountId) {
      getLog().debug({ issueKey }, 'jira.ignoring_own_comment');
      return;
    }

    if (!this.hasMention(commentText)) return;

    const conversationId = this.buildConversationId(projectKey, issueKey);
    const codebase = await this.resolveMappedCodebase(projectKey);
    if (!codebase) {
      await this.sendSetupError(conversationId, projectKey);
      return;
    }

    const conversation = await db.getOrCreateConversation('jira', conversationId);
    if (!conversation.codebase_id) {
      try {
        await db.updateConversation(conversation.id, {
          codebase_id: codebase.id,
          cwd: codebase.default_cwd,
        });
      } catch (error) {
        if (error instanceof ConversationNotFoundError) {
          getLog().error(
            { conversationId, codebaseId: codebase.id },
            'jira.conversation_link_failed'
          );
          throw new Error('Failed to set up Jira conversation - please try again');
        }
        throw error;
      }
    }

    const finalMessage = this.stripMention(commentText);
    if (!finalMessage) {
      await this.sendMessage(
        conversationId,
        `Mention ${this.botMentionForDisplay()} with a request, for example: ${this.botMentionForDisplay()} fix this failing test.`
      );
      return;
    }

    const issueContext = this.buildIssueContext(issue, projectKey, finalMessage, commentAuthor);
    const isolationHints: IsolationHints = {
      workflowType: 'issue',
      workflowId: issueKey,
      suggestedBranch: this.buildSuggestedBranch(issueKey, issue.fields?.summary),
    };

    await this.lockManager.acquireLock(conversationId, async () => {
      try {
        await handleMessage(this, conversationId, finalMessage, {
          issueContext,
          isolationHints,
        });
      } catch (error) {
        const err = toError(error);
        getLog().error({ err, conversationId }, 'jira.message_handling_error');
        try {
          await this.sendMessage(conversationId, classifyAndFormatError(err));
        } catch (sendError) {
          getLog().error(
            { err: toError(sendError), conversationId },
            'jira.error_message_send_failed'
          );
        }
      }
    });
  }

  private parseEvent(event: JiraWebhookPayload): ParsedJiraEvent | null {
    if (!event.issue || !event.comment) return null;

    const issueKey = event.issue.key;
    if (!issueKey) return null;

    const projectKey =
      event.issue.fields?.project?.key ?? issueKey.split('-')[0]?.trim().toUpperCase();
    if (!projectKey) return null;

    const commentText = flattenAdfText(event.comment.body).trim();
    if (!commentText) return null;

    return {
      issue: event.issue,
      issueKey,
      projectKey,
      commentText,
      commentAuthor: event.comment.author ?? event.user,
    };
  }

  private hasMention(text: string): boolean {
    const escaped = this.escapeRegex(this.botMention);
    const pattern = new RegExp(`@${escaped}(?=$|[\\s,:;])`, 'i');
    return pattern.test(text);
  }

  private stripMention(text: string): string {
    const escaped = this.escapeRegex(this.botMention);
    const pattern = new RegExp(`@${escaped}(?=$|[\\s,:;])(?:[\\s,:;]+)?`, 'gi');
    return text.replace(pattern, '').trim();
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private botMentionForDisplay(): string {
    return `@${this.botMention}`;
  }

  private buildConversationId(projectKey: string, issueKey: string): string {
    return `jira:${this.siteHost}:${projectKey}:${issueKey}`;
  }

  private parseConversationId(
    conversationId: string
  ): { siteHost: string; projectKey: string; issueKey: string } | null {
    const match = /^jira:([^:]+):([^:]+):([A-Z][A-Z0-9]+-\d+)$/i.exec(conversationId);
    if (!match) return null;
    return { siteHost: match[1], projectKey: match[2], issueKey: match[3] };
  }

  private async postComment(issueKey: string, message: string): Promise<void> {
    await this.jiraRequest<unknown>(`/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment`, {
      method: 'POST',
      body: JSON.stringify({ body: toAdfDocument(message) }),
    });
  }

  private async getSprintIssueKeys(sprintId: number): Promise<string[]> {
    const result = await this.jiraRequest<JiraSprintIssuesResponse>(
      `/rest/agile/1.0/sprint/${encodeURIComponent(String(sprintId))}/issue?maxResults=100&fields=summary,status,issuetype,parent,labels`
    );
    return (result.issues ?? [])
      .map(issue => issue.key)
      .filter((issueKey): issueKey is string => Boolean(issueKey));
  }

  private async jiraRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const headers = new Headers(options.headers);
        headers.set('Accept', headers.get('Accept') ?? 'application/json');
        headers.set(
          'Authorization',
          `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`
        );
        if (options.body && !headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }

        const response = await fetch(`${this.siteUrl}${path}`, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(
            `Jira API error: ${String(response.status)} ${response.statusText} - ${body}`
          );
        }

        if (response.status === 204) return undefined as T;
        const body = await response.text();
        if (!body) return undefined as T;
        return JSON.parse(body) as T;
      } catch (error) {
        if (attempt < maxRetries && this.isRetryableError(error)) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelayFn(attempt)));
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Jira API request exhausted retries for ${path}`);
  }

  private isRetryableError(error: unknown): boolean {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('fetch failed') ||
      message.includes('429') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    );
  }

  private async resolveMappedCodebase(projectKey: string): Promise<JiraCodebaseRef | null> {
    const mappingValue =
      this.projectCodebaseMap[projectKey.toUpperCase()] ?? this.projectCodebaseMap[projectKey];
    if (!mappingValue) return null;

    const byId = await codebaseDb.getCodebase(mappingValue);
    if (byId) return byId;

    const byPath = await codebaseDb.findCodebaseByDefaultCwd(mappingValue);
    if (byPath) return byPath;

    const byName = await codebaseDb.findCodebaseByName(mappingValue);
    if (byName) return byName;

    if (existsSync(mappingValue)) {
      getLog().warn({ projectKey, mappingValue }, 'jira.codebase_mapping_path_unregistered');
    }
    return null;
  }

  private async sendSetupError(conversationId: string, projectKey: string): Promise<void> {
    try {
      await this.sendMessage(
        conversationId,
        `Jira project ${projectKey} is not mapped to a registered Archon codebase. Set JIRA_PROJECT_CODEBASE_MAP, for example: {"${projectKey}":"/path/to/repo"}`
      );
    } catch (error) {
      getLog().error({ err: error, conversationId, projectKey }, 'jira.setup_error_send_failed');
    }
  }

  private buildIssueContext(
    issue: JiraIssue,
    projectKey: string,
    userComment: string,
    commentAuthor?: JiraUser
  ): string {
    const fields = issue.fields;
    const labels = fields?.labels?.join(', ') ?? '';
    const components =
      fields?.components
        ?.map(component => component.name)
        .filter(Boolean)
        .join(', ') ?? '';
    const assignee = fields?.assignee?.displayName ?? 'Unassigned';
    const reporter = fields?.reporter?.displayName ?? 'Unknown';
    const author = commentAuthor?.displayName ?? commentAuthor?.accountId ?? 'Unknown';

    return `[Jira Issue Context]
Issue ${issue.key}: "${fields?.summary ?? ''}"
Project: ${projectKey}${fields?.project?.name ? ` (${fields.project.name})` : ''}
URL: ${this.siteUrl}/browse/${issue.key}
Status: ${fields?.status?.name ?? 'Unknown'}
Reporter: ${reporter}
Assignee: ${assignee}
Comment author: ${author}
Labels: ${labels}
Components: ${components}

Description:
${flattenAdfText(fields?.description).trim()}

---

${userComment}`;
  }

  private buildSuggestedBranch(issueKey: string, summary: string | undefined): string {
    const slug = (summary ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    return slug ? `jira/${issueKey}-${slug}` : `jira/${issueKey}`;
  }
}
