---
description: Run generic Archon BMAD capability lab over declared capability profiles.
argument-hint: '<summarize|probe|forge-draft> <capability id or search term>'
---

# Capability Lab

Use `.archon/commands/archon-capability-lab.md` and
`.archon/scripts/capability-lab.ts`.

Examples:

```bash
bun .archon/scripts/capability-lab.ts summarize --capability "host.mcp.context7.office-js-live.docs"
bun .archon/scripts/capability-lab.ts probe --capability "OfficeJS"
bun .archon/scripts/capability-lab.ts forge-draft --capability "Google Apps Script"
```

Boundary: registry and Forge draft output are advisory. No MCP install, secret
read, live call, target mutation, or promotion is implied.
