# UI-lab Full shadcn Coverage Evidence

## Source Snapshot

- Snapshot date: 2026-05-12
- Official source: https://ui.shadcn.com/docs/components
- Contract ledger: `.archon/bmad/ui-lab-components.queue.json`
- Manifest authority: `.archon/scripts/ui-lab/manifest.ts`

## Coverage Contract

`@archon/ui-lab` tracks all 59 official shadcn component entries in the queue.
Each queue item records the official name, component id, source URL, category,
target UI file, Storybook story id, Playwright test id, registry item path,
registry dependencies, Forge evidence path, status, attempts, and artifacts.
The UI-lab UI/UX practice profile records broad component and template
rules that Forge can use for template generation:

- `.archon/bmad/ui-lab-ui-ux-practices.json`
- `.archon/bmad/evidence/ui-lab-ui-ux-practices.md`
- `.archon/bmad/ui-lab-dependency-map.json`
- `.archon/bmad/evidence/ui-lab-template-patterns.md`

Status meaning:

- `pending`: component exists in the official snapshot but still needs full variant/test/registry/Forge evidence.
- `in_progress`: a Ralph loop owns the queue lock for this item.
- `implemented`: component source exists but verification is incomplete.
- `verified`: Storybook and Playwright evidence exists but Forge readiness is incomplete.
- `forge-ready`: component can be consumed from shadcn registry metadata and declared evidence.
- `blocked`: component needs a stated unblock condition.

## Forge Boundary

Capability Pack Forge may use:

- `packages/ui-lab/registry.json`
- `packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json`
- generated `packages/ui-lab/public/r/*.json`
- `.archon/bmad/ui-lab-components.queue.json`
- `.archon/bmad/evidence/ui-lab-component-runs/*.json`
- `.archon/bmad/ui-lab-ui-ux-practices.json`
- `.archon/bmad/evidence/ui-lab-ui-ux-practices.md`
- `.archon/bmad/ui-lab-dependency-map.json`
- `.archon/bmad/evidence/ui-lab-template-patterns.md`
- Storybook story ids and Playwright evidence recorded on queue items

Forge must not claim template readiness from source file presence alone.
No custom UI-lab MCP is declared for v1; shadcn registry/MCP compatibility is
the discovery surface until a concrete Forge query proves that registry metadata
is insufficient.

## Validation

Run:

```bash
bun .archon/scripts/ui-lab/refresh-queue.ts
bun --filter @archon/ui-lab registry:build
bun .archon/scripts/ui-lab/validate.ts
```
