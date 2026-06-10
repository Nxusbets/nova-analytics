import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('loads successfully with all CTAs', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Nova Analytics' }).first()).toBeVisible();

    await expect(page.locator('text=Turn data into decisions')).toBeVisible();

    const startFreeTrial = page.locator('a[href="/auth/sign-up"]').first();
    await expect(startFreeTrial).toBeVisible();

    const signIn = page.locator('a[href="/auth/sign-in"]').first();
    await expect(signIn).toBeVisible();
  });

  test('features section is visible', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Real-time Analytics')).toBeVisible();
    await expect(page.locator('text=Custom Dashboards')).toBeVisible();
  });

  test('header navigation links work', async ({ page }) => {
    await page.goto('/');

    const signInLink = page.locator('a[href="/auth/sign-in"]').first();
    await signInLink.click();
    await page.waitForURL('**/auth/sign-in');

    expect(page.url()).toContain('/auth/sign-in');
  });
});
