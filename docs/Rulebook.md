# Rulebook

**Date:** 17 September 2026  
**Status:** Consolidated codebase standard for adoption  
**Source snapshot:** `SideSwipeTech/Sprinkle-Jelly-V1` at `161eee6df8b7544b74b906a709675b1557614b6d`

## Purpose and authority

Build Labs with understandable code, independent domains, safe data handling and working learner and administrator journeys. This rulebook covers codebase-wide engineering practice. Feature behavior, numerical limits and domain exceptions remain in the [domain documents](domains/) and [shared definitions](shared/Shared.md); they are not duplicated here.

Established product rules remain binding. Recommendations from [Architecture Review](Architecture%20Review.md), the proposed core-first delivery order, and the tooling choices below are consolidated here for adoption, not represented as previously applied changes. Creating this document does not install packages, modify application code or replace [Architecture](Architecture.md), [Build Phases](Build%20Phases.md) or [CLAUDE.md](../CLAUDE.md). Resolve the alignment items in section 20 before treating the proposed changes as binding implementation instructions. Do not silently choose between contradictory documents.

Use the latest explicit owner-approved decision when an older instruction disagrees. Product descriptions decide behavior; the adopted architecture decides structure. Demo supplies the visual reference, not permission to change behavior. A new product or architectural decision goes to the owner; ordinary local implementation choices within the agreed design do not need a new planning document.

**Daily reading:** the active task, the relevant domain/shared sections, and the applicable rules below. Do not load or rewrite the entire documentation tree for every edit.

## 1. Delivery, scope and Git

Work on one approved task at a time. No parallel domain builds, autonomous agent swarms, surprise branches or worktrees. Follow the explicitly selected Git workflow; the current agent instruction uses `main`, with branches/worktrees only when requested. Preserve others' changes, inspect the diff before committing, and never reset, clean, delete, force-push or rewrite history without specific authorization.

State a short plan in the task conversation: outcome, owner, dependencies and checks. Do not generate task hierarchies, decision ledgers or permanent planning files. Keep commits focused and plainly named. Push or alter external systems only within the owner's authorization.

The recommended delivery order is Foundation/Access, then core journeys, then remaining domain features, then release validation. A domain may remain incomplete during the core pass; a feature declared working must have its backend, frontend, necessary staff controls and real integrations. Do not call a placeholder, success-returning stand-in or disconnected endpoint a completed feature.

Bring required dependencies forward in their owning module. Defer optional breadth, not authorization, durable records, private-data protection, essential failure handling or mandatory dependencies of the selected journey. Keep remaining approved work visible in the existing task/domain context. Core-ready is not launch-ready.

Read references to understand behavior; write the implementation fresh. Do not import, deploy or copy Demo files into production. Avoid unrelated renames, blanket formatting, speculative refactors and dependency upgrades inside a feature fix. Remove temporary instrumentation and experiments before sign-off.

## 2. Keep the selected shape and ownership

Retain the modular monolith, one React application and one backend image with API, worker and migration entry points. Keep the selected TypeScript, NestJS/Fastify, Drizzle/PostgreSQL, Redis, React/Vite/Tailwind, TanStack Query, React Router, Radix, Monaco, xterm.js, Zod and pnpm stack unless the owner changes it.

Do not introduce microservices, event sourcing, separate domain databases or a generic low-code admin builder to organize this application. A domain owns its backend behavior, data, learner pages and staff pages. Administration hosts management capabilities; it does not become their second owner.

| Capability | Ownership rule |
|---|---|
| Execution and Evaluation | Share runtime execution and factual checking; the activity owns its scoring/completion policy. |
| Content | Reuse authoring, validation and lifecycle mechanisms; retain independent authored collections. |
| Data lifecycle | Coordinate retention, erasure and holds; domains perform removal of their own records. |
| Generated help | Own the three provider-backed actions; do not absorb authored WizBit guidance. |
| Analytics | Own activity interpretation and skill calculations, not every domain's outcome. |
| Economy | Own XP, levels, rewards, Credits and settlement. |
| Notifications | Own durable inbox delivery; not the event that caused a notice. |
| Assessments | Own the Mock/Company test lifecycle, including proctoring. No separate global proctoring engine. |
| Solutions and Certificates | Own accepted-source records and credentials respectively. |
| Access, Jobs and shared UI | Foundation capabilities, not new problem-owning domains. |

Challenges, Tracks, Daily and Debug own separate problems, even when their text is identical. Shared forms and evaluators never link their content, submissions, completion or reward identities. Do not build a central problem bank or automatic duplicate-content synchronization.

## 3. Imports and domain connections

Deny cross-module dependencies unless explicitly allowed. Being in a lower layer is not blanket permission to import it. Use the adopted boundary configuration as the single import-rule authority. Preserve acyclic dependencies and one deliberate public entry per domain.

Do not import another domain's repositories, database schema, internal helpers, stores or staff-page internals, including through re-exports or dynamic-import workarounds. Shared frontend code must not import domain code. Contracts must not import backend implementations or React. Production code must not import Demo or development-auth code.

**Recommended composition rule:** composition injects narrow interfaces into consumers. A domain does not import composition as a service locator, retrieve arbitrary providers or construct another domain's concrete service. Allowed synchronous interactions and genuine deferred events serve different purposes; use the adopted architecture's explicit connections rather than forcing every interaction through an event.

A cross-domain foreign key or other structural dependency requires an explicit approved exception. Domain ownership applies to tables and objects, not merely folders. Use each owner's interface rather than cross-domain SQL or a frontend-wide store that bypasses boundaries.

Boundary checks need small allowed and forbidden examples. An import checker verifies dependencies; it does not prove authorization, private-response safety or transaction correctness. Use focused lint and tests for those properties.

## 4. TypeScript and code quality

Keep strict TypeScript and the chosen module settings. Validate external values from `unknown`; do not trust a cast as runtime validation. Avoid `any`, double casts, non-null assertions and suppression comments used merely to make errors disappear. A genuinely necessary exception must be narrow and explained at its use.

Use descriptive names, explicit public contracts and small cohesive functions. Prefer straightforward composition over inheritance frameworks and generic abstractions with one speculative consumer. Split files at clear responsibilities, not an arbitrary line quota. Keep domain-specific components local; extract established common behavior rather than moving everything potentially reusable into shared code.

Handle asynchronous work deliberately: await or return required promises, handle failures, and bound concurrency. Do not hide missing awaits with `void`, swallow errors in empty catches, or keep required work in a detached promise. Use durable jobs for work that must survive the request.

Represent mutually exclusive states explicitly rather than independent flags that allow impossible combinations. Preserve distinctions among missing, null, empty, zero, unavailable and pending. Make state transitions exhaustive where the contract defines a closed set. Comments explain intent, safety constraints and non-obvious tradeoffs, not narrate every line.

## 5. Contracts, API and backend responsibilities

Declare request/response schemas in the existing contracts package and derive types from them. Validate untrusted requests, provider responses and worker payloads at their boundaries. Runtime schemas supplement TypeScript; they do not replace authorization. Keep separate learner, staff, public and internal shapes where visibility differs.

Keep controllers focused on request handling. Put business decisions in the owning application/domain service and persistence in owner repositories. Do not return ORM rows or accept arbitrary object fields as writeable properties. Parameterize values; allowlist dynamic identifiers and sort fields. Keep raw SQL in the allowed repository/infrastructure locations.

Use the agreed API prefix and stable error codes with a request reference. Return safe, actionable messages, not stacks, secrets, database statements or provider internals. Expected absence and permission refusal are not generic server failures. Do not return a fake successful empty list when a dependency failed.

Check ownership and current authority for every protected operation, including downloads, streams and background actions. Validate return destinations and object references. State-changing user actions must not be ordinary GET requests. Apply the chosen cookie/session, CSRF, origin and transport protections consistently; CORS or a hidden menu alone is not authorization.

## 6. Data, transactions and repeated actions

Only the owning repository reads/writes its tables. Define keys, constraints, indexes and bounded query shapes with the feature. Protect uniqueness and concurrency in authoritative storage, not only in UI checks. Avoid unbounded scans, per-row query loops and schema discovery in hot requests. Paginate large collections with stable ordering.

Use short transactions for facts that must agree. The recommended cross-domain transaction mechanism passes a transaction context through approved owner interfaces; it does not grant direct access to foreign tables. Acceptance, required accepted-source capture and the payable reward obligation must not disagree.

Do not hold database transactions open across code execution, AI calls, uploads or video processing. Prepare external work and required durable objects first, then perform the authoritative commit. External object storage does not automatically roll back with SQL; interrupted preparation and cleanup need explicit recovery.

Use stable operation identity and database protection for repeatable writes. Scope identity to the actor and operation; reject reuse with different inputs. The same request returns its original outcome. A genuinely new action is not a duplicate simply because its text matches an earlier one.

Keep required obligations with their originating change. Deferred notification or display failure must not undo a valid result. Do not optimistically claim XP paid, code saved, a certificate issued or a test finalized before the owner confirms that fact.

## 7. Background work and live connections

Durable work belongs in persistent jobs/outbox records, not Redis-only queues, in-memory timers or detached promises. Include original inputs or safe references, operation identity and the recovery information needed after a crash. Expect repeat delivery and make each effect safe to repeat.

Use bounded claims, leases, concurrency and retries. Resume unfinished work without replaying completed effects. A retry must not substitute newly edited grading material or send another paid request after an uncertain provider outcome. Make waiting, running, failed, paused and terminal states distinguishable.

The domain decides recovery: Assessment grading resumes automatically under its policy; rewards and certificates use their own permitted recovery actions. A generic Release/Retry control must not bypass that distinction. Prioritize deadline-sensitive and grading work so bulk broadcasts or staff validation do not starve it.

Persistent deadlines and recurring work must recover across restarts without duplicate scheduling. Use the platform clock for authoritative timing. A closed browser does not cancel accepted work unless its domain explicitly defines that outcome.

An API replica may hold transient sockets but not the sole durable record. Drain planned shutdowns, handle crashes honestly and apply the existing stop/reattach rules. Release a running-program slot once; an empty terminal uses none, but a live input-waiting or permitted detached program still uses one. Redis failure must not be interpreted as zero usage.

## 8. Configuration and dependencies

Keep one `.env` per installation and a complete secret-free `.env.example`. Never commit secrets, production dumps, access tokens or credentials. Do not expose private values through `VITE_*`, logs or frontend bundles. Use central validated configuration, not scattered `process.env` reads in business code.

**Recommended precedence:** environment controls operational settings; the owning domain holds permitted admin-editable settings; recorded tests, rewards and Credit cycles keep captured historical values. Defaults initialize settings rather than silently replacing administrator choices at restart. Align Architecture before implementing this precedence.

Validate only the configuration required by the entry point and enabled capability. Disabled generated help must not require working provider credentials. Unreadable configured limits cannot widen permissions through guessed defaults. Product figures have one named home, with explicit units; examples in documentation are not extra configuration sources.

Pin the supported tool/runtime versions, use pnpm and its lockfile, and keep installs reproducible. Add or upgrade a dependency only for a demonstrated need and with owner approval; inspect compatibility and licensing. Do not introduce competing caches, routers, styling systems, formatters or state libraries incidentally.

Keep real development services separate from production data and credentials. Development sign-in is a production-excluded entry point, not a query-parameter bypass. Browser tabs sharing a session cannot silently have independent roles; use separate contexts for simultaneous role tests. Define a safe local re-verification flow without weakening the live requirement.

## 9. Identity, authorization and privacy

WordPress alone determines User, Admin and Super Admin. Retain the fixed responsibilities in [Administration](domains/Administration/Administration.md). No local role assignment, permission editor, hidden override, emergency promotion or authorization inferred from email/display name.

Check current authority and required recent verification at protected actions. A stale admin page does not retain removed permissions. Client caches and stores display authority; they never grant it. Preserve the approved existing-session outage rules without admitting new or more privileged sessions on an unverifiable claim.

Apply learner ownership consistently. Unknown, hidden and another person's private record disclose no existence information. Neither Admin nor Super Admin can inspect private learner source, Notes, project files or terminal content. Deliberately submitted request/report text and other documented support exceptions remain narrow.

Protect the live recorded-test restriction across tabs. Proctoring policy belongs inside Assessments; Access supplies its account/session restriction, and help/UI consumers enforce it. Course quizzes and Debug windows do not inherit Assessment policy merely because they have timers.

Keep sign-out, account switching, restrictions, routine membership lapse, payment reversal, progress reset and erasure distinct. Preserve the domain's recovery and historical-record guarantees; do not turn an account action into an undocumented destructive operation. Public certificate verification remains its narrow exception, not a public profile.

## 10. Frontend state ownership

TanStack is a family of libraries. This architecture selects **TanStack Query** for server state, not TanStack Store or Router. Retain React Router. Do not add other TanStack packages because Query is already installed.

| State | Default owner/tool |
|---|---|
| Server-held catalogues, saved drafts, results, balances and session readings | TanStack Query cache through the owning domain's API hooks |
| One component's dialog, selected tab or temporary input | React `useState` or `useReducer` |
| Shareable page/search/filter state | The existing router's URL state, only where the approved page supports it |
| Coordinated client-only state across an editor or domain | Scoped context/reducer first; Zustand only when justified and approved |
| Unsaved code and cursor/undo state | The domain's edit session and Monaco model, not a global server-data replica |
| Allowed remembered preferences/recovery | The documented account/device storage helper and lifecycle |
| Authoritative marks, permissions, rewards and completion | Backend owners, never a browser store |

Do not mirror Query results into Zustand or Redux and then maintain both as competing server caches. Derive values where practical rather than storing synchronized copies. A deliberately editable draft is different: retain its acknowledged base revision and its unsaved changes separately from the Query result.

A background refetch must not replace dirty code. On an actual server change, follow the owner's conflict flow. A successful save acknowledges the submitted revision, not edits typed afterward. Keep those later edits dirty until their own save succeeds.

Zustand is optional, not a required dependency. When adopted, create a store per owning domain or editor instance where appropriate, expose narrow selectors/actions, and clear private state under the existing account lifecycle. Avoid a single platform store joining all seventeen domains. Store editor metadata selectively; do not put every keystroke or terminal byte in a globally subscribed store.

Do not add Redux by default. Reconsider Redux Toolkit only for a demonstrated need for extensive coordinated client-side transitions and debugging conventions. RTK Query is an alternative data-cache system, not another cache for the same resources beside TanStack Query. No blanket persistence of stores or Query caches, especially staff reference material and private source.

## 11. Queries, mutations and request discipline

Create a stable QueryClient for the mounted browser application. Define query keys/options and API hooks in their owning domains. Keys include relevant identity/access scope, resource, filters and paging. Shared controls receive data/actions rather than importing domain hooks.

Choose freshness, retry, reconnect, focus and polling behavior deliberately. Do not copy one aggressive polling interval onto every panel or trigger queries from render/effect loops. A live update and a polling fallback must have explicit coordination. Deduplicate subscriptions and clean them up with their timers and listeners.

Use targeted invalidation or authoritative mutation responses. Do not invalidate the whole application after each edit. Cancel or isolate old-session requests and subscriptions before clearing private caches; late responses must not repopulate a different account's view. Do not retry authentication, authorization or validation refusals indefinitely.

Mutations follow backend idempotency. An uncertain timeout is not proof that a write failed; recover its state before issuing a new operation. Optimistic UI is appropriate only for reversible presentation with reconciliation. Never optimistically declare a protected save, publication, grade, reward or certificate final.

Keep unsaved edit sessions independent from background refresh. Debounce autosave under the domain's timing rule, detect conflicting base revisions and serialize dependent writes. Parallel independent requests are permitted; sequential development does not mean serializing every runtime API call.

Measure request counts during load, navigation, idle time and failures. Set page-specific budgets from the actual design. Passing render checks alone does not establish that a page is not flooding the backend. Account/session verification cadence remains governed by Access, not a generic cache convenience.

## 12. Code editors and admin authoring

Use the shared Monaco component and common terminal/preview building blocks for learner code, staff code and read-only source. Preserve model identity, undo history, selection and cursor through harmless layout/theme changes. Dispose models, listeners, workers and output buffers when their owning session ends.

Admin authoring includes per-language starters/reference solutions, broken Debug programs, SQL queries/datasets, executable lesson examples and multi-file templates. Keep each buffer associated with its domain, item, file, language and edit session. Switching language or file must not overwrite another buffer.

Separate **Save draft**, **Learner preview**, **Validate code/content** and **Publish/Update**. Incomplete drafts can save. Preview creates no learner results and exposes no private grading material. Validation executes deliberately; it is not triggered across every language/case by every autosave. Staff checks contribute no learner solves, XP or skill evidence.

A validation pass applies only to its exact code, cases, runtime and relevant settings. Use a revision/fingerprint or equivalent approved mechanism; changed inputs make the pass inapplicable. A late result for an older revision cannot authorize publishing the current one. Recheck applicability and current permission when publication commits.

Keep validation running, failed, unavailable, cancelled and out-of-date distinct. Debug's reference must pass and its broken starter must fail as specified. All offered languages need valid results. A provider outage never becomes Passed. Do not use learner code as a staff reference answer.

Preserve work through expired recent verification. Renew through the permitted access flow, return to the same edit session and retry only with valid authority. Reauthentication must not automatically publish. A lost role may remove write permission but cannot justify silently calling unsaved content saved.

Repository lint/format tools govern application source, not all user-authored programs. Format authored code only through its permitted language formatter and explicit action. Never automatically repair intentionally broken exercises or rewrite fixtures while running repository autofixes.

## 13. Execution and evaluation safety

Run learner and staff-authored programs only through the execution boundary, never inside the application API or ordinary worker process. Exercise SQL uses isolated datasets, never the Labs database connection. Validate runtime support and operation eligibility rather than accepting arbitrary commands or provider language identifiers.

Enforce resource, source, output, input, filesystem and network limits server-side. Deny privileged mounts, internal-service access and Docker-daemon access to executed programs. A runtime being available does not prove its isolation: test the actual configured host. Separate development/staff load from learner obligations according to the chosen capacity policy.

Browser previews execute only inside the approved isolation boundary. They cannot read host sessions/storage, control the parent page or bypass device/navigation restrictions. Browser-network behavior differs from server isolation; describe it accurately.

Run is experimentation. Submit/Validate Fix invokes the activity's grading policy. Preserve Practice all-pass acceptance, Assessment partial/negative marks and simpler course-quiz scoring. Missing required cases are a platform fault, not an unanswered learner response. Grade recorded tests against their original retained material.

Hidden cases, reference answers, unrevealed hints and private diagnostics never travel in learner responses, including error streams or exports. Preserve visible/hidden feedback boundaries, distinguish refusal from program failure, and prevent late output from replacing a newer run. Code Lab fallback and Workspace reconnect behavior remain their specific policies, not universal engine defaults.

## 14. Interface, accessibility and behavior

Use one shared component system and the selected styling approach. Read colors, dimensions and motion from the approved theme system. Domain-specific components may compose those controls without introducing a second theme, editor or business-rule implementation.

Retain all supported theme/mode combinations and the shared header/Settings switch. Appearance changes do not reset work. Honor account/OS reduced motion, keyboard operation, visible focus, modal focus return and screen-reader feedback. Do not make an action drag-only or color-only. Preserve each domain's actual mobile/desktop boundary.

Distinguish empty content, no search matches, no learner activity, insufficient evidence, unavailable, conflict, pending and partial outcomes. Unknown values are not zero. Preserve good data during partial failure and show understandable freshness where the product requires it, not raw internal metadata.

Use approved learner-facing names, including Solve rate and Fix rate. Do not mechanically replace clear product wording with internal vocabulary. Keep local feedback, passing notices, WizBit messages, confirmations and durable notifications distinct. Confirmation requires an explicit action; dismissal or failed rendering is not consent.

Do not hide a required feature because its backend is unfinished. Omit unsupported future scope, and report real availability for delivered features. Escape routes and Retry must work and must not bypass authority or repeat an irreversible action blindly.

## 15. Files, saving, retention and deletion

Validate actual file types, safe paths, sizes and intended use. Apply required scanning/processing before exposure. Upload success is not publication readiness. Refuse malformed/oversized operations without partial placeholders or permanently consumed quota. Keep object access scoped and credentials out of client-visible references.

Preserve domain-specific file limits and atomic batch behavior. Treat MB and MiB explicitly. A shared physical blob does not create shared content ownership; do not delete bytes still needed by another valid logical owner. Workspace's runtime, text-only execution and template-copy rules remain intact.

Saved means acknowledged by the storage promised by that experience. Protect local recovery, base revisions and retained original work. Do not blindly overwrite dirty buffers with fetched content or initialize an empty editable document after a failed load.

Use the existing account/device storage helper. Ordinary coding drafts clear under their policy; appearance and same-account Quick Notes recovery retain their explicit exceptions. On identity change, prevent disclosure immediately and retry failed cleanup. Offline-device data cannot be claimed remotely erased.

Apply retention windows and recent-item floors as the documented union, not their intersection. Keep summaries and required unfinished-work inputs. Content deletion, progress reset and account erasure have different scopes. Preserve earned records and issued-certificate information after ordinary content changes; account erasure and authorized revocation keep their separate consequences.

Run erasure and cleanup as resumable owner-specific work, respecting scoped holds. Do not mark completion while required deletion is unfinished. A restore must not expose erased accounts/private content again. No new bulk private-data export or emergency staff-read bypass is introduced.

## 16. Errors, observability and performance

Preserve enough safe structured context to diagnose faults: operation, request/job reference, owner, duration, outcome class and relevant resource readings. Log at meaningful boundaries without echoing whole requests, credentials, learner code, answers, Notes, private project files or generated prompts. Avoid high-cardinality personal labels in metrics.

Distinguish unhealthy, degraded and unknown services. Report wait time separately from execution time. A counter write failing must not block optional presentation, but missing required durable records must prevent a false success. Use the owner's recovery rather than a generic catch-and-retry loop.

Measure database, cache, external-service and execution timings where they explain a bottleneck. Bound payloads, output, query work, imports and exports. Avoid per-request schema checks and expensive work inside the event loop. Profile before adding caches or abstractions; cache misses and outages must preserve correctness.

Release timers, subscriptions, observers, sockets and models. Test repeated page entry and long editor sessions for leaks. A boundary checker, linter or passing unit suite does not establish runtime performance or security.

## 17. Linting and formatting

**Recommended tooling for adoption:** ESLint with type-aware `typescript-eslint`, React Hooks and TanStack Query rules, plus standalone Prettier. Keep dependency-cruiser for import boundaries. This document installs nothing; selecting tools does not add them automatically to the current stack.

Use one root ESLint flat configuration with focused backend/frontend/contracts/test sections. Start with recommended correctness checks and enable relevant Promise, unsafe-value and exhaustive-state checks deliberately. Respect NestJS decorator metadata when choosing type-import rules. Do not enable every stylistic rule or fight the formatter.

Prettier handles formatting; `eslint-config-prettier` disables conflicts. Run formatting checks separately, not through Prettier-as-an-ESLint-rule by default. Do not add Biome beside them for the same files. Keep formatting choices in configuration rather than debating them in feature tasks.

Exclude generated output, third-party code and Demo from production-code autofix sweeps. Keep deliberately invalid training fixtures under their own explicit checks. Narrow exceptions cannot exempt the application module that uses those fixtures. Never turn off a rule, loosen a type or weaken an assertion solely to obtain a green run.

A necessary suppression needs a local reason and a minimal scope. An ignored Promise still needs deliberate rejection/lifecycle handling; `void` alone is not a solution. Commands proposed here must be created and exercised before anyone claims they pass.

## 18. Verification and completion

Keep the builder's browser walkthrough and the owner's manual check. No autonomous review swarm. Unit tests cover pure difficult logic; integration tests exercise real databases, Redis, object access and execution where needed. Deterministic test inputs are legitimate; fabricated service success is not evidence of integration.

For every slice, test the ordinary journey and its relevant empty, denied, failed, interrupted, duplicate and concurrent cases. Include negative authorization with another learner and both staff roles. Test missing/corrupted dependencies, not only deliberately wrong learner answers. Check actual responses for protected fields.

Use the established commands: the fast `pnpm verify` for types, lint, boundaries and unit checks; `pnpm verify:full` adds formatting verification, real integration/browser checks, production builds and entry-point boot checks as adopted. Commands must fail on failed checks and must not hide errors behind shell success. Full checks run before slice acceptance and on the exact release commit; narrower checks may support intermediate edits.

Add regression coverage for each fixed defect. Do not weaken the test to match a regression or call a skipped check passed. Use controlled service interruption and fault scenarios in test environments, never production. Verify request counts, code execution, recovery and correct role behavior in the browser.

Record what ran, the result, what could not be exercised and the owner's manual outcome in the existing task/commit context. No estimate of completion is proof. Never say Tested, secure, load-ready or production-ready from compilation alone.

## 19. Deployment and operational safety

Prove migrations on an empty database and an upgrade with representative existing records. Never treat a release as database reset. Keep one ordered migration stream and execute it with the intended migration connection, not uncontrolled startup by every replica.

Confirm the PgBouncer mode, database driver and prepared-query compatibility. Budget total connections across API, workers and replicas. Redis cache eviction and counter failures require separate handling; missing counters never authorize excess capacity.

Deploy the verified image and frontend artifact with the adopted migration order. Keep compatibility with previous tables, API responses and queued jobs during rollback. Test planned drain and crash recovery with live connections and accepted obligations.

Separate test and production credentials, storage and data. Keep secrets out of bundles and build artifacts. Rehearse backup restore, erasure protection and the actual failed-release recovery procedure. A successful backup job is not evidence that restoration works.

Live changes, broadcasts, destructive migrations and privileged infrastructure operations need explicit authorization. Do not purchase services, expose endpoints, widen permissions or alter production settings as a convenience to make a development check pass.

## 20. Adoption and document alignment

This rulebook does not silently mark Architecture Review as applied. Before implementing conflicting recommendations, obtain owner adoption and make the smallest matching changes in the existing authoritative documents.

| Area to align | Required agreement |
|---|---|
| Delivery | Core-first versus the current full-domain order; retain complete verified slices and visible remaining work. |
| Git | Resolve Build Phases' implementation-branch wording against the current direct-to-main instruction. |
| Connections and transactions | Adopt explicit allowed dependencies, injected interfaces and required transaction participation without adding a new framework. |
| Configuration | Set environment/persisted-setting/captured-value precedence and safe public build readers. |
| Frontend rules | Preserve Notes recovery and useful freshness wording; permit domain-local components without creating competing shared systems. |
| Agent instructions | Add this rulebook and the relevant shared definitions to the reading path; remove automatic terminology changes that contradict approved behavior. |
| Tooling | Approve ESLint/Prettier configuration before installation. Zustand remains optional; Redux is not a default dependency. |

The ownership, permission, scoring, retention and other product decisions already approved are not reopened by this table. Do not create another decision register to apply these alignments. Update the existing documents together and verify the changed rules against a real representative slice.

## Before marking a slice complete

| Check | Required evidence |
|---|---|
| Scope and ownership | Only the approved behavior; no new hidden dependency or copied domain logic. |
| Data integrity | Saved work, original grading, repeat actions and required cross-owner records agree. |
| Security and privacy | Actual backend/object checks; no forbidden data in responses, caches or logs. |
| Admin and learner journey | Real authoring/code validation and the learner experience, including relevant recovery. |
| Quality and regression | Applicable type, lint, formatting, boundary, unit, integration and browser checks completed. |
| Delivery | Focused reviewed diff, honest check record and owner walkthrough; no unapproved production side effect. |

## References

Project authority: [Architecture](Architecture.md), [Architecture Review](Architecture%20Review.md), [Build Phases](Build%20Phases.md), [Shared](shared/Shared.md), [Access](shared/Access.md), [Content](shared/Content.md), [Code Editor](shared/Code%20Editor.md), [Solving](shared/Solving.md), [Operations](shared/Operations.md), [Data and Privacy](shared/Data%20and%20Privacy.md), and the owning domain documents linked from them.

Tool guidance, checked 17 September 2026: [TanStack Query and client state](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state), [Query defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [React state structure](https://react.dev/learn/choosing-the-state-structure), [Zustand introduction](https://zustand.docs.pmnd.rs/learn/getting-started/introduction), [Redux tradeoffs](https://redux.js.org/tutorials/fundamentals/part-1-overview), [RTK Query](https://redux-toolkit.js.org/rtk-query/overview), [typed linting](https://typescript-eslint.io/getting-started/typed-linting/), [Promise handling](https://typescript-eslint.io/rules/no-floating-promises/), [Prettier integration](https://prettier.io/docs/integrating-with-linters), and [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). These explain tools; they do not override Labs' product decisions.
