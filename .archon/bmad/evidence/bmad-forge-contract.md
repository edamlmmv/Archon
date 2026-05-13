# BMAD Capability Pack Forge Snapshot

Forge command:

```bash
node /Users/edam/Documents/TODA/BMAD-METHOD/tools/capability-pack-forge.js --input <forge-request.json> --output <dir>
```

Compiler lifecycle:

```text
migrate -> ingest -> search -> draft -> validate -> export-bmad -> promote
```

Authority:

- v1 JSON request is canonical input for local draft generation.
- Forge emits reviewable artifacts only.
- `customization-draft.toml` is inactive until routed through BMAD customization.
- `codex-task-packet.md` is instruction draft only.
- `kind: bmad-capability-pack` is identity only, not a grant or install manifest.

Boundaries:

- Forge must not call live Context7, MCP, Docker, Git, Codex app-server, network, Graphify, shell tools, or live Agentic Search tools to satisfy metadata.
- PostgreSQL MCP is advisory only; Forge v2 compiler state uses direct `pg`.
- Raw secrets and live query/sample data are forbidden.
