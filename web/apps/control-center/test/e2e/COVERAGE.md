# Web E2E Test Coverage

E2E tests run against the control-center web app using [Playwright](https://playwright.dev/). A shared authenticated session is established in `tests/setup/global.setup.ts` and reused by happy-path suites; sad-path suites run unauthenticated.

---

## Authentication

**Suites:** `tests/suites/01-login/`

### Happy paths — `01-auth.spec.ts`

| Test | What is verified |
|------|-----------------|
| Dashboard loads when logged in | Navigating to the dashboard with a valid session renders the dashboard page |
| Logout redirects to login page | Clicking logout from the dashboard lands on the login form |
| Protected routes blocked after logout | After logging out, navigating directly to `/auth/dashboard` redirects away from it |

### Sad paths — `02-login-sad-paths.spec.ts`

| Test | What is verified |
|------|-----------------|
| Wrong password shows error | Submitting valid email + wrong password keeps the user on the login form (not redirected to dashboard) |
| Unknown email shows error | Submitting a non-existent email keeps the user on the login form |
| Submit with only email blocked | Submitting the form with email but no password does not navigate to dashboard |
| Unauthenticated user redirected from dashboard | Visiting `/auth/dashboard` with no session redirects to login |
| Manual URL visit after logout blocked | Clearing cookies and visiting a protected URL redirects away |

---

## Not Yet Covered

The following features have no E2E tests today:

- Inspections — create, view, edit, submit
- Alerts — view, acknowledge, filter
- Reports — generate, download
- User management — invite, edit roles, deactivate
- Settings — profile, notifications, language/locale
- Offline / connectivity degraded scenarios
- Role-based UI restrictions (controls hidden or disabled for non-admins)
