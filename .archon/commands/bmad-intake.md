---
description: Normalize a user goal into a BMAD-ready Archon planning input.
argument-hint: <goal, repo roots, constraints>
---

# BMAD Intake

**Input**: $ARGUMENTS

---

You are the intake node for an Archon-native BMAD planning workflow.

This command does not implement code. It normalizes the operator's request into
the smallest useful planning packet for downstream Archon nodes.

Do not emit progress notes, provisional JSON, or multiple JSON objects. Your
final response must be exactly one JSON object and no other text.

## Phase 1: Parse

Extract:

- Goal: the concrete desired outcome.
- Done condition: how success should be recognized.
- Target repo roots: absolute paths mentioned by the user.
- BMAD source repo: `/Users/edam/Documents/TODA/BMAD-METHOD` unless evidence says otherwise.
- Archon repo: `/Users/edam/Documents/TODA/Archon` unless evidence says otherwise.
- Constraints: no-touch paths, approval boundaries, test expectations, token budget concerns.
- Desired execution lane: planning only, implementation, Ralph loop, review, or capability-pack drafting.
- Module awareness:
  - No upstream BMAD module mention -> `mentionMode: "none"` and empty `requestedModules`.
  - Agent/module/workflow builder terms -> request `bmad-builder`.
  - Test architecture, ATDD, NFR, traceability, CI, Playwright strategy -> request `bmad-method-test-architecture-enterprise`.
  - WDS, UX strategy, trigger map, scenarios, design system, design-first -> request `bmad-method-wds-expansion`.
  - Core BMAD planning/dev/review terms -> request `bmad-method`.
  - Google Apps Script and OfficeJS MCP terms stay MCP advisory/deferred; do not classify them as upstream BMAD modules.
- MCP awareness:
  - No MCP mention -> `mentionMode: "none"` and empty `requestedMcps`.
  - One MCP mention, for example `WebGL` -> `mentionMode: "single"` and one requested MCP.
  - A WebGL2 MCP mention -> `mentionMode: "single"` and `requestedMcps: ["WebGL2"]`; do not rename it to Context7 during intake.
  - Google Apps Script, Apps Script, or `@google/clasp mcp` mentions -> include `Google Apps Script`.
  - OfficeJS, Office JS, Office Add-ins, Outlook add-ins, Outlook Office, OfficeDev, live Office MCP, or `office4ai` mentions -> include `OfficeJS`; include `OfficeJS Live MCP` when live Office document MCP behavior is requested.
  - Context7 mentions -> include `Context7`; do not claim live Context7 unless a runtime artifact proves it.
  - Shadcn or shadcn/ui mentions -> include `shadcn`.
  - Storybook mentions -> include `Storybook`.
  - Playwright mentions -> include `Playwright`.
  - Radix mentions -> include `Radix Docs`; do not claim a Radix MCP.
  - Tailwind mentions -> include `Tailwind Docs`; do not claim a Tailwind MCP.
  - Multiple MCP mentions, for example `Google, Office and others` -> `mentionMode: "multiple"` and each named MCP.

If the input has no explicit target repo, default target repo to the current Archon checkout.

## Phase 2: Route Preconditions

Check the request against these preconditions:

- BMAD and target repos must stay distinct.
- BMAD Workspace status/evidence requires an explicit session id; do not assume active session discovery.
- Forge outputs are drafts until human review and BMAD customization/promotion.
- Codex `/goal` is outer objective tracking; Archon owns this workflow body.
- Context7, Graphify, Agentic Search, and Forge evidence are advisory unless downstream evidence says otherwise.
- MCP names from the user are advisory route context only. They do not prove availability, install, authorization, or live runtime configuration.
- Google Apps Script MCP awareness may map downstream to `host.mcp.context7.google-apps-script.docs`, but intake must not claim `@google/clasp mcp`, `clasp login`, Apps Script API enablement, triggers, push, or deploy state.
- OfficeJS MCP awareness may map downstream to `host.mcp.context7.office-js-live.docs` and `host.mcp.office-js.live`, but intake must not claim office4ai install, Office Add-in install, certificate trust, Microsoft Graph permissions, OAuth state, Outlook mailbox state, or Office document access.
- WebGL2 MCP names are advisory route context only. Downstream route evidence may map them to `host.mcp.context7.webgl-fundamentals.docs`, but intake must not claim a live WebGL2 MCP.
- UI-stack MCP awareness may map downstream to `host.mcp.storybook.local-preview`, `host.mcp.playwright.official`, and `host.mcp.shadcn.registry` when local Archon evidence exists, but intake must not claim Storybook is running, Playwright browsers are installed, shadcn MCP init has been run, or any live MCP call happened.
- Radix and Tailwind map downstream to docs/source capability claims only; intake must not claim unofficial Radix or Tailwind MCP support.
- Vendored upstream BMAD modules under `.archon/bmad/vendor/` are advisory route evidence only. They do not prove skill installation or runtime authority.

## Phase 3: Output

Return exactly one JSON object:

```json
{
  "goal": "string",
  "doneCondition": "string",
  "repoRoots": {
    "bmad": "/Users/edam/Documents/TODA/BMAD-METHOD",
    "archon": "/Users/edam/Documents/TODA/Archon",
    "target": "/Users/edam/Documents/TODA/Archon"
  },
  "constraints": ["string"],
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
  "desiredLane": "planning|implementation|ralph|review|capability-pack",
  "needsForgeDraft": true,
  "needsRalphLoop": false,
  "tokenBudgetMode": "compact"
}
```

### CHECKPOINT
- [ ] Goal and done condition are explicit.
- [ ] MCP mention mode is one of `none`, `single`, or `multiple`.
- [ ] Repo roots are absolute paths.
- [ ] BMAD repo and target repo are not collapsed into one unless user explicitly asks.
- [ ] Module awareness preserves upstream BMAD route context without claiming install/runtime support.
- [ ] Output is valid JSON only.
