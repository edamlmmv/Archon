# Archon Workflow Capability Snapshot

Source repo: `/Users/edam/Documents/TODA/archon`

Archon architecture:

- Commands live in `.archon/commands/*.md`.
- Workflows live in `.archon/workflows/*.yaml`.
- Workflows use `nodes:` DAG format.
- Node types include `command`, `prompt`, `bash`, `script`, `loop`, `approval`, and `cancel`.
- Artifacts in `$ARTIFACTS_DIR` are the durable handoff between fresh nodes.
- Repo-local commands/workflows override defaults by name.

Codex provider:

- Supports `provider: codex`, model selection, `modelReasoningEffort`, `webSearchMode`, `additionalDirectories`, and structured output.
- Does not support Archon `skills`, `mcp`, `agents`, `hooks`, or tool restrictions.

Loop node:

- Good fit for Ralph-style repeated implementation from disk state.
- Does not support per-loop MCP, skills, hooks, retry, or tool restrictions.
- Use preflight artifacts when loop iterations need compact context.
