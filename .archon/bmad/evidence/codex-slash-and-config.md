# Codex Slash And Config Snapshot

Official docs:

- Slash commands: `https://developers.openai.com/codex/cli/slash-commands`
- Config reference: `https://developers.openai.com/codex/config-reference#configtoml`

Relevant facts:

- `/goal` is experimental and requires `features.goals = true`.
- `/goal <objective>` attaches an objective to the active thread.
- Codex config lives in `~/.codex/config.toml`; trusted projects can load project-scoped `.codex/config.toml`.
- MCP servers are configured under `mcp_servers.<id>`.
- Local observed command bundle style uses TOML files with `description` and `prompt`.
- Archon BMAD launcher preserves user MCP mentions in route artifact field `mcpAwareness`.
- Supported prompt modes are `none`, `single` (for example `WebGL`), and `multiple` (for example `Google`, `Office`).

Boundary:

- Codex slash command is a launcher and summary surface.
- Archon owns the BMAD workflow body.
- `mcpAwareness` is advisory route context only. It does not install, enable, authorize, or call live MCP servers.
