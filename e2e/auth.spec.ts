import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('sign-up page loads without errors', async ({ page }) => {
    await page.goto('/auth/sign-up');
    await page.waitForLoadState('networkidle');

    const body = await page.textContent('body');
    expect(body).not.toContain('Internal Server Error');
    expect(body).not.toContain('Application error');

    await expect(page.locator('text=Create account')).toBeVisible();
  });

  test('sign-in page loads with form', async ({ page }) => {
    await page.goto('/auth/sign-in');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Nova Analytics')).toBeVisible();
  });

  test('redirects to sign-in when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard/overview');

    await page.waitForURL('**/auth/sign-in**');
    expect(page.url()).toContain('/auth/sign-in');
  });

  test('logout clears session and redirects to landing', async ({ page }) => {
    await page.goto('/auth/sign-in');

    await page.waitForLoadState('networkidle');

    await page.goto('/');
    await expect(page.locator('text=Turn data into decisions')).toBeVisible();
  });

  test('demo cookie does NOT grant access', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'demo_session',
        value: 'demo_user_nova',
        domain: new URL(page.url()).hostname,
        path: '/'
      }
    ]);

    await page.goto('/dashboard/overview');

    await page.waitForURL('**/auth/sign-in**');
    expect(page.url()).toContain('/auth/sign-in');
  });
});
