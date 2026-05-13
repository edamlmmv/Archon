# BMAD Capability Contract Snapshot

Source: BMAD capability contract.

Useful capability groups:

- `bmad.workflow`: BMAD skills and routes.
- `evidence.graph`: Graphify evidence.
- `evidence.docs`: Context7/docs evidence.
- `executor.codex`: Codex execution.
- `executor.codex.manual`: manual Codex operator execution.
- `operator.codex.affordance`: Codex operator affordances.
- `runtime.session`: active session context.
- `repo.git`: git state.
- `host.mcp`: MCP host capability.

Verifier boundary:

- `bmad workspace verify-capability --input` is declared-contract only.
- It does not run Graphify, inspect Codex config, read `_bmad/custom`, call app-server, authorize writes, or grant runtime authority.

Codex/Context7 note:

- Context7 docs MCP is advisory evidence and requires a grant.
- It must not leak secrets or become verifier authority.
