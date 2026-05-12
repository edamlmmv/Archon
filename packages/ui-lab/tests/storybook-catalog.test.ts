import AxeBuilder from '@axe-core/playwright';
import type { AxeResults } from 'axe-core';
import type { APIRequestContext, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

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
      if (!message.includes('Axe is already running') || attempt === 4) {
        throw error;
      }
      await page.waitForTimeout(300);
    }
  }
  throw new Error('axe analysis retry loop exhausted');
}

test.describe('Storybook catalog', () => {
  test('renders every story and passes axe without console errors', async ({ page, request }) => {
    const stories = await loadStorybookStories(request);
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
});
