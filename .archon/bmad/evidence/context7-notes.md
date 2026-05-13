# Context7 Notes

Role:

- Context7 is a docs MCP source.
- Use it for current library/API documentation when granted and available.

Codex path:

- Configure as a Codex MCP server under `mcp_servers`.
- Check availability with `/mcp` or Codex MCP diagnostics.

Archon path:

- Archon `mcp:` applies to Claude nodes only.
- Codex nodes in Archon ignore `mcp:`.

Boundary:

- Context7 evidence is advisory unless captured into a local artifact.
- Do not store secrets, raw tokens, or live credential material.
