# UI-lab Productization Evidence

Generated: 2026-05-13T03:02:24.243Z

## Counts

| Kind | Count |
| --- | ---: |
| dependency | 1 |
| evidence | 1 |
| template | 13 |
| web-adoption | 6 |
| workflow | 1 |

## Queue

| Item | Kind | Target | Parent | Evidence state | Current gate | Storybook evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `agent-command-center` | template | `packages/ui-lab/src/templates/agent-command-center.tsx` | root | template-ready | false | `ui-lab-templates--agent-command-center`, `ui-lab-templates--agent-command-center-compact` | forge-ready |
| `workflow-review` | template | `packages/ui-lab/src/templates/workflow-review.tsx` | root | template-ready | false | `ui-lab-templates--workflow-review`, `ui-lab-templates--workflow-review-invalid` | forge-ready |
| `settings-form-workspace` | template | `packages/ui-lab/src/templates/settings-form-workspace.tsx` | root | template-ready | false | `ui-lab-templates--settings-form-workspace`, `ui-lab-templates--settings-form-workspace-compact`, `ui-lab-templates--settings-form-workspace-invalid` | forge-ready |
| `dashboard-shell` | template | `packages/ui-lab/src/templates/productization.tsx` | root | template-ready | false | `ui-lab-templates--dashboard-shell` | forge-ready |
| `project-settings-form` | template | `packages/ui-lab/src/templates/productization.tsx` | root | template-ready | false | `ui-lab-templates--project-settings-form` | forge-ready |
| `environment-variables-form` | template | `packages/ui-lab/src/templates/productization.tsx` | root | template-ready | false | `ui-lab-templates--environment-variables-form` | forge-ready |
| `workflow-builder-shell` | template | `packages/ui-lab/src/templates/productization.tsx` | root | template-ready | false | `ui-lab-templates--workflow-builder-shell` | forge-ready |
| `workflow-execution-review` | template | `packages/ui-lab/src/templates/productization.tsx` | root | template-ready | false | `ui-lab-templates--workflow-execution-review` | forge-ready |
| `command-palette-flow` | template | `packages/ui-lab/src/templates/productization.tsx` | root | template-ready | false | `ui-lab-templates--command-palette-flow` | forge-ready |
| `data-table-workspace` | template | `packages/ui-lab/src/templates/productization.tsx` | root | template-ready | false | `ui-lab-templates--data-table-workspace` | forge-ready |
| `onboarding-empty-state` | template | `packages/ui-lab/src/templates/productization.tsx` | root | template-ready | false | `ui-lab-templates--onboarding-empty-state` | forge-ready |
| `modal-drawer-crud` | template | `packages/ui-lab/src/templates/productization.tsx` | root | template-ready | false | `ui-lab-templates--modal-drawer-crud` | forge-ready |
| `sidebar-app-shell` | template | `packages/ui-lab/src/templates/productization.tsx` | root | template-ready | false | `ui-lab-templates--sidebar-app-shell` | forge-ready |
| `web-ui-wrapper-adoption` | web-adoption | `packages/web/src/components/ui` | root | lab-proven | false | `ui-lab-templates--dashboard-shell` | forge-ready |
| `web-settings-form-adoption` | web-adoption | `packages/web/src/routes/SettingsPage.tsx` | web-ui-wrapper-adoption | web-adopted | false | `ui-lab-templates--settings-form-workspace` | forge-ready |
| `web-dashboard-shell-adoption` | web-adoption | `packages/web/src/routes/DashboardPage.tsx` | web-ui-wrapper-adoption | web-adopted | true | `ui-lab-templates--dashboard-shell` | forge-ready |
| `web-workflow-builder-shell-adoption` | web-adoption | `packages/web/src/routes/WorkflowBuilderPage.tsx` | web-ui-wrapper-adoption | not-proven | false | `ui-lab-templates--workflow-builder-shell` | pending |
| `web-workflow-execution-review-adoption` | web-adoption | `packages/web/src/routes/WorkflowExecutionPage.tsx` | web-ui-wrapper-adoption | not-proven | false | `ui-lab-templates--workflow-execution-review` | pending |
| `web-command-palette-adoption` | web-adoption | `packages/web/src/components/workflows/CommandPicker.tsx` | web-ui-wrapper-adoption | not-proven | false | `ui-lab-templates--command-palette-flow` | pending |
| `dependency-drift-profile` | dependency | `.archon/bmad/ui-lab-dependency-map.json` | root | template-ready | false | `ui-lab-templates--data-table-workspace` | forge-ready |
| `ui-lab-productization-loop` | workflow | `.archon/workflows/ui-lab-productization-loop.yaml` | root | template-ready | false | `ui-lab-templates--workflow-execution-review` | forge-ready |
| `forge-template-evidence-pack` | evidence | `.archon/bmad/evidence/ui-lab-productization.md` | root | template-ready | false | `ui-lab-templates--command-palette-flow` | forge-ready |

## Evidence State Labels

- `template-ready`: UI-lab template exists and has declared registry/metadata.
- `lab-proven`: Storybook, Playwright, registry, or shim evidence proves reusable lab readiness.
- `web-adopted`: A Web route consumes approved public UI-lab exports.
- `not-proven`: Declared future Web adoption item with no route-level proof yet.

## Forge Boundary

Forge reads `.archon/bmad/ui-lab-productization.queue.json`, registry items, Storybook ids, Playwright ids, and dependency evidence. Source internals remain implementation detail.
