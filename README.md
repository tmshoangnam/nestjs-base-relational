## Nocode Survey — Backend

This repository contains the backend service for Nocode Survey — a no-code platform that allows TMC customers to create and embed survey/diagnostic forms on their websites. The backend integrates with TenpinAPI to provide in-depth personality diagnostics based on birth dates.

---

### Users

1. Admin (TMC): system-wide administration, clients and forms management.
2. Client (TMC customer): create and manage diagnostic forms.
3. End User: completes the diagnostic forms.

---

## Architecture & Technology

- NestJS 11 (Typescript)
- TypeORM (v0.3.x) with PostgreSQL
- Redis for cache/session
- JWT / Passport for authentication
- Docker / Docker Compose for local development and CI
- Jest for unit and e2e tests

## Project Layout (high-level)

- `src/` — application source
- `src/auth`, `src/users`, `src/roles`, `src/database`, ... — domain modules
- `test/` — e2e and integration tests
- `docker-compose.*.yaml` — compose files for different environments
- `env-example-relational` — sample environment file for relational DB

---

## Prerequisites

- Node.js >= 16
- npm >= 8 (or yarn)
- Docker & Docker Compose (for containerized development)
- PostgreSQL (local or remote)
- Redis (optional — for cache/session)

## Environment variables

Copy `env-example-relational` to `.env` and update required values (DATABASE_URL, TENPIN_API_KEY, JWT_SECRET, AWS_*, etc.). `env-example-relational` already contains sample relational DB settings used for development/tests.

Example important variables (see `env-example-relational` for full list):

- DATABASE_HOST=postgres
- PORT=3000
- JWT_SECRET=your_jwt_secret
- TENPIN_API_KEY=your_tenpin_api_key
- REDIS_URL=redis://localhost:6379

---

## Local setup & run

1) Clone the repository

```powershell
git clone <repo-url> && cd "tmc-nocode-survey-be"
```

2) Install dependencies

```powershell
npm install
```

3) Set environment variables

```powershell
Copy-Item .\env-example-relational .env
# Edit .env to set DATABASE_URL, TENPIN_API_KEY, JWT_SECRET, etc.
```

4) Run PostgreSQL using Docker (recommended)

```powershell
docker compose -f docker-compose.infra.yaml --env-file env-example-relational up -d
```

5) Generate a migration if you want create new or update:

```powershell
npm run migration:generate -- src/database/migrations/CreateTable
```

6) Run database migrations

```powershell
npm run migration:run
```

7) Run seeders (optional)

```powershell
npm run seed:run:relational
```

8) Start development server

```powershell
npm run start:dev
```

The app will be available at `http://localhost:3000/docs` (or `PORT` defined in `.env`).

---

## Run with Docker (dev/prod)

- Development

```powershell
docker compose -f docker-compose.dev.yaml up -d
docker compose -f docker-compose.dev.yaml logs -f
```

```

Check the compose files for service definitions (db, redis) and adjust `.env` for your environment.

---

## Migrations & Seeds

- Generate a migration if you want create new or update:

```powershell
docker compose -f .\docker-compose.dev.yaml exec survey-nocode-be npm run migration:generate -- src/database/migrations/CreateTable
```

- Run migrations:

```powershell
docker compose -f .\docker-compose.dev.yaml exec survey-nocode-be npm run migration:run
```

- Run seed:

```powershell
docker compose -f .\docker-compose.dev.yaml exec survey-nocode-be npm run seed:run:relational
```

- Revert migrations:

```powershell
docker compose -f .\docker-compose.dev.yaml exec survey-nocode-be npm run migration:revert
```

---

## Tests

- Unit & integration tests:

```powershell
npm run test
```

- E2E tests:

```powershell
npm run test:e2e
```

There is a convenience script `test:e2e:relational:docker` for running e2e tests inside a Docker environment (see `package.json`).

---

## Lint & Format

- Lint: `npm run lint`
- Format: `npm run format`

---

## Security & Secrets

- Do not commit `.env` or secrets into git. Use Secrets Manager in production.
- Avoid logging sensitive information. Use TLS for all external communication.

---

## Contributing

1. Fork or create a feature branch `feature/xxx` from `develop` or `main` according to team workflow.
2. Add unit tests for new features.
3. Run `npm run lint` and `npm run test` before creating a PR.
4. Create PR with clear description, migration notes (if any), and test instructions.

---

## Quick FAQ

- Q: How to use TenpinAPI locally?
- A: Set `TENPIN_API_KEY` in `.env` with the sandbox/production key provided by Tenpin. If you need to mock Tenpin responses, run a local mock server or stub responses in the service layer.

---

## License

MIT
