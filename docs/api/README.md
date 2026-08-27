# API collection (Bruno)

Open [Bruno](https://www.usebruno.com/) → "Open Collection" → select this `docs/api` folder.

Select the **Local** environment (top-right environment picker) before running
requests — it points `baseUrl` at the backend directly on `localhost:8080`,
bypassing the nginx `ui` container.

## Auth flow

Most routes require a SuperTokens session cookie. Run **auth / Sign In**
first — Bruno's cookie jar carries the session to subsequent requests in the
same run automatically.

**auth / Sign Up** requires either an authenticated admin session or a valid
`X-System-Actor-Key` header matching the backend's `SYSTEM_ACTOR_KEY` env var
(set the `systemActorKey` environment variable to match) — this is how you
bootstrap the very first user in a fresh environment, before any admin
session exists.

## Folders

- `health/` — unauthenticated health check
- `auth/` — sign up (admin/system-actor only), sign in/out, current user,
  password change, user management (admin)
- `notifications/` — device token registration, sending, and logs
- `test/` — test-only cleanup endpoint, gated by `TEST_API_KEY` (set the
  `testApiKey` environment variable to match)
