import { describe, expect, it } from 'bun:test';
import { buildDagAdoptionReport } from '../dag-adoption-report';

describe('Archon DAG adoption report', () => {
  it('reports DAG use, structured output, mutates_checkout, and authority boundaries', async () => {
    const report = await buildDagAdoptionReport({
      now: new Date('2026-05-13T12:00:00.000Z'),
    });

    expect(report.errors).toEqual([]);
    expect(report.summary.workflowCount).toBeGreaterThanOrEqual(6);
    expect(report.summary.boundary).toContain('Validated DAG structure is source evidence only');

    const byName = new Map(report.workflows.map(workflow => [workflow.name, workflow]));
    const bmadRoute = byName.get('bmad-route-first');
    const jira = byName.get('jira-bmad-enhancement-follow-through');
    const forge = byName.get('context7-capability-forge-loop');
    const agenticSearch = byName.get('agentic-search-capability-loop');

    expect(bmadRoute?.mutatesCheckout).toBe(true);
    expect(jira?.mutatesCheckout).toBe(false);
    expect(forge?.authorityLevels).toContain('runtime-artifact');
    expect(forge?.authorityLevels).toContain('runtime-gated');
    expect(agenticSearch?.authorityLevels).toContain('runtime-artifact');
    expect(agenticSearch?.authorityLevels).toContain('runtime-gated');
    expect(jira?.authorityLevels).toContain('runtime-gated');
    expect(jira?.evidenceRefs).toContain('.archon/state/jira-party-mode-diversity-plan.json');
    expect(agenticSearch?.evidence.gateStatus).toBe('ready');
    expect(agenticSearch?.evidence.runtimeArtifact).toBe(true);
    expect(forge?.evidence.decision).toBe('allow-jira-dry-run');

    const intake = bmadRoute?.nodes.find(node => node.id === 'intake');
    const deterministicScan = bmadRoute?.nodes.find(node => node.id === 'deterministic-scan');
    expect(intake?.structuredOutput.enabled).toBe(true);
    expect(intake?.structuredOutput.schemaType).toBe('object');
    expect(deterministicScan?.type).toBe('bash');
    expect(deterministicScan?.structuredOutput.enabled).toBe(false);

    const approval = jira?.nodes.find(node => node.id === 'evidence-approval');
    expect(approval?.type).toBe('approval');
    expect(approval?.dependsOn).toEqual(['jira-verify']);
  });

  it('keeps Codex provider capability limits explicit', async () => {
    const report = await buildDagAdoptionReport({
      now: new Date('2026-05-13T12:00:00.000Z'),
    });
    const codex = report.providerCapabilities.find(provider => provider.id === 'codex');

    expect(codex?.unsupportedNodeFields).toContain('mcp');
    expect(codex?.unsupportedNodeFields).toContain('skills');
    expect(codex?.unsupportedNodeFields).toContain('agents');
    expect(codex?.unsupportedNodeFields).toContain('hooks');
    expect(codex?.unsupportedNodeFields).toContain('allowed_tools/denied_tools');
    expect(codex?.supported).toContain('structuredOutput');
  });
});
