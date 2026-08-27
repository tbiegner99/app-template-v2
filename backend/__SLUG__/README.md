# Go Backend with DDD Architecture

## Structure

This backend follows Domain-Driven Design (DDD) principles with clean separation of concerns:

### Domain Structure
Each domain (e.g., `health`, `auth`) contains:
- **models.go** - Business models and domain entities
- **mapper.go** - Converts between DTOs and domain models
- **datasource.go** - Database/external service interactions
- **service.go** - Business logic layer
- **controller.go** - HTTP request/response handling
- **routes.go** - Domain initialization and route registration

## Running the Application

### With Docker Compose
```bash
docker compose up --build
```

This starts:
- Go backend server on port 8080
- SuperTokens core on port 3567
- PostgreSQL database on port 5432

### Environment Variables
- `PORT` - Server port (default: 8080)
- `SUPERTOKENS_CONNECTION_URI` - SuperTokens core URL
- `SUPERTOKENS_API_KEY` - SuperTokens API key (optional)

## API Endpoints

### Health
- `GET /api/health` - Health check endpoint

### Auth (SuperTokens)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user (protected)

## Authentication

The app uses [SuperTokens](https://supertokens.com/) for authentication with email/password.

Session tokens are managed via HTTP-only cookies by SuperTokens.
