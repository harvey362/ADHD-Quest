/**
 * Critical User Journey E2E Tests
 *
 * Tests the most important user flows end-to-end
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Complete new user onboarding flow', async ({ page }) => {
    // Landing page should be visible
    await expect(page.getByText('ADHD QUEST')).toBeVisible();

    // Click to enter app
    await page.getByRole('button', { name: /start.*quest/i }).click();

    // Should see widget library
    await expect(page.getByText('ARCADE')).toBeVisible();
    await expect(page.getByText('TASK CRUSHER')).toBeVisible();
  });

  test('Create first task and complete subtask @smoke', async ({ page }) => {
    // Navigate to Task Crusher
    await page.goto('/#/task-crusher');

    // Create a task
    await page.getByPlaceholder(/enter.*task/i).fill('Test task for E2E');
    await page.getByRole('button', { name: /break.*down/i }).click();

    // Wait for AI response (mocked in test env)
    await page.waitForSelector('[data-testid="subtask-item"]', { timeout: 5000 });

    // Complete first subtask
    const firstSubtask = page.locator('[data-testid="subtask-item"]').first();
    await firstSubtask.getByRole('checkbox').check();

    // Verify XP was earned
    await expect(page.getByText(/\+10 XP/i)).toBeVisible();

    // Verify XP bar updated
    const xpBar = page.locator('[data-testid="xp-bar"]');
    await expect(xpBar).toBeVisible();
  });

  test('Complete full Pomodoro session', async ({ page }) => {
    await page.goto('/#/pomodoro');

    // Start focus session
    await page.getByRole('button', { name: /start/i }).click();

    // Verify timer is running
    await expect(page.getByText(/25:00|24:59/)).toBeVisible();

    // Timer should be counting down
    await page.waitForTimeout(2000);
    await expect(page.getByText(/24:58|24:57/)).toBeVisible();

    // Pause timer
    await page.getByRole('button', { name: /pause/i }).click();

    // Reset
    await page.getByRole('button', { name: /reset/i }).click();
    await expect(page.getByText(/25:00/)).toBeVisible();
  });

  test('Quick capture note creation', async ({ page }) => {
    await page.goto('/#/quick-capture');

    // Create a note
    await page.getByPlaceholder(/capture.*thought/i).fill('Test note for E2E testing');
    await page.getByRole('button', { name: /save.*note/i }).click();

    // Verify note appears in list
    await expect(page.getByText('Test note for E2E testing')).toBeVisible();

    // Verify timestamp
    await expect(page.getByText(/just now|seconds ago/i)).toBeVisible();
  });

  test('Calendar navigation and task display', async ({ page }) => {
    await page.goto('/#/calendar');

    // Verify current month is displayed
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    await expect(page.getByText(new RegExp(currentMonth, 'i'))).toBeVisible();

    // Navigate to next month
    await page.getByRole('button', { name: /next/i }).click();

    // Navigate back
    await page.getByRole('button', { name: /prev/i }).click();

    // Navigate to today
    await page.getByRole('button', { name: /today/i }).click();
  });

  test('Settings theme change', async ({ page }) => {
    await page.goto('/#/settings');

    // Get initial theme color
    const initialColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-green');
    });

    // Change to different theme
    await page.getByRole('button', { name: /danger red/i }).click();

    // Verify theme changed
    const newColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-green');
    });

    expect(newColor).not.toBe(initialColor);
    expect(newColor).toContain('#ff0000');
  });

  test('Achievement display and filtering', async ({ page }) => {
    await page.goto('/#/achievements');

    // Verify achievements are displayed
    await expect(page.getByText(/achievements/i)).toBeVisible();

    // Filter by category
    await page.getByRole('button', { name: /speed/i }).click();

    // Verify only speed achievements shown
    await expect(page.getByText(/speed.*demon|speedrunner/i)).toBeVisible();

    // Show all
    await page.getByRole('button', { name: /all/i }).click();
  });

  test('Stats dashboard data visualization', async ({ page }) => {
    await page.goto('/#/statistics');

    // Verify dashboard loads
    await expect(page.getByText(/statistics/i)).toBeVisible();

    // Verify overview cards
    await expect(page.getByText(/total tasks/i)).toBeVisible();
    await expect(page.getByText(/total xp/i)).toBeVisible();

    // Change time range
    await page.getByRole('button', { name: /week/i }).click();
    await page.getByRole('button', { name: /month/i }).click();

    // Verify charts render (basic check)
    const charts = page.locator('canvas');
    await expect(charts.first()).toBeVisible();
  });

  test('User can navigate between all widgets', async ({ page }) => {
    const widgets = [
      'task-crusher',
      'completed-quests',
      'pomodoro',
      'quick-capture',
      'calendar',
      'time-trainer',
      'achievements',
      'statistics',
      'settings',
    ];

    for (const widget of widgets) {
      await page.goto(`/#/${widget}`);

      // Verify widget loads
      await expect(page.locator('body')).not.toContainText('404');

      // Verify back button exists
      await expect(page.getByRole('button', { name: /back.*arcade/i })).toBeVisible();

      // Navigate back to arcade
      await page.getByRole('button', { name: /back.*arcade/i }).click();
      await expect(page.getByText(/arcade/i)).toBeVisible();
    }
  });
});

test.describe('Accessibility Tests @a11y', () => {
  test('Landing page has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Task Crusher has no accessibility violations', async ({ page }) => {
    await page.goto('/#/task-crusher');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Keyboard navigation works throughout app', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Enter should activate button
    await page.keyboard.press('Enter');

    // Should navigate into app
    await page.waitForTimeout(500);
    await expect(page.getByText(/arcade/i)).toBeVisible();
  });
});
