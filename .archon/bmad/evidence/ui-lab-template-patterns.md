# UI-lab Template Pattern Evidence

## Template Registry

| Template | Kind | Storybook evidence | Playwright evidence | Dependencies |
| --- | --- | --- | --- | --- |
| `agent-command-center` | agent-workflow-shell | `ui-lab-templates--agent-command-center`, `ui-lab-templates--agent-command-center-compact` | `ui-lab-template:agent-command-center` | `archon-ui-core`, `lucide-react` |
| `workflow-review` | evidence-review-shell | `ui-lab-templates--workflow-review`, `ui-lab-templates--workflow-review-invalid` | `ui-lab-template:workflow-review` | `archon-ui-core`, `lucide-react` |
| `settings-form-workspace` | settings-form | `ui-lab-templates--settings-form-workspace`, `ui-lab-templates--settings-form-workspace-compact`, `ui-lab-templates--settings-form-workspace-invalid` | `ui-lab-template:settings-form-workspace` | `archon-ui-core`, `react-hook-form`, `zod`, `lucide-react` |
| `dashboard-shell` | dashboard-shell | `ui-lab-templates--dashboard-shell` | `ui-lab-template:dashboard-shell` | `archon-ui-core`, `lucide-react` |
| `project-settings-form` | project-settings-form | `ui-lab-templates--project-settings-form` | `ui-lab-template:project-settings-form` | `archon-ui-core`, `lucide-react` |
| `environment-variables-form` | environment-variables-form | `ui-lab-templates--environment-variables-form` | `ui-lab-template:environment-variables-form` | `archon-ui-core`, `lucide-react` |
| `workflow-builder-shell` | workflow-builder-shell | `ui-lab-templates--workflow-builder-shell` | `ui-lab-template:workflow-builder-shell` | `archon-ui-core`, `lucide-react` |
| `workflow-execution-review` | workflow-execution-review | `ui-lab-templates--workflow-execution-review` | `ui-lab-template:workflow-execution-review` | `archon-ui-core`, `lucide-react` |
| `command-palette-flow` | command-palette-flow | `ui-lab-templates--command-palette-flow` | `ui-lab-template:command-palette-flow` | `archon-ui-core`, `cmdk`, `lucide-react` |
| `data-table-workspace` | data-table-workspace | `ui-lab-templates--data-table-workspace` | `ui-lab-template:data-table-workspace` | `archon-ui-core`, `lucide-react` |
| `onboarding-empty-state` | onboarding-empty-state | `ui-lab-templates--onboarding-empty-state` | `ui-lab-template:onboarding-empty-state` | `archon-ui-core`, `lucide-react` |
| `modal-drawer-crud` | modal-drawer-crud | `ui-lab-templates--modal-drawer-crud` | `ui-lab-template:modal-drawer-crud` | `archon-ui-core`, `lucide-react` |
| `sidebar-app-shell` | sidebar-app-shell | `ui-lab-templates--sidebar-app-shell` | `ui-lab-template:sidebar-app-shell` | `archon-ui-core`, `lucide-react` |

## Dependency Profile

Forge may use `.archon/bmad/ui-lab-dependency-map.json` to decide which dependencies are required now and which runtime-package dependencies stay deferred until a template imports them.

| Dependency | Version | Use |
| --- | --- | --- |
| `class-variance-authority` | ^0.7.1 | variant/class composition utilities |
| `clsx` | ^2.1.1 | variant/class composition utilities |
| `cmdk` | ^1.1.1 | command palette templates |
| `lucide-react` | ^1.14.0 | central icon registry and template actions |
| `radix-ui` | ^1.4.3 | accessible primitive wrappers used by forms and overlays |
| `react-hook-form` | ^7.75.0 | validated form templates |
| `tailwind-merge` | ^3.4.0 | variant/class composition utilities |
| `zod` | ^4.4.3 | validated form templates |

## Forge Boundary

Templates expose registry items, Storybook ids, Playwright ids, dependency profile refs, productization queue refs, and UI/UX practice refs. Forge must use those declared refs instead of reading component internals.
