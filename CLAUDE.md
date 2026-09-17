# Wizly Labs

Coding practice for learners, run from a WordPress main site. Seventeen domains, one platform, built fresh in this repository.

- Courses
- Challenges & Tracks
- Daily Challenges
- Debug Detective
- Code Lab
- Workspace Projects
- Mock and Company Tests
- Solutions
- Quick Notes
- Topic Requests
- Notifications
- Economy
- Certificates
- Skills and progress
- Profile & Settings
- WizBit
- Administration

## Read first

1. `docs/Build Phases.md`: the order of work and what finishes a slice.
2. `docs/Architecture.md`: how everything is built. It is one page and it is binding.
3. The domain document under `docs/domains/` for the slice in hand, together with its group's overview.
4. `Demo/`: the visual and workflow reference. Start it with `pnpm dev` inside `Demo/`; it runs on port 5300.
5. `docs/Rebuild.md`: why this is a fresh build, and the only place that says where reference material lives.

## How the work goes

- **One task at a time.** No parallel builds and no agent swarms.
- **Everything lands on `main`.** Create a branch or a worktree only when the owner asks for one.
- **Plan first.**
  - Before building a slice, state the plan in the session: the outcome, what it owns, the shared parts it uses and how it will be checked.
  - Build only after the owner agrees.
  - Where a domain document is unclear, propose the simplest answer and get a yes or no. Then write the answer into that document.
- **Build a whole slice.** Backend, pages, staff screens and integrations go together. Nothing is backend-only or frontend-only.
- **The loop:**
  1. Implement the slice.
  2. Drive it in a browser against the real services.
  3. The owner walks through it by hand.
  4. Find the root cause of anything wrong.
  5. Fix it.
  6. The owner walks through it again.

  No other agent reviews or verifies the work.
- **No new documents.**
  - No decision rows, planning hierarchies, reports or prompt files.
  - Update the domain document and keep a short completion note in the commit message.
- **Commit small, with plain messages.** Push when the owner asks.

## Rules that never relax

- **Greenfield.**
  - Nothing is copied from any earlier build.
  - No code, comment or document refers to an earlier build. `docs/Rebuild.md` is the one exception.
- **Real services only.** No fake, mock or stand-in service, no mock data and no silent fallback. If a service is down, the feature says so.
- **One `.env`.**
  - Only `backend/src/config/` reads it.
  - Figures are committed defaults that `.env` can override.
  - No secret is ever committed.
- **No sign-in during development.** The environment decides the role (see Architecture section 7). Never build a sign-in or sign-up form.
- **The boundary rules in Architecture section 4 hold from the first commit.** Fix a violation at its cause; never silence it.
- **The Demo is a reference, not a source.** Redesign from it, and make it consistent where it is not. Never import from `Demo/`, and never copy its files.
- **Interface text is for people.** No specification sentences, internal state names, computation timestamps or implementation facts on any page.
- **Nothing missing shows as zero, and nothing ships that cannot be reached.**
- **Ask before anything destructive or outward-facing.** That covers deleting data, force pushes, touching servers and sending messages.

## Courses

Written lessons and video use one hierarchy: **Subject → Chapter → Lesson**. There is no separate course and module structure for video.

## Roles

The product has three roles: **User**, **Admin** and **Super Admin**. WordPress alone decides who holds which, and Labs has no role assignment and no permission editor. *Learner* and *staff* remain the words for the people.

## Words

The left-hand word is the one this product uses, in code, in interface text and in documents. The domain documents still use some right-hand words. When a slice is planned, its document is corrected to the left-hand word.

| Use | Not |
|---|---|
| test (Mock Test, Company Test) | attempt, retake, redo, sitting |
| try, tries (a delivery or a save) | attempt |
| aged out, pruned; Credits *clear*; a membership is *past its end* | expired, expire |
| archive; a learner *retracts* a topic request and it reads *archived* | withdraw, withdrawn |
| toast (the brief on-screen message) | notice |
| page | surface |
| shell | frame |
| challenge, track challenge | problem, item |
| test case, hidden test case | case, hidden case |
| editorial | worked explanation, worked solution |
| reference solution | reference answer |
| studio | authoring form |
| runtime registry | language catalogue |
| fixture | schema and datasets |
| preflight | readiness check (that name belongs to the platform's health check) |
| strictness: off · Standard · Strict | proctoring setting |
| counted-event ceiling | event limit |
| relief grant | fresh-test grant |
| sealed test, live test | recorded test |
| saved locally | saved on this device |
| hard delete | permanent delete |
| acceptance rate | solve rate |
| the companion (the domain); WizBit (its name in the product) | assistant |
| help panel | door |
| moment kind | message kind |
| requires acknowledgement | sticks |
| generated assistance | generated help |
| legal hold | retention hold |
| paused | parked |
| fresh handoff | recent verification |
| Analytics (the module); Skills and Recap (its pages) | Progress |
| verdict | judgment, label |
| the gate | minimum evidence |
| evidence view | drill-down |
| sealed day | finalized day |
| hold: reserved, captured, released | charge |
| base grant, continuation grant | tranche |
| Workspace Projects | Workspace |
| integration reference | linked activity |
| course project | assigned project |
| block | content section |
| executable | runnable |

More left-hand words:

- *Session* has two meanings and no third: the sign-in session and the interactive terminal session.
- Difficulty: easy · medium · hard · extreme.
- Content lifecycle: draft · published · archived.
- Save states: saving · saved · not saved, tap to retry · saved locally.

## Commands

These commands arrive with the first slice, the repository skeleton. Keep this list up to date.

- `./start-dev.ps1`: starts everything locally. Docker must be running.
- `pnpm verify`: the fast checks.
- `pnpm verify:full`: everything, before a release.
