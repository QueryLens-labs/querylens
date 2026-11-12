# QueryLens

QueryLens is a local web application for analyzing read-only SQL queries against a demo PostgreSQL database and exploring the execution plan returned by PostgreSQL. It combines a React interface with a FastAPI service that validates a query, runs it in a read-only transaction with `EXPLAIN ANALYZE`, and returns the actual plan and timing data.

## Main features

- SQL editor with an example query and Ctrl/⌘ + Enter execution.
- Query type, estimated cost, returned rows, planning time, execution time, and total time.
- Expandable execution plan tree with operation and available row, cost, timing, and buffer details.
- Read-only view of the API response, plus loading and error states.
- Local PostgreSQL demo schema with 100 products and 100,000 sales rows.
- Read-only database role and a query statement timeout.

Schema exploration and interactive visual flow are planned work; they are not implemented in this release.

## Technology stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, CodeMirror 6, and lucide-react.
- Backend: Python 3.13, FastAPI, Uvicorn, and psycopg.
- Database: PostgreSQL 17.
- Containers: Docker and Docker Compose; Nginx serves the built frontend and proxies `/api` to FastAPI.

## Architecture

The browser sends API requests to Nginx under `/api`. Nginx forwards them to FastAPI, which validates read-only SQL and executes the query against PostgreSQL using the restricted `querylens_readonly` account. The API returns PostgreSQL's execution plan for the frontend to render. Docker Compose starts the database first, waits for its health check, then starts the API and frontend.

## Repository structure

```text
frontend/                  React and TypeScript application
backend/app/               FastAPI application and SQL analysis
backend/tests/             Pytest suite
backend/database/init/     PostgreSQL schema, demo data, and role setup
docker-compose.yml         Full-stack services, at repository root
.env.example               Local demo environment template
TODO.md                    Project roadmap
LICENSE                    MIT License
THIRD_PARTY_NOTICES.md     Lucide and Feather notices
```

## Requirements

For the full containerized application, install Docker Desktop with Docker Compose. For running components directly, use Node.js 20.19+ with npm and Python 3.13. PostgreSQL can be provided by the Compose `db` service.

## Installation

Clone this repository, then from its root:

```powershell
Copy-Item .env.example .env
```

The values are for local demonstration only. Change both passwords before exposing services beyond your machine.

## Environment configuration

- `POSTGRES_ADMIN_PASSWORD`: password for the PostgreSQL bootstrap administrator.
- `QUERYLENS_DB_PASSWORD`: password for the API's restricted database account.
- `QUERYLENS_DB_PORT`: host port mapped to PostgreSQL. Defaults to `55432` to avoid a host's existing `5432` service.
- `QUERYLENS_WEB_PORT`: host port for the web app. Defaults to `3000`.

The backend uses internal Compose networking and connects to PostgreSQL at `db:5432`. Do not commit `.env`.

## Run with Docker Compose

From the repository root:

```powershell
docker compose up --build -d
docker compose ps
```

Open <http://localhost:3000> (or the configured `QUERYLENS_WEB_PORT`). PostgreSQL initialization scripts run only when the named data volume is first created. Stop the services with `docker compose down`; this preserves the database volume.

To verify the seeded rows and query the database:

```powershell
docker compose exec db psql -U querylens_admin -d querylens -c "SELECT count(*) AS sales FROM sales;"
```

## Run components locally

Start PostgreSQL with Compose, then run the API from `backend/` with the database host set to `localhost`, database port set to `55432` (or your configured host port), and the credentials from `.env`:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
$env:QUERYLENS_DB_HOST = 'localhost'
$env:QUERYLENS_DB_PORT = '55432'
$env:QUERYLENS_DB_PASSWORD = 'querylens_local_readonly'
uvicorn app.main:app --reload --port 8000
```

In another terminal, run the frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Vite serves <http://localhost:5173> and proxies `/api` to the local API on port 8000.

## Running tests

Build the frontend:

```powershell
cd frontend
npm ci
npm run build
```

Run backend tests:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
pytest
```

## API overview

- `GET /api/health` reports API and PostgreSQL connectivity, database name, and PostgreSQL version.
- `POST /api/analyze` accepts `{"query": "SELECT ..."}` and returns query metrics and parsed execution-plan nodes.
- `/docs` exposes FastAPI's interactive API documentation when the backend is reachable directly.

The service accepts a single `SELECT` statement (including `WITH ... SELECT`) and executes it with `EXPLAIN ANALYZE` inside a read-only transaction with a 10-second statement timeout. Use the local demo database for analysis.

## Development status

- Phase 1: completed.
- Phase 2.1: completed.
- Phase 2.2: pending.
- Phase 2.3: pending.
- Future optimization and benchmarking phases: pending.

See [TODO.md](TODO.md) for the detailed roadmap and verification history.

## License

QueryLens is licensed under the [MIT License](LICENSE). Third-party attributions are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md); dependencies retain their own licenses.
