import { homedir } from 'node:os';
import { join } from 'node:path';

export const context7CatalogPath = '.archon/bmad/context7-capabilities.catalog.json';
export const context7RegistryPath = '.archon/bmad/capability-profile-registry.context7.json';
export const context7ForgeRequestPath = '.archon/bmad/context7-forge.request.json';
export const context7EvidencePath = '.archon/bmad/evidence/context7-capability-pack.md';
export const context7McpProfilePath = '.archon/mcp/context7-official.json';
export const context7WorkflowPath = '.archon/workflows/context7-capability-forge-loop.yaml';
export const context7CommandPath = '.archon/commands/context7-capability-sync.md';

export const context7SelectedSkillIds = [
  'context7-mcp',
  'context7-cli',
  'frontend-design',
  'react-ui-patterns',
  'base-ui-react',
  'browser-test',
  'playwright-tests',
  'context-engineering',
  'agentic-engineering',
  'mcp-server-patterns',
  'senior-prompt-engineer',
  'prompt-engineering-patterns',
  'git-workflow',
  'git-workflow-and-versioning',
  'user-story-mapping',
] as const;

export const context7SetupSkillIds = ['find-docs'] as const;

export const context7CapabilityIds = [
  'host.mcp.context7.docs',
  'host.cli.context7.docs',
  'skill.context7.ui.frontend-design',
  'skill.context7.ui.react-patterns',
  'skill.context7.ui.base-ui-react',
  'skill.context7.browser.playwright',
  'skill.context7.agentic-search.context-engineering',
  'skill.context7.mcp.patterns',
  'skill.context7.prompt.engineering',
  'skill.context7.git.workflow',
  'skill.context7.story-mapping',
] as const;

export const context7SkillInstallRoots = [
  '.agents/skills',
  '.claude/skills',
  join(homedir(), '.agents/skills'),
  join(homedir(), '.claude/skills'),
] as const;
