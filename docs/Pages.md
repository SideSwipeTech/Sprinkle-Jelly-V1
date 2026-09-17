# Pages

**Date:** 17 September 2026  
**Purpose:** Grouped page and route map for Labs.  
**Status:** Product page map; implementation and workflow-layout verification are separate.  
**Product baseline:** `884d34d9e133ecfd873935ba4436169c14fed0dc`.

This map organizes the approved experience by **group → domain/product area → learner and admin pages**. Domain administration stays beside its learner experience. The Administration group contains only shared oversight, people, governance and operations.

Groups identify related work; they create no new domain, data owner, shared problem collection or permission. All staff routes still use the one admin console. A route prefix need not match a navigation group: Code Lab remains in Practice here even though its retained address begins with `/build`.

This is a map of browser destinations, not backend API endpoints, a code-generation registry or a claim that pages are implemented. Several routes can open different views of one editor. A dialog, file tab, validation result or action does not automatically need another page. The later admin-workflow pass may simplify presentation without removing the capabilities listed here.

## How to read the map

- **Learner:** the verified owner with the required access. Staff may walk permitted learner views under the existing exclusion rules.
- **Admin pages:** Admin and Super Admin can perform their approved preparation/read work. Publication, live changes and protected actions remain Super Admin-only. A page available to Admin does not make every action on it available.
- **Super Admin:** explicitly identified for protected pages/actions. WordPress alone determines staff roles; there are no local role-grant routes.
- A `:parameter` identifies an existing, authorized item or the stated date/type. It is not a title chosen freely by the browser. No private source, answers, tokens with unrelated authority or personal text belong in route parameters.
- Unless listed as **added/adapted** in section 10, retain the source route pattern. This is not a requirement for compatibility redirects from routes that do not ship.

The [domain documents](domains/) define feature behavior and exceptions. [Shared](shared/Shared.md) defines reused capabilities; [Architecture](Architecture.md) defines technical ownership. This map does not override them. In particular, an accepted route is never permission to read a different learner's record.

## Groups

| Group | Product areas, with their own admin work alongside them |
|---|---|
| Overview | Home; Skills & Progress; Annual Recap |
| Learning | Courses: Lessons and Video Courses |
| Practice | Code Lab; Challenges; Daily Challenges; Debug Detective; Tracks |
| Build | Workspace Projects: My Projects and Course Workspaces; template authoring |
| Assessments | Mock Tests; Company Tests; their common test and paper-authoring views |
| Personal | Profile & Settings; My Solutions; Certificates; Quick Notes; Topic Requests; Economy |
| Platform | WizBit; Notifications; cross-platform controls and runtime information |
| Administration | Operations, people, publication oversight, classification, reports, source records, lifecycle and audit |
| Access | Main-site handoff, restrictions and common status pages; outside the activity groups |

The group/domain labels below are organizational, not additional backend modules. The existing 17-domain accounting is unchanged; Mock/Company and Challenges/Tracks have distinct visible subsections.

## 1. Overview

### Home

**Owner:** Analytics / Home–Skills–Progress, composing facts supplied by other domains. [Home](domains/Progress/Home.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/` | Home | Return through Continue; see the Daily, Notes preview, recent solutions, announcements, achievements and activity. Each region handles its own loading or failure. |

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/analytics/home-suggestion` | Home suggestion | Choose the existing published destination and optional explanation for Home’s curated slot. Super Admin applies changes; this is not an automated recommendation builder. |

**Journey:** Home → owner-confirmed Continue target or selected destination. A completed item is not resumable; an archived item can still resume when its owner permits it. Curating a suggestion creates no learner progress.

### Skills & Progress

**Owner:** Analytics. [Skills](domains/Progress/Skills.md), [Activity](domains/Progress/Activity.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/skills` | Skills & Progress | Read skills, evidence-based trends, practice patterns and owner-supplied Assessment figures. Change the approved period; open explanations or an authored next action. |

Evidence detail, **Why this result?**, and **How your stats work** are panels on this page, not additional routes. There is no goals editor, learner analytics console, peer comparison or language/company filter added here.

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/analytics/next-action-mappings` | Next-action destinations | Manage the authored links used by the approved skill guidance. Super Admin changes mappings; they do not grant access or calculate new skills. |
| `/admin/analytics/skill-evidence-reset` | Skill-evidence reset | Super Admin previews and confirms the existing Skills reset scope for a specified learner. Reuse the same reset operation as People, not a second reset policy. |
| `/admin/analytics/reporting` | Participation and content-review reports | Read bounded aggregate participation and per-area review reports; filter supported periods/areas and export permitted counts. This is not access to learner source. |

**Journey:** Skills → inspect evidence/explanation → open an available next action. Admin mappings → select authorized content → confirm update. A report drill-down stays in its owning report or links to the content owner’s management page.

### Annual Recap

**Owner:** Analytics. [Recap](domains/Progress/Recap.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/recap` | Annual Recap | Read an eligible private year-in-review and select a previously eligible year. Apply the approved season, eligibility and empty-section rules. |

No dedicated admin editor, public share page or second activity-calculation system. Year selection is state on the recap route, not a new route per year.

**Shared in Overview:** owner-supplied cards, activity presentation, permitted links, lists and explanations. Analytics interprets its evidence; Economy still owns XP, Daily owns streaks, Assessments owns readiness and Solutions owns saved-entry counts.

## 2. Learning

### Courses — Lessons and Video Courses

**Owner:** Courses. Both formats use **Subject → Chapter → Lesson**. A chapter is part of the subject outline, not an extra learner destination. [Courses](domains/Courses/Courses.md), [Lessons](domains/Courses/Lessons.md), [Authoring](domains/Courses/Authoring.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/learn` | Learning catalogue | Browse the separate Lessons and Video Courses tabs with their own search, filters, counts and progress. A format selection does not mix their records. |
| `/learn/subjects/:subject` | Subject overview | Read the subject’s orientation, chapters, requirements and recognition; Start/Open, Continue or review according to its format and learner state. Used for both formats. |
| `/learn/subjects/:subject/changes` | Subject changes | Read learner-safe published changes for either format. Distinguish additions, updates, moves and removals without resetting completed learning. |
| `/learn/lessons/:lesson` | Reading lesson | Read Markdown/formatted sections, images, callouts and code examples; use chapter navigation and the approved explicit completion action. |
| `/learn/lessons/:lesson/video` | Video lesson | Watch protected video with captions/transcript and verified coverage. Playback or transcript failure must not become lost completion. |
| `/learn/lessons/:lesson/quiz` | Quiz lesson | Read the rules, answer, submit and see the outcome plus immediate-only review. Keep the approved temporary-take and retake rules. |
| `/learn/lessons/:lesson/project` | Assigned project lesson | Read the assignment and open its Course Workspace. Completion comes from the nonempty, checked checklist plus explicit Workspace confirmation. |
| `/learn/lessons/:lesson/reference` | Linked activity lesson | Open the authored platform activity and display its completion supplied by that activity’s owner. Do not create a second solve or grade. |
| `/learn/completion/:item` | Learning completion | Read the confirmed subject completion, applicable recognition and certificate state, and approved next links. Opening this page never awards completion. |
| `/learn/previews/:previewId` | Read-only draft preview | A signed-in person holding a valid, scoped preview link reads the selected draft. The 24-hour/revocation rules apply; no editing, execution, enrollment or completion. |

The lesson type is confirmed from the authorized content, not trusted from its URL suffix. A moved/removed lesson follows the owning stale-link rule and offers the current subject outline where available. A revoked draft preview never falls through to live or private editing content.

**Admin — one authoring experience with addressable views**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/courses` | Manage learning | List and create written/video subjects. Choose the format, then manage the same hierarchy; keep incomplete drafts saveable. |
| `/admin/courses/:content` | Edit subject | Edit subject details and its chapter tree; create chapters, manage ordering and open lessons. Here :content is the subject identity for either format. |
| `/admin/courses/:content/chapters/:chapter` | Edit chapter | Manage this subject’s chapter details and ordered lessons. No module vocabulary or nested chapter hierarchy. |
| `/admin/courses/lessons/:lesson` | Edit lesson | Edit the selected lesson type, including shared code editors, videos, quiz questions or an assigned template. Preserve dirty work and keep validation separate from autosave. |
| `/admin/courses/lessons/:lesson/revisions` | Lesson revisions | Inspect retained revisions and restore one into the draft, not directly into published content. Return to the same lesson editor. |
| `/admin/courses/:content/order-preview` | Learner order preview | Read the draft subject outline with required/optional items and its initial sequential frontier. Preview creates no learner activity. |
| `/admin/courses/:content/publish` | Validate and publish view | Show the same editor’s blockers and warnings; validate and Publish/Update as Super Admin, or submit the exact draft for approval as Admin. |
| `/admin/courses/:content/settings` | Subject settings view | Open the same subject’s navigation, prerequisites, classification and future-award presentation settings. Only authorized live changes take effect. |
| `/admin/courses/:content/retirement` | Subject removal view | Preview Archive/Delete consequences and obtain the required confirmation. Preserve completed learning, issued awards and learner Workspace records. |
| `/admin/courses/:content/review` | Learning content review | Read the subject’s aggregate starts, reach, completion, drop-off and certificate figures; open the owning lesson to correct content. |
| `/admin/courses/approvals` | Learning publication approvals | Review submitted learning drafts. Super Admin approves and publishes the exact reviewed content in one action, or rejects with a reason. |
| `/admin/courses/transfer` | Learning import/export | Validate and preview a whole-subject draft import or export permitted authored content. Never import learner records or publish implicitly. |

These views are not a mandatory sequence of separate forms. Settings, preview, validation and removal can open in the same authoring workspace while preserving their direct entry addresses. Creation is an action on the relevant list/tree; a first successful draft save supplies its identity.

**Learner journey:** catalogue → subject → lesson → the lesson type’s completion → next lesson or confirmed subject completion. An assigned project crosses into Build’s existing Workspace; it does not embed another project system.

**Admin journey:** select format → create/open subject → chapter → lesson → save draft → preview or deliberate code/media validation as needed → submit/publish/update. Draft changes invalidate a previous check when its relevant inputs change; returning from verification must not discard unsaved code. Published changes trigger the approved mandatory notice, not a notification on every autosave.

**Shared in Learning:** authoring controls, code editor, execution, quiz evaluation, files/media and the common outline. Video coverage and reading completion stay distinct. Certificates, Workspace, Economy and Notifications retain ownership of their connected outcomes. Custom animation sections are excluded.

## 3. Practice

The five areas below remain separately identifiable. Challenges, Tracks, Daily and Debug own independent problems; Code Lab is a playground. [Practice](domains/Practice/Practice.md), [Authoring](domains/Practice/Authoring.md).

**Group entry**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/practice` | Practice entry | Open Code Lab, Challenges, Daily Challenges, Debug Detective or Tracks. Reuse permitted summaries/links; this group page owns no problems, rewards or separate progress. |

### Code Lab

[Code Lab](domains/Practice/Code%20Lab.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/build/code-lab` | Code Lab | Use a language-specific scratch and runnable starter, manual/Auto selection, Run/Stop, interactive terminal or browser preview, formatting and download. No Submit or graded solve. |

The existing address is retained to avoid a route change made solely for grouping. It appears under Practice in this map and its entry points. Prepared input, environment information, supplied browser page and enabled generated-help results are panels here, not routes.

**Admin:** no Code Lab content-management page. Runtime readiness belongs to the shared runtime view in Platform; the playground does not gain a problem library.

**Journey:** open scratch → choose/confirm runtime → edit → Run → input/output → Stop or finish. Closing and device drafts follow Code Lab’s own rules.

### Challenges

[Challenges](domains/Practice/Challenges.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/practice/challenges` | Challenge catalogue | Search/filter standalone Challenges, see owned status and Solve rate, choose Random Challenge or open a problem. |
| `/practice/challenges/:challengeId` | Challenge workbench | Read, choose a supported language, edit, Run, Submit, reveal authored hints and inspect own history. Acceptance unlocks the permitted explanation and saved solution. |

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/challenges` | Manage Challenges | List/create independently owned Challenges with the shared authoring form. Draft creation is not publication. |
| `/admin/challenges/:challengeId` | Edit Challenge | Edit statement, supported languages, starters, reference code, cases, SQL data where applicable, hints and limits. Preview/validate and perform role-permitted lifecycle actions. |
| `/admin/challenges/:challengeId/editorial` | Challenge explanation | Author the learner-facing per-language worked explanation, separate from private reference code. Reuse the owning problem editor and its validation. |
| `/admin/challenges-review` | Challenge content review | Read aggregate problem Solve rates and supported diagnostic signals; open the selected Challenge for correction. Do not inspect learner source. |

**Journeys:** catalogue → workbench → accepted result → exact My Solutions entry. Admin list → problem editor → save/validate → submit or publish/update. Unpublish/Archive/Delete are explicit actions, not extra problem copies.

### Daily Challenges

[Daily Challenges](domains/Practice/Daily%20Challenges.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/practice/daily` | Daily overview | See today’s problem or neutral date, countdown, streak, milestones and calendar. Open today or an eligible past Daily. |
| `/practice/daily/past` | Past Dailies | Browse older published Dailies and permitted retained history; distinguish no more entries from a failed page. |
| `/practice/daily/:productDate` | Daily workbench | Open the Daily for a validated product date in YYYY-MM-DD form. Run/Submit, see date-specific status and reward, hints and own history. |

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/daily-challenges` | Daily authoring | List/create/select Daily-owned problems and edit code, references, cases, hints, date and bonus in the shared form. Selection remains within this studio. |
| `/admin/daily-challenges/schedule` | Daily schedule | Read the calendar/list, fill an empty future date and schedule/move/unschedule eligible drafts. A begun date cannot bypass its locks. |
| `/admin/daily-challenges/schedule-health` | Daily schedule health | Inspect future scheduled, empty and blocked dates and open their authoring context. This read does not select or publish a problem. |
| `/admin/daily-challenges/review` | Daily content review | Read aggregate rates and review signals for Daily-owned problems and export the supported bounded view. |

A selected Daily draft, validation result and Void Daily confirmation are states of these pages; they do not need another route. Keep the selected identity recoverable within the authoring flow without putting source code in the URL.

**Journeys:** overview/calendar → dated workbench → valid first solve → correct reward/streak/calendar. Admin authoring → validate → schedule/publish → schedule health. Catch-up pays its approved reward without repairing a broken streak; begun dates use the approved correction/void behavior.

### Debug Detective

[Debug Detective](domains/Practice/Debug%20Detective.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/practice/debug-detective` | Debug case board | Find published cases by the approved filters, mode and language; show separate timed/practice Fix rates and the learner’s own status. |
| `/practice/debug-detective/:caseAddress` | Debug workbench | Repair the broken starter, Run and Validate Fix, use hints and retained-code restore. A timed window supplies its own clock/checkpoint; acceptance unlocks the debrief. |

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/debug-detective` | Manage Debug cases | List/create cases in their own collection, including safe Delete through normal administration rather than a maintenance-only screen. |
| `/admin/debug-detective/:caseId` | Edit Debug case | Edit broken and fixed code, cases, languages, bug metadata, modes, hints and debriefs. Check both sides and preserve active-window protections on material changes. |
| `/admin/debug-detective-bug-types` | Debug bug types | Maintain the case-authoring bug-type vocabulary under the approved authority; this is metadata, not a learner bug score. |
| `/admin/debug-detective-review` | Debug content review | Read aggregate case funnels, times and review signals. Keep timed and practice populations separate and private learner source inaccessible. |

**Journeys:** case board → workbench → optional explicit timed start → validated fix → saved solution/debrief. Admin → broken/reference code and cases → exact-content validation → publish/update. Ending or withdrawing a timed case uses the existing checkpoint and allowance-restoration rules.

### Tracks

[Tracks](domains/Practice/Tracks.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/practice/tracks` | Track catalogue | Browse single-language Tracks with description, progress and learner state. |
| `/practice/tracks/:trackId` | Track overview | Read its language, ordered independent problems and requirements; Start, Continue, open an available entry or review a completed track. |
| `/practice/tracks/:trackId/problems/:problemId` | Track problem workbench | Solve this Track’s own problem in its fixed language. Verify both parent and problem ownership; never route it through a standalone Challenge identity. |

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/tracks` | Manage Tracks | List/create Tracks and choose their language. Do not offer an Add existing Challenge reference workflow. |
| `/admin/tracks/:trackId` | Edit Track and its problems | Edit the Track, arrange its owned problems and open the shared authoring form for a selected child. Its starter/reference/cases/hints/explanation belong to that Track problem. |

A child problem editor can remain a panel/modal in the existing Track editor; it does not require a second admin page. Preserve and validate the selected child when returning or saving. Import creates independent Track-owned content, not live links or copied learner progress.

**Journeys:** track overview → owned problem workbench → solve → next available entry or overview. Admin Track → create/select owned problem → author/validate → publish → arrange. Similar problems in separate Tracks or other areas remain independent.

**Shared in Practice:** all five areas reuse editing and runtime information. The four problem-owning areas reuse the solving workbench, authored hint controls, case evaluation and problem-authoring form. Code Lab omits graded solving. Daily dates, Debug windows and Track language/completion stay with their owners; My Solutions and Economy receive independent source identities.

## 4. Build

### Workspace Projects

**Owner:** Workspace. [Workspace](domains/Workspace/Workspace.md), [Files and Saving](domains/Workspace/Files%20and%20Saving.md), [Running](domains/Workspace/Running.md), [Templates](domains/Workspace/Templates.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/build` | Build entry | Enter My Projects or Course Workspaces. This is navigation to existing collections, not another project catalogue or Code Lab owner. |
| `/build/projects` | My Projects | List/search personal projects, see their allowance, create blank/from template, rename, download or safely delete. Do not mix Course Workspaces into its count. |
| `/build/projects/:projectId` | Project workspace | Open an owned personal or Course Workspace: file explorer, tabs, editor, saving, Run/Preview, output, checklist and permitted management. |
| `/build/course-workspaces` | Course Workspaces | Manage assigned work separately: open, download, delete or return to its course. Show its combined storage and retained archived-course work. |

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/workspace/templates` | Template authoring | List/create/edit templates using the shared file tree, code editor, runtime/entry settings and checklist. Preview/validate and manage independent starting content, never learner projects. |

Create Project, choose template, file history, restore, conflict choices and deletion are dialogs/panels inside these destinations. Opening a Course Workspace reuses the same project route and editor; the project’s verified scope chooses its storage allowance and Back to Course destination.

**Journeys:** personal catalogue → create/select → edit/save → Run/Preview → checklist plus explicit completion → download. Course project lesson → existing/new assigned Workspace → return to course. Template author → edit files → deliberate validation → publish; later edits do not rewrite learner copies.

**Shared in Build:** file/editor/terminal/preview components and safe upload/download behavior. Retain the 40-file/20 MB project limit, fixed runtime, text-only terminal input files and nonempty completed-checklist gate. No learner-project administration, hosting, collaboration or repository-import pages.

## 5. Assessments

**Owner:** Assessments. Mock and Company are distinct page families using one recorded-test capability, including proctoring. [Assessments](domains/Assessments/Assessments.md), [Taking a Test](domains/Assessments/Taking%20a%20Test.md), [Results](domains/Assessments/Results.md), [Authoring](domains/Assessments/Authoring.md).

### Entry and Mock Tests — learner

| Route | Page or addressable view | Brief |
|---|---|---|
| `/assess` | Assessment entry | Enter the clearly labelled Mock or Company area. Opening it starts no test. |
| `/assess/mock` | Mock catalogue | Search/filter Mock papers, inspect featured items and choose the correct Start, Resume, Practice or Result action. |
| `/assess/mock/history` | Mock history | Read the learner’s recorded Mock results, invalidations and retained summaries; open a result. |
| `/assess/papers/:paper` | Mock paper details | Read the Mock instructions, sections, marks, negative marking, timing and current settings; obtain the authoritative next action. |

### Company Tests — learner

| Route | Page or addressable view | Brief |
|---|---|---|
| `/assess/companies` | Company catalogue | Find a company and inspect its available papers and permitted preparation summaries. |
| `/assess/companies/:company` | Company page | Read company roles, papers, Actual/Pattern information and its readiness/progress; open a paper briefing. |
| `/assess/company/history` | Company test history | Read the learner’s recorded Company results and statuses without introducing Mock pass/fail rules. |
| `/assess/papers/:paper/briefing` | Company paper briefing | Read instructions, timing, marks, availability, provenance and proctoring before Start. No question or attempt is created by opening the briefing. |

### Common test views — learner

| Route | Page or addressable view | Brief |
|---|---|---|
| `/assess/papers/:paper/preflight` | Pre-test systems check | Check the required capabilities and read pass, warning or could-not-check states. Recheck or explicitly acknowledge actual warnings; no test starts here. |
| `/assess/papers/:paper/acknowledgement` | Test conditions acknowledgement | Show the required recorded-test conditions for either type. Acknowledge and explicitly Start, or leave without creating a test. |
| `/assess/tests/:test` | Recorded test | Answer/save, navigate under captured rules, Run permitted coding samples and Submit. Preserve deadline, proctoring and account-level restrictions across refresh. |
| `/assess/results/:test` | Assessment result | Show grading, final or invalidated status; open permitted review, history or practice. Retained summary and withheld review are different states. |
| `/assess/papers/:paper/practice` | Unrecorded paper practice | Practise the eligible paper without a recorded-test clock, proctoring events, rewards or skill evidence. Do not silently create a second recorded attempt. |

A paper’s verified type selects its entry view and policy. Both types keep proctoring settings; event recording Off does not remove the recorded-test help/Notes restrictions. Question navigation, answer review and submission confirmation are parts of the test/result, not new routes per question.

### Common paper authoring — admin

Reach the existing paper list from the Mock or Company section with that type selected; these are views of one list, not duplicate admin applications. The persisted paper type selects its fields and remains authoritative.

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/assessments/papers` | Manage papers | List/create Mock or Company papers, select the correct type and open its authoring workspace. |
| `/admin/assessments/papers/:paper` | Paper authoring | Manage the paper’s details, sections, timing, marking, navigation and questions. Draft saves do not publish; live edits protect existing attempts. |
| `/admin/assessments/papers/:paper/questions` | Question-authoring view | Edit supported question types, keys and explanations; use the shared code editor for coding starters, references and cases. Questions stay owned by the paper. |
| `/admin/assessments/papers/:paper/import` | Question import | Template, upload or paste a bounded batch; validate every row and commit all or none under the paper’s type and safe-update rules. |
| `/admin/assessments/papers/:paper/checklist` | Validation view | Inspect current blockers and reference checks, correct them and publish/update with permitted authority. A stale or unavailable check is not a pass. |
| `/admin/assessments/papers/:paper/published` | Live paper view | Inspect the current published content and return to editing. Read-only preview is not a permanent publication freeze or a required duplicate-to-correct workflow. |
| `/admin/assessments/papers/:paper/settings` | Paper settings view | Edit the same paper’s permitted settings and relevant change-notice/fresh-test options. Apply live changes only as Super Admin. |
| `/admin/assessments/papers/:paper/accommodations` | Accommodations | Super Admin grants the approved pre-start time accommodation; do not add medical uploads or change an active test’s duration. |
| `/admin/assessments/papers/:paper/analytics` | Paper analytics | Inspect the applicable aggregate paper/question figures. Render the paper’s type-specific measures without adding a score editor. |
| `/admin/assessments/tests/:test/recorded-events` | Recorded-event review | Admin/Super Admin inspect the permitted factual event timeline and ending. No recording, source code or inference of motive. |
| `/admin/assessments/tests/:test/invalidate` | Result invalidation | Super Admin selects a permitted reason and explicitly confirms the existing invalidation/restored-attempt consequences. No manual score choice or generic re-grade. |

### Company organization — admin

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/assessments/companies` | Manage companies and roles | Create/select companies, maintain job roles, identity and marking defaults, and reach company-owned papers. Job roles are not account permissions. |
| `/admin/assessments/companies/:company/analytics` | Company analytics | Read aggregate company/paper preparation figures and open their owning paper review. This is internal administration, not an employer portal. |

**Journeys:** Mock catalogue → details, or Company catalogue → company → briefing → systems check/conditions → explicit Start → saved answers → one ending → result. Admin paper → questions/code/cases → validation → publish/update. These routes can be addressable views of the same paper workspace; their existence does not mandate a multi-screen wizard.

**Shared in Assessments:** one answer/timer/proctoring/result capability and shared coding controls. Company grouping/section behavior and Mock navigation/reward rules remain distinct. Course quizzes and Debug windows do not use a recorded Assessment merely because they are timed.

## 6. Personal

### Profile & Settings

[Profile](domains/Profile/Profile.md), [Settings](domains/Profile/Settings.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/profile` | Profile | Read the private identity summary, owner-supplied statistics, activity, certificate collection and recent solutions. Open detail with its owner; refresh without blanking good data. |
| `/profile/settings` | Settings | Open the existing six-section settings experience. Each setting has its own save state; no global Save All or reset-everything control. |
| `/profile/settings/notifications` | Notification settings | Open the notification section and its seven switches, including the mandatory course-change exception. |
| `/profile/settings/appearance` | Appearance settings | Open theme/mode, navigation, accent, typeface, editor/terminal palette and reduced motion. The header switcher shares this preference. |
| `/profile/settings/companion` | Companion settings | Choose Present/Quiet and Companion/Plain, name/reset WizBit and replay orientation. This is not a general chat page. |
| `/profile/settings/certificates` | Certificate settings | Set/propose the certificate display name and use the collection’s visibility controls. Certificate policy remains owned by Certificates. |
| `/profile/settings/account` | Account information | Read WordPress-derived identity, normalized role, membership and session facts; use the main site for identity, passwords or billing. |
| `/profile/settings/data-privacy` | Data and privacy | Read local-state disclosures and policy links; request/cancel learner erasure in its permitted window and inspect actual status. |

The six section routes open the same Settings page at that section, not six unrelated forms. Profile owns no independent staff editor. Its support, erasure and certificate decisions link to the owning pages elsewhere in this map.

**Journey:** account menu → Profile/Settings → owning detail or permitted setting → confirmed result. Do not make a local preference update a WordPress role change.

### My Solutions

[Solutions](domains/Practice/Solutions.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/solutions` | My Solutions | See the four origin categories, saved-entry totals, difficulty counts and retention explanation. |
| `/solutions/:type` | Solutions category | Browse the selected Challenges, Daily, Tracks or Debug collection; use the supported search, difficulty, paging and list/grid presentation. |
| `/solutions/entry/:entryId` | Accepted solution | Read this learner’s retained accepted code, captured solve facts and available authored explanation. Return to its owning problem for more practice. |
| `/solutions/entry/:entryId/compare` | Solution comparison | Read the learner’s code beside the current same-language editorial/debrief. Explain expired source or unavailable authored content honestly. |

The `:type` value is one of the four domain-approved origin keys; arbitrary values are refused. Literal `entry` routes take precedence. Post-acceptance selection opens the exact owned entry or selects it in its category; it does not depend on a current list position.

**Admin:** no learner-code collection or source viewer. Editorial authoring lives with Challenges, Tracks, Daily or Debug, not in Solutions administration. Generated analysis, when enabled and permitted, stays an inline panel on the owned entry.

**Journey:** accepted problem → saved entry → optional comparison → original problem. No Run, Submit, editing or public share page is added here.

### Certificates

[Certificates](domains/Certificates/Certificates.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/profile/certificates/:certificateId` | Certificate and pending-name entry | Open the owned certificate context from completion or a notice; resolve a genuinely missing name and show its actual issuance state. |
| `/profile/certificates/:certificateId/detail` | Certificate detail | Read the selected owned credential; download when valid, copy verification and use Hide/Show under the owner’s rules. |

**Public**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/certificates/verify/:identifier` | Public certificate verification | Verify the identifier without sign-in using only the approved public fields and status. No learner profile, email, marks or staff reasons. |

The lifetime collection is a Profile/Settings region. Do not add a competing standalone certificate collection just to make a sidebar group symmetrical.

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/certificates` | Manage certificates | Search/filter permitted certificate records and open the appropriate support/credential action without manufacturing an award. |
| `/admin/certificates/name-corrections` | Name-correction decisions | Super Admin approves/rejects the learner’s exact current proposal with the required history. Approval is not automatic reissue. |
| `/admin/certificates/parked-generations` | Failed generation recovery | Show failed certificate-generation work and its safe diagnostics. Super Admin retries the existing credential through its specific recovery action. |
| `/admin/certificates/:certificateId` | Certificate record | Inspect permitted private record/status history; Super Admin can use the approved reissue, revocation and generation actions. |
| `/admin/certificates/:certificateId/revoke` | Revoke certificate | Super Admin confirms a permitted revocation reason. This is not ordinary course editing, name correction or Delete certificate. |

**Journeys:** eligible course completion → waiting name/generation → owned certificate → download/public verification. Name proposal → staff decision → separately confirmed reissue when needed. Ordinary course edits and content deletion do not rewrite an issued credential.

### Quick Notes

[Quick Notes](domains/Notes/Quick%20Notes.md).

**No standalone learner or admin route.** The shell toggle, keyboard shortcut and Home’s My Notes card open the same private scratchpad; mobile uses its existing sheet. Loading, typing, autosave, supersession and recovery happen inside the panel. It remains absent in Workspace, Administration and recorded tests. No note list, export page, lesson notebook or staff inspection is introduced.

### Topic Requests

[Topic Requests](domains/Topic%20Requests/Topic%20Requests.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/requests` | Your Requests | Read the learner’s own submitted requests and status, withdraw a Pending request under the approved Archive rule, and open fulfilled content. |

Request creation is a contextual dialog on eligible catalogue/content pages, not a generic request-creation route. Its area, safe context and restrictions come from the invoking page. No learner text-search, attachment, request editing or public request directory is added.

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/topic-requests` | Review Topic Requests | Search/filter permitted request text, follow the status graph, maintain the private team note and attach accessible fulfilment content. No rewriting or deleting the learner’s request. |

**Journey:** eligible page → contextual request → durable acknowledgement → Your Requests → status/fulfilled content. Staff queue → review → permitted status/referral → notification. The cross-source Content Gaps view is listed once in global oversight.

### Economy — rewards and Credits

[Economy](domains/Economy/Economy.md), [Credits](domains/Economy/Credits.md), [Administration](domains/Economy/Administration.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/achievements` | Achievements | Read earned/in-progress recognition and its actual requirements. No claims, custom goals, ranking or badge-authoring controls. |
| `/xp-history` | XP history | Read the learner’s own awards, reversals and corrections in their existing order. |
| `/credits` | How Credits Work | When generated help is enabled, read available Credits, allowance rules and next refresh. This is not a purchase, transfer or request-more page. |
| `/credits/history` | Credit history | When enabled, read the learner’s allowance, spend, release/expiry and correction history. Keep it distinct from XP. |

Header balances, a problem’s reward line and insufficient-Credits feedback are shared displays on their host pages, not additional destinations. While generated help is off, hide the priced actions/Credit surfaces and refuse their inactive use without creating empty promotional pages.

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/economy/configuration` | Economy configuration | Super Admin previews and applies the approved bounded reward/allowance/price settings. Historical awards and active captured terms retain their policy. |
| `/admin/economy/correction` | Accounting correction | Super Admin repairs one verified incident with current/proposed totals and a reason; no discretionary gift or score editor. |
| `/admin/economy/failed-rewards` | Failed reward recovery | Read failed delivery and retry an original reward occasion as Super Admin without paying it twice. |
| `/admin/economy/operations` | Economy operations | Read safe aggregate delivery and Credit-use figures, not learner rankings or private code. |

**Journeys:** qualifying domain outcome → Economy’s recorded award → history/recognition. Enabled generated action → quoted price → confirmation → one hold/settlement → Credit history. No achievements-administration route.

**Shared in Personal:** owner-provided collections, read-only editor, history lists, settings controls and permitted confirmations. Personal is not a global state store; each record remains with its owning domain.

## 7. Platform

### WizBit

[WizBit](domains/WizBit/WizBit.md), [Guidance](domains/WizBit/Guidance.md), [Messages](domains/WizBit/Messages.md), [Generated Help](domains/WizBit/Generated%20Help.md), [Administration](domains/WizBit/Administration.md).

**Learner: hosted experiences, not a `/wizbit` route.**

| Experience | Host and purpose |
|---|---|
| Fixed companion corner / Plain messages | Eligible learner shell; show approved facts and the same assistance under the saved presentation preference |
| Page guide and authored hints | Current eligible page; present the page owner’s guidance without inventing content or changing its hint rules |
| Product-help panel | Open from the companion; answer from authored guidance/knowledge or explain uncertainty/unavailability |
| First-run orientation | Home; introduce the approved landmarks, allow Skip and replay from Settings |
| Generated-help answer | Inline in the permitted Code Lab, Workspace, lesson or owned Solution; absent while the capability is off |
| Companion preferences | Reference the existing `/profile/settings/companion` section; do not duplicate it |

Recorded-test suppression applies across tabs and presentations. No learner companion appears in Administration. Essential system warnings/confirmations are not dependent on the character.

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/wizbit/kb` | Knowledge-base authoring | Create/edit authored answers, synonyms, tags and rule references; review stale entries and use the fixed role-based publication lifecycle. |
| `/admin/wizbit/kb-administration` | Knowledge matching controls | Super Admin previews and changes bounded matching controls against the private authored evaluation set. No learner-question transcript. |
| `/admin/wizbit/responses` | Response authoring | Prepare the complete approved message set, preview Companion/Plain and restore a previous set into a draft; Super Admin publishes validated wording. |
| `/admin/wizbit/identity` | Character presentation | Super Admin chooses approved artwork/accent covering all expressions and safe fallbacks. No default-name editor or skin shop. |
| `/admin/wizbit/nudges` | Nudge controls | Super Admin reduces/disables the approved producer or lengthens its permitted cooldown. No new promotional producers or relaxed ceilings. |

**Journeys:** eligible page → requested authored help → answer/clarification/real failure. Staff edit → preview/validate → publish the relevant help content. Aggregate usage belongs in permitted operational reporting; no new chat-history or AI-configuration page.

### Notifications

[Notifications](domains/Notifications/Notifications.md), [Broadcasts](domains/Notifications/Broadcasts.md).

**Learner**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/inbox` | Notifications inbox | Read/filter/page owned notices, mark read/unread, open valid destinations and perform the approved row/whole-view clearing actions. |

The bell, unread badge and preview panel are shell controls; Home announcements are read-only. Preferences use `/profile/settings/notifications`. There is no route per notice and no separate inbox per domain; opening a row leads to its owning destination.

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/broadcasts` | Broadcast composer | Super Admin writes and previews a System announcement, checks the audience estimate, confirms Send and can stop remaining delivery. |
| `/admin/broadcasts/history` | Broadcast history | Read recorded sends and aggregate delivery/stop counts. No sent-message editing, recall, arbitrary resend or recipient-read tracking. |

**Journeys:** domain event → eligible inbox item → owning page. Composer → preview/confirm → background delivery/history. Mandatory course-change delivery remains distinct from optional broadcasts and other System notices.

### Shared runtime information

[Languages](shared/Languages.md), [Execution](shared/Execution.md).

**Admin**

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/language-registry` | Runtime availability | Read the one platform runtime catalogue, readiness, offered operations and bounds. This shared read supports all authoring areas and is not a Code Lab admin editor. |

Runtime configuration/rehearsal remains the approved operational responsibility. This read-only page cannot create a private language catalogue or publish an unverified runtime. The shared shell, theme switcher, system confirmations and transient notices are components, not further pages.

## 8. Administration — global work only

Domain-owned admin pages are listed with their groups above. These pages host only the cross-domain capabilities Administration actually owns. [Administration](domains/Administration/Administration.md), [People](domains/Administration/People.md), [Content](domains/Administration/Content.md), [Operations](domains/Administration/Operations.md), [Reports](domains/Administration/Reports.md).

### Operations and people

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin` | Operations hub | Read published service/job health, the defined attention strip and links to the owning management/recovery pages. Do not recreate their controls or probe services on every visit. |
| `/admin/people` | People directory | Search permitted identity facts and filter WordPress-derived role, membership and standing; open an audited support record. |
| `/admin/people/:identity` | Person support view | Read allowed identity/access/progress/standing history and reach permitted actions. Neither staff role can inspect private Notes, code, files or terminal content. |
| `/admin/people/:identity/suspend` | Suspend access | Super Admin confirms the identified person, reason and permitted duration. Apply Access’s existing session/test consequences. |
| `/admin/people/:identity/lift-suspension` | Lift suspension | Super Admin identifies the active suspension and records the reason for early restoration. |
| `/admin/people/:identity/ban` | Ban access | Super Admin confirms the exact person and reason. Do not alter the main-site purchase or invent a test score. |
| `/admin/people/:identity/unban` | Unban access | Super Admin performs the typed restorative confirmation and attribution; the approved no-reason exception remains. |
| `/admin/people/:identity/payment-reversal` | Confirm payment reversal | Super Admin records the main site’s completed reversal reference and reason. This neither processes payment nor creates a billing console. |
| `/admin/people/:identity/reset` | Progress reset | Super Admin previews exact selected-scope impact, confirms and reads the actual operation result. Preserve the approved files, awards, solve facts and certificates. |
| `/admin/identity-delivery` | Main-site verification recovery | Read unapplied/unverified main-site changes and invoke the permitted retry as Super Admin. No role assignment or private-inbox access. |
| `/admin/maintenance-windows` | Maintenance windows | Super Admin declares affected capabilities and timing; read actual health-based progress/end. No Force healthy shortcut. |

### Publication oversight, classification and governance

| Route | Page or addressable view | Brief |
|---|---|---|
| `/admin/submissions` | Publication submissions | Read the permitted cross-domain approval queue and open a specific submitted draft. Domain editors remain in their own groups. |
| `/admin/submissions/:submissionId` | Review publication submission | Super Admin compares the exact submission and its current validation/impact, then approves-and-publishes or rejects with a reason. |
| `/admin/reports` | Content-report queue | Review reported existing content and its permitted status transitions/outcomes. Open the owning editor for a correction, rather than edit all domains here. |
| `/admin/vocabulary` | Skills and topics | Super Admin creates, label-corrects, archives or merges classifications with impact checks. Display language/difficulty information without another editable copy. |
| `/admin/import/:kind/:id` | Contextual import view | Open the existing shared importer only for an allowlisted destination kind and owned identity; validate/commit through that domain. No central problem bank or new supported import kind. |
| `/admin/provenance` | Content source defaults | Manage permitted shared authorship/rights defaults for authored containers. Effective item records remain tied to their content owner. |
| `/admin/provenance/:kind/:id` | Content source record | Read/prepare the permitted source and rights information for a specific authored item; Super Admin applies protected changes under its owner’s rules. |
| `/admin/content-gaps` | Content Gaps | Read Asked for and Searched for but not found as separate safe aggregate sources. Link to Topic Requests or WizBit authoring; do not merge their records. |
| `/admin/lifecycle` | Erasure and retention holds | Read deletion progress and scoped holds; Super Admin initiates the permitted administrative erasure or places/releases a hold. Learner requests require no staff approval. |
| `/admin/audit` | Audit history | Read the permitted immutable trail by actor, target, action and date. No editing/deleting history or private learner-source export. |

These source-backed shared oversight tools do not relocate domain authoring under Administration. A Practice import/approval link enters the exact destination’s context; returning goes to that domain’s editor. Certificate, Economy, Assessment and WizBit actions link to their existing entries above.

**Journeys:** operations issue → owning recovery page; content report → owning editor → recorded resolution; submitted draft → exact review → publish/reject; People → authorized consequence → confirmed result/history. Confirmation routes display forms only; opening a URL performs no destructive action.

No local role grant/remove pages, permission editor, learner impersonation, general SQL console, private-code viewer, arbitrary badge builder, category editor or AI activation dashboard.

## 9. Access and common status pages

**Owner:** Access and the shared status presentation. [Access](shared/Access.md), [Interface](shared/Interface.md).

These sit outside the normal activity pages. The device theme/mode choice remains available without revealing private state.

| Route | Page or addressable view | Brief |
|---|---|---|
| `/handoff` | Main-site handoff | Receive and validate the one-time main-site return; show progress, an attended-device wait, refusal or a recoverable verification failure. No Labs password form. |
| `/restricted` | Access restriction | Explain the verified access/restriction outcome and permitted main-site next action. Never expose private staff reasons or assume missing membership after a failed check. |
| `/unavailable` | Service unavailable | Show a genuine platform failure with a safe retry/escape route and no invented account or content state. |
| `/not-found` | Not found | Use the same privacy-safe response for missing, hidden or another person’s private object. |

An unmatched route renders the same Not found behavior. An unmatched `/admin/*` path uses the permitted console/not-found treatment without revealing protected navigation. These are route fallbacks, not additional functional pages. Public certificate verification is listed once under Certificates.

Sign-in/sign-up, password and identity changes, billing/renewal, contact, privacy, terms and consent pages belong to WordPress/main-site destinations supplied by integration configuration. Do not invent local routes or hard-code their external addresses. Main-site sign-out and session-ending behavior stay with Access.

## 10. Deliberate route adaptations and non-pages

These are bounded page bindings for already-approved behavior, not additional product features. Parameters may keep the implementation’s established spelling; changing a placeholder label alone does not create a new route.

| Source address or missing binding | Mapping for this product | Reason |
|---|---|---|
| `/learn/courses/:course` | Use `/learn/subjects/:subject` for both formats | One subject hierarchy and overview, without a second course/module family |
| `/learn/courses/:course/changes` | `/learn/subjects/:subject/changes` | Both learning formats need their approved published-change history |
| `/admin/courses/:content/groups/:group` | `/admin/courses/:content/chapters/:chapter` | Chapters are the approved second level in both formats |
| Track entry reused `/practice/challenges/:challengeId` | `/practice/tracks/:trackId/problems/:problemId` | A Track problem is an independent owner-bound item, not a standalone Challenge reference |
| Signed-in shareable draft preview has no dedicated source-router entry | `/learn/previews/:previewId` | Give the approved scoped, expiring and revocable preview a reachable read-only destination |
| Source Build entry combined Code Lab and projects | Retain `/build` for Workspace collection links; put the existing `/build/code-lab` entry under Practice | Grouping changes without an unnecessary Code Lab URL rename |
| `/admin/debug-detective-maintenance` | Delete confirmation inside normal Debug administration | The approved CRUD policy removes the maintenance-only deletion restriction |
| `/admin/people/:identity/roles/grant` and `/roles/remove` | No Labs route | Staff roles are assigned only in WordPress |
| `/admin/people/:identity/end-session` | No standalone session-management page added | The approved People actions govern restrictions; their required session endings remain Access behavior |

Do not infer redirects from this comparison table. This is a greenfield route map; compatibility redirects are needed only for links the product actually promises to preserve. Existing published content-address changes still follow their owning redirect rules.

The source paper checklist/published/settings views and course publish/settings/retirement views are retained as **addressable views**, not instructions to build duplicate forms or force an admin to visit every URL. The detailed workflow pass can embed them in the same editor. Source “published” never restores an immutable-content rule.

### Important interfaces without another route

| Interface/action | Where it stays |
|---|---|
| Create subject/chapter/problem/track/template/company/project | Its owning list/tree dialog or editor; saved identity opens an existing detail route |
| Track child code, Daily draft and template file selection | Within the owning authoring page; selection must not be lost on the approved recovery path |
| Save, validation results, publish/update, unpublish/archive/delete confirmation | The initiating editor; no action is performed simply by opening a link |
| Skill evidence and explanations | Skills panels using the owner’s facts |
| Quick Notes | One private panel/sheet on eligible pages |
| WizBit guide/help/orientation and generated responses | The existing eligible host page |
| Bell preview and unread badge | The application shell |
| Assessment question palette/review and section briefings | Recorded test or result view |
| Project file tabs, version history, conflict recovery, checklist and downloads | Project workspace or catalogue |
| Certificate name/visibility and owned collection | Profile/Settings or the selected Certificate entry |
| File/media downloads, video streams, executor frames and backend endpoints | Services/actions, not extra product pages |

Filter values, selected tabs, years, rows and pagination may use validated URL state where useful. That state cannot select arbitrary recipients, grant authority, embed private content, bypass a timer or substitute a different domain’s object. Reuse source keys where they already exist; this map does not create query-driven new features.

## 11. Shared boundaries across the groups

| Reused capability | Consumers | What remains separate |
|---|---|---|
| Code editor and output controls | Learner and staff coding across Practice, Build, Assessments and Learning; read-only Solutions | Buffers, saving, allowed actions and content ownership |
| Practice problem form/workbench | Challenges, Tracks, Daily and Debug | Problems, submissions, reward identities, dates, language locks and timed windows |
| Recorded-test capability | Mock and Company | Their catalogues, grouping, navigation policy and type-specific figures/rewards |
| Learning hierarchy/authoring | Lessons and Video Courses | Content players, completion and award policy |
| Project workbench | Personal/Course Workspaces; staff template authoring reuses its controls | Learner projects, assignment completion and template source |
| Readable results/cards/lists | Overview, Personal and domain pages | The producing owner’s formula, privacy and update policy |
| Authoring/import/approval controls | The explicitly supported domain types | Which fields/actions exist and which records may change |
| Notifications and help hosts | Eligible pages across groups | Originating event, preferences, suppression and permitted context |

A group is not permission for lateral imports, cross-domain SQL, a global store or a central problem bank. The same URL prefix is not proof of shared ownership, and different prefixes are not a reason to copy a component.

## 12. Navigation and workflow checks

For every delivered page, verify direct entry, permitted normal entry, reload, Back/Cancel and its role/ownership boundary. Keep literal paths such as `past`, `history`, `approvals`, `entry` and `transfer` from being interpreted as object identifiers.

Do not lose a dirty code buffer on an internal tab, background refresh, route change or required re-verification. Apply the owning recovery/confirmation rule. A save acknowledgement covers the submitted revision, not later typing. No old validation pass authorizes modified code/cases. These checks apply equally to administrator code and learner work.

A displayed page is not proof that its workflow works. Exercise Create → edit/code → validate → publish → learner use, plus the important failure and duplicate-action branches. Preserve real service failures, unavailable figures, retained history, once-only results and hidden-material protection. Never silently substitute a Demo interaction for approved behavior.

This map creates no new implementation tasks, runtime registry or feature-ID ledger. Use the active group/domain section plus its referenced workflow; do not make every coding session read the whole file.

## Extraction basis

The source was pinned at `SideSwipeTech/Sprinkle-Jelly` commit `adb5aaa524fd210d71bc05a2d5437998d0c55fb1`. Routes were read from [the application router](https://github.com/SideSwipeTech/Sprinkle-Jelly/blob/adb5aaa524fd210d71bc05a2d5437998d0c55fb1/frontend/src/routes.tsx) and checked against the relevant [domain page descriptions](https://github.com/SideSwipeTech/Sprinkle-Jelly/tree/adb5aaa524fd210d71bc05a2d5437998d0c55fb1/docs/domains). Current domain/shared documents at the product baseline above take precedence over superseded source behavior.

The extraction covered learner, staff, public/status destinations and hosted panels. The source’s route comments are not treated as accurate page counts; actual route entries and their purposes were used. Demo was not used as the behavior or route authority. No browser execution, access test or implementation verification is claimed by this document.
