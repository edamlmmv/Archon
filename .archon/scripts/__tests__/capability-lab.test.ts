import { describe, expect, it } from 'bun:test';
import {
  buildForgeDraftCommands,
  findCapabilityProfiles,
  loadCapabilityRegistry,
  probeEvidenceRefs,
  runCapabilityLab,
} from '../capability-lab.ts';

const bmadRoot = '/Users/edam/Documents/TODA/BMAD-METHOD';

describe('Archon capability lab', () => {
  it('summarizes declared capability profiles without hardcoding one MCP', () => {
    const registry = loadCapabilityRegistry();
    const matches = findCapabilityProfiles(registry, 'host.mcp.context7.office-js-live.docs');

    expect(matches).toHaveLength(1);
    expect(matches[0]?.capabilityId).toBe('host.mcp.context7.office-js-live.docs');
    expect(matches[0]?.evidenceRefs).toContain('docs/workspace/templates/capability-request.context7-office-js-live.example.json');
    expect(findCapabilityProfiles(registry, 'Outlook add-in')[0]?.capabilityId).toBe('host.mcp.context7.office-js-live.docs');
  });

  it('probes evidence refs and keeps URLs advisory', () => {
    const result = runCapabilityLab({ mode: 'probe', query: 'host.mcp.office-js.live', bmadRoot });
    const evidence = result.evidence ?? [];

    expect(result.matchedProfiles[0]?.capabilityId).toBe('host.mcp.office-js.live');
    expect(evidence.some((ref) => ref.ref === 'https://pypi.org/project/office4ai/' && ref.exists === null)).toBe(true);
    expect(
      evidence.some(
        (ref) =>
          ref.ref === 'docs/workspace/templates/capability-request.office-js-live-mcp.example.json' &&
          ref.kind === 'workspace-path' &&
          ref.exists === true,
      ),
    ).toBe(true);
    expect(result.blockedClaims.join('\n')).toContain('No MCP install');
  });

  it('drafts Forge commands from capability request refs generically', () => {
    const registry = loadCapabilityRegistry();
    const profile = findCapabilityProfiles(registry, 'host.mcp.context7.google-apps-script.docs')[0];
    if (!profile) {
      throw new Error('expected Google Apps Script capability profile');
    }

    const commands = buildForgeDraftCommands(profile, bmadRoot);
    expect(commands).toEqual([
      'node tools/capability-pack-forge.js --input /Users/edam/Documents/TODA/BMAD-METHOD/docs/workspace/templates/capability-request.context7-google-apps-script.example.json --output /tmp/bmad-capability-pack-host-mcp-context7-google-apps-script-docs',
    ]);
  });

  it('supports non-MCP capabilities from same registry path', () => {
    const profile = findCapabilityProfiles(loadCapabilityRegistry(), 'evidence.graph.repo-intake')[0];
    if (!profile) {
      throw new Error('expected Graphify capability profile');
    }
    const evidence = probeEvidenceRefs(profile, bmadRoot);

    expect(evidence.some((ref) => ref.ref === 'docs/workspace/capability-contract.md' && ref.exists === true)).toBe(true);
  });

  it('loads all Archon supplemental capability profile registries', () => {
    const registry = loadCapabilityRegistry();
    const context7Profile = findCapabilityProfiles(registry, 'host.cli.context7.docs')[0];
    const uiLabProfile = findCapabilityProfiles(registry, 'archon.ui-lab.registry.full-coverage')[0];

    expect(context7Profile?.capabilityId).toBe('host.cli.context7.docs');
    expect(uiLabProfile?.capabilityId).toBe('archon.ui-lab.registry.full-coverage');
  });

  it('traces capability references across declared Archon surfaces', () => {
    const result = runCapabilityLab({ mode: 'trace', query: 'agentic-search' });
    const trace = result.trace;
    if (!trace) {
      throw new Error('expected trace result');
    }

    expect(result.matchedProfiles.some(profile => profile.capabilityId === 'agentic-search.bridge.capability-lab')).toBe(true);
    expect(trace.referencesBySurface.command.some(ref => ref.path === '.archon/commands/agentic-search-capability-sync.md')).toBe(true);
    expect(trace.referencesBySurface.workflow.some(ref => ref.path === '.archon/workflows/agentic-search-capability-loop.yaml')).toBe(true);
    expect(trace.referencesBySurface['forge-request'].some(ref => ref.path === '.archon/bmad/agentic-search-forge.request.json')).toBe(true);
    expect(trace.referencesBySurface.evidence.some(ref => ref.path === '.archon/bmad/evidence/agentic-search-capability-pack.md')).toBe(true);
    expect(trace.referencesBySurface.skill.some(ref => ref.path === '.agents/skills/context-engineering/SKILL.md')).toBe(true);
    expect(trace.referencesBySurface.command.find(ref => ref.path === '.archon/commands/agentic-search-capability-sync.md')?.authority).toBe('source');
    expect(trace.referencesBySurface['forge-request'].find(ref => ref.path === '.archon/bmad/agentic-search-forge.request.json')?.authority).toBe(
      'draft-only',
    );
    expect(trace.referencesBySurface['mcp-profile'].find(ref => ref.path === '.archon/mcp/context7-official.json')?.authority).toBe(
      'runtime-check',
    );
    expect(trace.boundaries.join('\n')).toContain('do not prove installs');
  });
});
