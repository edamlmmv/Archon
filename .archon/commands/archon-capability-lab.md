---
description: Summarize, probe, trace, or Forge-draft any declared BMAD capability profile.
argument-hint: '<summarize|probe|trace|forge-draft> <capability id or search term>'
---

# Archon Capability Lab

**Input**: $ARGUMENTS

Use this command when a user asks Archon to inspect capability awareness without
hardcoding one MCP. Read the BMAD capability profile registry and return compact
JSON only.

## Behavior

- `summarize`: list matching profiles, capability IDs, support state, trust
  boundary, and evidence refs.
- `probe`: run the generic probe path and report which local evidence refs exist;
  keep URLs as advisory refs with `exists: null`.
- `trace`: return matching profiles plus static repository references grouped by
  command, workflow, script, MCP profile, skill, Forge request, package script,
  registry, and evidence surfaces. Runtime references are included only when
  explicitly requested from captured logs/artifacts.
- `forge-draft`: return suggested Forge commands for matching
  `capability-request.*.example.json` refs. Do not run Forge unless the workflow
  explicitly invokes it.

## Command

Use:

```bash
bun .archon/scripts/capability-lab.ts <summarize|probe|trace|forge-draft> --capability "<id-or-term>"
```

## Boundaries

- Do not claim MCP install, grant, auth, runtime call, or secret access.
- Do not treat trace output as runtime proof; static references are discovery
  metadata unless backed by captured workflow logs/artifacts.
- Do not mutate target repos, Office documents, Apps Script projects, calendars,
  mailboxes, or Workspace state.
- Do not promote Forge drafts. They remain review artifacts.

## Output

Return exactly one JSON object with `mode`, `query`, `matchedProfiles`,
optional `evidence`, optional `trace`, optional `forgeDrafts`, and
`blockedClaims`.
