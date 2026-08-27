# Control Center E2E Tests

End-to-end tests for the __DISPLAY_NAME__ Control Center application using Playwright.

## Setup

### Prerequisites

- Node.js installed
- Control Center application running on `http://localhost:8000`
- A valid test user account in the system

### Installation

From this directory (`test/e2e`), install dependencies:

```bash
npm install
```

### Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your test credentials:

```env
BASE_URL=http://localhost:8000
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in headed mode (visible browser)

```bash
npm run test:headed
```

### Run tests in debug mode

```bash
npm run test:debug
```

### Run tests in UI mode (interactive)

```bash
npm run test:ui
```

### View test report

After running tests, view the HTML report:

```bash
npm run test:report
```

### Generate tests using Codegen

Record your actions and generate test code:

```bash
npm run test:codegen
```

## Test Structure

```
test/e2e/
├── .auth/                  # Stored authentication state (gitignored)
├── tests/
│   ├── global.setup.ts     # Global setup - authenticates once for all tests
│   └── auth.spec.ts        # Authentication tests
├── playwright.config.ts    # Playwright configuration
├── package.json
└── README.md
```

## Architecture

### Authentication Setup

The tests use a **setup project** that runs once before all other tests:

- `global.setup.ts` logs in a test user and saves the authentication state
- All subsequent tests reuse this authenticated state
- This approach significantly improves test performance by avoiding repeated logins

### Test Projects

- **setup**: Runs authentication setup once
- **chromium**: Chrome browser tests (currently the only supported browser)

### Adding New Browsers

To add support for Firefox or Safari, uncomment the relevant sections in [playwright.config.ts](playwright.config.ts:52-71):

```typescript
{
  name: 'firefox',
  use: {
    ...devices['Desktop Firefox'],
    storageState: '.auth/user.json',
  },
  dependencies: ['setup'],
},
```

### Supporting Multiple Environments

The tests are designed to support multiple environments through environment variables:

1. **Local Development** (default): `http://localhost:8000`
2. **Staging**: Set `BASE_URL=https://staging.example.com`
3. **Production**: Set `BASE_URL=https://production.example.com`

You can create different `.env` files for each environment or set environment variables in your CI/CD pipeline.

## Writing New Tests

### Authenticated Tests

Most tests will use the authenticated state from the setup project:

```typescript
import { test, expect } from '@playwright/test';

test('my authenticated test', async ({ page }) => {
  // User is already logged in via global.setup.ts
  await page.goto('/auth/dashboard');

  // Your test code here
});
```

### Unauthenticated Tests

To test unauthenticated flows, create a new browser context:

```typescript
test('my unauthenticated test', async ({ browser }) => {
  const context = await browser.newContext(); // No storageState
  const page = await context.newPage();

  await page.goto('/some-route');

  // Your test code here

  await context.close();
});
```

## CI/CD Integration

The Playwright configuration is optimized for CI environments:

- Retries failed tests 2 times (only in CI)
- Runs tests serially in CI (prevents resource issues)
- Uses `forbidOnly` to prevent accidentally committed `.only` tests

Set the `CI=true` environment variable in your CI pipeline to enable these optimizations.

## Troubleshooting

### Authentication fails

- Ensure the test user exists in your database
- Verify credentials in `.env` are correct
- Check that the application is running on the correct port

### Tests are slow

- Use the setup project pattern (already implemented) to authenticate once
- Run tests in parallel (default in local development)
- Consider using headed mode only when debugging

### Browser not found

If you get browser-related errors, reinstall browsers:

```bash
npx playwright install chromium
```

## Best Practices

1. **Use data-testid attributes** in your components for stable selectors
2. **Avoid hardcoded waits** - use Playwright's auto-waiting features
3. **Clean up resources** - close contexts/pages when creating them manually
4. **Keep tests independent** - each test should be able to run in isolation
5. **Use Page Object Model** for complex flows (recommended for larger test suites)
