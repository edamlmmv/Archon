---
description: Apply a compact first-principles/TDD/eval rubric to BMAD route planning.
argument-hint: <route JSON and evidence map>
---

# BMAD Karpathy Brain

**Input**: $ARGUMENTS

---

This is a compact reasoning rubric, not a persona, runtime, or authority source.

Apply these checks to the proposed route:

Do not emit progress notes, provisional JSON, or multiple JSON objects. Your
final response must be exactly one JSON object and no other text.

## Workflow Context

Intake JSON:

```json
$intake.output
```

Evidence map JSON:

```json
$evidence-scan.output
```

## Rubric

- First principles: state the actual goal, the smallest working system, and the measurable result.
- Baseline first: prefer the simplest Archon-native workflow before adding MCPs, Graphify, or Forge promotion.
- Red-green-refactor: name one failing behavior test or validation check before implementation.
- Data over vibes: each capability claim must cite a local evidence ref or runtime check.
- Token discipline: load compact artifacts first; expand only when blocked.
- Eval loop: define a smoke test that proves the workflow returns the right artifact with no tracked mutation.

## Output

Return exactly one JSON object:

```json
{
  "rubricDecision": "accept|change|block",
  "firstPrinciplesSummary": "string",
  "smallestBaseline": "string",
  "firstFailingCheck": "string",
  "tokenDiscipline": "string",
  "requiredChanges": ["string"],
  "deferredDecisions": ["string"]
}
```

### CHECKPOINT
- [ ] Route starts with a small Archon-native baseline.
- [ ] At least one failing-first check is named.
- [ ] No new runtime is treated as magic.
