---
description: Run Archon-native BMAD route planning from Codex Desktop
---

# Archon BMAD Route

Use this command when the user wants Codex Desktop to invoke the Archon-native BMAD workflow.

User task:

```text
$ARGUMENTS
```

## Contract

1. Treat Codex `/goal` as the durable objective. If no goal is visible and the requested task is ambiguous, ask for `/goal <objective>` before running a long workflow.
2. Preserve MCP intent in the Archon route artifact as advisory context:

   - No MCP mention -> `mcpAwareness.mentionMode = "none"`.
   - One MCP mention, for example `WebGL` -> `mentionMode = "single"` and `requestedMcps = ["WebGL"]`.
   - Google Apps Script mentions may map to `host.mcp.context7.google-apps-script.docs`; keep `@google/clasp mcp` setup as advisory until runtime evidence exists.
   - OfficeJS, Outlook add-ins, or live Office MCP mentions may map to `host.mcp.context7.office-js-live.docs` and `host.mcp.office-js.live`; keep office4ai as candidate evidence only until runtime evidence exists.
   - Multiple MCP mentions, for example `Google, Office and others` -> `mentionMode = "multiple"` and `requestedMcps` lists each named MCP.

3. Route Capability Pack Forge requests to `bmad-capability-pack-forge` through Archon, using `.archon/bmad/bmad-archon-codex-pilot.request.json` and summarizing `$ARTIFACTS_DIR/forge/` artifact names only.
4. Preserve upstream BMAD module intent in the Archon route artifact as advisory context:

   - Agent/module/workflow builder terms -> `moduleAwareness.requestedModules` includes `bmad-builder`.
   - Test architecture, ATDD, NFR, traceability, CI, or Playwright strategy -> includes `bmad-method-test-architecture-enterprise`.
   - WDS, UX strategy, trigger map, scenarios, design system, or design-first work -> includes `bmad-method-wds-expansion`.
   - Core BMAD planning/dev/review -> includes `bmad-method`.
   - Google Apps Script and OfficeJS MCP docs stay in `mcpAwareness`; do not turn them into module awareness.

5. Treat `.archon/bmad/vendor/*/source.json` as route evidence only. Do not claim vendored source proves skill installation or runtime support.
6. Run the Archon workflow from `/Users/edam/Documents/TODA/archon`:

   ```bash
   bun --cwd /Users/edam/Documents/TODA/archon run cli workflow run bmad-route-first --no-worktree "$ARGUMENTS"
   ```

7. Read and summarize Archon artifacts only:

   ```text
   $ARTIFACTS_DIR/bmad-route.json
   $ARTIFACTS_DIR/bmad-plan.md
   $ARTIFACTS_DIR/forge/
   ```

8. Keep Codex as the thin launcher. Do not dump full BMAD docs into the Codex answer.
9. Do not claim Codex loaded Archon `skills:`, `mcp:`, `agents`, `hooks`, or tool restrictions. For v1, the Codex path is slash-command launch plus artifact summary.

## Expected Output

Return a compact report with:

- selected BMAD route
- MCP awareness mode and requested MCP names
- module awareness mode, requested modules, and source manifests
- evidence refs Archon used
- blockers
- next action
- validation command or smoke check
