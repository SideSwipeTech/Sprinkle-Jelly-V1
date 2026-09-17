# Demo V2 — Admin

An independent, interactive admin-workflow prototype for Wizly Labs. The original `Demo/`, production architecture and product documents are unchanged. Learner pages are intentionally **not built in this folder**.

This is a **local frontend prototype**, not a deployed admin system. All people, usage, certificates, jobs and other examples are fictional. Its simulated role switch is not authentication. Never load real learner records or production credentials into it.

## Run locally

Use Node.js 22 or newer. From the repository root:

```sh
cd Demo-V2
pnpm install
pnpm dev
```

Open **http://127.0.0.1:5400/admin**. `npm install` and `npm run dev` work as alternatives. Stop with Ctrl+C.

The server binds only to `127.0.0.1`. Another port can be supplied through `PORT`. No `.env`, database, WordPress, Docker, API key or execution server is needed. Install dependencies before judging the code editor: `monaco-editor` is served from this folder's `node_modules`, not a public CDN.

When Monaco is unavailable, editable plain-text recovery areas remain usable and clearly identify the missing dependency. That is a recovery state, **not** the intended final editor. After installing, reload the page.

## What is implemented

| Area | Interactive prototype coverage |
|---|---|
| Shared admin shell | Domain work grouped alongside its product area; six themes, light/dark, accessible dialogs, clear local-only status and separate Admin/Super Admin simulations |
| Challenges | Independent collection; title/classification, statement, input/output, constraints, per-language starter/private reference, cases, hints, explanation, comparison and execution limits |
| Daily Challenges | Its own problem collection and code, future scheduling/calendar/health, bonus, begun-date guards and explicit Void behavior |
| Tracks | Create/select a Track first; its own single-language problems, ordering, and inherited language without a live Challenge reference |
| Debug Detective | Broken/reference code, bug types, cases, per-language debrief, Practice/Timed settings and separate aggregate sample readings |
| Authoring lifecycle | Incomplete draft saving, recovery, conflicts, safe learner preview, simulated validation, stale-check protection, approval, publishing/updating, eligible Unpublish/Archive/Delete |
| Assessments | Mock/Company context, sections, all five question types, coding buffers/cases, marks/penalties, timing, proctoring settings, company job roles, accommodations and factual event/result administration |
| Courses | Subject → Chapter → Lesson for both formats; reading blocks, executable examples, video preparation states, quizzes, assigned projects and linked activities; revisions, transfer and publication controls |
| Workspace templates | File tree, text/binary uploads, code editing, entry-file selection, renaming/moving, bounded storage, tasks, preview, draft/publication and independent templates |
| Certificates | Fictional record collection, exact name proposals, explicit reissue/revocation and failed-generation recovery; no real PDF generation |
| Economy | Sixteen bounded settings, previewed changes, incident-linked corrections, failed rewards and clearly labelled aggregate examples |
| Topic Requests | Status transitions, private team note, published fulfilment selection; no learner-text rewriting, deletion or merging |
| WizBit administration | Knowledge entries with source references, matching controls, coordinated editing of all 39 response kinds, nine expression previews and bounded nudge controls |
| Notifications | Broadcast composition/preview, audience confirmation, simulated delivery and Stop, immutable history; no messages are sent |
| Global administration | Operations, People, reports, classification, source records, publication review, scoped resets, holds, erasure progress, maintenance, audit and runtime information |

`tests/routes.json` lists the 83 admin route patterns from the current page map, with fictional fixture bindings. Several paths open a section of one editing workspace; they do not require separate forms or a mandatory multi-page wizard. Group names do not become URL prefixes.

## Start with these journeys

**Practice authoring:** open Challenges and select Generate Parentheses. Edit Overview, Statement, Code, Test cases, Hints and Explanation. Code tabs keep separate starter/reference buffers per language. Cases have one Visible/Hidden choice, input, expected output and optional explanation. SQL adds schema, datasets and row ordering.

**Track authoring:** create or open a Track, then Add problem. Its owner and language are already supplied. Creating the same exercise elsewhere does not synchronize it or copy learner records.

**Validation and publication:** save incomplete work whenever necessary. Validate demo checks structure and simulates execution outcomes. Change a case or source afterward: the earlier result becomes out of date. Preview excludes hidden inputs/expected outputs and private references. Super Admin publishes; Admin submits the exact draft for review.

**Template editing:** open Workspace templates and Personal Reading List. Add/edit a file, resize the file list or code area, edit tasks, save, preview, and validate. Binary uploads are stored as assets, not opened as source.

**Failure recovery:** use Demo controls to select Save failure, Slow save, Validation failure, Service unavailable or Recent verification. Editing remains visible. A response confirming an older save does not claim later typing was saved. Return to Normal when finished.

The editor and panel separators support mouse/pointer resizing and keyboard arrows. Code editors can expand and restore with Escape. Theme changes do not recreate the editing session. The approved minimap-off behavior is retained.

## Data and reset

The demo uses browser storage under the `wizly.demo.v2.*` keys. It does not read or change the original Demo's keys. Save draft stores a local draft; Publish/Update changes the separate local live copy. No real platform record changes.

Unsaved authoring has a separate recovery copy. A background refresh does not silently replace it. Another tab changing the same saved revision triggers the conflict path. Browser storage failure is shown rather than represented as a successful save.

Use **Demo controls → Reset demo**, with its typed confirmation, to restore fictional examples. Reset affects this prototype's local data, not repository files or the original Demo. Export a recovery copy of work you want to keep first.

Browser storage quotas can be lower than the product's 20 MB project allowance. The prototype reports an actual local storage failure; it does not promise production-sized persistent storage.

## What is real and what is simulated

**Real local interactions:** navigation, forms, code-buffer editing, per-language separation, case/hint management, local saving, draft/live separation, exact-draft invalidation, previews, imports/exports, local state transitions, role-dependent controls, resizing and themes.

**Simulated:** compilation, execution, SQL evaluation, reference correctness, media upload/transcoding/scanning, jobs, historical learner effects, payment/account changes, certificate issuance/revocation, notifications, health and analytics. The interface labels these examples and simulations. In particular, a successful simulated validation does not prove that arbitrary submitted code passes its test cases.

The template browser preview is deliberately restricted. It is not a general application host. Native code is never executed by this server. Video selection demonstrates filename/preparation controls, not real media storage. Imports in this prototype use the supplied **JSON** examples; the complete production CSV/import contract is not claimed.

All admin content, including fictional hidden cases/reference solutions, is inspectable in the browser's local data. Hiding it from the learner-preview dialog demonstrates the intended presentation boundary, not server-side secrecy. There is no learner application or production access-control guarantee here.

## Code organization

This folder is an intentionally standalone **native JavaScript ES-module prototype**, with a small Node static server and Monaco. It is not the production React/TypeScript implementation and changes no production stack decision. There is no generated framework, backend, central problem bank or dependency on the original Demo.

```text
src/app.js                  admin shell, routes and editing-session coordination
src/ui.js                   shared form, dialog, table and rendering helpers
src/editor.js               local Monaco loading, isolated models and resizing
src/model.js                content validation and comparison of draft identity
src/store.js                local persistence, conflicts, lifecycle and audit
src/data.js                 fictional examples and constructors
src/authoring.js            shared save, validation, preview and publish controls
src/questions.js            question-type controls
src/features/               owner-specific management experiences
src/styles.css              six themes, two modes and responsive layout
```

Untrusted displayed text is escaped. Markdown support is deliberately small. No production API calls, learner source imports or external font files are included. Monaco syntax services are not a compiler or a multi-language server-side formatter.

## Verification

```sh
pnpm verify
pnpm build
pnpm preview
```

`verify` runs source syntax/import checks and 59 unit/HTTP checks. HTTP checks include all 83 canonical admin deep links. `build` produces `dist/`; install dependencies first to include Monaco. A missing dependency produces an explicit recovery-editor warning instead of a claim that Monaco was bundled.

For browser checks on your own machine:

```sh
pnpm exec playwright install chromium
pnpm test:browser
```

The browser runner starts its own local server, uses fresh browser contexts, tests routes plus editing workflows, and writes `test-results/browser.json`. It expects Monaco to be installed. `pnpm test:browser -- --allow-recovery-editor` permits testing the labelled recovery editor instead.

### Checks performed during creation

- **59/59** Node unit and local HTTP checks passed.
- **83/83** mapped admin destinations rendered in a Chromium test harness without page exceptions.
- **16/16** interaction checks passed, including language buffers, hidden-case preview, stale validation, exact-draft publication, failed/late saves, verification recovery, Track ownership, role approval, resizing, cases, Assessment coding, course lesson types, template files, response-set coverage and narrow layout.
- **12/12** theme/mode combinations retained the edited buffer in that interaction check.
- Static build and module syntax/import checks passed.

The available environment blocked package downloads and normal browser navigation. The Chromium checks therefore injected the actual modules and CSS into a renderer, with test-only in-memory storage and navigation adapters; they exercised the explicit plain-text recovery editor. They were **not** a full browser-to-server or Monaco-worker test. The local HTTP checks tested the real static server separately.

The included normal Playwright runner, actual npm/pnpm installation, Monaco loading/undo/worker behavior, real-browser storage/reload behavior and your final usability walkthrough still need verification locally. No production execution, security, load, media, messaging or WordPress integration tests are claimed.

## Scope of this delivery

This is the **admin prototype for local review**, including the mapped management destinations. It is not a claim of complete production conformance for every domain exception. Keep iteration on administration until its workflows are approved; learner-page redesign remains the next, separate stage.
