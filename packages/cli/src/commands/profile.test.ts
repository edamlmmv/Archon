import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { tmpdir } from 'os';
import {
  restoreTeamProfile,
  syncTeamProfile,
  validateTeamProfile,
  type ProfileSyncResult,
} from './profile';

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

describe('Archon team profile validation', () => {
  let root: string;
  let profilePath: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'archon-profile-test-'));
    profilePath = join(root, '.archon', 'team-profile');
    mkdirSync(profilePath, { recursive: true });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('accepts placeholder secret keys in .env.example', () => {
    write(join(profilePath, '.env.example'), 'SLACK_BOT_TOKEN=\nWEBHOOK_SECRET=<secret>\n');

    const result = validateTeamProfile(root);

    expect(result.valid).toBe(true);
  });

  it('rejects secret-looking values', () => {
    write(join(profilePath, '.env.example'), 'SLACK_BOT_TOKEN=xoxb-real-token\n');

    const result = validateTeamProfile(root);

    expect(result.valid).toBe(false);
    expect(result.issues[0]?.message).toContain('Secret-looking key');
  });

  it('rejects personal absolute paths unless marked local-only', () => {
    write(join(profilePath, 'config.template.yaml'), 'paths:\n  workspaces: /Users/edam/.archon\n');

    const result = validateTeamProfile(root);

    expect(result.valid).toBe(false);
    expect(result.issues[0]?.message).toContain('Personal absolute path');
  });

  it('allows explicitly local-only personal paths', () => {
    write(
      join(profilePath, 'README.md'),
      'Example: /Users/example/.archon # local-only documentation\n'
    );

    const result = validateTeamProfile(root);

    expect(result.valid).toBe(true);
  });

  it('rejects unsupported top-level entries', () => {
    write(join(profilePath, 'archon.db'), 'not safe');

    const result = validateTeamProfile(root);

    expect(result.valid).toBe(false);
    expect(result.issues[0]?.message).toContain('Unsupported top-level');
  });
});

describe('Archon team profile sync and restore', () => {
  let root: string;
  let archonHome: string;
  let profilePath: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'archon-profile-sync-test-'));
    archonHome = join(root, 'home', '.archon');
    profilePath = join(root, '.archon', 'team-profile');
    mkdirSync(profilePath, { recursive: true });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  function seedValidProfile(): void {
    write(
      join(profilePath, 'config.template.yaml'),
      [
        'defaultAssistant: codex',
        'assistants:',
        '  codex:',
        '    model: gpt-5.5',
        '    modelReasoningEffort: high',
        'streaming:',
        '  slack: batch',
        'concurrency:',
        '  maxConversations: 4',
        '',
      ].join('\n')
    );
    write(join(profilePath, 'workflows', 'team-review.yaml'), 'name: team-review\nnodes: []\n');
    write(join(profilePath, 'commands', 'team-review.md'), 'Review this change.\n');
    write(join(profilePath, 'scripts', 'team-helper.ts'), 'console.log("ok");\n');
  }

  it('dry-runs planned writes without creating home files', () => {
    seedValidProfile();

    const result = syncTeamProfile({ cwd: root, archonHome, dryRun: true });

    expect(result.valid).toBe(true);
    expect(result.dryRun).toBe(true);
    expect(result.actions.some(action => action.action === 'copy')).toBe(true);
    expect(existsSync(join(archonHome, 'workflows', 'team-review.yaml'))).toBe(false);
  });

  it('syncs safe files and merges only allowlisted config fields', () => {
    seedValidProfile();
    write(
      join(archonHome, 'config.yaml'),
      [
        'botName: PersonalArchon',
        'assistants:',
        '  codex:',
        '    additionalDirectories:',
        '      - /tmp/local-only',
        '',
      ].join('\n')
    );

    const result = syncTeamProfile({ cwd: root, archonHome });

    expect(result.valid).toBe(true);
    expect(typeof result.backupId).toBe('string');
    expect(readFileSync(join(archonHome, 'workflows', 'team-review.yaml'), 'utf-8')).toContain(
      'team-review'
    );
    const config = readFileSync(join(archonHome, 'config.yaml'), 'utf-8');
    expect(config).toContain('defaultAssistant: codex');
    expect(config).toContain('model: gpt-5.5');
    expect(config).toContain('additionalDirectories');
    expect(config).not.toContain('claudeBinaryPath');
  });

  it('does not sync when validation fails', () => {
    write(join(profilePath, '.env.example'), 'DATABASE_URL=postgresql://secret\n');

    const result = syncTeamProfile({ cwd: root, archonHome });

    expect(result.valid).toBe(false);
    expect(existsSync(join(archonHome, 'backups'))).toBe(false);
  });

  it('restores previous safe home files from backup', () => {
    seedValidProfile();
    write(join(archonHome, 'workflows', 'personal.yaml'), 'name: personal\n');

    const syncResult: ProfileSyncResult = syncTeamProfile({ cwd: root, archonHome });
    expect(typeof syncResult.backupId).toBe('string');
    rmSync(join(archonHome, 'workflows', 'personal.yaml'));

    const restoreResult = restoreTeamProfile({
      archonHome,
      backupId: syncResult.backupId ?? '',
    });

    expect(restoreResult.actions.some(action => action.action === 'restore')).toBe(true);
    expect(readFileSync(join(archonHome, 'workflows', 'personal.yaml'), 'utf-8')).toContain(
      'personal'
    );
  });
});
