---
description: Refresh and validate Archon Context7 capability pack evidence.
argument-hint: <optional goal or capability query>
---

# Context7 Capability Sync

Input: $ARGUMENTS

Run:

```bash
bun .archon/scripts/validate-context7-capabilities.ts
bun run cli validate workflows context7-capability-forge-loop
bun run cli validate commands context7-capability-sync
```

Guardrails:

- Do not write API keys or OAuth tokens to repository files.
- Context7 MCP requires `CONTEXT7_API_KEY` or client-managed OAuth before live calls.
- Forge reads `.archon/bmad/context7-*.json` and evidence files only.
- Context7 docs and installed skills are advisory unless captured in local evidence.
