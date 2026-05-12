import { describe, expect, it } from 'bun:test';
import { validateBmadVendor } from '../validate-bmad-vendor.ts';

describe('BMAD upstream vendor registry', () => {
  it('pins upstream source manifests and route awareness without MissionCTL leakage', () => {
    const result = validateBmadVendor();
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.checkedFiles).toBeGreaterThan(0);
  });
});
