import { test, expect } from '@playwright/test';

test.describe('Ask Nova', () => {
  test('ask-nova page shows empty state with suggested questions', async ({ page }) => {
    await page.goto('/dashboard/ask-nova');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Ask Nova')).toBeVisible();

    await expect(page.locator('text=What was the best-selling category?')).toBeVisible();
    await expect(page.locator('text=What is the total revenue?')).toBeVisible();
  });

  test('sending a question shows user message in chat', async ({ page }) => {
    await page.goto('/dashboard/ask-nova');

    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea[placeholder*="Ask a question"]');
    await expect(textarea).toBeVisible();

    await textarea.fill('What is the total revenue?');

    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=What is the total revenue?')).toBeVisible();
  });
});
