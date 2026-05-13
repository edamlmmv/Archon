/**
 * Jira Cloud webhook and Atlassian Document Format types used by the adapter.
 */

export interface JiraUser {
  accountId?: string;
  displayName?: string;
  emailAddress?: string;
}

export interface JiraProject {
  key?: string;
  name?: string;
}

export interface JiraStatus {
  name?: string;
}

export interface JiraFields {
  summary?: string;
  description?: unknown;
  project?: JiraProject;
  status?: JiraStatus;
  issuetype?: { id?: string; name?: string };
  parent?: { key?: string };
  labels?: string[];
  components?: { name?: string }[];
  reporter?: JiraUser;
  assignee?: JiraUser | null;
}

export interface JiraIssue {
  id?: string;
  key: string;
  self?: string;
  fields?: JiraFields;
}

export interface JiraComment {
  id?: string;
  body?: unknown;
  author?: JiraUser;
  updateAuthor?: JiraUser;
  self?: string;
}

export interface JiraWebhookPayload {
  webhookEvent?: string;
  issue?: JiraIssue;
  comment?: JiraComment;
  user?: JiraUser;
}

export interface JiraCreatedIssue {
  id: string;
  key: string;
  self?: string;
  url: string;
  summary: string;
}

export interface JiraIssueDetails {
  key: string;
  summary: string;
  issueType: string;
  status: string;
  parentKey: string | null;
  labels: string[];
}

export interface JiraIssueSearchResult extends JiraIssueDetails {
  id: string;
  url: string;
}

export interface JiraCreateIssueInput {
  projectKey: string;
  issueTypeId: string;
  summary: string;
  description?: string;
  labels?: string[];
  parentKey?: string;
}

export interface JiraTransition {
  id: string;
  name: string;
  to: string;
  statusCategory?: string;
}

export interface JiraIssueTypeDetails {
  id: string;
  name: string;
  subtask: boolean;
  hierarchyLevel?: number;
}

export interface JiraBmadSprintExerciseOptions {
  projectKey: string;
  sprintId: number;
  epicIssueTypeId?: string;
  storyIssueTypeId?: string;
  taskIssueTypeId?: string;
  label?: string;
  summaryPrefix?: string;
}

export interface JiraBmadSprintExerciseCreated {
  epic: JiraCreatedIssue;
  stories: JiraCreatedIssue[];
  tasks: JiraCreatedIssue[];
}

export interface JiraBmadSprintExerciseVerification {
  ok: boolean;
  errors: string[];
  epicInSprint: boolean;
  sprintIssueKeys: string[];
  doneTaskKeys: string[];
  issues: Record<string, JiraIssueDetails>;
}

export interface JiraBmadSprintExerciseResult {
  created: JiraBmadSprintExerciseCreated;
  completedTaskKey: string;
  transitions: {
    toInProgress: JiraTransition;
    toDone: JiraTransition;
  };
  verification: JiraBmadSprintExerciseVerification;
}

export interface JiraBmadSprintExerciseVerificationInput {
  created: JiraBmadSprintExerciseCreated;
  sprintId: number;
  label: string;
  completedTaskKey: string;
}

export interface AtlassianTextNode {
  type: 'text';
  text: string;
}

export interface AtlassianHardBreakNode {
  type: 'hardBreak';
}

export interface AtlassianParagraphNode {
  type: 'paragraph';
  content?: (AtlassianTextNode | AtlassianHardBreakNode)[];
}

export interface AtlassianCodeBlockNode {
  type: 'codeBlock';
  attrs?: { language?: string };
  content?: AtlassianTextNode[];
}

export interface AtlassianBulletListNode {
  type: 'bulletList';
  content?: AtlassianListItemNode[];
}

export interface AtlassianListItemNode {
  type: 'listItem';
  content?: AtlassianParagraphNode[];
}

export type AtlassianDocumentNode =
  | AtlassianParagraphNode
  | AtlassianCodeBlockNode
  | AtlassianBulletListNode;

export interface AtlassianDocument {
  type: 'doc';
  version: 1;
  content: AtlassianDocumentNode[];
}
