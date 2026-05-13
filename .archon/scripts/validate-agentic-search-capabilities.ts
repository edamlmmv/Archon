import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { findCapabilityProfiles, loadCapabilityRegistry, runCapabilityLab } from './capability-lab';
import {
  agenticSearchAdapterOrder,
  agenticSearchCapabilityIds,
  agenticSearchCatalogPath,
  agenticSearchCommandPath,
  agenticSearchEvidencePath,
  agenticSearchForgeRequestPath,
  agenticSearchRegistryPath,
  agenticSearchRequiredBlockedClaimFragments,
  agenticSearchWorkflowPath,
} from './agentic-search-capabilities';

type Authority = 'source' | 'advisory' | 'runtime-check' | 'draft-only';

interface AgenticSearchCatalogSource {
  id: string;
  kind: string;
  supportState: string;
  authority: Authority;
  evidenceRefs: string[];
  blockedClaims: string[];
  bmads: string[];
  forgeRefs: string[];
}

interface AgenticSearchCatalog {
  schemaVersion: number;
  mode: string;
  adapterOrder: string[];
  capabilitySources: AgenticSearchCatalogSource[];
}

interface CapabilityRegistry {
  schemaVersion: number;
  profiles: Array<{
    capabilityId: string;
    evidenceRefs: string[];
    trustBoundary: string;
  }>;
}

interface ForgeRequest {
  schemaVersion: number;
  evidenceRefs: string[];
  blockedTools: string[];
  guardrails: string[];
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(path), 'utf8')) as T;
}

function assertFile(path: string): void {
  assert(existsSync(resolve(path)), `Missing required Agentic Search artifact: ${path}`);
}

function resolveEvidenceRef(ref: string): string | null {
  if (/^https?:\/\//.test(ref)) {
    return null;
  }
  if (isAbsolute(ref)) {
    return ref;
  }
  if (ref.startsWith('~')) {
    return null;
  }
  return resolve(ref);
}

function assertEvidenceRefsExist(refs: string[], owner: string): void {
  assert(refs.length > 0, `${owner} must include evidenceRefs`);
  for (const ref of refs) {
    const path = resolveEvidenceRef(ref);
    if (path) {
      assert(existsSync(path), `${owner} references missing evidence: ${ref}`);
    }
  }
}

function assertNoSecretMaterial(): void {
  const files = [
    agenticSearchCatalogPath,
    agenticSearchRegistryPath,
    agenticSearchForgeRequestPath,
    agenticSearchEvidencePath,
    agenticSearchWorkflowPath,
    agenticSearchCommandPath,
  ];
  const forbidden = [/ctx7sk[_-][A-Za-z0-9]+/, /Bearer\s+[A-Za-z0-9._-]{16,}/, /refresh_token["'\s:=]+[A-Za-z0-9._-]+/i];
  for (const file of files) {
    const content = readFileSync(resolve(file), 'utf8');
    for (const pattern of forbidden) {
      assert(!pattern.test(content), `Secret-looking material found in ${file}`);
    }
  }
}

function assertBlockedClaims(catalog: AgenticSearchCatalog, forgeRequest: ForgeRequest, registry: CapabilityRegistry): void {
  const combined = [
    ...catalog.capabilitySources.flatMap(source => source.blockedClaims),
    ...forgeRequest.blockedTools,
    ...forgeRequest.guardrails,
    ...registry.profiles.map(profile => profile.trustBoundary),
  ].join('\n');

  for (const fragment of agenticSearchRequiredBlockedClaimFragments) {
    assert(combined.includes(fragment), `Agentic Search blocked claims must include: ${fragment}`);
  }
}

function assertTraceVisibility(): void {
  const result = runCapabilityLab({ mode: 'trace', query: 'agentic-search' });
  const trace = result.trace;
  assert(Boolean(trace), 'Capability Lab trace must return Agentic Search references');
  if (!trace) {
    return;
  }

  const includesPath = (surface: keyof typeof trace.referencesBySurface, path: string): boolean =>
    trace.referencesBySurface[surface].some(reference => reference.path === path);

  assert(
    includesPath('registry', agenticSearchCatalogPath) && includesPath('registry', agenticSearchRegistryPath),
    'Capability Lab trace must see Agentic Search registry artifacts',
  );
  assert(includesPath('forge-request', agenticSearchForgeRequestPath), 'Capability Lab trace must see Agentic Search Forge request');
  assert(includesPath('evidence', agenticSearchEvidencePath), 'Capability Lab trace must see Agentic Search evidence');
  assert(includesPath('workflow', agenticSearchWorkflowPath), 'Capability Lab trace must see Agentic Search workflow');
  assert(includesPath('command', agenticSearchCommandPath), 'Capability Lab trace must see Agentic Search command');
}

export function validateAgenticSearchCapabilities(): void {
  for (const path of [
    agenticSearchCatalogPath,
    agenticSearchRegistryPath,
    agenticSearchForgeRequestPath,
    agenticSearchEvidencePath,
    agenticSearchWorkflowPath,
    agenticSearchCommandPath,
  ]) {
    assertFile(path);
  }

  const catalog = readJson<AgenticSearchCatalog>(agenticSearchCatalogPath);
  assert(catalog.schemaVersion === 1, 'Agentic Search catalog schemaVersion must be 1');
  assert(catalog.mode === 'advisory-capability-index', 'Agentic Search catalog mode must be advisory-capability-index');
  assert(
    JSON.stringify(catalog.adapterOrder) === JSON.stringify(agenticSearchAdapterOrder),
    'Agentic Search adapter order must match canonical order'
  );

  const sourceIds = new Set(catalog.capabilitySources.map(source => source.id));
  for (const adapterId of agenticSearchAdapterOrder) {
    assert(sourceIds.has(adapterId), `Agentic Search catalog missing adapter source: ${adapterId}`);
  }
  for (const source of catalog.capabilitySources) {
    assertEvidenceRefsExist(source.evidenceRefs, `Agentic Search source ${source.id}`);
    assert(source.blockedClaims.length > 0, `Agentic Search source ${source.id} must include blockedClaims`);
    assert(source.bmads.length > 0, `Agentic Search source ${source.id} must include BMAD delegation`);
    assert(source.forgeRefs.includes(agenticSearchForgeRequestPath), `Agentic Search source ${source.id} must include Forge ref`);
  }

  const registry = readJson<CapabilityRegistry>(agenticSearchRegistryPath);
  assert(registry.schemaVersion === 1, 'Agentic Search registry schemaVersion must be 1');
  const registryCapabilityIds = new Set(registry.profiles.map(profile => profile.capabilityId));
  for (const capabilityId of agenticSearchCapabilityIds) {
    assert(registryCapabilityIds.has(capabilityId), `Agentic Search registry missing ${capabilityId}`);
  }
  for (const profile of registry.profiles) {
    assertEvidenceRefsExist(profile.evidenceRefs, `Agentic Search profile ${profile.capabilityId}`);
    assert(profile.trustBoundary.length > 0, `Agentic Search profile ${profile.capabilityId} must include trustBoundary`);
  }

  const loadedRegistry = loadCapabilityRegistry();
  const matches = findCapabilityProfiles(loadedRegistry, 'agentic-search');
  assert(matches.length >= agenticSearchCapabilityIds.length, 'Capability Lab must load Agentic Search registry profiles');

  const forgeRequest = readJson<ForgeRequest>(agenticSearchForgeRequestPath);
  assert(forgeRequest.schemaVersion === 1, 'Agentic Search Forge request schemaVersion must be 1');
  for (const ref of [agenticSearchCatalogPath, agenticSearchRegistryPath, agenticSearchEvidencePath]) {
    assert(forgeRequest.evidenceRefs.includes(ref), `Agentic Search Forge request missing evidence ref: ${ref}`);
  }
  assert(
    forgeRequest.guardrails.some(guardrail => guardrail.includes('must not inspect implementation internals')),
    'Agentic Search Forge request must preserve no-source-internals boundary'
  );
  assert(
    forgeRequest.guardrails.some(guardrail => guardrail.includes('must not call live Context7')),
    'Agentic Search Forge request must preserve no-live-tool boundary'
  );

  assertBlockedClaims(catalog, forgeRequest, registry);
  assertTraceVisibility();
  assertNoSecretMaterial();
}

if (import.meta.main) {
  try {
    validateAgenticSearchCapabilities();
    process.stdout.write('AGENTIC_SEARCH_CAPABILITIES_VALID\n');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
