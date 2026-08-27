# __DISPLAY_NAME__

Monorepo containing the mobile app, web control-center, and backend (Go or
Node, chosen at generation time via `bin/create-app.sh`) for __DISPLAY_NAME__.

## Local Development

Full instructions, command reference, and troubleshooting live in
[local-dev/README.md](local-dev/README.md). Quick start:

```bash
npm install -g
source ~/.zshrc   # or ~/.bashrc if you use bash
```

Before your first `start`, complete the **Backend Setup** section in
[local-dev/README.md](local-dev/README.md#backend-setup-required-before-first-start) —
unless this app was generated with the blank-scaffold option, the backend
won't start without a Firebase service account file and SuperTokens
credentials. A blank-scaffold app has neither Firebase nor SuperTokens wired
in, and only the health domain.

```bash
__SLUG__ start all      # start all containers
__SLUG__ health all     # check status
__SLUG__ stop all       # stop everything
```

## Structure

- `mobile/__SLUG__/` — Flutter app
- `mobile/widgetbook/` — component catalog for the mobile app
- `web/apps/components/` — shared React design-system package
- `web/apps/control-center/` — React admin web app
- `backend/__SLUG__/` — API server (Go or Node, picked at generation time)
- `database/` — Liquibase migrations (empty scaffold if generated blank)
- `docs/api/` — Bruno API collection (see `docs/api/README.md`)
- `local-dev/` — Docker Compose stack + `__SLUG__` CLI
