# BMAD Catalog Snapshot

Source repo: `/Users/edam/Documents/TODA/BMAD-METHOD`

Known BMAD CLI:

- `bmad --version`: 6.6.0 at inspection time.
- `bmad --help`: includes `agentic-search`, `install`, `status`, `uninstall`, `upstream-sync`, `workspace`.
- `bmad workspace --help`: includes `launch`, `intake`, `packet`, `status`, `handoff`, `evidence`, `verify-capability`, `diff`, `result`, `closeout`, `archive`, `verify-archive`, `review`, `destroy`, `authorize`.

Relevant installed skills:

- `bmad-help`: orient current state and recommend next BMAD skill.
- `bmad-party-mode`: advisory multi-agent consensus; consensus fields only, no authority grant.
- `bmad-capability-pack-forge`: generate draft capability-pack artifacts from local evidence.
- `bmad-loop`: bounded autonomous implementation with checkpoints.
- `bmad-tool-leverage-review-prompt`: decide whether existing tools are underused.
- `bmad-highest-leverage-official-mcp-addition-prompt`: only after explicit MCP-addition goal.

Workspace caveat:

- `bmad workspace status/evidence` needs explicit session id. Without one it can fail with `SESSION_NOT_FOUND`.
