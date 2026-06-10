import { test, expect } from '@playwright/test';

test.describe('Ask Nova', () => {
  test('redirects to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/ask-nova');

    await page.waitForURL('**/auth/sign-in**');
    expect(page.url()).toContain('/auth/sign-in');
  });
});
