# Agentic Search Capability Pack Evidence

## Purpose

Agentic Search is now treated as a first-class advisory capability index for Archon route planning and Forge metadata.

## Adapter Order

Canonical order:

1. `file-search`
2. `skill-loading`
3. `database-query`
4. `web-search`
5. `memory`
6. `shell`

## Authority Boundary

- `file-search`, `skill-loading`, `web-search`, `memory`, Context7, UI-lab search metadata, and retrieved context are advisory until captured in declared evidence.
- `database-query`, `shell`, MCP, and tool output are runtime-check evidence only for exact captured workflow artifacts.
- Capability Pack Forge output is draft-only. It does not approve, install, authorize, or execute tools.
- Codex provider nodes do not gain per-node `mcp`, `skills`, `agents`, `hooks`, or tool restrictions from Agentic Search metadata.

## BMAD Delegation

- Audit: `bmad-help`, `bmad-agent-analyst`, `bmad-tool-leverage-review-prompt`.
- Registry and Forge: `bmad-capability-pack-forge`, `bmad-agent-tech-writer`.
- Workflow design: `bmad-agent-architect`, `bmad-create-epics-and-stories`.
- Implementation loop: `bmad-agent-dev`, `bmad-loop`.
- Readiness and review: `bmad-check-implementation-readiness`, `bmad-code-review`.

## Validation

Use:

```bash
bun .archon/scripts/validate-agentic-search-capabilities.ts
bun .archon/scripts/capability-lab.ts summarize --capability agentic-search
bun run cli validate workflows agentic-search-capability-loop
bun run cli validate commands agentic-search-capability-sync
```
