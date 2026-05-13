import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  findCapabilityProfiles,
  loadCapabilityRegistry,
  probeEvidenceRefs,
  runCapabilityLab,
} from '../capability-lab';
import { agenticSearchCapabilityIds } from '../agentic-search-capabilities';
import { validateAgenticSearchCapabilities } from '../validate-agentic-search-capabilities';

describe('Agentic Search capability awareness', () => {
  it('validates catalog, registry, Forge request, workflow, command, and evidence', () => {
    expect(() => validateAgenticSearchCapabilities()).not.toThrow();
  });

  it('loads Agentic Search profiles through Capability Lab supplemental registries', () => {
    const registry = loadCapabilityRegistry();
    const matches = findCapabilityProfiles(registry, 'agentic-search');
    const capabilityIds = matches.map(profile => profile.capabilityId);

    for (const capabilityId of agenticSearchCapabilityIds) {
      expect(capabilityIds).toContain(capabilityId);
    }
  });

  it('probes local evidence refs while leaving URLs advisory', () => {
    const registry = loadCapabilityRegistry();
    const profile = findCapabilityProfiles(registry, 'agentic-search.bridge.context7')[0];
    if (!profile) {
      throw new Error('expected Agentic Search Context7 bridge profile');
    }

    const evidence = probeEvidenceRefs(profile);
    expect(evidence.some(ref => ref.ref.endsWith('/.archon/mcp/context7-official.json') && ref.exists === true)).toBe(true);
    expect(evidence.every(ref => ref.kind !== 'url' || ref.exists === null)).toBe(true);
  });

  it('keeps Forge request metadata-only with blocked live-tool claims', () => {
    const request = JSON.parse(readFileSync(resolve('.archon/bmad/agentic-search-forge.request.json'), 'utf8')) as {
      guardrails: string[];
      blockedTools: string[];
      evidenceRefs: string[];
    };
    const guardrails = request.guardrails.join('\n');
    const blockedTools = request.blockedTools.join('\n');

    expect(request.evidenceRefs).toContain('.archon/bmad/agentic-search-capabilities.catalog.json');
    expect(guardrails).toContain('must not inspect implementation internals');
    expect(guardrails).toContain('must not call live Context7');
    expect(blockedTools).toContain('Custom Agentic Search MCP v1');
    expect(blockedTools).toContain('Codex provider per-node mcp/skills/agents/hooks');
  });

  it('returns success marker from validator CLI', () => {
    const result = Bun.spawnSync(['bun', '.archon/scripts/validate-agentic-search-capabilities.ts'], {
      cwd: process.cwd(),
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(result.exitCode).toBe(0);
    expect(new TextDecoder().decode(result.stdout)).toContain('AGENTIC_SEARCH_CAPABILITIES_VALID');
  });

  it('summarizes Agentic Search through Capability Lab runner', () => {
    const result = runCapabilityLab({ mode: 'summarize', query: 'agentic-search' });

    expect(result.matchedProfiles.length).toBeGreaterThanOrEqual(agenticSearchCapabilityIds.length);
    expect(result.blockedClaims.join('\n')).toContain('No MCP install');
    expect(existsSync(resolve('.archon/bmad/evidence/agentic-search-capability-pack.md'))).toBe(true);
  });

  it('traces Agentic Search artifacts through Capability Lab surfaces', () => {
    const result = runCapabilityLab({ mode: 'trace', query: 'agentic-search' });
    const trace = result.trace;
    if (!trace) {
      throw new Error('expected Agentic Search trace result');
    }

    expect(trace.referencesBySurface.registry.some(ref => ref.path === '.archon/bmad/agentic-search-capabilities.catalog.json')).toBe(true);
    expect(trace.referencesBySurface['forge-request'].some(ref => ref.path === '.archon/bmad/agentic-search-forge.request.json')).toBe(true);
    expect(trace.referencesBySurface.workflow.some(ref => ref.path === '.archon/workflows/agentic-search-capability-loop.yaml')).toBe(true);
    expect(trace.referencesBySurface.command.some(ref => ref.path === '.archon/commands/agentic-search-capability-sync.md')).toBe(true);
    expect(trace.referencesBySurface['runtime-log']).toEqual([]);
    expect(trace.boundaries.join('\n')).toContain('do not prove installs');
  });
});
