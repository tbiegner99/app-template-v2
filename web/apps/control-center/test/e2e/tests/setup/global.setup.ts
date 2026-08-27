import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { writeFileSync } from 'fs';
import { createUser } from '../helpers/api.helpers.js';

const authFile = path.join(__dirname, '../.auth/user.json');
const testUserFile = path.join(__dirname, '../.auth/test-user.json');

/**
 * Global setup that runs once before all tests.
 * Creates a test user via API, authenticates, and saves auth state.
 */
setup('authenticate', async ({ page }) => {
  // Create a fresh test user for this test run
  const testUser = await createUser({ roles: ['admin'] });

  // Persist the user ID so global teardown can delete it
  writeFileSync(testUserFile, JSON.stringify({ id: testUser.id }), 'utf8');

  console.log(`Created test user: ${testUser.email}`);

  // Navigate to the login page
  await page.goto('/auth');
  await page.waitForSelector('form');

  await page.fill('input[name="email"]', testUser.email);
  await page.fill('input[name="password"]', testUser.password);
  await page.click('button[type="submit"]');

  await page.waitForURL('**/auth/dashboard');
  await expect(page).toHaveURL(/\/auth\/dashboard/);

  console.log('Authentication successful');
  await page.context().storageState({ path: authFile });
});
