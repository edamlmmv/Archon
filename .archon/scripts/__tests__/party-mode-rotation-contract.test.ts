import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'bun:test';

describe('BMAD Party Mode rotation contract', () => {
  it('documents observable, mission-fit roster rotation instead of fixed default voices', () => {
    const skillPath = resolve(
      process.cwd(),
      '.archon/bmad/vendor/bmad-method/src/core-skills/bmad-party-mode/SKILL.md'
    );
    const content = readFileSync(skillPath, 'utf8');

    expect(content).toContain('Voice Selection Contract');
    expect(content).toContain('Same voices repeating is a failure mode');
    expect(content).toContain('.archon/scripts/party-mode-roster.ts');
    expect(content).toContain('Classify the mission intent');
    expect(content).toContain('recent-use penalty');
    expect(content).toContain('Do not repeat the same exact voice set');
    expect(content).toContain('Self-improve v1 may still start from John, Winston, Amelia, and Paige');
    expect(content).toContain('Add Mary for');
    expect(content).toContain('Sally for UX/user-facing workflow work');
    expect(content).toContain('participant_selection');
    expect(content).toContain('one-line reason for each voice');
    expect(content).toContain('kind: "bmad-agent" | "tool-voice"');
    expect(content).toContain('evidenceAllowed');
    expect(content).toContain('voteAllowed');
    expect(content).toContain('Tool voices');
    expect(content).toContain('ui_visibility');
    expect(content).toContain('resting');
    expect(content).toContain('recent voices');
    expect(content).toContain('attribution fields');
  });
});
