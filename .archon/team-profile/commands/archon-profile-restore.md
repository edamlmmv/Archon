Restore safe Archon home profile files from a previous sync backup.

Run:

```bash
bun run cli --cwd "$PWD" profile restore <backup-id>
```

Guardrails:
- Restore only `~/.archon/config.yaml`, `~/.archon/workflows`, `~/.archon/commands`, and `~/.archon/scripts`.
- Do not restore secrets, databases, workspaces, logs, or artifacts.
- Use the exact backup id printed by `archon profile sync`.
