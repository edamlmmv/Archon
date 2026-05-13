# Context7 Capability Pack Evidence

Role:

- Context7 provides current library/API docs through CLI and MCP paths.
- Context7 Skills provide reusable prompt guidance for UI-lab, Playwright, Agentic Search, MCP design, prompts, Git, and story mapping.
- Capability Pack Forge may consume the declared catalog/profile/evidence files only.

Installed surfaces:

- Project Universal skills: `.agents/skills/*`.
- Project Claude skills: `.claude/skills/*`.
- Global Universal skills: `~/.agents/skills/*`.
- Global Claude skills: `~/.claude/skills/*`.
- Context7 setup installed `find-docs` plus selected skill pack entries from `.archon/bmad/context7-capabilities.catalog.json`.

MCP boundary:

- `.archon/mcp/context7-official.json` declares the official Context7 MCP endpoint and stdio fallback using `CONTEXT7_API_KEY` environment references only.
- No raw Context7 API key, OAuth token, refresh token, or bearer token is stored in this repository.
- Live MCP support is blocked until a workflow records successful auth and tool output.

Forge boundary:

- `.archon/bmad/context7-forge.request.json` is draft input only.
- Context7 docs, skills, MCP names, and Agentic Search mappings are advisory unless captured in local evidence.
- UI-lab readiness still depends on shadcn registry, Storybook, and Playwright evidence.

Validation:

- `bun .archon/scripts/validate-context7-capabilities.ts`
- `bun run cli validate workflows context7-capability-forge-loop`
- `bun run cli validate commands context7-capability-sync`
- `bun test .archon/scripts/__tests__/capability-lab.test.ts .archon/scripts/__tests__/mcp-usage-report.test.ts .archon/scripts/__tests__/context7-capabilities.test.ts`
