Validate and sync the repository safe Archon team profile.

Run:

```bash
bun run cli --cwd "$PWD" profile validate .archon/team-profile
bun run cli --cwd "$PWD" profile sync .archon/team-profile
```

Guardrails:
- Do not copy raw `~/.archon`.
- Do not read or write `~/.archon/.env`, `archon.db`, `workspaces`, `logs`, or `artifacts`.
- Stop on any secret-looking value or personal absolute path in `.archon/team-profile`.
