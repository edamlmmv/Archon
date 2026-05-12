# UI Stack MCP Official Evidence

## Scope

This evidence file records the official MCP claims for the Archon UI lab.

## Official MCP Profiles

- Storybook MCP: official Storybook MCP endpoint exposed by Storybook preview at `http://127.0.0.1:6006/mcp`.
- Playwright MCP: official server command `npx -y @playwright/mcp@latest --headless --isolated`.
- shadcn MCP: official setup path through `bunx shadcn@latest mcp init --client codex --cwd packages/ui-lab`.

## Local Artifacts

- Package: `packages/ui-lab`
- Storybook config: `packages/ui-lab/.storybook/main.ts`
- Playwright config: `packages/ui-lab/playwright.config.ts`
- MCP config: `.archon/mcp/ui-stack-official.json`
- Registry metadata: `packages/ui-lab/registry.json` and `packages/ui-lab/public/r/*.json`

## Guardrail

MCP names are advisory route context unless a workflow node invokes the live MCP server and stores the result as run evidence.
