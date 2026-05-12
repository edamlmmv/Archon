# UI-Lab Component Ralph Contracts

This directory is populated by `.archon/scripts/ui-lab/pick.ts` as the
`ui-lab-component-loop` workflow selects queue items.

Each selected component receives:

- `<component>.json`: machine-readable variant and validation contract.
- `<component>.md`: human-readable Ralph story contract.

The queue remains the source of truth at
`.archon/bmad/ui-lab-components.queue.json`.
