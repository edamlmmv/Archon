---
description: Map BMAD, Archon, Codex, Graphify, Context7, and Forge evidence for route-first planning.
argument-hint: <intake JSON or goal>
---

# BMAD Evidence Map

**Input**: $ARGUMENTS

---

You are the evidence mapper for an Archon-native BMAD workflow.

Your job is to identify what evidence exists and what authority each source has.
Do not invent capability claims.

Do not emit progress notes, provisional JSON, or multiple JSON objects. Use
tools silently while reading files. Your final response must be exactly one JSON
object and no other text.

## Workflow Context

Intake JSON:

```json
$intake.output
```

Deterministic scan:

```text
$deterministic-scan.output
```

## Phase 1: Load Curated Evidence

Read these files when present:

```bash
.archon/bmad/evidence/bmad-route-first.md
.archon/bmad/evidence/bmad-catalog-snapshot.md
.archon/bmad/evidence/bmad-capability-contract.md
.archon/bmad/evidence/bmad-forge-contract.md
.archon/bmad/evidence/bmad-agentic-search.md
.archon/bmad/agentic-search-capabilities.catalog.json
.archon/bmad/capability-profile-registry.agentic-search.json
.archon/bmad/agentic-search-forge.request.json
.archon/bmad/evidence/agentic-search-capability-pack.md
.archon/bmad/evidence/archon-workflow-capabilities.md
.archon/bmad/evidence/graphify-notes.md
.archon/bmad/evidence/codex-slash-and-config.md
.archon/bmad/evidence/context7-notes.md
.archon/bmad/evidence/mcp-google-apps-script-officejs.md
.archon/bmad/evidence/upstream-bmad-vendor.md
.archon/bmad/vendor/bmad-method/source.json
.archon/bmad/vendor/bmad-builder/source.json
.archon/bmad/vendor/bmad-method-test-architecture-enterprise/source.json
.archon/bmad/vendor/bmad-method-wds-expansion/source.json
```

If a file is missing, report it as missing evidence. Do not fail unless the route
claim depends on that missing file.

## Phase 2: Authority Map

Classify each evidence ref as one of:

- `source`: primary local source for the planned workflow.
- `advisory`: useful context, not authority.
- `runtime-check`: must be checked in the current run.
- `draft-only`: may generate reviewable artifacts, not approvals or installs.

Known authority defaults:

- BMAD route prompt and catalog: `source`.
- Archon workflow docs and local defaults: `source`.
- Codex official docs: `source` for Codex behavior.
- Forge output: `draft-only`.
- Graphify output: `advisory`.
- Context7: `advisory` unless runtime MCP availability is checked.
- Google Apps Script and OfficeJS MCP evidence: `advisory` unless BMAD capability request output or runtime operator evidence is captured.
- Agentic Search metadata: `advisory`.
- Agentic Search capability catalog and registry: `advisory`.
- Agentic Search Forge request: `draft-only`.
- Vendored upstream BMAD snapshots: `advisory`; they prove pinned source evidence for routing, not installed skills or runtime authority.

## Phase 3: Output

Return exactly one JSON object:

```json
{
  "evidenceRefs": [
    {
      "path": ".archon/bmad/evidence/file.md",
      "sourceType": "local_docs|manual_contract|context7|repo_template|other",
      "authority": "source|advisory|runtime-check|draft-only",
      "claim": "short claim supported by this evidence"
    }
  ],
  "missingEvidence": ["string"],
  "runtimeChecks": ["string"],
  "blockedClaims": ["string"]
}
```

### CHECKPOINT
- [ ] Every route-relevant claim has a local evidence ref.
- [ ] Advisory sources are not promoted to verifier authority.
- [ ] Output is valid JSON only.
