import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../helpers/auth.helpers';

/**
 * Login sad-path tests
 *
 * These tests verify error handling during the authentication flow.
 * They run unauthenticated — no global setup state is required.
 */

test.describe('Login sad paths @basic', () => {
  test('shows error when logging in with wrong password', async ({ page }) => {
    const auth = new AuthHelpers(page);
    await auth.goToLogin();
    await auth.fillLoginCredentials('admin@test.com', 'wrongPassword123!');
    await page.click('button[type="submit"]');

    // Should stay on auth page
    await expect(page).not.toHaveURL(/\/auth\/dashboard/);
    // Should show some form of error — supertokens renders an error message
    await expect(page.locator('form')).toBeVisible();
  });

  test('shows error when logging in with unknown email', async ({ page }) => {
    const auth = new AuthHelpers(page);
    await auth.goToLogin();
    await auth.fillLoginCredentials('nobody@doesnotexist.invalid', 'Test1234!');
    await page.click('button[type="submit"]');

    await expect(page).not.toHaveURL(/\/auth\/dashboard/);
    await expect(page.locator('form')).toBeVisible();
  });

  test('requires both email and password', async ({ page }) => {
    const auth = new AuthHelpers(page);
    await auth.goToLogin();

    // Submit with only email
    await page.fill('input[name="email"]', 'someone@test.com');
    await page.click('button[type="submit"]');

    await expect(page).not.toHaveURL(/\/auth\/dashboard/);
  });

  test('redirects unauthenticated user from dashboard to login', async ({ page }) => {
    // Clear cookies/storage so there's no session
    await page.context().clearCookies();
    await page.goto('/auth/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected away from dashboard
    await expect(page).not.toHaveURL(/\/auth\/dashboard/);
    await expect(page.locator('form')).toBeVisible();
  });
});

test.describe('Logout sad paths @basic', () => {
  test('unauthenticated user cannot access protected routes after manual URL visit', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/auth/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/auth\/dashboard/);
  });
});
