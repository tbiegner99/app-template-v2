import { test as teardown } from '@playwright/test';
import path from 'path';
import { readFileSync, existsSync } from 'fs';
import { deleteUser } from '../helpers/api.helpers.js';

const testUserFile = path.join(__dirname, '../.auth/test-user.json');

/**
 * Global teardown that runs once after all tests.
 * Deletes the test user created during global setup.
 */
teardown('cleanup test user', async () => {
  if (!existsSync(testUserFile)) {
    console.log('No test user file found — skipping cleanup');
    return;
  }

  const { id } = JSON.parse(readFileSync(testUserFile, 'utf8'));
  if (!id) {
    console.log('No test user ID found — skipping cleanup');
    return;
  }

  await deleteUser(id);
  console.log(`Deleted test user: ${id}`);
});
