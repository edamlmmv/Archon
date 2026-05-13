import AxeBuilder from '@axe-core/playwright';
import type { AxeResults } from 'axe-core';
import type { APIRequestContext, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { componentCoverageEntries } from '../src/metadata/component-coverage.generated';

const productizationTemplateIds = [
  'agent-command-center',
  'workflow-review',
  'settings-form-workspace',
  'dashboard-shell',
  'project-settings-form',
  'environment-variables-form',
  'workflow-builder-shell',
  'workflow-execution-review',
  'command-palette-flow',
  'data-table-workspace',
  'onboarding-empty-state',
  'modal-drawer-crud',
  'sidebar-app-shell',
] as const;

interface StorybookIndexEntry {
  id: string;
  name: string;
  title: string;
  type: 'story' | 'docs';
}

interface StorybookIndex {
  entries: Record<string, StorybookIndexEntry>;
}

async function loadStorybookStories(request: APIRequestContext): Promise<StorybookIndexEntry[]> {
  const response = await request.get('/index.json');
  expect(response.ok()).toBeTruthy();
  const index = (await response.json()) as StorybookIndex;
  return Object.values(index.entries).filter(entry => entry.type === 'story');
}

async function analyzeStoryAxe(page: Page): Promise<AxeResults> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await new AxeBuilder({ page })
        .include('#storybook-root')
        .disableRules(['landmark-one-main', 'page-has-heading-one'])
        .analyze();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const retryable =
        message.includes('Axe is already running') ||
        message.includes('Execution context was destroyed');
      if (!retryable || attempt === 4) {
        throw error;
      }
      await page.waitForLoadState('domcontentloaded').catch(() => undefined);
      await page.waitForTimeout(300);
    }
  }
  throw new Error('axe analysis retry loop exhausted');
}

test.describe('Storybook catalog', () => {
  test('exposes every Forge-ready shadcn component story with variant metadata', async ({
    page,
    request,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    const stories = await loadStorybookStories(request);
    const storyIds = new Set(stories.map(story => story.id));
    expect(componentCoverageEntries).toHaveLength(59);

    for (const entry of componentCoverageEntries) {
      expect(storyIds.has(entry.storybookStoryId), `${entry.id} story id`).toBeTruthy();
      await page.goto(
        `/iframe.html?id=${encodeURIComponent(entry.storybookStoryId)}&viewMode=story`,
        {
          waitUntil: 'domcontentloaded',
        }
      );

      const component = page.getByTestId(entry.playwrightTestId);
      await expect(component, `${entry.id} component card`).toBeVisible();
      await expect(component, `${entry.id} Agentic Search marker`).toHaveAttribute(
        'data-agentic-search',
        'indexed'
      );
      await expect(component, `${entry.id} registry path`).toHaveAttribute(
        'data-registry-item-path',
        entry.registryItemPath
      );
      await expect(component, `${entry.id} story id`).toHaveAttribute(
        'data-storybook-story-id',
        entry.storybookStoryId
      );
      await expect(component, `${entry.id} practice profile`).toHaveAttribute(
        'data-practice-profile-path',
        entry.practiceProfilePath
      );
      await expect(component, `${entry.id} practice evidence`).toHaveAttribute(
        'data-practice-evidence-path',
        entry.practiceEvidencePath
      );
      await expect(component, `${entry.id} UI/UX practices`).toHaveAttribute(
        'data-ui-ux-practices',
        entry.uiUxPractices.join(',')
      );
      await expect(component, `${entry.id} density variants`).toHaveAttribute(
        'data-variant-density',
        entry.variants.density.join(',')
      );
      await expect(component, `${entry.id} surface variants`).toHaveAttribute(
        'data-variant-surface',
        entry.variants.surface.join(',')
      );
      await expect(component, `${entry.id} state variants`).toHaveAttribute(
        'data-variant-state',
        entry.variants.state.join(',')
      );
      await expect(component, `${entry.id} mode variants`).toHaveAttribute(
        'data-variant-mode',
        entry.variants.mode.join(',')
      );
      await expect(
        component.locator('[data-slot="card-title"]').filter({ hasText: entry.officialName })
      ).toBeVisible();
    }
  });

  test('renders every story and passes axe without console errors', async ({
    page,
    request,
  }, testInfo) => {
    testInfo.setTimeout(180_000);
    const stories = (await loadStorybookStories(request)).filter(
      story =>
        !story.id.startsWith('ui-lab-full-coverage--') ||
        story.id === 'ui-lab-full-coverage--all-components'
    );
    expect(stories.length).toBeGreaterThan(0);

    const consoleErrors: string[] = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    for (const story of stories) {
      const priorErrorCount = consoleErrors.length;
      await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`);
      const root = page.locator('#storybook-root, #root').first();
      await expect(root, `${story.title} / ${story.name} root should be visible`).toBeVisible();
      const rootBox = await root.boundingBox();
      expect(rootBox?.width ?? 0, `${story.id} root width`).toBeGreaterThan(20);
      expect(rootBox?.height ?? 0, `${story.id} root height`).toBeGreaterThan(20);

      const axeResults = await analyzeStoryAxe(page);
      expect(axeResults.violations, `${story.id} axe violations`).toEqual([]);
      expect(consoleErrors.slice(priorErrorCount), `${story.id} console errors`).toEqual([]);
    }
  });

  test('covers keyboard flows for Radix-backed primitives', async ({ page }) => {
    await page.goto('/iframe.html?id=ui-lab-primitive-matrix--dialog-interaction&viewMode=story');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.goto(
      '/iframe.html?id=ui-lab-primitive-matrix--alert-dialog-interaction&viewMode=story'
    );
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alertdialog')).toBeHidden();

    await page.goto(
      '/iframe.html?id=ui-lab-primitive-matrix--collapsible-interaction&viewMode=story'
    );
    await expect(page.getByText(/docs-backed capability claims/i)).toBeVisible();
    await page.getByRole('button', { name: /show route evidence/i }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(/docs-backed capability claims/i)).toBeHidden();

    await page.goto('/iframe.html?id=ui-lab-primitive-matrix--tabs-interaction&viewMode=story');
    await expect(page.getByText(/enumerate every story/i)).toBeVisible();
    await page.getByRole('tab', { name: 'Tests' }).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByText(/page-ready patterns/i)).toBeVisible();

    await page.goto('/iframe.html?id=ui-lab-primitive-matrix--tooltip-interaction&viewMode=story');
    await page.getByRole('button', { name: 'Hover for tooltip' }).focus();
    const tooltipContent = page
      .locator('[data-slot="tooltip-content"]')
      .filter({ hasText: /advisory until verified live/i });
    await expect(tooltipContent).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tooltipContent).toBeHidden();
  });

  test('exposes form template evidence and editable controls', async ({ page }) => {
    await page.goto('/iframe.html?id=ui-lab-templates--settings-form-workspace&viewMode=story');

    const template = page.getByTestId('ui-lab-template:settings-form-workspace');
    await expect(template).toBeVisible();
    await expect(template).toHaveAttribute('data-template-kind', 'form-workspace');
    await expect(template).toHaveAttribute(
      'data-registry-item-path',
      'packages/ui-lab/registry/new-york/settings-form-workspace/registry-item.json'
    );
    await expect(template).toHaveAttribute(
      'data-dependency-profile',
      '.archon/bmad/ui-lab-dependency-map.json'
    );
    await expect(template).toHaveAttribute('data-ui-ux-practices', /bounded-variant-matrix/);

    await page.getByLabel('Workspace name').fill('UI-lab template pack');
    await page.getByLabel('Default branch').fill('dev');
    await page.getByRole('button', { name: /save settings/i }).click();
    await expect(page.getByText(/Saved UI-lab template pack/i)).toBeVisible();
  });

  test('exposes productization template registry and variant metadata', async ({ page }) => {
    for (const templateId of productizationTemplateIds) {
      const storyId = `ui-lab-templates--${templateId}`;
      await page.goto(`/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`);

      const template = page.getByTestId(`ui-lab-template:${templateId}`);
      await expect(template, `${templateId} template`).toBeVisible();
      await expect(template, `${templateId} template id`).toHaveAttribute(
        'data-template-id',
        templateId
      );
      await expect(template, `${templateId} registry path`).toHaveAttribute(
        'data-registry-item-path',
        `packages/ui-lab/registry/new-york/${templateId}/registry-item.json`
      );
    }
  });
});
