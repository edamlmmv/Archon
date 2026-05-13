import { describe, expect, it } from 'bun:test';
import {
  context7CapabilityIds,
  context7SelectedSkillIds,
  context7SetupSkillIds,
  context7SkillInstallRoots,
} from '../context7-capabilities';
import { validateContext7Capabilities } from '../validate-context7-capabilities';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

describe('Context7 capability pack', () => {
  it('validates catalog, registry, Forge request, MCP profile, and installed skill refs', () => {
    expect(() => validateContext7Capabilities()).not.toThrow();
  });

  it('keeps selected skills installed in project and global Universal/Claude roots', () => {
    for (const skillId of [...context7SelectedSkillIds, ...context7SetupSkillIds]) {
      for (const root of context7SkillInstallRoots) {
        const skillPath = root.startsWith('.') ? resolve(root, skillId, 'SKILL.md') : join(root, skillId, 'SKILL.md');
        expect(existsSync(skillPath)).toBe(true);
      }
    }
  });

  it('declares Context7 capability IDs without granting runtime authority', () => {
    const registry = JSON.parse(readFileSync(resolve('.archon/bmad/capability-profile-registry.context7.json'), 'utf8')) as {
      profiles: Array<{ capabilityId: string; trustBoundary: string }>;
    };
    const capabilityIds = registry.profiles.map(profile => profile.capabilityId);

    for (const capabilityId of context7CapabilityIds) {
      expect(capabilityIds).toContain(capabilityId);
    }
    expect(registry.profiles.some(profile => profile.trustBoundary.includes('advisory'))).toBe(true);
  });
});
