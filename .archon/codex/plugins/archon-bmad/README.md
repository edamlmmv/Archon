# Archon BMAD Codex Plugin

This local Codex plugin exposes the Archon-native BMAD route workflow in Codex Desktop.

Primary command:

```text
/archon-bmad:bmad <task>
```

The command is intentionally a thin launcher. It tells Codex to run the Archon workflow from `/Users/edam/Documents/TODA/archon`, then summarize the artifacts that Archon writes. BMAD reasoning, routing, and evidence mapping stay in Archon.

Capability Pack Forge is available through the BMAD route as `bmad-capability-pack-forge`. When requested, Archon runs the local Forge request at `.archon/bmad/bmad-archon-codex-pilot.request.json` and summarizes `$ARTIFACTS_DIR/forge/` artifact names only.

MCP mention handling is advisory route context, not live MCP configuration:

- No MCP mention: preserve `mcpAwareness.mentionMode = "none"`.
- One MCP mention, for example `WebGL`: preserve `requestedMcps = ["WebGL"]`.
- `WebGL2 MCP` mention: preserve `requestedMcps = ["WebGL2"]`; route awareness may map it to BMAD `host.mcp.context7.webgl-fundamentals.docs`, with `/websites/webglfundamentals` as the canonical Context7 source and `https://webgl2fundamentals.org` as caveat only.
- Google Apps Script mentions may map to `host.mcp.context7.google-apps-script.docs`, including Apps Script Context7 source IDs, REST API, and `@google/clasp mcp` refs.
- OfficeJS, Outlook add-ins, or live Office MCP mentions may map to `host.mcp.context7.office-js-live.docs` and `host.mcp.office-js.live`, with office4ai kept as candidate evidence only.
- Multiple MCP mentions, for example `Google, Office and others`: preserve each named MCP and mark `mentionMode = "multiple"`.

Archon Codex provider nodes still do not load per-node `mcp:`, `skills:`, `agents`, `hooks`, or tool restrictions in this v1 launcher path.

Generic capability lab:

```bash
bun .archon/scripts/capability-lab.ts summarize --capability "host.mcp.context7.office-js-live.docs"
bun .archon/scripts/capability-lab.ts probe --capability "OfficeJS"
bun .archon/scripts/capability-lab.ts forge-draft --capability "Google Apps Script"
```

Capability Lab reads BMAD profile registry entries, probes local evidence refs,
and drafts Forge commands. It does not call MCP servers, install tools, read
secrets, mutate targets, or promote Forge drafts.

Module awareness is also advisory route context. Archon vendors selected
upstream BMAD snapshots under `.archon/bmad/vendor/` with `source.json`
manifests that pin upstream URL, branch, commit, copied paths, refresh command,
and route boundary.

- BMAD Method: core planning, implementation, review, and route-help.
- BMad Builder: agent, workflow, module, setup, and validation authoring.
- Test Architect Enterprise: test architecture, ATDD, NFR, traceability, CI,
  automation, and Playwright strategy.
- WDS UX: design-first strategy, trigger mapping, scenarios, design system, and
  product evolution.

Vendored BMAD source is not global skill installation proof, runtime grant, MCP
configuration, hook, agent, or tool-restriction authority.

Refresh vendored snapshots from upstream:

```bash
bun .archon/scripts/refresh-bmad-vendor.ts
```

Install or refresh the local marketplace:

```bash
codex plugin marketplace add /Users/edam/Documents/TODA/archon/.archon/codex
```

Local marketplaces are read from their configured source path. `codex plugin marketplace upgrade` is only for Git-backed marketplaces.

Enable the plugin in `/Users/edam/.codex/config.toml`:

```toml
[plugins."archon-bmad@archon-bmad"]
enabled = true
```

Codex Desktop may need a reload before the slash command palette refreshes.
