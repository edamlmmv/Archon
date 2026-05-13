import { describe, expect, it } from 'bun:test';
import {
  inferPartyModeIntent,
  selectPartyModeRoster,
  type PartyModeHistoryEntry,
} from '../party-mode-roster.ts';

function ids(selection: ReturnType<typeof selectPartyModeRoster>): string[] {
  return selection.participant_selection.selected.map(agent => agent.id);
}

describe('Party Mode roster selection', () => {
  it('infers UX intent and selects Sally for UI Lab work', () => {
    const selection = selectPartyModeRoster({
      topic: 'Improve UI Lab Party Mode visible roster and user-facing workflow',
      seed: 'ux-seed',
    });

    expect(inferPartyModeIntent(selection.topic)).toBe('ux');
    expect(ids(selection)).toContain('sally');
    expect(selection.participant_selection.selected).toHaveLength(2);
    expect(selection.participant_selection.selected[0]?.reason).toContain('fit');
    expect(selection.participant_selection.selected[0]?.kind).toBe('bmad-agent');
    expect(selection.participant_selection.selected[0]?.voteAllowed).toBe(true);
    expect(selection.participant_selection.selected[0]?.evidenceAllowed).toContain('source');
    expect(selection.ui_visibility.rosterStrip.intent).toBe('ux');
    expect(selection.ui_visibility.selectedVoices.map(agent => agent.id)).toContain('sally');
    expect(selection.ui_visibility.finalAttribution).toEqual(
      [...selection.participant_selection.selected, ...selection.participant_selection.toolVoices]
    );
  });

  it('selects Mary for evidence-heavy Jira/process work', () => {
    const selection = selectPartyModeRoster({
      topic: 'Scan artifacts, prove evidence, follow Jira process through completion',
      seed: 'evidence-seed',
    });

    expect(selection.intent).toBe('evidence');
    expect(ids(selection)).toContain('mary');
  });

  it('rotates away from the exact previous roster when possible', () => {
    const history: PartyModeHistoryEntry[] = [
      {
        createdAt: '2026-05-13T12:00:00.000Z',
        topic: 'Jira evidence process',
        intent: 'process',
        selectedAgentIds: ['mary', 'john'],
      },
    ];

    const selection = selectPartyModeRoster({
      topic: 'Jira evidence process',
      intent: 'process',
      history,
      seed: 'rotation-seed',
    });

    expect(selection.participant_selection.historyAvailable).toBe(true);
    expect(selection.participant_selection.recentAgentIdsChecked).toEqual(['mary', 'john']);
    expect(selection.participant_selection.rotationChangedSeat).toBe(true);
    expect(ids(selection)).not.toEqual(['mary', 'john']);
    const selectedIds = new Set(ids(selection));
    expect(selection.ui_visibility.restingRecentVoices.map(agent => agent.id)).toEqual(
      selection.participant_selection.recentAgentIdsChecked.filter(agentId => !selectedIds.has(agentId))
    );
    expect(selection.ui_visibility.rotationState.changedSeat).toBe(true);
    expect(selection.ui_visibility.controls.rotateRequestAvailable).toBe(true);
  });

  it('keeps pinned agents even when they repeat and explains the override when roster is full', () => {
    const history: PartyModeHistoryEntry[] = [
      {
        createdAt: '2026-05-13T12:00:00.000Z',
        topic: 'Pinned round',
        intent: 'general',
        selectedAgentIds: ['john', 'winston'],
      },
    ];

    const selection = selectPartyModeRoster({
      topic: 'Pinned round',
      history,
      pinnedAgentIds: ['john', 'winston'],
      minVoices: 2,
      maxVoices: 2,
      seed: 'pinned-seed',
    });

    expect(ids(selection).sort()).toEqual(['john', 'winston']);
    expect(selection.participant_selection.repeatOverrideReason).toBe(
      'repeated because user-pinned agents fill roster'
    );
  });

  it('is deterministic for the same seed and inputs', () => {
    const input = {
      topic: 'Architecture risk around provider capability boundaries',
      seed: 'stable-seed',
    };

    expect(ids(selectPartyModeRoster(input))).toEqual(ids(selectPartyModeRoster(input)));
  });

  it('selects broad multi-intent panels when tools, DAG, Jira, UI Lab, and implementation are requested', () => {
    const selection = selectPartyModeRoster({
      topic:
        'Agents and BMADs missing: leverage Party Mode with DAG, capabilities, agentic search, Archon, Jira board, UI Lab, skills, commands, shell, implementation tests, provider boundaries',
      seed: 'broad-party-mode-plan',
    });

    expect(selection.intent).toBe('architecture');
    expect(ids(selection)).toContain('winston');
    expect(ids(selection)).toContain('amelia');
    expect(ids(selection)).toContain('sally');
    expect(ids(selection)).toContain('mary');
    expect(selection.participant_selection.detectedIntents).toEqual(
      expect.arrayContaining(['architecture', 'implementation', 'ux', 'process', 'evidence'])
    );
  });

  it('adds bounded tool voices and keeps inactive tools inert', () => {
    const selection = selectPartyModeRoster({
      topic: 'Party Mode should show DAG, Jira, UI Lab, commands, shell, and unavailable external tool voices',
      seed: 'tool-voice-seed',
      toolVoices: [
        {
          id: 'dag',
          name: 'DAG',
          role: 'Workflow graph evidence',
          scope: 'Validated workflow source and DAG report',
          evidenceAllowed: ['source'],
          handoffRole: 'explain workflow shape',
          evidenceRefs: ['.archon/workflows/jira-bmad-enhancement-follow-through.yaml'],
        },
        {
          id: 'missing-tool',
          name: 'Missing Tool',
          role: 'Unavailable evidence source',
          scope: 'No current artifact',
          evidenceAllowed: ['runtime-artifact'],
          handoffRole: 'stay inactive until evidence exists',
          evidenceRefs: ['.archon/state/does-not-exist.json'],
        },
      ],
    });

    const dag = selection.participant_selection.toolVoices.find(voice => voice.id === 'dag');
    const missing = selection.participant_selection.toolVoices.find(
      voice => voice.id === 'missing-tool'
    );

    expect(dag?.kind).toBe('tool-voice');
    expect(dag?.status).toBe('active');
    expect(dag?.voteAllowed).toBe(false);
    expect(dag?.stance).toBe('inform');
    expect(dag?.evidenceRefs).toContain('.archon/workflows/jira-bmad-enhancement-follow-through.yaml');
    expect(missing?.status).toBe('inert');
    expect(missing?.stance).toBe('block');
    expect(selection.ui_visibility.toolVoices.map(voice => voice.id)).toEqual(['dag', 'missing-tool']);
    expect(selection.ui_visibility.finalAttribution.map(voice => voice.id)).toContain('dag');
  });
});
