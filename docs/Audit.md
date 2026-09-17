# Audit

**Date:** 17 September 2026  
**Result:** A01–A09 approved, applied and rechecked in the affected product documents.  
**Rechecked product content:** `656061a794f8617c486cf6a22f32f9e542dd0a73`  
**Patch base:** `d9ddea965b5ea6e300a7ed9837a806b08e6b553b`  
**Original audit snapshot:** `1bb6e7cab9b28868a9e3446821807683aa0ea171`  
**Source inventory:** `SideSwipeTech/Sprinkle-Jelly` at `86730143eb20074a58bf99e32c21ad5375a8d4b2`

## Scope and result

All 17 domains have product descriptions in 43 domain documents. Mock and Company remain two types within Assessments; counting them separately gives 18 product areas, not a missing domain. Tracks keeps independent problems within the Challenges & Tracks grouping.

The owner approved the audit recommendations, including optional Unpublish / Return to Draft and the Assessment-to-Skills treatment of negative, partial and unanswered question marks. The correction pass changed eleven domain documents and Build Phases. This report records the follow-up; it does not add a new product domain or another implementation-planning layer.

**All nine findings from the original audit are closed at the documentation level.** The eleven source feature entries affected by A01–A08 are marked Corrected and rechecked in the updated working feature map. A09 concerns Build Phases and is not an additional source feature.

The recheck compared the changed wording with the related domain rules and confirmed the intended file-change scope. Arithmetic examples were checked separately. No application, browser, security, load or integration test was run. This is not certification that implementation works or that every sentence in every source technical file has been audited.

Demo, `CLAUDE.md`, `Architecture.md`, `Rebuild.md` and all other unaffected files were preserved. The newly added technical documents were not rewritten or certified by this product-correction pass. No shared-definition files were created.

## Feature accounting

| Disposition | Source entries | Meaning |
|---|---:|---|
| Mapped | 470 | Named capability located in the product descriptions |
| Approved revision | 44 | Already represented with an approved wording, ownership or behavior change |
| Corrected and rechecked | 11 | Previously flagged entries now covered by the corrections below |
| Shared presentation detail | 1 | Notification category treatment and broadcast-only authored icons need their shared home |
| Removed by approval | 1 | Labs-local role assignment/permission editing; roles are WordPress-only |
| Access definition pending | 15 | Dedicated shared Access description is the next stage |
| **Total** | **542** | 527 domain entries plus 15 Access entries |

Every source ID remains represented once in the working CSV. Eleven rows changed disposition; no ID was removed or duplicated. Keep the original finding reference on each corrected row for traceability. The working feature map is a review aid, not required reading for every coding task.

542 remains a source-reference count, not a certified count of unique launch capabilities. Repeated descriptions of the same shared capability must not become independent implementations. Code Lab Auto detection is an approved addition beyond its original table; the header switcher and label-only taxonomy Rename extend existing entries. Final unique-feature accounting follows shared consolidation rather than counting document headings.

## Closed findings

| Finding | Applied rule | Owning documents |
|---|---|---|
| **A01 — Missing grading material** | No saved answer with valid grading material is unanswered. Missing/empty/unreadable required cases are a platform/content fault: preserve acknowledged code, recover the original material, or use the existing genuine platform-failure invalidation. Never score missing cases as learner inactivity. | [Results](domains/Assessments/Results.md#total-and-final-grading) |
| **A02 — Course project completion** | Use Workspace's nonempty, all-checked checklist plus explicit learner confirmation. No course-side bypass or automatic grader. Later task changes/deletion preserve earned learning completion. | [Lessons](domains/Courses/Lessons.md#assigned-projects), [Workspace](domains/Workspace/Workspace.md#checklist-and-completion) |
| **A03 — Continue and archived work** | The owning domain confirms unfinished and resumable work. Retained course enrollment or an existing test can still permit Resume after catalogue retirement; completed/history-only or withdrawn practice content is not made resumable. | [Home](domains/Progress/Home.md#continue), Courses, Assessments |
| **A04 — Fixed staff roles** | Economy and WizBit reference WordPress-derived User/Admin/Super Admin. Protected configuration/publication/recovery is Super Admin-only; Admin has its defined preparation/read work. No local grants or overrides; per-action checks remain. | [Economy administration](domains/Economy/Administration.md), [WizBit administration](domains/WizBit/Administration.md), [Role policy](domains/Administration/Administration.md#fixed-responsibilities) |
| **A05 — Unpublish** | Explicit optional Unpublish / Return to Draft for Challenges, Tracks, track problems and Debug. Preserve identity and earned records; republish with validation and no renewed reward. Debug protects active windows. Daily retains its future-only Unschedule and begun-date rules. Archive remains final. | [Practice authoring](domains/Practice/Authoring.md#unpublish--return-to-draft), Challenges, Tracks, Debug Detective |
| **A06 — Debug addresses** | Generate from the title when no address is supplied, with timestamp fallback when needed. Normalize/validate supplied addresses, reject conflicts and keep one address tied to one case. A title edit does not silently regenerate its established address. | [Debug Detective](domains/Practice/Debug%20Detective.md#readable-case-addresses) |
| **A07 — Assessment evidence value** | Assessment supplies 100 × earned question marks / original available marks, bounded to 0–100. Eligible unanswered/skipped/not-reached questions in a valid finalized test supply zero with their reason. Faulted/pending/invalidated work supplies no invented zero. Actual marks, accuracy and existing Skills weights remain unchanged. | [Results](domains/Assessments/Results.md#skill-evidence), [Skills](domains/Progress/Skills.md#values-weights-and-minimum-evidence) |
| **A08 — Running slots** | A live program still occupies a slot while waiting for input or briefly detached. An editor, completed output or empty terminal panel occupies none. Browser preview remains outside server-running capacity. The shared limit is still three. | [Running](domains/Workspace/Running.md#terminal-and-limits), Code Lab, Lessons |
| **A09 — Build plan alignment** | Reviewed scope, WordPress-only roles, generated help built but initially off, and a required producer/consumer/staff-capability check before each usable slice. Bring a prerequisite forward in its own home or a linked sequential group; never claim a stub is complete. | [Build Phases](Build%20Phases.md) |

The original recommendations and evidence remain available in the earlier [audit revision](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/62e3ee90b536dd3de05c6da82e3d1ded9b9a07d9/docs/Audit.md). They are historical findings, not still-open product choices.

## Recheck observations

### Grading and Skills

The approved multi-select arithmetic was not changed. For a four-mark question with two correct options and a one-mark penalty, the examples remain 4 for both correct, 2 for one correct, 0 for one correct plus one wrong, -1 for wrong-only and 0 for unanswered. A duplicate option counts once. A wrong-only answer with negative marking disabled scores zero. The six-mark mixed-selection example still yields two marks.

The four-mark question supplies Skills values 100, 50, 0 and 0 for full, half, negative and unanswered outcomes respectively. A negative mark remains negative in the Assessment sum. Pending/faulted or unclassified evidence is not supplied as zero, and a nonpositive available-mark denominator is rejected rather than divided. These arithmetic examples passed a local calculation check, not an application test.

### Completion, resume and lifecycle

The document walkthrough distinguishes an empty checklist, an unchecked task, all tasks checked without confirmation, and valid explicit completion. Only the final eligible confirmation completes a project; later workspace changes cannot revoke earned course completion.

Continue distinguishes a resumable archived course or existing test from a completed result and an unavailable practice item. It cannot turn retained history into a new start. Owner unavailability is not guessed permission.

The Unpublish descriptions agree across shared Practice authoring, Challenges, Tracks and Debug. Track parent/child availability stays explicit, content remains independently owned, and republishing does not reset first-solve eligibility. Debug withdrawal protects acknowledged code and restores affected timed allowance. Daily receives no generic date-lock bypass.

### Roles, capacity and plan

Economy and WizBit now use the same fixed staff policy as Administration. The change removes grantable-permission language without weakening action checks or making private learner work accessible.

Workspace and Code Lab now agree that waiting for input is still a running process. Workspace's two-minute detached process also remains a live slot. Neither a completed terminal display nor browser preview is counted as another live server program.

Build Phases still has four sequential phases, one active delivery task and domain-owned prerequisites. The new text closes stale approval wording; it does not claim that detailed implementation dependencies have already been scheduled or that coding/testing is complete.

## Remaining shared work

**S01 — Access:** write the dedicated product definition for the 15 mapped entries, preserving the current WordPress-only roles, verified membership/staff entry, sign-in restrictions, live-test protection, account ownership and known-state versus outage behavior. Do not import superseded local role management.

**S02 — Presentation:** give notification category treatment and the broadcast-only authored icon rule one shared home. The existing inbox is not missing or being redesigned.

Consolidate the other approved common behavior: language capabilities, editor controls, execution, evaluation, content actions, files/media, common interface states, product time, saving, retention and cross-domain facts. Preserve intentional differences: Notes recovery is not Workspace recovery; a course quiz is not a recorded Assessment; Code Lab has no grading; authored WizBit help is not generated help.

These are planned definition tasks, not unresolved A01–A09 decisions. Shared definitions should be discussed before writing, keep simple names and plain language, and reference domain-owned policies rather than clone them.

## What follows

Shared product definitions come next, then the Demo-based admin workflow review, final shared/domain reconciliation, technical-document alignment and focused phase details. The new Architecture and agent instructions already present in the repository are inputs for that later alignment, not a reason to recreate them without review.

The correction pass adds no new domain, central problem library, role, grading model, project grader, feature branch or worktree. Keep the existing structure and move forward from the corrected behavior.
