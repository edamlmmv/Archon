# Upstream BMAD Vendor Evidence

Archon vendors selected upstream BMAD source snapshots under
`.archon/bmad/vendor/<slug>/` for route awareness only.

## Source Of Truth

- `bmad-method`: `https://github.com/bmad-code-org/BMAD-METHOD`
- `bmad-builder`: `https://github.com/bmad-code-org/bmad-builder`
- `bmad-method-test-architecture-enterprise`: `https://github.com/bmad-code-org/bmad-method-test-architecture-enterprise`
- `bmad-method-wds-expansion`: `https://github.com/bmad-code-org/bmad-method-wds-expansion`

Each snapshot has `source.json` with upstream URL, branch, pinned commit,
copied paths, refresh command, route families, and advisory boundary.

## Refresh

Run:

```bash
bun .archon/scripts/refresh-bmad-vendor.ts
```

The refresh clones upstream GitHub repos into a temporary directory, sparse
checks out allowlisted paths, writes a staging snapshot, then swaps it into
`.archon/bmad/vendor/`. If clone or copy fails before the swap, the existing
snapshot is left unchanged.

## Route Families

- BMAD Method: core BMAD planning, implementation, review, and route-help
  surfaces.
- BMad Builder: agent, workflow, module, setup, and validation authoring.
- Test Architect Enterprise: test architecture, ATDD, NFR, traceability, CI,
  framework, automation, and Playwright strategy.
- WDS UX: design-first strategy, product brief, trigger mapping, UX scenarios,
  UX design, design system, and product evolution.

## Boundaries

- Vendored BMAD source is route evidence only.
- Vendored BMAD source is not global skill installation proof.
- Vendored BMAD source is not runtime grant, MCP config, hook, agent, or
  tool-restriction authority.
- MissionCTL paths are intentionally excluded.
- Google Apps Script and OfficeJS MCP docs remain deferred in this phase.
