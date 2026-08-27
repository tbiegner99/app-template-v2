# __SLUG_UPPER__ Local Development Environment

Unified tooling for running the __DISPLAY_NAME__ stack locally.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Mac or Linux)
- [Node.js](https://nodejs.org/) (for `npm install -g`)
- bash or zsh shell (Windows is not supported)

---

## Installation

From the repository root:

```bash
npm install -g
source ~/.zshrc   # or ~/.bashrc if you use bash
```

This installs the `__SLUG__` command and sets `$__SLUG_UPPER___HOME` in your shell profile. Because `$__SLUG_UPPER___HOME` points directly to the scripts folder in this repo, any updates to the scripts take effect immediately — no reinstall needed.

---

## Backend Setup (required before first start, unless generated blank)

If this app was generated with `bin/create-app.sh`'s blank-scaffold option,
skip this section — a blank-scaffold backend has no SuperTokens, no
Firebase, and only the health domain, so it starts with no setup.

The backend container mounts a Firebase service account file that is
**not** committed to the repo (it's a real credential). Without it,
`__SLUG__ start all` / `__SLUG__ start __SLUG__-backend` will fail.

1. Create or open a project at the [Firebase Console](https://console.firebase.google.com).
2. Project Settings → Service Accounts → **Generate new private key**. This
   downloads a JSON file.
3. Save it as `backend/__SLUG__/__SLUG__-firebase.json` (this exact filename
   is already gitignored — never commit it).
4. Open `backend/__SLUG__/docker-compose.yml` and update the `FIREBASE_PROJECT_ID`
   environment value to match your actual Firebase project ID (find it in
   Project Settings, or in the JSON file's `project_id` field).
5. Copy `backend/__SLUG__/.env.example` to `backend/__SLUG__/.env` and fill in
   `SUPERTOKENS_CONNECTION_URI` / `SUPERTOKENS_API_KEY` (a free
   [SuperTokens](https://supertokens.com/) managed instance works for local dev).
6. `POST /signup` requires an admin session or a valid `X-System-Actor-Key`
   header — there's no admin user yet on a fresh database, so set
   `SYSTEM_ACTOR_KEY` in that same `.env` to any value and use it to create
   your first user (see `docs/api/auth/Sign Up.bru`, or `curl` directly).
   Unset it again once you have an admin account.

---

## Quick Start

```bash
__SLUG__ start all      # start all containers (__SLUG__-postgres, __SLUG__-backend, __SLUG__-ui)
__SLUG__ health all     # check status of all containers
__SLUG__ stop all       # stop everything
```

---

## All Commands

| Command | Alias | Target | Description |
|---------|-------|--------|-------------|
| `start` | `s` | `<container\|all>` | Start one or all containers |
| `stop` | `x` | `<container\|all>` | Stop one or all containers |
| `restart` | `r` | `<container>` | Restart a container (no rebuild) |
| `rebuild` | `rb` | `<container>` | Rebuild image and restart |
| `logs` | `l` | `<container>` | Follow log output |
| `health` | `h` | `<container\|all>` | Report health status |
| `reset-db` | `rdb`, `dbr` | — | Drop, reseed, and migrate DB |
| `alias` | `a` | `<alias> <container>` | Add a short-name container alias (implicit `add`) |
| `alias add` | `a add` | `<alias> <container>` | Add a short-name container alias |
| `alias remove` | `a remove`, `a rm` | `<alias>` | Remove a container alias |
| `alias list` | `a list` | — | List configured container aliases |
| `help` | `--help`, `-h` | — | Show help text |

### Container Aliases

`<container>` arguments accept either a real container name (`__SLUG__-postgres`)
or a short alias configured in `local-dev/scripts/container-aliases.conf`
(committed to the repo). Defaults: `ui`, `be`/`backend`, `db`/`postgres`,
`supertokens`/`auth`.

Add your own with `__SLUG__ alias add <alias> <container>`, or the shorter
implicit form: `__SLUG__ a <alias> <container>` (e.g. `__SLUG__ a cache __SLUG__-redis`).
`__SLUG__ alias list` / `__SLUG__ a list` shows what's configured.

### Examples

```bash
__SLUG__ start all
__SLUG__ s __SLUG__-backend

__SLUG__ stop __SLUG__-ui
__SLUG__ x all

__SLUG__ restart __SLUG__-backend
__SLUG__ r __SLUG__-backend

__SLUG__ rebuild __SLUG__-ui
__SLUG__ rb __SLUG__-ui

__SLUG__ logs __SLUG__-backend
__SLUG__ l __SLUG__-ui

__SLUG__ health all
__SLUG__ h __SLUG__-postgres

__SLUG__ reset-db
__SLUG__ rdb
```

---

## Container Names

| Container | Compose File | Description |
|-----------|-------------|-------------|
| `__SLUG__-postgres` | `local-dev/docker-compose.infra.yml` | PostgreSQL 15 database |
| `__SLUG__-backend` | `backend/__SLUG__/docker-compose.yml` | API server (Go or Node) |
| `__SLUG__-ui` | `local-dev/docker-compose.frontend.yml` | nginx frontend server |

Container names are prefixed with the project slug so multiple projects
generated from this template can run side by side on the same machine
without Docker container-name collisions.

`__SLUG__` discovers all `docker-compose*.yml` files in the repo at runtime — new stacks are picked up automatically.

---

## Frontend Dev Workflow

The `ui` container serves the `control-center` app via nginx. It always tries to proxy requests to your local webpack dev server first. If no dev server is running, it falls back to serving the pre-built static files from `web/apps/control-center/dist/`.

**To use the proxy (hot reload):**
```bash
cd web/apps/control-center
npm run dev           # starts webpack dev server on port 3000
__SLUG__ start __SLUG__-ui         # ui container proxies to it automatically
```

**To serve the static build:**
```bash
cd web/apps/control-center
npm run build         # outputs to dist/
__SLUG__ start __SLUG__-ui         # ui container serves the static files
```

You can switch between modes at any time — no container restart needed when starting/stopping the dev server.

### Adding a New Frontend App

1. Add a build stage for the new app (or mount its `dist/` directory)
2. Add a new `volume` entry in `local-dev/docker-compose.frontend.yml`:
   ```yaml
   - ../web/apps/my-new-app/dist:/usr/share/nginx/html/my-new-app:ro
   ```
3. Add a new location block in `local-dev/ui/nginx/default.conf`:
   ```nginx
   location /my-new-app/ {
       proxy_pass http://host.docker.internal:3001/;
       proxy_intercept_errors on;
       error_page 502 503 504 = @my_new_app_static;
   }

   location @my_new_app_static {
       alias /usr/share/nginx/html/my-new-app/;
       try_files $uri $uri/ /my-new-app/index.html;
   }
   ```
4. Add `MY_NEW_APP_DEV_PORT=3001` to `local-dev/.env`
5. Run `__SLUG__ rebuild __SLUG__-ui` to pick up the config change

---

## Database

### Environment

Copy `.env.example` to `.env` and adjust if needed (defaults work out of the box):

```bash
cp local-dev/.env.example local-dev/.env
```

### Reset (drop, reseed, migrate)

```bash
__SLUG__ reset-db   # or: __SLUG__ rdb / __SLUG__ dbr
```

This runs 5 steps in order:
1. Check postgres is running
2. Drop the database
3. Recreate the database
4. Apply `local-dev/seed.sql`
5. Run all Liquibase migrations from `database/`

### Seed

`local-dev/seed.sql` is initially empty. To pre-populate the database with a dump:

```bash
pg_dump -h localhost -U __SLUG__ __SLUG___local > local-dev/seed.sql
```

Commit `seed.sql` to share the baseline with the team.

### Adding a Migration

1. Create a new file in `database/migrations/` following the naming convention:
   ```
   YYYYMMDD_NNN_description.xml
   ```
   Example: `20260424_001_add_users_table.xml`

2. Write the Liquibase changeset:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
           http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.9.xsd">

       <changeSet id="20260424_001" author="your-name">
           <createTable tableName="users">
               <column name="id" type="BIGSERIAL"><constraints primaryKey="true"/></column>
               <column name="email" type="VARCHAR(255)"><constraints nullable="false" unique="true"/></column>
               <column name="date_created" type="TEXT"><constraints nullable="false"/></column>
               <column name="last_modified" type="TEXT"><constraints nullable="false"/></column>
           </createTable>
       </changeSet>

   </databaseChangeLog>
   ```

3. Register it in `database/changelog-master.xml`:
   ```xml
   <include file="migrations/20260424_001_add_users_table.xml"/>
   ```

4. Run `__SLUG__ reset-db` to test the full reset + migration cycle.

> **Convention**: Every table must include `date_created` (set on insert, never updated) and `last_modified` (updated on every write) as ISO-8601 UTC text columns.

---

## Troubleshooting

**`__SLUG__: command not found`**
Run `source ~/.zshrc` (or `~/.bashrc`) after installing, or open a new terminal.

**`__SLUG_UPPER___HOME` not set**
Re-run `npm install -g` from the repo root, then source your shell profile.

**Docker is not running**
Start Docker Desktop and wait for it to be fully ready, then retry.

**Port conflicts**
Edit `local-dev/.env` to change `UI_PORT`, `DB_PORT`, or `CONTROL_CENTER_DEV_PORT` to free ports.

**`ui` container can't reach webpack dev server**
Ensure your dev server is bound to `0.0.0.0` (not just `localhost`), so Docker can reach it via `host.docker.internal`.

**Postgres connection refused during `reset-db`**
Make sure postgres is running first: `__SLUG__ start __SLUG__-postgres`, then retry.
