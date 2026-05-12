# Archon UI Lab PRD

## Objective

Create a dedicated `@archon/ui-lab` workspace package that owns reusable UI primitives, variant stories, page templates, shadcn registry artifacts, and browser validation for the Archon UI stack.

## Scope

Initial primitives: `alert-dialog`, `badge`, `button`, `card`, `collapsible`, `dialog`, `input`, `resizable`, `scroll-area`, `separator`, `tabs`, `textarea`, `tooltip`.

## Stories

1. Package scaffold + dependency wiring
   - Add `packages/ui-lab` workspace package.
   - Export components, templates, styles, and package subpaths.
   - Wire `@archon/web` compatibility re-exports.

2. Storybook + MCP endpoint
   - Add React Vite Storybook.
   - Include Storybook MCP, a11y, docs, and Vitest addons.
   - Serve MCP at the Storybook local endpoint.

3. Component extraction/re-export bridge
   - Move generic primitives into `@archon/ui-lab`.
   - Keep `packages/web/src/components/ui/*` as re-export shims.

4. Primitive story matrix
   - Cover density, surface, state, and mode variants.
   - Preserve existing `cva` component variants.

5. Interactive Radix stories
   - Add play functions for dialog, alert-dialog, collapsible, tabs, and tooltip.
   - Keep keyboard interactions visible to tests.

6. Template registry
   - Add page templates composed from UI-lab primitives.
   - Publish shadcn-compatible registry artifacts under `registry.json` and `public/r`.

7. Playwright/a11y/browser matrix
   - Enumerate Storybook `index.json`.
   - Visit every story in Chromium, Firefox, and WebKit.
   - Fail on console errors, invisible canvas roots, and axe violations.

8. Forge/capability docs + final validation
   - Add official MCP config and evidence files.
   - Add Forge request payload.
   - Validate package gates and repo-level validation where practical.

## Acceptance

- `@archon/ui-lab` type-checks.
- Existing web imports continue to resolve through compatibility shims.
- Storybook builds.
- Playwright visits every Storybook story.
- Capability docs do not claim unofficial Radix or Tailwind MCP support.
