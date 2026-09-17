# Architecture

**Status:** Agreed  
**Date:** 17 September 2026

This document covers the whole architecture. The domain documents under `docs/domains/` say what the product does; this one says how it is built. Where they disagree on behaviour, the domain document wins. Where they disagree on structure, this one wins.

## 1. Shape

- **Backend:** one modular monolith. It has two entry points, `api` and `worker`, plus a `migrate` command, and all three are built into one image. The api holds no state, so a replica can stop at any moment.
- **Frontend:** one single-page app, served as static files.
- **Stack:**
  - TypeScript in strict mode everywhere.
  - NestJS on Fastify.
  - Drizzle on PostgreSQL.
  - Redis.
  - React, Vite and Tailwind CSS.
  - TanStack Query and React Router.
  - Radix primitives for dialogs, menus, popovers and tabs.
  - Monaco for the code editor and xterm.js for the terminal.
  - Zod for every contract and for configuration.
  - pnpm workspaces.
- **Dependencies:** a new one is added only when a slice needs it and the owner agrees.

## 2. Repository layout

```
CLAUDE.md          working rules for the building agent
.env.example       every configuration name, with comments; .env itself is never committed
start-dev.ps1      the one command that starts everything locally
contracts/         Zod schemas and the types read from them; no server code, no React
backend/
  src/
    main.ts          picks the entry point: api, worker or migrate
    config/          the only reader of .env; defaults.ts holds every product figure
    infrastructure/  db, redis, storage, video, streams, monitoring
    core/            access, jobs
    engines/         execution, content, lifecycle, help
    domains/         one folder per domain
    composition/     the only place one domain is wired to another
  migrations/        one stream, from zero
frontend/
  src/
    app/             entry, router, shell, providers, development sign-in
    shared/          components, theme, api client, device storage, hooks
    domains/         one folder per domain; its staff screens under <domain>/admin/
infra/             compose files for the local data services and for deployment, deploy scripts
tests/             browser smoke tests, one per slice; integration tests
Demo/              the visual and workflow reference; never imported, never deployed
docs/
```

A domain is one pipeline on both sides: `backend/src/domains/<domain>/` answers `frontend/src/domains/<domain>/`, and both use the same folder name.

## 3. Layers and the call rule

| Layer | Holds |
|---|---|
| 0. Foundation | `config`, `infrastructure`, `core` (access, jobs) |
| 1. Engines | execution and evaluation, content and media, data lifecycle, generated help |
| 2. Record domains | notifications, economy, analytics, certificates, solutions |
| 3. Producer domains | code lab, challenges, daily challenges, debug detective, workspace, assessments, courses, notes, topic requests |
| 4. Composite domains | profile, wizbit, administration |

- **Calls go downward only.** A higher layer may call a lower one. It may never call upward.
- **Upward traffic is an event.** When something must reach a higher layer, the producer writes an event in the same transaction as the change that caused it, and the worker delivers it.
- **Sideways calls go through `composition/`.** Two domains in the same layer talk through an adapter declared there, and every such edge is listed in the boundary file.
- **One public entry per domain.** Each domain has an `index.ts`, and nothing outside the domain imports past it.
- **Tables belong to their domain.** Only the owning domain's repositories read or write them. A foreign key into another domain's table is allowed only when the boundary file lists it as a named exception.
- **Pages compose in the browser.** A page that needs facts from several domains calls each domain's own route. No backend domain assembles another domain's data.

## 4. Boundaries enforced from the first commit

One file at the repository root is the single authority for the boundary rules. It is a dependency-cruiser configuration, read by the verify command. It states the layers, the allowed edges, the public entry points and the named exceptions. A file that belongs to no known module fails the check.

The build refuses:

1. an upward import, or a sideways import that is not listed;
2. an import of another domain's repository, schema or helper, whether direct or through a re-export;
3. a shared frontend component importing a domain;
4. a learner page importing a staff screen's internals;
5. `contracts/` importing server or React code;
6. production code importing development-only code;
7. a runtime import cycle;
8. raw SQL outside a repository or `infrastructure/db`;
9. a domain class constructed with another domain's service. It asks `composition/` for an adapter instead.

Each rule has its own small tests: examples that must fail and examples that must pass. A rule that stops catching its failing example fails the build.

## 5. Configuration: one `.env`

- There is one `.env` file at the repository root and no other env file. The backend, Vite, the compose files and the deploy scripts all read it. Vite sees only names that start with `VITE_`.
- `backend/src/config/` is the only code that reads the environment. It validates every name at startup and refuses to start on a missing or malformed value, naming the problem.
- Product figures (limits, timings, awards, thresholds) are committed defaults in `config/defaults.ts`. Code reads a figure by name and never carries the literal. `.env` may override any figure by name.
- Secrets live in `.env` only. `.env.example` lists every name with a comment and no real value.

## 6. Services

| Service | Local | Live |
|---|---|---|
| PostgreSQL | Docker | the host's |
| PgBouncer | Docker | the host's |
| Redis, cache | Docker | the host's |
| Redis, counters | Docker | the host's |
| Object storage | Cloudflare R2, a development bucket | Cloudflare R2 |
| Video | Bunny Stream | Bunny Stream |
| Code execution | the execution server (Judge0 and the terminal executor) | the same |
| Generated help | the real provider, switched on and off in `.env` | the same |
| Main site | none locally (see section 7) | WordPress with the connector plugin |

- **PgBouncer:** the app connects through PgBouncer, and migrations connect directly.
- **Cache Redis:** may evict.
- **Counters Redis:** never evicts. It holds pace limits, counters and running-program counts.
- **No stand-ins:** there are no stand-in services, no mock data and no silent fallback. When a service is down, the feature says it is unavailable and nothing pretends otherwise.
- **`start-dev.ps1`:**
  1. Loads `.env`.
  2. Starts the four Docker services and waits for them.
  3. Migrates the database.
  4. Starts the api, the worker and the frontend.
- **Development content:** it is real content, made through the staff screens or by a small seed of executable content. A deployment starts from an empty database.

## 7. Access, roles and development sign-in

- **Identity:** it comes from the WordPress main site through the connector plugin and a one-time handoff. Labs has no password, no sign-up and no sign-in form of its own.
- **Roles:** there are three, decided by WordPress alone: User, Admin and Super Admin. Labs has no role assignment and no permission editor.
- **What each role may do:** this is a fixed table in code, the one in `docs/domains/Administration/Administration.md`.
- **Checks and records:**
  - Every staff write checks the role when the action is performed.
  - The write and its attributed record are stored in the same transaction.
  - Super Admin writes also require a main-site verification no older than fifteen minutes.
- **Development sign-in:**
  - With `DEV_AUTH=true` in `.env`, and only outside production, the api mounts one development sign-in route.
  - In Vite's development mode the frontend calls that route once on load. It takes the role from `VITE_DEV_ROLE` (default `super-admin`), or from `?dev-role=user|admin|super-admin` for one tab.
  - The result is a real session, so the rest of the platform behaves exactly as it does live.
  - The production build contains neither the route nor the frontend code that calls it.

## 8. Data and background work

- **Migrations:** Drizzle migrations run in one stream from zero and are applied by the `migrate` command. Every change to the schema is proven on an empty database before it is committed.
- **Durable work:** it never depends on Redis.
  - An event is a row written in the same transaction as the change that caused it.
  - The worker claims rows with a lease, retries a bounded number of times and then pauses the row for a person to release.
  - Every handler is safe to repeat: a repeated delivery never duplicates a reward, a solve, a notice or a certificate.
- **Retained records:** each one states how long it lives. Erasure and holds belong to the lifecycle engine, and every domain registers what it keeps with that engine.

## 9. Contracts and the API

- **Shape:** every route's request and response is a Zod schema in `contracts/`.
  - The backend validates with the schema.
  - The frontend's api client takes its types from the same schema.
  - There is no generated client and no generated specification file.
- **Prefix and errors:** routes live under `/api/v1`. An error carries a stable code and the request's id, and never a stack trace or a secret.
- **Privacy:**
  - Hidden test material, other learners' records and private learner work are never sent to a browser that may not read them.
  - A refused private record looks the same as one that does not exist.

## 10. Frontend

- **The shell:** it lives in `app/` and holds navigation, the header, the theme and mode switcher and the page frame. It follows the Demo in look and flow, redesigned where the Demo is inconsistent. It is never copied from the Demo file by file.
- **Shared components:** `shared/components/` is the only component set. A domain composes them and adds none that another domain could reuse.
- **Theme:**
  - The six themes and two modes come from the Demo's values.
  - They live as custom properties in one theme file that Tailwind reads.
  - No component carries a colour or size literal.
- **Text:** interface text is short, written for a learner or a staff member. No page shows a specification sentence, an internal state name, a computation timestamp or an implementation fact.
- **States:** loading, empty, unavailable, refused and not found are different states and look different. Nothing missing is shown as zero.
- **Device storage:** it is scoped to the signed-in account and cleared at sign-out, except appearance.

## 11. Verification

- **`pnpm verify`:** the fast path. It runs the typechecks, lint, the boundary rules and their tests, and the unit tests.
- **`pnpm verify:full`:** everything else:
  - the fast path;
  - integration tests against the real local PostgreSQL and Redis;
  - the browser smoke tests;
  - the production builds;
  - a boot test for each of api, worker and migrate, which checks that the intended providers are present and that every scheduled job is registered exactly once.
- **Unit tests:** they sit beside the code and cover the hard logic:
  - execution outcomes;
  - access and sessions;
  - test timing and marking;
  - ledgers and idempotent rewards;
  - erasure;
  - jobs;
  - streak dates.
- **Tests and services:** tests never fake PostgreSQL or Redis. A test that needs an outside service uses the real one and is tagged so the fast path can skip it.
- **Smoke tests:** every slice adds one browser smoke test of its main journey, so a finished slice keeps passing.
- **Done:** a slice is done only after both of these:
  1. The builder has driven it in a browser against the real services.
  2. The owner has walked through it by hand.
- **Release:**
  - `verify:full` runs on the exact commit being released.
  - The deploy order is migrate, then api and worker, then frontend.
  - The previous image and frontend build are kept, and no migration breaks the previous release, so a bad release can be rolled back.

## 12. Left out on purpose

- no feature identifiers or coverage ledgers
- no decision log
- no permission matrix and no named permission on every method
- no provenance labels on figures
- no generated control register
- no queue that depends on Redis
- no second styling system
