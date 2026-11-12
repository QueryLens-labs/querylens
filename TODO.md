# QueryLens — Pending Features

Phase 1 is complete. The current implementation includes the Phase 2.1 main interface; later work remains pending. This file outlines the roadmap and records prior verification.

## Phase 1.5 — Verification and stabilization (2026-10-30)

- [x] Built and started the frontend, backend, and PostgreSQL with Docker Compose; containers are active and health checks pass.
- [x] Verified 100 products, 100,000 sales, the `sales.product_id → products.id` foreign key, and read-only permissions.
- [x] Verified persistence: the sales count remained at 100,000 after restarting PostgreSQL.
- [x] Verified the live browser → Nginx → FastAPI → PostgreSQL → `EXPLAIN ANALYZE` → plan tree flow, including JOIN, GROUP BY, and ORDER BY.
- [x] Verified rejection of INSERT, UPDATE, DELETE, DROP, and multiple statements; controlled SQL errors and timeouts were also checked.
- [x] Checked loading and error states in Chrome; no JavaScript exceptions occurred.
- [x] Pytest: 14 tests passed. Frontend build passed. `npm audit`: 0 vulnerabilities after upgrading Vite to 7.3.7.
- [x] Validated `docker compose config --quiet`.

Local port 5432 was already in use by another PostgreSQL instance, so verification used port 55432. `.env.example` is configured with that port for the local environment.

## Phase 2.1 — Main interface (2026-10-30)

- [x] Responsive dark interface with a header, live PostgreSQL status, sidebar, and disabled pending navigation.
- [x] PostgreSQL editor using CodeMirror 6, a valid example query, and execution from the button or Ctrl/⌘ + Enter.
- [x] Live metrics for query type, estimated cost, rows, execution time, planning time, and total time.
- [x] Recursive, expandable tree of the received plan, with operations, cost, rows, timing, and available buffer data.
- [x] Read-only viewer for the API response JSON.
- [x] Loading and error states; Results and Visual Flow tabs are disabled because the required data or views do not exist yet.
- [x] Schema and flow panels are marked as pending without drawing fictitious structures.
- [x] Verified the frontend build, Docker Compose, and live analysis flow; checked desktop and mobile views for horizontal overflow.

## Phase 2.2 — Schema explorer and advanced visual analysis

- [ ] Secure endpoint for retrieving the demo database's actual schema.
- [ ] Table and relationship explorer based on actual metadata.
- [ ] Selection and navigation between plan nodes.
- [ ] Identification of potentially expensive operations using explainable rules.
- [ ] Detailed per-node metrics and buffer context.
- [ ] Explanations of PostgreSQL operations and strategies.

## Phase 2.3 — Visual execution flow

- [ ] Interactive diagram generated exclusively from the actual plan received.
- [ ] Navigation between diagram nodes and the execution tree.

## Phase 3 — Optimization experiments

- [ ] Create and clean up temporary indexes in isolated test environments.
- [ ] Compare results before and after applying an optimization.
- [ ] Experiment history.
- [ ] Visual comparison of execution plans.

## Phase 4 — Reproducible benchmarks

- [ ] Run queries repeatedly with controlled parameters.
- [ ] Performance, variability, and distribution statistics.
- [ ] Compare different volumes of fictitious data.
- [ ] Export benchmark results and configuration.

## Phase 5 — Product improvements

- [ ] Save queries and experiments.
- [ ] Import and export reproducible scenarios.
- [ ] Recommendations based on rules and plan evidence.
- [ ] Improvements to the interface, accessibility, and user experience.

