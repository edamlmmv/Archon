import { describe, expect, it } from 'bun:test';
import { officialComponents, uiLabProductizationItems, uiLabTemplates } from '../ui-lab/manifest';
import { validateUiLab } from '../ui-lab/validate';

describe('UI-lab queue and registry contract', () => {
  it('tracks every official shadcn component exactly once', () => {
    expect(officialComponents).toHaveLength(59);
    expect(new Set(officialComponents.map(component => component.id)).size).toBe(59);
  });

  it('validates queue, registry, and Forge awareness surfaces', () => {
    expect(() => validateUiLab()).not.toThrow();
  });

  it('tracks UI-lab productization templates and queue kinds', () => {
    expect(uiLabTemplates.length).toBeGreaterThanOrEqual(13);
    expect(uiLabProductizationItems.length).toBeGreaterThan(uiLabTemplates.length);
    expect(new Set(uiLabProductizationItems.map(item => item.id)).size).toBe(
      uiLabProductizationItems.length
    );
    expect(new Set(uiLabProductizationItems.map(item => item.kind))).toEqual(
      new Set(['template', 'web-adoption', 'dependency', 'workflow', 'evidence'])
    );
  });

  it('tracks parent and child Web adoption items without overclaiming future Web routes', () => {
    const byId = new Map(uiLabProductizationItems.map(item => [item.id, item]));
    expect(byId.get('web-ui-wrapper-adoption')?.status).toBe('forge-ready');
    expect(byId.get('web-ui-wrapper-adoption')?.webAdoption?.evidenceState).toBe('lab-proven');

    const childIds = [
      'web-settings-form-adoption',
      'web-dashboard-shell-adoption',
      'web-workflow-builder-shell-adoption',
      'web-workflow-execution-review-adoption',
      'web-command-palette-adoption',
    ];
    expect(childIds.every(id => byId.get(id)?.webAdoption?.parentId === 'web-ui-wrapper-adoption')).toBe(
      true
    );
    expect(byId.get('web-settings-form-adoption')?.status).toBe('forge-ready');
    expect(byId.get('web-settings-form-adoption')?.webAdoption?.evidenceState).toBe(
      'web-adopted'
    );
    expect(byId.get('web-settings-form-adoption')?.webAdoption?.currentGate).toBe(false);
    expect(byId.get('web-dashboard-shell-adoption')?.status).toBe('forge-ready');
    expect(byId.get('web-dashboard-shell-adoption')?.webAdoption?.evidenceState).toBe(
      'web-adopted'
    );
    expect(byId.get('web-dashboard-shell-adoption')?.webAdoption?.currentGate).toBe(true);

    for (const id of childIds.filter(
      childId =>
        childId !== 'web-settings-form-adoption' && childId !== 'web-dashboard-shell-adoption'
    )) {
      expect(byId.get(id)?.status).toBe('pending');
      expect(byId.get(id)?.webAdoption?.evidenceState).toBe('not-proven');
      expect(byId.get(id)?.webAdoption?.currentGate).toBe(false);
    }
  });
});
