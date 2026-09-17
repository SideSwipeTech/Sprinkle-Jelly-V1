# Architecture Review

**Date:** 17 September 2026  
**Status:** Findings and recommendations — not applied  
**Repository:** `SideSwipeTech/Sprinkle-Jelly-V1`  
**Reviewed snapshot:** `5b3429f7c247f599f4ac476121e98be6a2df48d3`

## Summary

Keep the chosen stack and modular-monolith approach. The important changes are clearer domain connections, explicit transaction boundaries, safe background recovery, and a first-class architecture for administrator code authoring.

Administration is not only forms and CRUD. Staff edit starter programs, reference solutions, broken code, SQL exercises, executable lessons and multi-file project templates. Editing, learner preview, execution validation, saving and publication need distinct responsibilities.

This report records the architecture review and its recommended corrections. Creating it does not approve or apply those corrections. The agreed product documents remain authoritative for behavior; Architecture remains the structural authority until deliberately updated.

This is a documentation review, not verification of a running application or the deployed execution server. No browser, load, penetration, migration or restore tests are claimed here. The recorded request-storm incident in [Rebuild](Rebuild.md) is background evidence, not a failure reproduced during this review.

## Keep the foundation

Retain one modular backend, one React application, one backend image with separate API/worker/migration commands, and domain-owned data and staff pages. Keep TypeScript, NestJS on Fastify, Drizzle with PostgreSQL, Redis, React/Vite/Tailwind, TanStack Query, React Router, Radix, Monaco, xterm.js, Zod and pnpm as selected.

Keep WordPress-controlled User, Admin and Super Admin roles, shared UI components, real-service integration checks, sequential delivery and owner walkthroughs. Do not introduce microservices, separate domain databases, an event-sourcing framework, a generic low-code admin builder or another planning-document hierarchy to address these findings.

**Sources:** [Architecture](Architecture.md), [agent instructions](../CLAUDE.md), [Build Phases](Build%20Phases.md).

## Priority and change scope

| Priority | Finding | Main change location |
|---|---|---|
| Before foundational implementation | Domain interfaces and deny-by-default dependencies | Architecture: layers, composition and boundaries |
| Before accepting durable learner work | Cross-domain transactions and owner-specific recovery | Architecture: data and background work |
| Before admin coding workflows | Exact-draft validation, private authoring and executable-content isolation | Architecture: admin authoring, execution and contracts |
| Before long authoring sessions | Editor-safe recent-verification recovery | Architecture: access and frontend |
| Before environment setup | Configuration precedence and development-session behavior | Architecture and agent instructions |
| Before integrated slices | Request budgets, connection lifecycle and capacity recovery | Architecture: frontend and operations |
| Before release | Populated-data upgrades, job-compatible rollback and restore/erasure safety | Architecture: verification and release |
| Before any implementation agent proceeds | Contradictory instructions and terminology | Architecture, agent instructions and Build Phases |

These priorities indicate when the correction is needed. They are not additional development phases or authorization to start implementation.

## 1. Domain connections and isolation

### Finding

Architecture section 3 allows downward calls, sends all upward traffic through events, and routes sideways calls through composition. Some approved interactions need an immediate answer rather than a later event: generated help must reserve Credits before dispatch, lifecycle work needs owner-specific erasure actions, and a security ending must coordinate with a live Assessment.

At the same time, allowing every downward call would be weaker than deny-by-default isolation. Layer order alone should not authorize access to every lower domain. Section 4's instruction that a domain asks composition for an adapter also leaves room for a service locator that can reach arbitrary services.

### Recommended correction

Separate the source-code dependency direction from the permitted runtime interaction. Domains import no foreign internals. Every cross-domain dependency is explicitly allowed. Composition supplies a narrow interface to the caller; the caller does not import composition or look up arbitrary services.

Use immediate interfaces for permission checks, reservations and coordinated state changes. Use durable events for effects that genuinely may happen after the original operation commits. A lower-level capability can declare the interface it needs and receive an approved implementation through composition without importing the higher domain's implementation.

Retain one public domain entry point, owner-only repositories and explicit foreign-key exceptions. Do not add blanket permission for all downward edges. Keep imports acyclic and avoid circular synchronous workflows.

Use dependency-cruiser for dependency boundaries and cycles. Use focused lint or tests for SQL placement, private response fields, authorization and transaction behavior; an import-graph check does not establish these guarantees by itself. Standard Nest provider tokens and factories are sufficient for wiring the interfaces.

**Verification:** an unlisted downward or sideways import fails; a foreign internal import fails even through re-export; a permitted injected interface works; no domain can retrieve arbitrary services from composition.

**Sources:** [Architecture, sections 3–4](Architecture.md); [Access](shared/Access.md), [Help](shared/Help.md), [Data and Privacy](shared/Data%20and%20Privacy.md). Implementation references: [Nest providers](https://docs.nestjs.com/fundamentals/custom-providers), [dependency-cruiser rules](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md).

## 2. Transactions and background delivery

### Finding

The product requires an accepted solve, its required accepted-source capture and its payable reward obligation to agree. Delayed reward delivery is permitted; announcing acceptance without the required saved record is not. Architecture describes transactions and an outbox but does not specify how multiple owners join one necessary atomic operation.

It also says failed work pauses for a person to release. That is not the policy for every job: Assessment grading has its own automatic recovery, Certificates has a specific generation retry, and Economy has an individual reward-recovery action.

### Recommended correction

Define a shared transaction context for the few operations that require atomic owner participation. Each owner writes through its own repository and narrow interface. An orchestrator coordinates those operations; it does not write SQL against another owner's tables.

A first acceptance should follow this shape:

> Finish and verify grading and required source preparation → commit the owning acceptance, required Solutions record and reward obligation together → deliver deferred effects safely.

Do not keep the database transaction open during execution, video processing, an AI request or a large upload. Prepare external work first, then make the authoritative database commit short. External storage is not part of that database transaction: establish the required durable source before acceptance and make unfinished cleanup recoverable.

Treat outbox delivery as repeatable work, not a guarantee that a handler runs once. Preserve stable operation identity and owner-side duplicate protection. A notification failure must not reverse a valid solve.

The worker owns leases, retries and scheduling mechanics. The owner defines whether a failure retries automatically, needs its specific staff action or is terminal. Persist deadlines and recurring schedules, recover after restarts, bound concurrency, and prevent large broadcasts or author-validation batches from starving Assessment grading.

**Verification:** fail an acceptance between owner writes and observe no partial acceptance; replay it without duplicate records; interrupt a worker and recover the same work; verify grading, reward and certificate recovery independently.

**Sources:** [Solving](shared/Solving.md), [Solutions](shared/Solutions.md), [Economy](shared/Economy.md), [Operations](shared/Operations.md). Implementation references: [Drizzle transactions](https://orm.drizzle.team/docs/transactions), [transactional outbox guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).

## 3. Administrator code authoring and validation

### Finding

The architecture names shared editors but does not describe the full staff coding path. Administration needs to edit and validate executable content, not merely store text fields.

| Authoring context | Code-related material |
|---|---|
| Challenges, Tracks and Daily | Per-language starters, reference solutions, cases and editorials |
| Debug Detective | Broken programs, reference fixes, cases and per-language debriefs |
| Assessment coding questions | Starters, reference material and grading cases |
| Lessons | Display-only and executable examples |
| Workspace templates | Files, folders, runtime, entry file and checklist |
| SQL activities | Queries, schema, datasets, expected tables and ordering rules |

### Recommended correction

Describe three distinct operations. **Editing** changes a draft. **Learner preview** presents the permitted learner view without creating learner activity or exposing private grading material. **Validation** deliberately executes the relevant authored material through the execution capability.

Keep one shared Monaco component and shared terminal/preview building blocks. The owning domain supplies buffers, languages, permissions, validation actions and publication rules. Staff validation creates no learner submission, solve, XP or skill evidence.

A validation pass applies only to the exact code, cases, runtime and relevant settings that were checked. For example, validating a Python reference and then changing a hidden case must invalidate the earlier approval for publication.

Use a small internal draft revision or content fingerprint. A result that arrives after its inputs changed may remain visible as an older check, but cannot be called a pass for the current draft. Relevant runtime changes also invalidate applicability. Publication verifies both the successful result and that its inputs still match.

Save incomplete drafts independently from expensive execution checks. Do not run every language and case on every autosave. Validate deliberately and make running, failed, unavailable and no-longer-current validation states distinguishable. Cancellation or service failure must not produce an invented pass.

Replace the subjective instruction that a domain may add nothing another domain could reuse. Share established common controls; allow domain-local components for genuinely domain-specific behavior. Otherwise a single giant shared authoring component could become the place where every domain's rules accumulate.

**Verification:** edit a reference, hidden case or relevant setting after validation; complete an old validation after a new edit; save an incomplete draft; validate every offered language; preview without learner writes; run a template without touching a learner project. Confirm publication cannot consume an obsolete pass.

**Sources:** [Practice authoring](domains/Practice/Authoring.md), [Assessment authoring](domains/Assessments/Authoring.md), [Course authoring](domains/Courses/Authoring.md), [Templates](domains/Workspace/Templates.md), [Code Editor](shared/Code%20Editor.md), [Content](shared/Content.md).

## 4. Executable-content and information boundaries

### Finding

Staff-authored code is still untrusted executable content. Administrator authority does not make it safe to run in the application process. The architecture needs an explicit boundary for learner programs, staff reference solutions, broken starters, lesson examples and templates.

### Recommended correction

Route all such execution through the execution service, never inside the Labs API or ordinary worker process. The API and worker coordinate execution; they are not general-purpose shells for uploaded programs. SQL exercises use isolated exercise datasets, never the application's PostgreSQL connection.

Keep browser execution in an isolated preview context. Do not combine same-origin access with script execution in a way that lets an application-origin preview escape its intended restrictions. The preview must not read Labs sessions, control its parent page or reach another person's work.

Define upload type, size and path checks, required scanning/processing, and controlled delivery. Successful storage alone does not mean a file is safe to publish or execute. Keep uploads outside application execution paths and retain the approved preview and download rules.

Document execution-host privileges, resource limits, filesystem mounts, network restrictions and access to the Docker daemon. Staff validation must satisfy the same isolation boundary as learner execution. The deployed executor was not inspected in this review; these are required checks, not claims about its current protection.

Use separate learner and staff response shapes. Authorized staff can edit their own reference material; learner responses must never contain it merely because a component hides the field. Neither staff role gains access to private learner code, Notes, project files or terminal content.

**Verification:** attempt parent-page access from preview, invalid upload paths, forbidden network/host access and exercise SQL against unauthorized storage. Inspect actual learner responses for reference answers and hidden cases. Run these checks in the real controlled test environment.

**Sources:** [Execution](shared/Execution.md), [Evaluation](shared/Evaluation.md), [Files and Media](shared/Files%20and%20Media.md), [People](domains/Administration/People.md). Implementation references: [iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe), [OWASP uploads](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [Docker security](https://docs.docker.com/engine/security/).

## 5. Recent verification without lost authoring work

### Finding

Super Admin writes require main-site verification within fifteen minutes. A multi-language problem or project template can take longer to author. Without a recovery design, a legitimate save or publication can interrupt work, discard code or leave the administrator uncertain about what committed.

### Recommended correction

Retain the approved verification requirement. Preserve unsaved editor state and the last confirmed draft; explain that verification is required; complete the permitted main-site refresh; return to the same work; then retry the intended operation safely.

Do not silently extend privilege, claim an unconfirmed save succeeded or automatically publish simply because verification completed. A role loss must revoke the action even when local work is recoverable. Apply the documented device-clearing rules so recovery never exposes another account's content.

The architecture should guarantee this behavior before the workflow review chooses the least disruptive screen sequence. Authentication recovery and editor recovery must be designed together.

**Verification:** let verification age out while editing several files; fail the refresh; return successfully; change the WordPress role before retry. Confirm no lost draft, duplicate save, unauthorized publish or cross-account disclosure.

**Sources:** [Architecture, section 7](Architecture.md), [Access](shared/Access.md), [Administration](domains/Administration/Administration.md).

## 6. Configuration and development isolation

### Finding

One `.env` is reasonable, but the architecture does not reconcile environment overrides with persisted admin-editable settings and historical conditions. It also says only backend configuration reads the environment while Vite and startup scripts need a defined subset.

Development authority selected for one tab is ambiguous when tabs share one session cookie. Real external services also need separated development and live data scopes.

### Recommended correction

| Configuration class | Recommended authority |
|---|---|
| Operational connections, secrets and deployment switches | Environment configuration |
| Permitted admin-editable product settings | The owning domain's persisted, validated values |
| Original test, reward, Credit-cycle or validation conditions | Captured values belonging to that operation |

Use committed/environment defaults to initialize permitted settings, not overwrite saved administrative choices on every restart. Preserve existing test conditions, earned awards and active Credit-cycle terms. Define precedence explicitly for any operational override that remains permitted.

Keep one `.env` per installation. Define narrow validated readers for the backend and the public build/startup configuration. Never expose secrets through `VITE_*` values. Validate configuration for the entry point and enabled capability that needs it: generated help being off must not require working AI credentials.

Retain automatic local sign-in, with both build and startup protection against production exposure. For simultaneous role testing, use separate browser contexts; otherwise treat a development role switch as replacement of the shared session, not independent authority in each tab. A development role parameter must grant nothing in production.

Separate development/live storage, video assets, credentials, execution namespaces or equivalent access boundaries. Real integration testing does not require production learner data. Document the safe local equivalent of recent verification without weakening production checks.

**Verification:** restart after an administrative setting change; change defaults with existing cycles/tests; boot each command with only its required configuration; build with development flags; test two role contexts and account switching; confirm no test write reaches live learner data.

**Sources:** [Architecture, sections 5–7](Architecture.md), [Economy administration](domains/Economy/Administration.md), [Credits](domains/Economy/Credits.md), [Access](shared/Access.md). Implementation reference: [Vite environment handling](https://vite.dev/guide/env-and-mode).

## 7. Requests, connections and release safety

### Request management

Selecting TanStack Query does not by itself establish a bounded request pattern. Define stable account-scoped keys, deliberate stale-time and focus/reconnect behavior, bounded retries, targeted invalidation and where polling or live updates apply. Clear private cached data on identity changes. A slow or failed panel must not trigger a platform-wide refetch loop.

Add browser checks for request volume during initial load, navigation and an idle interval, including failures. Set budgets from the actual page design rather than inventing one universal limit. A visually correct page can still overload its backend.

### Connection lifecycle

Stateless means the API holds no sole durable copy of required work; it does not mean a live connection has no transient state. Distinguish planned shutdown from a crash. Drain planned work, handle terminal connections deliberately, and apply each domain's existing stop or reconnection behavior after failure. A restart must neither orphan a process nor create a second one silently.

### Database, counters and releases

| Area | Recommended architectural detail and check |
|---|---|
| PgBouncer | State pool mode, Drizzle driver, prepared-query compatibility and connection budgets across API/worker replicas. Keep migrations direct. Test the selected combination. |
| Counter Redis | Handle restart, lost counters and memory-exhaustion write failures. Reconcile running capacity; a missing counter is not proof that no program is running. |
| Migrations | Prove a fresh install and an upgrade with representative existing data. An update must never be interpreted as resetting the database. |
| Rollback | Preserve compatibility with pending jobs and API responses as well as tables. Exercise rollback against queued work. |
| Backups and erasure | Demonstrate restore and the procedure preventing erased private records from becoming available again after restoration. |

`noeviction` is an eviction policy, not a guarantee that counters cannot fail. Likewise, a successful empty-database migration does not demonstrate a safe upgrade. Keep the existing real-service testing requirement and test failures in controlled environments rather than substituting success-returning services.

**Sources:** [Architecture, sections 6, 8, 10–11](Architecture.md), [Operations](shared/Operations.md), [Data and Privacy](shared/Data%20and%20Privacy.md). Implementation references: [TanStack Query defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [Nest shutdown lifecycle](https://docs.nestjs.com/fundamentals/lifecycle-events), [PgBouncer features](https://www.pgbouncer.org/features.html), [Redis eviction behavior](https://redis.io/docs/latest/develop/reference/eviction/).

## 8. Align the implementation instructions

Contradictory instructions should be corrected before an agent begins a slice. These are document-alignment recommendations, not permission to rewrite agreed product behavior during coding.

| Mismatch | Recommended resolution |
|---|---|
| Device storage clears at sign-out except appearance, but Notes preserves same-account recovery text | Reference the approved clearing policy, including Notes' explicit exception. |
| Blanket prohibition on computation timestamps versus required freshness information | Ban raw internal metadata, not understandable wording such as Updated five minutes ago. |
| Agent instructions replace Solve rate with acceptance rate | Preserve the approved Solve/Fix rate terminology; remove automatic rewrites that contradict product decisions. |
| Agent instructions require `main`; Build Phases specifies an implementation branch | Align Build Phases with the current direct-to-`main` direction; branches/worktrees only when requested. |
| Agent reading order omits shared definitions | Read the relevant shared capability and owning domain, not the entire documentation tree. |
| No permission matrix versus a required fixed role table | Say no configurable role/permission editor. Keep the fixed WordPress-derived role-to-action policy and server checks. |
| Worker failures generically wait for staff release | Reference the owner's grading, reward, certificate or other approved recovery policy. |
| Every potentially reusable component must be shared | Share established common behavior; retain domain-specific components within their owner. |

Authorization remains necessary at each protected action and private object, not only when opening the admin page. Keep the three-role model; do not add a configurable permission system to solve an instruction inconsistency.

**Sources:** [agent instructions](../CLAUDE.md), [Architecture](Architecture.md), [Build Phases](Build%20Phases.md), [Quick Notes](domains/Notes/Quick%20Notes.md), [Practice](domains/Practice/Practice.md), [Analytics](shared/Analytics.md). Implementation reference: [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## Application and follow-up

After approval, apply the structural corrections mainly to Architecture and the agent instructions, plus the focused Build Phases alignment. Update a product document only when clarifying an already-approved boundary, or after a separately approved behavior change. Do not create new domains, branches, worktrees or planning layers merely to apply this review.

Recheck the edited rules against atomic acceptance, generated-help reservation, live-test security endings, erasure, exact-draft validation and retained Notes recovery. Keep the fixed role model, independent problem libraries, existing scoring, earned-history protections and real-service verification intact.

Then optimize the admin workflows against Demo: create/edit content, code editing, multi-language and SQL authoring, template files, validation, preview, save/reauthentication recovery, publish/update, Unpublish, Archive and safe Delete. Screen optimization must not hide expensive code validation inside autosave or combine learner preview with a grading run.

**Completion of this report means the findings are recorded. It does not mean the recommended architecture changes have been applied or their verification checks have passed.**
