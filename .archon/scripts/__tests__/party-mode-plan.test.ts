import { describe, expect, it } from 'bun:test';
import {
  PARTY_MODE_PLAN_MARKER,
  buildPartyModePlan,
  defaultPartyModePlanArtifactPath,
} from '../party-mode-plan.ts';

describe('Party Mode plan artifact', () => {
  it('turns BMAD and tool voices into a reusable consensus-to-Jira plan', () => {
    const plan = buildPartyModePlan({
      topic:
        'Leverage tools and agent voices to argue next ideal Archon improvement with Jira follow-through',
      label: 'archon-bmad-next-improvements',
      seed: 'next-ideal-tool-voice-consensus',
    });

    expect(plan.marker).toBe(PARTY_MODE_PLAN_MARKER);
    expect(plan.consensus.decisionId).toBe('artifact-driven-jira-follow-through');
    expect(plan.consensus.decision).toContain('Party Mode consensus artifact');
    expect(plan.partyMode.participant_selection.selected.map(voice => voice.kind)).toEqual([
      'bmad-agent',
      'bmad-agent',
      'bmad-agent',
      'bmad-agent',
    ]);
    expect(plan.partyMode.participant_selection.toolVoices.every(voice => !voice.voteAllowed)).toBe(
      true
    );
    expect(plan.toolEvidence.activeVoiceIds).toEqual(
      expect.arrayContaining(['dag', 'agentic-search', 'archon-workflow', 'jira-board', 'shell'])
    );
    expect(plan.jira.label).toBe('archon-bmad-next-improvements');
    expect(plan.jira.stories).toHaveLength(3);
    expect(plan.jira.stories[0]?.summary).toBe('Generate reusable Party Mode consensus artifacts');
    expect(plan.jira.stories[1]?.summary).toBe(
      'Drive Jira follow-through from Party Mode plan artifacts'
    );
    expect(plan.jira.stories[2]?.evidenceWorkflows).toContain(
      'jira-bmad-enhancement-follow-through'
    );
  });

  it('has a stable default artifact path under gitignored Archon state', () => {
    expect(defaultPartyModePlanArtifactPath()).toBe(
      `${process.cwd()}/.archon/state/party-mode-next-improvements-plan.json`
    );
  });
});
