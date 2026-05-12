# Safe Archon Team Profile

This folder is the Git-shareable source for home-scoped Archon profile files.

It is safe to commit because it must contain only sanitized templates:

- `config.template.yaml` for allowlisted global preferences
- `workflows/` for home-scoped workflows
- `commands/` for home-scoped commands
- `scripts/` for home-scoped scripts
- `.env.example` with empty placeholders only

Never put real credentials, `~/.archon/.env`, `archon.db`, workspaces, logs, or artifacts here.

Install locally:

```bash
bun run cli --cwd "$PWD" profile validate .archon/team-profile
bun run cli --cwd "$PWD" profile sync .archon/team-profile
```

Rollback:

```bash
bun run cli --cwd "$PWD" profile restore <backup-id>
```
