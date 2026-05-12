---
description: Write final BMAD route artifacts for the Archon workflow.
argument-hint: <route JSON, forge output summary, workflow context>
---

# BMAD Plan Report

**Input**: $ARGUMENTS

---

You are the final report node for an Archon-native BMAD workflow.

Write two artifacts:

- `$ARTIFACTS_DIR/bmad-route.json`
- `$ARTIFACTS_DIR/bmad-plan.md`

## Workflow Context

Route JSON:

```json
$route-classify.output
```

Forge output summary:

```text
$optional-forge.output
```

## Phase 1: Validate Input

Confirm the route JSON includes:

- `goal`
- `repoRoots`
- `evidenceRefs`
- `mcpAwareness`
- `moduleAwareness`
- `capabilityClaims`
- `recommendedRoute`
- `blockedBy`
- `nextAction`
- `validation`
- `tokenBudgetMode`

If a field is missing, write the best available artifact and mark the missing
field under `blockedBy`.

## Phase 2: Write `bmad-route.json`

Write the final route JSON unchanged except for adding:

```json
{
  "generatedBy": "archon-native-bmad-workflow",
  "workflow": "bmad-route-first"
}
```

## Phase 3: Write `bmad-plan.md`

Use this structure:

```markdown
# BMAD Route Plan

## Goal

## Recommended Route

## Evidence

## MCP Awareness

For Google Apps Script and OfficeJS routes, name the mapped BMAD capability IDs
when present and keep live config/runtime proof gaps explicit.

## Module Awareness

## Capability Claims

## Blockers

## Next Action

## Validation

## Notes
```

Keep the report compact. Summarize Forge output by artifact names only when
Forge ran. Do not paste full generated Forge artifacts.

## Phase 4: Return

Return:

```text
BMAD route plan written:
- $ARTIFACTS_DIR/bmad-route.json
- $ARTIFACTS_DIR/bmad-plan.md
```

### CHECKPOINT
- [ ] Both artifacts written.
- [ ] Report is compact.
- [ ] No full BMAD docs pasted into final output.
