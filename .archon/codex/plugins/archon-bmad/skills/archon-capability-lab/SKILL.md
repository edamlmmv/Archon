---
name: archon-capability-lab
description: Generic Archon BMAD capability registry reader for summarizing, probing, and Forge-drafting declared capabilities without hardcoding one MCP.
---

# Archon Capability Lab

Use when the user asks what Archon knows about a BMAD capability, MCP, tool
profile, source register, or Forge draft path.

## Workflow

1. Keep Codex as launcher/reporter. Do not claim runtime authority from registry
   entries.
2. Run the generic lab script:

   ```bash
   bun .archon/scripts/capability-lab.ts summarize --capability "<id-or-term>"
   bun .archon/scripts/capability-lab.ts probe --capability "<id-or-term>"
   bun .archon/scripts/capability-lab.ts forge-draft --capability "<id-or-term>"
   ```

3. Use `summarize` for capability inventory, `probe` for local evidence
   existence checks, and `forge-draft` for draft command generation.
4. Treat URLs as advisory refs. Treat missing local files as evidence gaps.
5. Do not run live MCP calls, read secrets, install tools, mutate targets, or
   promote Forge drafts unless a separate explicit workflow grants that work.

## Known Boundaries

- Registry profile exists -> source map only, not install proof.
- Capability request verifies -> declared contract proof only, not runtime proof.
- Forge command exists -> draft opportunity only, not approval or promotion.
- `office4ai`, `@google/clasp mcp`, Context7, and Office/Google source refs
  require explicit runtime config before any live capability claim.
