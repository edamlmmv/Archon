export const agenticSearchCatalogPath = '.archon/bmad/agentic-search-capabilities.catalog.json';
export const agenticSearchRegistryPath = '.archon/bmad/capability-profile-registry.agentic-search.json';
export const agenticSearchForgeRequestPath = '.archon/bmad/agentic-search-forge.request.json';
export const agenticSearchEvidencePath = '.archon/bmad/evidence/agentic-search-capability-pack.md';
export const agenticSearchWorkflowPath = '.archon/workflows/agentic-search-capability-loop.yaml';
export const agenticSearchCommandPath = '.archon/commands/agentic-search-capability-sync.md';

export const agenticSearchAdapterOrder = [
  'file-search',
  'skill-loading',
  'database-query',
  'web-search',
  'memory',
  'shell',
] as const;

export const agenticSearchCapabilityIds = [
  'agentic-search.adapter.file-search',
  'agentic-search.adapter.skill-loading',
  'agentic-search.adapter.database-query',
  'agentic-search.adapter.web-search',
  'agentic-search.adapter.memory',
  'agentic-search.adapter.shell',
  'agentic-search.bridge.capability-lab',
  'agentic-search.bridge.context7',
  'agentic-search.bridge.ui-lab',
  'agentic-search.bridge.bmad-route-first',
  'agentic-search.bridge.forge',
  'agentic-search.bridge.mcp-awareness',
] as const;

export const agenticSearchRequiredBlockedClaimFragments = [
  'MCP install',
  'authorization',
  'runtime call',
  'mcp/skills/agents/hooks',
  'Forge approval',
] as const;
