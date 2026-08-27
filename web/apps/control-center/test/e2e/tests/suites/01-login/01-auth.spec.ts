import { test } from '@playwright/test';
import { AuthHelpers } from '../../helpers/auth.helpers';

/**
 * Authentication tests
 *
 * These tests verify the authentication flow and access control.
 * The authenticated state is set up once in global.setup.ts and reused here.
 */

test.describe.serial('Authentication', () => {
  test('should show dashboard when user is logged in', async ({ page }) => {
    const auth = new AuthHelpers(page);

    // Navigate to the dashboard
    // Since we're using the authenticated state from global.setup.ts,
    // the user should already be logged in
    await auth.goToDashboard();

    // Verify we're on the dashboard page
    await auth.verifyOnDashboard();
  });

  test('should logout successfully and redirect to login page', async ({ page }) => {
    const auth = new AuthHelpers(page);

    // Navigate to dashboard (already logged in from global.setup.ts)
    await auth.goToDashboard();

    // Perform logout
    await auth.logout();

    // Verify we're on login page
    await auth.verifyLoginFormVisible();

    // Verify we can't access protected routes anymore
    await auth.verifyCannotAccessDashboard();
  });
});
