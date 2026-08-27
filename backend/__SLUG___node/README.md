# Node Backend with DDD Architecture

TypeScript + Express port of the Go backend, kept structurally identical so the
two are interchangeable at generation time (see `bin/create-app.sh`).

## Structure

This backend follows Domain-Driven Design (DDD) principles with clean separation of concerns:

### Domain Structure
Each domain (e.g., `health`, `auth`) contains:
- **models.ts** - Business models and domain entities
- **mapper.ts** - Converts between DTOs and domain models
- **datasource.ts** - Database/external service interactions
- **service.ts** - Business logic layer
- **controller.ts** - HTTP request/response handling
- **routes.ts** - Domain initialization and route registration

## Running the Application

### With Docker Compose
```bash
docker compose up --build
```

This starts:
- Node backend server on port 8080 (debug inspector on 9229)
- SuperTokens core on port 3567
- PostgreSQL database on port 5432

### Locally
```bash
npm install
npm run dev        # ts-node + nodemon, hot reload
npm run dev:debug  # same, with --inspect on 9229
npm run build && npm start   # compiled, production-style run
npm test            # vitest
```

### Environment Variables
- `PORT` - Server port (default: 8080)
- `SUPERTOKENS_CONNECTION_URI` - SuperTokens core URL
- `SUPERTOKENS_API_KEY` - SuperTokens API key (optional)
- See `.env.example` for the full list (Firebase, DB, system-actor key).

## API Endpoints

### Health
- `GET /api/__SLUG__/health` - Health check endpoint

### Auth (SuperTokens)
- `POST /api/__SLUG__/auth/signup` - User registration
- `POST /api/__SLUG__/auth/signin` - User login
- `POST /api/__SLUG__/auth/signout` - User logout
- `GET /api/__SLUG__/auth/me` - Get current user (protected)

## Authentication

The app uses [SuperTokens](https://supertokens.com/) for authentication with email/password.
Session tokens are managed via HTTP-only cookies by SuperTokens.
