# UI-lab Web Adoption Evidence

Generated: 2026-05-13T03:02:24.243Z

## Scope

This evidence distinguishes reusable UI-lab readiness from actual Web route adoption. The parent `web-ui-wrapper-adoption` remains a lab-proven rollup for primitive shims. Current Web adoption gate: `web-dashboard-shell-adoption`. Workflow builder, workflow execution review, and command palette remain declared future work.

## Adoption Queue

| Item | Status | Evidence state | Parent | Current gate | Target files | Required imports |
| --- | --- | --- | --- | --- | --- | --- |
| `web-ui-wrapper-adoption` | forge-ready | lab-proven | rollup | false | `packages/web/src/components/ui` | `@archon/ui-lab/components/ui/*` |
| `web-settings-form-adoption` | forge-ready | web-adopted | web-ui-wrapper-adoption | false | `packages/web/src/routes/SettingsPage.tsx` | `FormActions`, `FormRow`, `FormSection`, `FormShell`, `FormSummary`, `StatusChip`, `useFormProgress` |
| `web-dashboard-shell-adoption` | forge-ready | web-adopted | web-ui-wrapper-adoption | true | `packages/web/src/routes/DashboardPage.tsx` | `DashboardShell` |
| `web-workflow-builder-shell-adoption` | pending | not-proven | web-ui-wrapper-adoption | false | `packages/web/src/routes/WorkflowBuilderPage.tsx` | `WorkflowBuilderShell` |
| `web-workflow-execution-review-adoption` | pending | not-proven | web-ui-wrapper-adoption | false | `packages/web/src/routes/WorkflowExecutionPage.tsx` | `WorkflowExecutionReview` |
| `web-command-palette-adoption` | pending | not-proven | web-ui-wrapper-adoption | false | `packages/web/src/components/workflows/CommandPicker.tsx` | `CommandPaletteFlow` |

## Settings Route Proof

- Target: `packages/web/src/routes/SettingsPage.tsx`
- Approved import source: `@archon/ui-lab`
- Approved imports: `FormShell`, `FormSection`, `FormRow`, `FormActions`, `FormSummary`, `StatusChip`, `useFormProgress`

## Dashboard Route Proof

- Target: `packages/web/src/routes/DashboardPage.tsx`
- Approved import source: `@archon/ui-lab`
- Approved imports: `DashboardShell`
- Validator: `bun .archon/scripts/ui-lab/validate-web-adoption.ts`
- Type gate: `bun --filter @archon/web type-check`

## Captured Visual Evidence

- Desktop viewport: `.archon/bmad/evidence/ui-lab-web-adoption-desktop.png`
- Mobile viewport: `.archon/bmad/evidence/ui-lab-web-adoption-mobile.png`
- Dirty form/readiness state: `.archon/bmad/evidence/ui-lab-web-adoption-dirty-form.png`
- Loading and error state: captured during Vite-only Settings route run with API calls unavailable.
- Saved/success state: not forced in the visual run because the backend API was not started; mutation behavior remains owned by Web and is covered by `bun --filter @archon/web type-check`.

## State Evidence Requirements

| Item | Evidence state | State evidence |
| --- | --- | --- |
| `web-ui-wrapper-adoption` | lab-proven | pure primitive shim coverage |
| `web-settings-form-adoption` | web-adopted | desktop viewport |
| `web-settings-form-adoption` | web-adopted | mobile viewport |
| `web-settings-form-adoption` | web-adopted | loading state |
| `web-settings-form-adoption` | web-adopted | error state or recorded deterministic blocker |
| `web-settings-form-adoption` | web-adopted | dirty form state |
| `web-settings-form-adoption` | web-adopted | saved/success state |
| `web-settings-form-adoption` | web-adopted | validation summary/readiness state |
| `web-settings-form-adoption` | web-adopted | keyboard/focus order |
| `web-dashboard-shell-adoption` | web-adopted | desktop viewport |
| `web-dashboard-shell-adoption` | web-adopted | mobile viewport |
| `web-dashboard-shell-adoption` | web-adopted | loading state |
| `web-dashboard-shell-adoption` | web-adopted | error state or recorded deterministic blocker |
| `web-dashboard-shell-adoption` | web-adopted | empty state |
| `web-dashboard-shell-adoption` | web-adopted | active workflow state |
| `web-dashboard-shell-adoption` | web-adopted | history state |
| `web-dashboard-shell-adoption` | web-adopted | filter and pagination state |

## Authority Boundary

Agentic Search may index this file as advisory metadata. Forge may consume the queue, evidence labels, target refs, and approved imports. Runtime behavior remains proven by Web validation, UI-lab registry evidence, Storybook, and Playwright artifacts rather than source-internal inference.
