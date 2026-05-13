---
description: Launch the persisted BMAD UI-lab productization workflow.
argument-hint: '<goal text>'
---

# UI-lab Productization Loop

**Input**: $ARGUMENTS

Use this command to launch the persisted Archon workflow:

```bash
bun run cli workflow run ui-lab-productization-loop "$ARGUMENTS"
```

## Goal Contract

Default goal when no argument is provided:

```text
Keep UI-lab productized for Forge template generation: registry-backed templates,
Web adoption evidence, dependency drift controls, Agentic Search metadata, and
Archon-persisted BMAD workflow evidence remain ready while future Web adoption
children stay pending until route-level proof exists.
```

## Boundaries

- No custom UI-lab MCP v1.
- Forge reads registry/evidence/dependency metadata, not source internals.
- Web app owns data/state; UI-lab owns reusable UI, common components, icons, hooks, and templates.
- Web adoption evidence separates `template-ready`, `lab-proven`, `web-adopted`, and `not-proven`.
- Storybook and Playwright are validation aids; shadcn registry is the install/MCP contract.
