# Wizly Labs V2 — Build Phases

**Status:** Draft for owner review  
**Date:** 15 September 2026  
**Approach:** Sequential development; one active domain or closely related group at a time.

## Purpose

Rebuild Labs with clear ownership and a working product at every milestone. Shared capabilities are built once. Each domain then adds its own complete learner and staff experience without recreating those capabilities.

This document defines the build order and completion checks only. It does not select technologies, approve individual features, or carry forward the previous implementation automatically.

## Before implementation

Finish the plain-language product discussions: shared capabilities, individual domains, important edge cases, cross-domain journeys and visual references. Then agree the technology stack and architecture. The existing repository supplies reference material; only explicitly accepted behaviour becomes part of V2.

## Working rules

- **One active delivery task.** No parallel domain builds or autonomous agent swarms. A related group is developed sequentially, not simultaneously.
- **One simple Git flow.** Keep `main` and one active implementation branch. Finish, verify and merge before starting the next task; agents do not create additional branches or worktrees.
- **Finish usable slices.** Backend, frontend, domain-specific administration and required integrations belong to the same delivery. Split large domains into smaller usable slices rather than separate backend-only and frontend-only projects.
- **Verify throughout.** Run automated checks and a focused manual walkthrough for every slice. Phase 4 repeats the important journeys across the completed platform.
- **Change shared behaviour deliberately.** Pause the affected task, agree the smallest necessary shared change, verify existing consumers, then resume. Do not create a private replacement inside a domain.
- **Keep documentation small.** Update the relevant document and a short completion record. Do not generate new planning hierarchies or silently expand scope.

## Phase overview

| Phase | Goal | Completion result |
|---|---|---|
| 1. Foundation & Access | Establish a working, protected platform | Labs starts reliably and admits the right users |
| 2. Shared Capabilities | Establish reusable frontend and backend behaviour | Shared systems work before domains depend on them |
| 3. Domain Delivery | Complete the 17 domains sequentially | Learner and staff workflows work end to end |
| 4. Validation & Release | Test the complete product and its operation | A verified release candidate with no unresolved launch blockers |

## Phase 1 — Foundation & Access

| Subphase | Work |
|---|---|
| **1.1 Project & environments** | Set up the repository, local development and test environment. Establish repeatable installation, startup, reset and configuration. |
| **1.2 Data & operational basics** | Establish persistence, migrations, required storage and a first repeatable test deployment. Add logging, request tracing and health checks. |
| **1.3 Access & permissions** | Implement the agreed main-site handoff, learner and staff access, permissions, sign-out, expired access and account/session restrictions. |
| **1.4 Basic application shell** | Build routing, learner navigation and a minimal staff shell. Establish basic appearance and common page feedback; defer full Dashboard, Settings and Administration pages. |
| **1.5 Foundation verification** | Check fresh setup, sign-in, access refusal, staff restrictions, sign-out, restart and deployment. Correct failures before proceeding. |

**Exit check:** A fresh setup reaches the learner and staff shells through the agreed access flow, rejects unauthorized actions, survives a restart and can be deployed reproducibly. No domain is required to make the foundation work.

## Phase 2 — Shared Capabilities

| Subphase | Work |
|---|---|
| **2.1 Common interface components** | Build reusable forms, buttons, dialogs, lists, tables, navigation elements, loading/empty/error states and accessibility behaviour. Extend the shell rather than rebuilding it. |
| **2.2 Languages & coding workspace** | Establish the approved language catalogue, starter-code rules, shared editor configurations, output panel, interactive terminal and browser preview where supported. |
| **2.3 Execution & evaluation** | Implement Run, Stop, input/output, execution limits and supported-language behaviour. Separately implement answer checking, test results and hidden-answer protection. Platform faults must not count as learner failures. |
| **2.4 Content & media** | Build the agreed shared draft, review, publish and archive behaviour, together with common file/media handling. Individual authoring screens belong to their domains. |
| **2.5 Reliable actions & data lifecycle** | Establish shared background processing, safe repeat actions, change tracking and agreed retention/deletion handling. Record the activity and completion facts approved Progress features will need; dashboard screens remain later. |
| **2.6 Shared assistance & verification** | Build common generated-help behaviour only if retained in V2. Verify all shared capabilities through development-only examples, including normal, failed and interrupted operations. |

**Boundaries:** Assessment timing, test saving and result history belong to the Assessment domain, not a second shared assessment product. Notifications, Economy and Progress keep their own domain ownership even where other domains use their capabilities. Build only known shared needs, not speculative frameworks.

**Exit check:** The shared frontend and backend work together in the verification environment. Required interfaces and behaviour are clear, failure cases are exercised, and later domains can reuse them without inventing alternatives.

## Phase 3 — Sequential Domain Delivery

Groups organize the work; they do not create additional domains or dictate the technical architecture. Within each group, finish one domain or explicitly linked pair before moving on.

| Subphase / group | Delivery order | Group completion |
|---|---|---|
| **3.1 Supporting domains** | Notifications → Economy | Approved messages, rewards, balances and related controls work before other domains depend on them. Their header/inbox/balance surfaces work; final Settings composition comes later. |
| **3.2 Practice** | Code Lab → Challenges & Tracks + Solutions → Daily Challenges → Debug Detective | Learners can experiment, solve, revisit accepted solutions, complete daily work and debug code. Challenges and Solutions form one linked delivery group. |
| **3.3 Build** | Workspace Projects | Learners can create, edit, run and manage projects using the approved multi-file experience and templates. |
| **3.4 Assessments** | Common assessment experience → Mock Tests → Company Tests → combined verification | One Assessment domain supports both types, including their approved differences, saving, timing, submission, results and history. |
| **3.5 Learning** | Courses + Certificates | Lessons, video, quizzes and assigned activities work with the approved completion and certificate journey. Complete the linked group before declaring that journey finished. |
| **3.6 Personal utilities** | Quick Notes → Topic Requests | Personal notes and content requests work, including any staff handling those features require. |
| **3.7 Overview & account** | Home / Skills / Progress → Profile & Settings | Dashboard and progress views use facts already recorded by completed domains. Profile and Settings assemble the preferences and account controls those domains actually need. |
| **3.8 Companion** | WizBit | The companion works against real pages and approved help contexts, including its restrictions and unavailable states. |
| **3.9 Administration** | Unified console and remaining cross-domain management | Assemble the domain-owned staff screens and complete global administration. Verify role-specific access and management journeys without rebuilding individual studios. |

**Domain coverage:** These groups contain 17 domains. Mock and Company are two types within Assessment; Home / Skills / Progress is one domain; Profile & Settings is one domain.

### The same pipeline for every domain

**Confirm behaviour → agree local implementation details → backend → frontend and staff screens → integrations → automated checks → manual walkthrough → merge.**

The brief states the learner outcome, owned area, shared capabilities used and completion checks. The agent makes ordinary local implementation choices within the approved architecture; new product or architecture choices return to the owner.

A domain is complete when its agreed workflows work, important edge cases are handled, applicable staff controls work, its data survives the promised interruptions, and previously completed domains still pass their relevant checks.

**Dependency rule:** No required integration is silently replaced with a placeholder. Build its prerequisite first or complete the two domains as one sequential group. A later dashboard is acceptable only when its required source facts are already captured correctly.

**Administration rule:** Build each domain's authoring and management screens with that domain inside the basic staff shell. Subphase 3.9 unifies and completes the console; it is not the first time staff can manage content.

**Progress rule:** Build collection of the required facts early and their recording with each producer. Build the final Progress calculations and screens in 3.7. Any calculation needed earlier by another domain must be completed before that dependency is signed off.

## Phase 4 — Validation, Hardening & Release

Freeze features during this phase. Work consists of verified defect fixes and release preparation, not new capabilities.

| Subphase | Verification |
|---|---|
| **4.1 Complete domain walkthroughs** | Manually test every learner and staff domain, including normal, empty, loading, restricted and failed states. Repeat checks on the integrated product. |
| **4.2 Cross-domain journeys** | Verify challenge → solution → reward → progress; daily → completion → streak; course → activity → completion → certificate; assessment → result → progress; and account/preferences changes across affected areas. |
| **4.3 Failure & recovery behaviour** | Exercise refresh, disconnect, duplicate actions, service interruption, expired access and interrupted background work. Confirm work is preserved as promised and results are not duplicated. |
| **4.4 Security & access** | Test learner/staff boundaries, access to another learner's data, hidden test material, uploads, sensitive actions and the main-site boundary. |
| **4.5 k6 & performance** | Run representative browse, run, submit, assessment, stream and mixed workloads against agreed targets. Use representative data, identify bottlenecks, fix and rerun. |
| **4.6 Deployment & release checks** | Rehearse fresh deployment, update, backup, restoration, restart and the agreed failed-release recovery procedure. Verify real external integrations, then rerun affected functional and critical checks. |

**Exit check:** All agreed release checks pass with recorded results, no launch-blocking defect remains, and the owner approves the release. Any accepted non-blocking issue has a visible follow-up. Completion means verified behaviour, not a guarantee that no future bug can exist.

## Documents to create next

Keep this roadmap as the single build-order overview. Later, create one focused document for each phase, supported by the shared and individual domain documents already planned. Phase documents reference those descriptions instead of copying their features and workflows.

**Draft assumptions to confirm:** Notifications and Economy come before Practice; domain-specific staff screens are delivered with their domain; final dashboard and account screens come late, but the facts and controls they depend on are not postponed.
