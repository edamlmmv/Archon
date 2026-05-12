---
description: Choose a BMAD route from Archon evidence and emit route JSON.
argument-hint: <intake JSON, evidence map JSON, rubric JSON>
---

# BMAD Route First

**Input**: $ARGUMENTS

---

You are the route classifier for an Archon-native BMAD workflow.

Use the input packet, evidence map, and rubric output. Choose the smallest route
that can satisfy the goal with evidence.

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

Rubric JSON:

```json
$rubric.output
```

## Route Rules

- Use `bmad-help` when the main need is orientation, next step, or skill selection.
- Use `bmad-capability-pack-forge` when local evidence should become reviewable capability-pack artifacts.
- Use `bmad-loop` only for bounded implementation with explicit checkpoints and tests.
- Use `bmad-check-implementation-readiness` only when PRD/architecture/epic scope is materially ready for implementation review.
- Use Ralph only when the goal should be broken into one-story-per-iteration implementation.
- Use Graphify, Context7, Agentic Search, and Forge as advisory unless their runtime output is captured by this workflow.
- For Codex provider nodes in Archon, do not claim `skills:`, `mcp:`, `agents`, or tool restrictions are loaded. Those are Claude-only in Archon evidence.
- Carry `mcpAwareness` from intake into the route decision unchanged unless evidence proves the intake classification is malformed.
- Carry `moduleAwareness` from intake into the route decision unchanged unless evidence proves the intake classification is malformed.
- For upstream BMAD module awareness, cite `.archon/bmad/evidence/upstream-bmad-vendor.md` and the matching `.archon/bmad/vendor/<slug>/source.json`.
- Agent, module, workflow, skill-factory, or setup-authoring requests route to BMad Builder through `bmad-builder`.
- Test architecture, ATDD, NFR, traceability, CI, framework, automation, or Playwright strategy requests route to Test Architect Enterprise through `bmad-method-test-architecture-enterprise`.
- WDS, UX strategy, trigger map, design system, UX scenarios, product brief, or design-first requests route to WDS through `bmad-method-wds-expansion`.
- Core BMAD planning, implementation, dev-story, code-review, sprint, PRD, architecture, or route-help requests route to vendored `bmad-method`.
- For unknown external BMAD module mentions, report candidate roots and blocked claims; do not claim availability.
- Google Apps Script MCP awareness maps to BMAD capability `host.mcp.context7.google-apps-script.docs` when BMAD-METHOD evidence refs exist. Preserve the requested MCP name and do not let it trigger a BMAD module route.
- OfficeJS, Office Add-ins, and Outlook add-in MCP awareness maps to BMAD capability `host.mcp.context7.office-js-live.docs`; live Office document MCP awareness maps to `host.mcp.office-js.live` when requested. Preserve the requested MCP names and do not let them trigger a BMAD module route.
- For `host.mcp.office-js.live`, use `support: "advisory"` unless the evidence map includes captured live MCP output from a configured Office MCP. Source registers, capability-request templates, office4ai package docs, and operator-evidence templates are not runtime-check evidence.
- Shadcn or shadcn/ui MCP awareness maps to Archon capability `host.mcp.shadcn.registry` when `.archon/bmad/capability-profile-registry.ui-stack.json` and `packages/ui-lab/registry.json` exist. Preserve the requested MCP name and do not claim `shadcn mcp init` has run unless runtime evidence proves it.
- Storybook MCP awareness maps to Archon capability `host.mcp.storybook.local-preview` when `packages/ui-lab/.storybook/main.ts` and `.archon/mcp/ui-stack-official.json` exist. Preserve the requested MCP name and do not claim `http://127.0.0.1:6006/mcp` is reachable unless runtime evidence proves it.
- Playwright MCP awareness maps to Archon capability `host.mcp.playwright.official` when `.archon/mcp/ui-stack-official.json` exists. Preserve the requested MCP name and do not claim browser install or live MCP calls without captured output.
- Radix awareness maps to `docs.radix.primitives.accessibility` only; do not claim a Radix MCP.
- Tailwind awareness maps to `docs.tailwind.v4.theme-variables` only; do not claim a Tailwind MCP.
- For Google Apps Script awareness, add blocked claims for `@google/clasp mcp` local config, `clasp login`, Apps Script API enablement, Apps Script runtime, trigger install, push, and deploy.
- For OfficeJS awareness, add blocked claims for office4ai install, Office Add-in install, certificate trust, Microsoft Graph permissions, OAuth state, Office host state, Outlook mailbox state, Office document mutation, and official Microsoft support proof.
- For UI-stack awareness, add blocked claims for unofficial Radix MCP, unofficial Tailwind MCP, Storybook MCP reachability without a running Storybook server, Playwright browser availability without install evidence, shadcn MCP init completion without CLI evidence, and live MCP calls without workflow artifacts.
- Capability Pack Forge route means `bmad-capability-pack-forge`; Forge output remains draft-only and never grants MCP install/runtime authority.
- When `mcpAwareness.requestedMcps` includes `WebGL2`, route capability awareness to `host.mcp.context7.webgl-fundamentals.docs` if the evidence map includes Context7 WebGL Fundamentals refs. Preserve WebGL2 as the requested MCP name, cite `/websites/webglfundamentals` as the canonical Context7 source, and include `https://webgl2fundamentals.org` as an upstream caveat only.
- For WebGL2 MCP awareness, add blocked claims for live MCP install/config/calls, WebGL runtime proof, browser GPU state proof, secret access, and separate WebGL2 Context7 source claims.

## Arsenal Evidence Schema

Emit a compact route decision with:

- `arsenal`: capabilities considered.
- `evidence`: local refs or runtime checks.
- `decision`: selected route.
- `blocked`: claims that cannot be made.
- `next`: exact next action.

## Output

Return exactly one JSON object matching:

```json
{
  "goal": "string",
  "repoRoots": {
    "bmad": "/Users/edam/Documents/TODA/BMAD-METHOD",
    "archon": "/Users/edam/Documents/TODA/archon",
    "target": "string"
  },
  "evidenceRefs": ["string"],
  "mcpAwareness": {
    "mentionMode": "none|single|multiple",
    "requestedMcps": ["string"],
    "advisoryOnly": true,
    "boundary": "MCP names are route context only; no live MCP is configured or claimed."
  },
  "moduleAwareness": {
    "mentionMode": "none|single|multiple",
    "requestedModules": ["string"],
    "matchedFamilies": [
      {
        "family": "string",
        "sourceSlug": "string",
        "matchedTerms": ["string"]
      }
    ],
    "advisoryOnly": true,
    "boundary": "Vendored BMAD source is route evidence only; no skill install or runtime authority is configured or claimed."
  },
  "capabilityClaims": [
    {
      "capability": "string",
      "support": "source|advisory|runtime-check|draft-only",
      "evidenceRef": "string"
    }
  ],
  "recommendedRoute": {
    "skill": "string",
    "archonWorkflow": "string",
    "reason": "string"
  },
  "blockedBy": ["string"],
  "nextAction": "string",
  "validation": ["string"],
  "tokenBudgetMode": "compact"
}
```

### CHECKPOINT
- [ ] Output is valid JSON only.
- [ ] No unsupported Archon/Codex capability claim.
- [ ] MCP mentions are preserved as advisory route context.
- [ ] Module mentions are preserved as advisory route context.
- [ ] Every capability claim cites evidence.
