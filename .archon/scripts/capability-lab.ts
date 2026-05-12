import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

export interface CapabilityProfile {
  profileId: string;
  capabilityId: string;
  toolName: string;
  supportState: string;
  trustBoundary: string;
  evidenceRefs: string[];
  repairHint: string;
}

export interface CapabilityRegistry {
  schemaVersion: number;
  profiles: CapabilityProfile[];
}

export interface EvidenceProbe {
  ref: string;
  kind: 'url' | 'absolute-path' | 'workspace-path' | 'literal';
  exists: boolean | null;
  resolvedPath?: string;
}

export interface CapabilityLabResult {
  mode: 'summarize' | 'probe' | 'forge-draft';
  query: string;
  matchedProfiles: CapabilityProfile[];
  evidence?: EvidenceProbe[];
  forgeDrafts?: string[];
  blockedClaims: string[];
}

const DEFAULT_BMAD_ROOT = '/Users/edam/Documents/TODA/BMAD-METHOD';
const DEFAULT_REGISTRY = 'docs/workspace/capability-profile-registry.json';
const DEFAULT_SUPPLEMENTAL_REGISTRY = resolve(process.cwd(), '.archon/bmad/capability-profile-registry.ui-stack.json');

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function parseProfile(value: unknown, index: number): CapabilityProfile {
  if (!isObject(value)) {
    throw new Error(`profile[${index}] must be an object`);
  }
  const profile = {
    profileId: value.profileId,
    capabilityId: value.capabilityId,
    toolName: value.toolName,
    supportState: value.supportState,
    trustBoundary: value.trustBoundary,
    evidenceRefs: value.evidenceRefs,
    repairHint: value.repairHint,
  };
  for (const [field, fieldValue] of Object.entries(profile)) {
    if (field === 'evidenceRefs') {
      if (!isStringArray(fieldValue)) {
        throw new Error(`profile[${index}].${field} must be string[]`);
      }
      continue;
    }
    if (typeof fieldValue !== 'string' || fieldValue.trim() === '') {
      throw new Error(`profile[${index}].${field} must be a non-empty string`);
    }
  }
  return profile as CapabilityProfile;
}

function loadRegistryFile(registryPath: string): CapabilityRegistry {
  const parsed: unknown = JSON.parse(readFileSync(registryPath, 'utf8'));
  if (!isObject(parsed)) {
    throw new Error('capability profile registry must be an object');
  }
  if (parsed.schemaVersion !== 1) {
    throw new Error('capability profile registry schemaVersion must be 1');
  }
  if (!Array.isArray(parsed.profiles)) {
    throw new Error('capability profile registry profiles must be an array');
  }
  return {
    schemaVersion: parsed.schemaVersion,
    profiles: parsed.profiles.map(parseProfile),
  };
}

function mergeCapabilityRegistries(primary: CapabilityRegistry, supplemental: CapabilityRegistry): CapabilityRegistry {
  const profilesById = new Map<string, CapabilityProfile>();
  for (const profile of primary.profiles) {
    profilesById.set(profile.profileId, profile);
  }
  for (const profile of supplemental.profiles) {
    profilesById.set(profile.profileId, profile);
  }
  return {
    schemaVersion: primary.schemaVersion,
    profiles: Array.from(profilesById.values()),
  };
}

export function loadCapabilityRegistry(
  registryPath: string = join(DEFAULT_BMAD_ROOT, DEFAULT_REGISTRY),
  supplementalRegistryPath: string | null = DEFAULT_SUPPLEMENTAL_REGISTRY,
): CapabilityRegistry {
  const registry = loadRegistryFile(registryPath);
  if (!supplementalRegistryPath || !existsSync(supplementalRegistryPath)) {
    return registry;
  }
  return mergeCapabilityRegistries(registry, loadRegistryFile(supplementalRegistryPath));
}

export function findCapabilityProfiles(registry: CapabilityRegistry, query: string): CapabilityProfile[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === '') {
    throw new Error('capability query must be non-empty');
  }
  return registry.profiles.filter((profile) => {
    const searchable = [
      profile.profileId,
      profile.capabilityId,
      profile.toolName,
      profile.supportState,
      profile.trustBoundary,
      profile.repairHint,
      ...profile.evidenceRefs,
    ]
      .join('\n')
      .toLowerCase();
    return searchable.includes(normalizedQuery);
  });
}

export function probeEvidenceRefs(profile: CapabilityProfile, bmadRoot: string = DEFAULT_BMAD_ROOT): EvidenceProbe[] {
  return profile.evidenceRefs.map((ref) => {
    if (/^https?:\/\//.test(ref)) {
      return { ref, kind: 'url', exists: null };
    }
    if (isAbsolute(ref)) {
      return { ref, kind: 'absolute-path', exists: existsSync(ref), resolvedPath: ref };
    }
    if (ref.includes('/') || ref.includes('.')) {
      const resolvedPath = resolve(bmadRoot, ref);
      return { ref, kind: 'workspace-path', exists: existsSync(resolvedPath), resolvedPath };
    }
    return { ref, kind: 'literal', exists: null };
  });
}

export function buildForgeDraftCommands(profile: CapabilityProfile, bmadRoot: string = DEFAULT_BMAD_ROOT): string[] {
  return profile.evidenceRefs
    .filter((ref) => ref.startsWith('docs/workspace/templates/capability-request.') && ref.endsWith('.example.json'))
    .map((requestRef) => {
      const requestPath = resolve(bmadRoot, requestRef);
      const slug = profile.capabilityId.replaceAll('.', '-').replaceAll('/', '-');
      return `node tools/capability-pack-forge.js --input ${requestPath} --output /tmp/bmad-capability-pack-${slug}`;
    });
}

export function runCapabilityLab(options: {
  mode: CapabilityLabResult['mode'];
  query: string;
  bmadRoot?: string;
  registryPath?: string;
}): CapabilityLabResult {
  const bmadRoot = options.bmadRoot ?? DEFAULT_BMAD_ROOT;
  const registryPath = options.registryPath ?? join(bmadRoot, DEFAULT_REGISTRY);
  const registry = loadCapabilityRegistry(registryPath);
  const matchedProfiles = findCapabilityProfiles(registry, options.query);
  const evidence = options.mode === 'probe' ? matchedProfiles.flatMap((profile) => probeEvidenceRefs(profile, bmadRoot)) : undefined;
  const forgeDrafts =
    options.mode === 'forge-draft' ? matchedProfiles.flatMap((profile) => buildForgeDraftCommands(profile, bmadRoot)) : undefined;

  return {
    mode: options.mode,
    query: options.query,
    matchedProfiles,
    evidence,
    forgeDrafts,
    blockedClaims: [
      'Registry profiles are advisory source maps only.',
      'No MCP install, authorization, runtime call, secret access, or target write is proved by this lab.',
      'Forge draft commands are suggestions unless explicitly run and reviewed.',
    ],
  };
}

function parseArgs(argv: string[]): { mode: CapabilityLabResult['mode']; query: string; bmadRoot?: string; registryPath?: string } {
  const [modeInput, ...rest] = argv;
  if (modeInput !== 'summarize' && modeInput !== 'probe' && modeInput !== 'forge-draft') {
    throw new Error('Usage: bun .archon/scripts/capability-lab.ts <summarize|probe|forge-draft> --capability <id-or-term>');
  }
  let query = '';
  let bmadRoot: string | undefined;
  let registryPath: string | undefined;
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    const next = rest[index + 1];
    if ((arg === '--capability' || arg === '--query') && next) {
      query = next;
      index += 1;
      continue;
    }
    if (arg === '--bmad-root' && next) {
      bmadRoot = next;
      index += 1;
      continue;
    }
    if (arg === '--registry' && next) {
      registryPath = next;
      index += 1;
      continue;
    }
  }
  if (query.trim() === '') {
    throw new Error('--capability is required');
  }
  return { mode: modeInput, query, bmadRoot, registryPath };
}

if (import.meta.main) {
  try {
    const result = runCapabilityLab(parseArgs(Bun.argv.slice(2)));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
