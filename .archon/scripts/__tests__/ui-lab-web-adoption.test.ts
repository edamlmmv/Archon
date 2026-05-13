import { describe, expect, it } from 'bun:test';
import {
  expectedUiShimExport,
  isPureUiShim,
  validateWebAdoption,
} from '../ui-lab/validate-web-adoption';
import { uiLabProductizationItems } from '../ui-lab/manifest';

const shimEntries = [
  {
    path: 'packages/web/src/components/ui/button.tsx',
    content: expectedUiShimExport('button'),
  },
];

const settingsRouteWithAdoption = `import {
  FormActions,
  FormRow,
  FormSection,
  FormShell,
  FormSummary,
  StatusChip,
  useFormProgress,
} from '@archon/ui-lab';

export function SettingsPage() {
  return null;
}
`;

const dashboardRouteWithAdoption = `import { DashboardShell } from '@archon/ui-lab';

export function DashboardPage() {
  return <DashboardShell title="Mission Control" />;
}
`;

function readAdoptedRoute(relativePath: string): string {
  if (relativePath.endsWith('SettingsPage.tsx')) return settingsRouteWithAdoption;
  if (relativePath.endsWith('DashboardPage.tsx')) return dashboardRouteWithAdoption;
  return '';
}

describe('UI-lab Web adoption validator', () => {
  it('fails if a Web primitive shim contains a local implementation', () => {
    expect(
      isPureUiShim(
        'packages/web/src/components/ui/button.tsx',
        `export function Button() {
  return <button />;
}
`
      )
    ).toBe(false);
  });

  it('fails if the selected Settings route lacks approved UI-lab adoption imports', () => {
    expect(() =>
      validateWebAdoption({
        shimEntries,
        readTextFile: relativePath =>
          relativePath.endsWith('SettingsPage.tsx')
            ? 'export function SettingsPage() { return null; }'
            : dashboardRouteWithAdoption,
      })
    ).toThrow('Settings route must import FormActions from @archon/ui-lab');
  });

  it('fails if the selected Dashboard route lacks approved UI-lab adoption imports', () => {
    expect(() =>
      validateWebAdoption({
        shimEntries,
        readTextFile: relativePath =>
          relativePath.endsWith('DashboardPage.tsx')
            ? 'export function DashboardPage() { return null; }'
            : settingsRouteWithAdoption,
      })
    ).toThrow('Dashboard route must import DashboardShell from @archon/ui-lab');
  });

  it('passes when Settings and Dashboard consume approved public UI-lab exports', () => {
    expect(() =>
      validateWebAdoption({
        shimEntries,
        readTextFile: readAdoptedRoute,
      })
    ).not.toThrow();
  });

  it('fails if future Web adoption children are marked forge-ready without evidence', () => {
    const invalidItems = uiLabProductizationItems.map(item =>
      item.id === 'web-workflow-builder-shell-adoption'
        ? {
            ...item,
            status: 'forge-ready' as const,
            webAdoption: {
              parentId: item.webAdoption?.parentId,
              targetFiles: item.webAdoption?.targetFiles ?? [],
              requiredImports: item.webAdoption?.requiredImports ?? [],
              evidenceState: 'web-adopted' as const,
              currentGate: item.webAdoption?.currentGate ?? false,
              visualEvidenceRequired: item.webAdoption?.visualEvidenceRequired ?? true,
              stateEvidence: item.webAdoption?.stateEvidence ?? [],
            },
          }
        : item
    );

    expect(() =>
      validateWebAdoption({
        productizationItems: invalidItems,
        shimEntries,
        readTextFile: readAdoptedRoute,
      })
    ).toThrow('web-workflow-builder-shell-adoption must remain pending until migrated');
  });
});
