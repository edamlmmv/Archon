# Archon BMAD

Use this skill when the user asks Codex Desktop to use Archon BMAD, run BMAD through Archon, or route a task with the Archon-native BMAD workflow.

## Workflow

1. Keep Codex as a launcher and reporter. Archon owns the BMAD workflow.
2. Prefer the slash command `/archon-bmad:bmad <task>` when available.
3. If the slash command is unavailable, run from any current working directory:

   ```bash
   bun --cwd /Users/edam/Documents/TODA/archon run cli workflow run bmad-route-first --no-worktree "<task>"
   ```

4. Preserve MCP mentions as advisory `mcpAwareness` in the route artifact: `none`, `single` (for example `WebGL`), or `multiple` (for example `Google`, `Office`). Google Apps Script may map to `host.mcp.context7.google-apps-script.docs`; OfficeJS or Outlook add-ins may map to `host.mcp.context7.office-js-live.docs`; live Office MCP may map to `host.mcp.office-js.live`.
5. Preserve upstream BMAD module mentions as advisory `moduleAwareness` in the route artifact. Use vendored source manifests under `.archon/bmad/vendor/` for BMAD Method, BMad Builder, Test Architect Enterprise, and WDS route context.
6. Treat vendored BMAD source as route evidence only. It is not skill installation proof, runtime grant, MCP config, hook, agent, or tool-restriction authority.
7. Route Capability Pack Forge needs to `bmad-capability-pack-forge`; Forge artifacts are drafts only.
8. Summarize generated Archon artifacts instead of copying full BMAD source docs into the answer.
9. Do not claim Codex provider nodes load Archon `skills:`, `mcp:`, `agents`, `hooks`, or tool restrictions in v1.
10. Use `archon-capability-lab` or `.archon/scripts/capability-lab.ts` when a generic declared-capability summary, probe, or Forge draft command is needed.

## Artifacts

- `$ARTIFACTS_DIR/bmad-route.json`
- `$ARTIFACTS_DIR/bmad-plan.md`
- `$ARTIFACTS_DIR/forge/` when the Forge draft node runs

## Vendored Upstream BMADs

- `bmad-method`: core BMAD planning, implementation, review, and route-help.
- `bmad-builder`: agent, workflow, module, setup, and validation authoring.
- `bmad-method-test-architecture-enterprise`: test architecture, ATDD, NFR, traceability, CI, automation, Playwright strategy.
- `bmad-method-wds-expansion`: WDS UX strategy, trigger mapping, scenarios, design system, design-first work.

Refresh with:

```bash
bun .archon/scripts/refresh-bmad-vendor.ts
```
