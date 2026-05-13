# BMAD Agentic Search Snapshot

Agentic Search classes:

- `file-search`: local files and docs.
- `skill-loading`: installed skills and skill bodies.
- `database-query`: structured DB evidence, deferred for v1.
- `web-search`: remote/current info, deferred unless needed.
- `memory`: prior rollout memory, advisory.
- `shell`: local commands and deterministic snapshots.

V1 integration:

- Use `file-search`, `skill-loading`, and `shell`.
- Defer `database-query`, `web-search`, and `memory` unless the route explicitly needs them.

Boundary:

- Agentic Search metadata is planning guidance.
- Retrieved context and tool output are not BMAD verifier input unless captured by a declared evidence artifact.
