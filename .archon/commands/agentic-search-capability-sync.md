---
description: Refresh and validate Archon Agentic Search capability awareness.
argument-hint: <optional capability query>
---

# Agentic Search Capability Sync

Input: $ARGUMENTS

Run:

```bash
bun .archon/scripts/validate-agentic-search-capabilities.ts
bun .archon/scripts/capability-lab.ts summarize --capability agentic-search
bun .archon/scripts/capability-lab.ts trace --capability agentic-search
bun run cli validate workflows agentic-search-capability-loop
bun run cli validate commands agentic-search-capability-sync
```

Guardrails:

- Agentic Search ranks capability evidence; it does not grant runtime authority.
- Capability Lab trace reports static repo references only unless a captured
  runtime root is explicitly provided.
- MCP install, authorization, and live calls require separate captured artifacts.
- Forge reads `.archon/bmad/agentic-search-*.json` and evidence files only.
- Codex provider nodes do not gain per-node `mcp`, `skills`, `agents`, `hooks`, or tool restrictions.
