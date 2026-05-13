# UI-lab UI/UX Practice Evidence

## Source

- Source: general-ui-ux-practice-profile
- Basis: Cross-library UI/UX heuristics plus UI-lab registry, Storybook, Playwright, and Forge evidence.
- Fetched at: 2026-05-13T03:02:24.243Z
- Practice profile: `.archon/bmad/ui-lab-ui-ux-practices.json`

## Applied UI-lab Contract

This profile captures broad UI/UX practices for component and template generation. It is cross-library guidance backed by UI-lab registry, Storybook, Playwright, and Forge evidence.

| Practice id | Name | UI-lab rule | Forge template use |
| --- | --- | --- | --- |
| `accessibility-first-interactions` | Accessibility first interactions | Every interactive surface needs keyboard, focus, label, and screen-reader behavior represented in evidence. | Template generators should carry accessibility states and keyboard evidence into generated task packets. |
| `bounded-variant-matrix` | Bounded variant matrix | Expose reusable density, surface, state, and mode axes as bounded metadata, not one-off visual cases. | Template generators should derive controls from declared variant axes instead of inspecting source internals. |
| `semantic-theme-tokens` | Semantic theme tokens | Use semantic theme tokens for color, borders, focus rings, and surfaces; avoid hardcoded palette decisions. | Template generators should emit theme-token-safe examples that can move across brands. |
| `responsive-layout-integrity` | Responsive layout integrity | Components and templates must keep stable dimensions, readable text, and no incoherent overlap across mobile and desktop. | Template generators should preserve responsive constraints and viewport evidence for every block. |
| `clear-information-hierarchy` | Clear information hierarchy | Use predictable heading, description, action, and supporting metadata structure for scanability. | Template generators should keep hierarchy slots explicit when composing templates. |
| `storybook-variant-evidence` | Storybook variant evidence | Expose default, state, mode, and variant matrix stories with stable Storybook ids. | Template generators should use Storybook ids as visual evidence anchors for each template input. |
| `browser-and-a11y-proof` | Browser and a11y proof | Record browser behavior, a11y, visible rendering, console cleanliness, and interaction evidence before marking Forge-ready. | Template generators should require test evidence refs for interactive or overlay components. |
| `state-complete-surfaces` | State complete surfaces | Represent default, focus, disabled, invalid, loading, and empty states where the component can reach them. | Template generators should include state coverage before marking a template reusable. |
| `motion-with-restraint` | Motion with restraint | Use motion only to clarify state changes, and keep reduced-motion mode in the evidence model. | Template generators should avoid decorative motion and preserve reduced-motion variants. |
| `composition-ready-slots` | Composition ready slots | Keep component parts, slots, registry dependencies, and template-safe examples explicit. | Template generators should compose from declared slots, dependencies, and examples. |

## Forge Boundary

Forge may consume the practice profile, queue, registry, Storybook ids, Playwright ids, and per-component evidence. Forge must not read UI-lab source internals to infer template readiness.
