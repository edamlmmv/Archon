# UI Stack Storybook Components Evidence

## Primitive Scope

`@archon/ui-lab` now tracks the full official shadcn component snapshot through
`.archon/bmad/ui-lab-components.queue.json`. The initial hand-authored primitive
set remains:

- `alert-dialog`
- `badge`
- `button`
- `card`
- `collapsible`
- `dialog`
- `input`
- `resizable`
- `scroll-area`
- `separator`
- `tabs`
- `textarea`
- `tooltip`

## Story Matrix

Storybook stories model the requested variant dimensions:

- density: `compact`, `default`, `comfortable`
- surface: `flat`, `outline`, `elevated`, `ghost`
- state: `default`, `focus`, `disabled`, `invalid`, `loading`, `empty`
- mode: `dark`, `high-contrast`, `reduced-motion`, `responsive`

## Template Scope

The first page-template set is:

- `AgentCommandCenterTemplate`
- `WorkflowReviewTemplate`

These templates are registered through shadcn-compatible registry artifacts and exercised through Storybook.

## Full Coverage Follow-up

The complete 59-component list, registry metadata, and Forge evidence contract
live in `.archon/bmad/evidence/ui-lab-coverage.md`.
