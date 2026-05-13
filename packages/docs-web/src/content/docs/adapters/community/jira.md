# Jira Cloud Adapter

The Jira Cloud community forge adapter lets Jira issue comments trigger Archon workflows and sends Archon responses back to the same Jira issue as comments.

V1 uses manual Jira webhook or Automation setup. Archon does not register Jira dynamic webhooks, install a Jira app, or manage OAuth/Connect lifecycle.

## Environment

```bash
JIRA_SITE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-atlassian-api-token
JIRA_WEBHOOK_SECRET=generated-shared-secret
JIRA_PROJECT_CODEBASE_MAP='{"SCRUM":"/Users/edam/Documents/TODA/Archon"}'

# Optional
JIRA_ALLOWED_ACCOUNT_IDS=account-id-1,account-id-2
JIRA_BOT_MENTION=archon
JIRA_BOT_ACCOUNT_ID=bot-account-id
```

`JIRA_PROJECT_CODEBASE_MAP` values must point at an existing registered Archon codebase by ID, name, or exact path. Jira issues do not carry repository URLs, so Archon will not guess a repo from Jira text.

## Webhook Setup

Create a Jira Automation rule or webhook that sends issue comment events to:

```text
https://your-archon-host/webhooks/jira
```

Send the shared secret as either:

```text
X-Archon-Jira-Secret: <JIRA_WEBHOOK_SECRET>
```

or, if your Jira setup cannot send custom headers:

```text
https://your-archon-host/webhooks/jira?token=<JIRA_WEBHOOK_SECRET>
```

## Usage

Comment on a mapped Jira issue:

```text
@archon fix this failing test
```

Archon creates one conversation per Jira issue using:

```text
jira:<site-host>:<projectKey>:<issueKey>
```

Responses are posted back to Jira with Atlassian Document Format comments.

## Work Item Operations

The adapter also exposes a narrow Jira Cloud REST helper surface for code-driven planning flows:

- create Epics, Stories, and Tasks
- parent Stories and Tasks to an Epic with Jira's `parent` field
- add issue keys to an active sprint
- fetch issue details and available transitions
- transition an issue by resolving the target status name first

The bundled BMAD sprint exercise operation creates a disposable sandbox set, adds only Stories and Tasks to a sprint, transitions exactly one generated Task to Done, and returns verification results.

## Limits

- Issue comments with the configured mention trigger Archon; issue descriptions do not.
- Dynamic webhook registration, Jira app install flow, OAuth/Connect, attachments, and Jira UI mapping are deferred.
- Missing project mappings produce a setup comment and do not invoke AI.
