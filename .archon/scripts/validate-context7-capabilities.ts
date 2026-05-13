import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  context7CapabilityIds,
  context7CatalogPath,
  context7CommandPath,
  context7EvidencePath,
  context7ForgeRequestPath,
  context7McpProfilePath,
  context7RegistryPath,
  context7SelectedSkillIds,
  context7SetupSkillIds,
  context7SkillInstallRoots,
  context7WorkflowPath,
} from './context7-capabilities';

interface Context7Catalog {
  schemaVersion: number;
  selectedSkills: Array<{
    id: string;
    status: string;
    capabilityIds: string[];
  }>;
  setup?: {
    cliSkill?: {
      status?: string;
    };
    mcp?: {
      status?: string;
      profilePath?: string;
    };
  };
  evidenceRefs?: string[];
}

interface CapabilityRegistry {
  schemaVersion: number;
  profiles: Array<{
    capabilityId: string;
    evidenceRefs: string[];
  }>;
}

interface ForgeRequest {
  schemaVersion: number;
  evidenceRefs: string[];
  guardrails: string[];
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(path), 'utf8')) as T;
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertFile(path: string): void {
  assert(existsSync(resolve(path)), `Missing required Context7 artifact: ${path}`);
}

function assertSkillInstalled(skillId: string): void {
  for (const root of context7SkillInstallRoots) {
    const skillPath = root.startsWith('.') ? resolve(root, skillId, 'SKILL.md') : join(root, skillId, 'SKILL.md');
    assert(existsSync(skillPath), `Missing Context7 skill ${skillId} at ${skillPath}`);
  }
}

function assertNoSecretMaterial(): void {
  const files = [
    context7CatalogPath,
    context7RegistryPath,
    context7ForgeRequestPath,
    context7EvidencePath,
    context7McpProfilePath,
    context7WorkflowPath,
    context7CommandPath,
  ];
  const forbidden = [/ctx7sk[_-][A-Za-z0-9]+/, /Bearer\s+[A-Za-z0-9._-]{16,}/, /refresh_token["'\s:=]+[A-Za-z0-9._-]+/i];
  for (const file of files) {
    const content = readFileSync(resolve(file), 'utf8');
    for (const pattern of forbidden) {
      assert(!pattern.test(content), `Secret-looking material found in ${file}`);
    }
  }
}

export function validateContext7Capabilities(): void {
  for (const path of [
    context7CatalogPath,
    context7RegistryPath,
    context7ForgeRequestPath,
    context7EvidencePath,
    context7McpProfilePath,
    context7WorkflowPath,
    context7CommandPath,
  ]) {
    assertFile(path);
  }

  const catalog = readJson<Context7Catalog>(context7CatalogPath);
  assert(catalog.schemaVersion === 1, 'Context7 catalog schemaVersion must be 1');
  assert(catalog.setup?.cliSkill?.status === 'installed', 'Context7 CLI setup skill must be marked installed');
  assert(
    catalog.setup?.mcp?.status === 'profile-configured-auth-blocked',
    'Context7 MCP status must preserve auth-blocked boundary'
  );
  assert(catalog.setup?.mcp?.profilePath === context7McpProfilePath, 'Context7 MCP profile path mismatch');

  const catalogSkillIds = new Set(catalog.selectedSkills.map(skill => skill.id));
  for (const skillId of context7SelectedSkillIds) {
    assert(catalogSkillIds.has(skillId), `Context7 catalog missing selected skill: ${skillId}`);
    assertSkillInstalled(skillId);
  }
  for (const skillId of context7SetupSkillIds) {
    assertSkillInstalled(skillId);
  }
  assert(
    catalog.selectedSkills.every(skill => skill.status === 'installed'),
    'Every selected Context7 skill must be marked installed'
  );

  const registry = readJson<CapabilityRegistry>(context7RegistryPath);
  assert(registry.schemaVersion === 1, 'Context7 capability registry schemaVersion must be 1');
  const registryCapabilityIds = new Set(registry.profiles.map(profile => profile.capabilityId));
  for (const capabilityId of context7CapabilityIds) {
    assert(registryCapabilityIds.has(capabilityId), `Context7 capability registry missing ${capabilityId}`);
  }
  for (const profile of registry.profiles) {
    assert(profile.evidenceRefs.length > 0, `Context7 profile ${profile.capabilityId} must include evidenceRefs`);
  }

  const forgeRequest = readJson<ForgeRequest>(context7ForgeRequestPath);
  assert(forgeRequest.schemaVersion === 1, 'Context7 Forge request schemaVersion must be 1');
  for (const ref of [context7CatalogPath, context7RegistryPath, context7EvidencePath, context7McpProfilePath]) {
    assert(forgeRequest.evidenceRefs.includes(ref), `Context7 Forge request missing evidence ref: ${ref}`);
  }
  assert(
    forgeRequest.guardrails.some(guardrail => guardrail.includes('must not call live Context7')),
    'Context7 Forge request must preserve no-live-tool boundary'
  );

  const mcpProfile = readFileSync(resolve(context7McpProfilePath), 'utf8');
  assert(mcpProfile.includes('${CONTEXT7_API_KEY}'), 'Context7 MCP profile must use environment placeholder');
  assert(!mcpProfile.includes('ctx7sk'), 'Context7 MCP profile must not include raw API key-looking values');

  assertNoSecretMaterial();
}

if (import.meta.main) {
  try {
    validateContext7Capabilities();
    process.stdout.write('CONTEXT7_CAPABILITIES_VALID\n');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
