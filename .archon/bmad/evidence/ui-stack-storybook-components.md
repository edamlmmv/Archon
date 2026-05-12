# UI Stack Storybook Components Evidence

## Primitive Scope

`@archon/ui-lab` covers the current Archon UI primitives:

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
