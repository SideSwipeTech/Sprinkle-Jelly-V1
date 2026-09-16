# Audit

**Date:** 17 September 2026  
**Result:** Inventory mapped; consistency corrections required before shared definitions.  
**Product snapshot:** `SideSwipeTech/Sprinkle-Jelly-V1` at `1bb6e7cab9b28868a9e3446821807683aa0ea171`  
**Source snapshot:** `SideSwipeTech/Sprinkle-Jelly` at `86730143eb20074a58bf99e32c21ad5375a8d4b2`

## Scope and outcome

The product has descriptions for all **17 domains**, in **43 domain documents**, plus **Build Phases**. Mock and Company are two types within Assessments. Counting them as separate product areas gives 18 areas, not a missing document. Tracks has independent problems but remains within Challenges & Tracks in the domain count.

This pass reviewed the current product descriptions, their approved changes, the source feature tables and selected detailed source rules at the boundaries where the documents interact. The working feature map assigns a destination and disposition to each of the **542 source feature entries**: **527 domain entries and 15 Access entries**.

A mapped entry means its named capability has a home. It does not certify every sentence of the source, prove implementation, or establish that every edge case works. The substantive conflicts and omissions found are listed below. No application tests, browser walkthrough, load test or security test was run in this documentation audit. The Demo was not treated as a second behavior authority.

**No product feature document, Demo file, role setting or application code was changed by this audit.** Corrections below are proposals against the stated snapshot, not silently applied requirements. Shared definitions have not been started.

## Inventory accounting

| Disposition | Source entries | Meaning |
|---|---:|---|
| Mapped | 470 | Named capability located in the current descriptions |
| Approved revision | 44 | Its wording, ownership or behavior reflects an already-approved change |
| Needs correction or clarification | 11 | Eleven feature entries affected by findings A01–A08; these are not eleven missing domains |
| Shared presentation detail | 1 | Category presentation needs a clear shared home, S02 |
| Removed by approval | 1 | Labs-local role assignment and permission editing; authority is now WordPress-only |
| Access definition pending | 15 | Dedicated shared definition not yet written; already-approved role changes still apply |
| **Total source entries** | **542** | One row per source ID in the working feature map |

The working CSV uses normalized readable feature labels and the original IDs. A destination is the primary reading location, not a claim that no other document participates. Dispositions are mutually exclusive; a revised feature with an identified gap is counted under the gap, with its approved change retained in the note.

### Domain coverage

| Area | Source entries | Product description |
|---|---:|---|
| Courses | 57 | Written |
| Assessments | 57 | Written |
| Administration | 42 | Written |
| Challenges & Tracks | 36 | Written |
| Daily Challenges | 36 | Written |
| Debug Detective | 36 | Written |
| WizBit | 35 | Written |
| Workspace | 34 | Written |
| Notifications | 32 | Written |
| Home / Skills / Progress | 32 | Written |
| Economy | 23 | Written |
| Topic Requests | 22 | Written |
| Code Lab | 21 | Written |
| Certificates | 19 | Written |
| Profile & Settings | 19 | Written |
| Quick Notes | 14 | Written |
| Solutions | 12 | Written |
| Access boundary | 15 | Shared definition pending |

### What these numbers do not mean

542 is a source-reference accounting total, not a newly certified number of unique launch features. The source sometimes counts a capability in its producer and again in a presenting domain. Shared consolidation must not multiply those into independent implementations.

Code Lab's approved Auto language detection is an additional capability absent from its 21-row source table. The header theme/mode shortcut and label-only taxonomy Rename extend existing entries; they need not be counted as new domains or duplicated features. Unified learning hierarchy, independent Track content and mandatory course notices replace or refine existing behavior. Custom interactive-animation sections remain excluded.

Do not publish a final unique-feature total by subtracting document headings or counting repeated controls. The current reliable figures are the 17-domain inventory and the 542-row source mapping, with the dispositions above. Final launch accounting follows closure of this audit and shared-capability consolidation.

## Findings

### A01 — Missing grading material must not become a skipped answer

**Priority:** High. **Type:** Inherited rule conflict. **Feature:** assessments.F08.

[Results](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Assessments/Results.md) groups a coding question with no cases together with a learner who saved no code, treating both as skipped. The [source Assessment engine](https://github.com/SideSwipeTech/Sprinkle-Jelly/blob/86730143eb20074a58bf99e32c21ad5375a8d4b2/docs/domains/assessments/04-engine.md) contains the same clause, but also says missing or irreparable grading inputs cause platform recovery or invalidation rather than an invented learner result.

**Correction:** no learner answer remains an unanswered/skipped response under the existing rules. Missing or unreadable required test cases are a platform/content fault: preserve the acknowledged answer, recover the required grading material, or use the existing platform-failure invalidation rule if it cannot be recovered. Publication checks remain mandatory but are not a reason to classify corrupted/missing material as learner inactivity.

The agreed multi-select arithmetic itself is present and is not being reopened.

### A02 — Course projects must use the approved checklist gate

**Priority:** High. **Type:** Cross-domain detail gap. **Feature:** courses.F30.

[Workspace](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Workspace/Workspace.md) requires at least one task, every task checked and explicit completion confirmation. [Lessons](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Courses/Lessons.md) describes project self-confirmation but does not state that eligibility condition clearly. Its statement that a checklist does not make the decision is compatible with explicit confirmation, but is not enough to communicate the prerequisite.

**Correction:** a course-project lesson completes from its Workspace's valid explicit completion. State the same nonempty/all-checked prerequisite beside that action. Checking tasks alone does not complete the project. Reopening tasks or deleting the workspace does not undo learning completion already earned. No new project grader is introduced.

### A03 — Continue must respect retained access to archived work

**Priority:** High. **Type:** Cross-domain contradiction. **Feature:** skills.F02.

[Home](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Progress/Home.md) says to skip archived Continue candidates. [Courses](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Courses/Courses.md) preserves archived-subject access for existing enrollments, and [Taking a Test](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Assessments/Taking%20a%20Test.md) protects attempts already started when a paper is retired.

**Correction:** Continue returns only work the owning domain confirms is both unfinished and resumable. Archive alone is not a global refusal. Completed work still stays out of Continue; retained historical results do not automatically become resumable work. The owning domain decides, not a second rule in Home.

### A04 — Align remaining staff wording with the fixed role policy

**Priority:** Medium. **Type:** Wording/authority alignment. **Features:** economy.F19, companion.F27.

[Economy administration](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Economy/Administration.md) still says configuration and retry permissions are granted explicitly. [WizBit administration](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/WizBit/Administration.md) uses generic separately-permissioned staff actions. [Administration](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Administration/Administration.md) now fixes those responsibilities to WordPress-derived Admin/Super Admin, with no Labs permission editor.

**Correction:** reference the shared fixed policy. Admin prepares permitted drafts and reviews; Super Admin performs protected live configuration, publication and recovery. Retain per-action checks; do not interpret the new wording as one unprotected admin endpoint. This is not evidence that extra roles have been implemented, and descriptive words such as author or support do not automatically constitute extra roles.

### A05 — Preserve the source's Return to Draft capability explicitly

**Priority:** Medium. **Type:** Feature detail lost in extraction. **Features:** challenges.F23, debug.F21.

The [Challenges/Tracks lifecycle](https://github.com/SideSwipeTech/Sprinkle-Jelly/blob/86730143eb20074a58bf99e32c21ad5375a8d4b2/docs/domains/challenges/03-rules.md) and [Debug lifecycle](https://github.com/SideSwipeTech/Sprinkle-Jelly/blob/86730143eb20074a58bf99e32c21ad5375a8d4b2/docs/domains/debug/03-rules.md) expressly allow published content to return to draft. [Practice authoring](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Practice/Authoring.md) and the new area descriptions list editing, publishing, Archive and Delete, without clearly retaining that separate action.

**Recommendation:** restore an explicit Unpublish / Return to Draft action for Challenges, Tracks and Debug cases. It removes content from new learner access while allowing editing, without removing earned records. Existing draft/code and Debug timed-window protections still apply. It is not a required step for ordinary direct editing. Final Archive remains a different action. Confirm this omission is restored rather than treating silence as approval to remove it.

### A06 — Restore stable Debug case-address behavior

**Priority:** Medium. **Type:** Missing behavior detail. **Feature:** debug.F29.

The [source feature table](https://github.com/SideSwipeTech/Sprinkle-Jelly/blob/86730143eb20074a58bf99e32c21ad5375a8d4b2/docs/domains/debug/03-rules.md) specifies a generated readable address when none is supplied, normalization of an authored address and an unambiguous case destination. [Debug Detective](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Practice/Debug%20Detective.md) does not carry this feature beyond general shared authoring references.

**Correction:** state the source's automatic-address fallback, validation and uniqueness behavior in plain language. Shared address handling can own its implementation later. Do not require every domain to invent its own address-generation policy.

### A07 — Define the Assessment-to-Skills value without changing marks

**Priority:** High before implementing the integration. **Type:** Incomplete product contract. **Features:** assessments.F29, skills.F11.

[Results](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Assessments/Results.md) permits negative per-question marks and partial credit. [Skills](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Progress/Skills.md) expects a qualifying question value in 0–100. The [source measurement rule](https://github.com/SideSwipeTech/Sprinkle-Jelly/blob/86730143eb20074a58bf99e32c21ad5375a8d4b2/docs/domains/analytics/04-engine.md) also refers to a finalized eligible percentage without making this negative-mark conversion explicit in that rule.

**Recommendation to ratify:** Assessment supplies a separate evidence value derived from its own captured grading: `100 × earned question marks / available question marks`, bounded to 0–100. Keep the actual question marks, including a valid negative mark, unchanged in the test result. Explicitly decide the eligibility of unanswered/not-reached questions; do not let Progress infer it. Recommended treatment is zero evidence value for an eligible unanswered question in a valid finalized test, while preserving the unanswered reason and excluding platform-failed/invalidated work. This is a proposal, not an approved scoring or eligibility change.

Before closure, include examples for a wrong-only penalized answer, a partial answer, an unanswered/not-reached answer and a platform failure. No new model, weighting system or extra score is required.

### A08 — Clarify what occupies a running-program slot

**Priority:** Medium. **Type:** Ambiguous shared-capacity wording. **Feature:** workspace.F14.

[Workspace Running](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Workspace/Running.md) exempts idle terminals from a running slot. [Code Lab](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/domains/Practice/Code%20Lab.md) correctly counts a live program waiting for input as active. Without distinguishing an empty terminal panel from a waiting process, those descriptions can be implemented differently.

**Correction:** an editor, completed output or terminal panel with no live program consumes no slot. A live program consumes one until it exits, is stopped or reaches its allowed bound, including while waiting for input. Keep the existing shared limit; do not add a second Workspace counter.

### A09 — Refresh Build Phases after the approved domain work

**Priority:** Medium before implementation. **Type:** Planning/status alignment; not an additional feature entry.

[Build Phases](https://github.com/SideSwipeTech/Sprinkle-Jelly-V1/blob/1bb6e7cab9b28868a9e3446821807683aa0ea171/docs/Build%20Phases.md) still contains draft assumptions and conditional generated-help wording. Generated help has now been explicitly approved as built but initially off. Its no-placeholder/domain-end-to-end rule also needs an explicit prerequisite check before starting a slice whose required Notes, requests, reports or staff controls have a later delivery position.

**Correction:** update the approved scope statements without claiming implementation has started. During phase-detail work, give required producer/consumer capabilities a definite prerequisite or an explicitly linked sequential group. Do not silently use stubs or start parallel domain work. The final administration composition remains late; a domain's required management capability does not.

## Shared work that is expected, not a missing domain

**S01 — Access.** Its 15 reference entries need one current shared definition. In particular, carry forward the three WordPress-derived roles, verified downgrade behavior, membership versus staff entry, one sign-in, same-account takeover/refusal, recorded-test protection and privacy. Do not import superseded local role grants or older eligibility mechanics from the extraction snapshot simply because their old feature IDs remain in the checklist.

**S02 — Common presentation.** Notification categories exist, but their consistent category treatment and broadcast-only authored icon rule need a clear shared home (notifications.F13). This is presentation definition, not a reason to rebuild Notifications.

**Other planned shared definitions:** language capabilities and status, editor controls, execution and evaluation, honest save/error states, safe repeated actions, data-retention terms, publishing/authoring controls, product time and cross-domain facts. Preserve intentional differences: Notes recovery is not Workspace recovery; a course quiz is not a recorded Assessment; Code Lab has no grading; authored help is not generated help.

## Approved direction confirmed in the documents

The checks found the following choices represented: independent problem collections and rewards; shared forms rather than a shared problem bank; learner/admin Solve rates; restored Mock proctoring; the agreed multi-select formula; one learning hierarchy; protected completed learning and issued certificates; mandatory course-change notices; the four Workspace restrictions; the Notes and Topic Request restrictions; the shared header theme/mode choice; fixed-corner WizBit; and WordPress-only User/Admin/Super Admin authority.

The five locally available WizBit files were matched by Git blob hash to their committed versions. Counting the actual tables confirmed **39 message kinds and nine expressions**. This is a document check, not an animation or behavior test.

No whole domain was missing from the product set. The exceptions above concern conflicting wording, omitted feature detail and an incomplete cross-domain rule; they are not a recommendation to restart the product definition.

## Closing this audit

Keep the existing product documents. Make small edits at their owning locations, not a second specification hierarchy. A01–A04, A06 and A08 can be aligned to rules already agreed. Explicitly restore or decide A05, and ratify A07's evidence examples rather than leaving an implementation agent to choose. Refresh A09 during the phase-plan alignment.

Then repeat the affected cross-domain checks and update this report's dispositions. Only after that should shared product definitions consolidate the settled behavior. Admin workflow simplification, Demo-to-feature mapping, Architecture, Rules and phase details follow; none is certified complete by this audit.

The detailed feature map is an audit working attachment, not another document every coding session must load. A corrected document should be verified against the relevant scenario, not merely contain the feature ID.

## Source references

[Source inventory and 542-entry count](https://github.com/SideSwipeTech/Sprinkle-Jelly/blob/86730143eb20074a58bf99e32c21ad5375a8d4b2/reference/extraction/README.md); [Source document index](https://github.com/SideSwipeTech/Sprinkle-Jelly/blob/86730143eb20074a58bf99e32c21ad5375a8d4b2/docs/README.md).

Named feature tables were checked in the source domain documents for Courses, Assessments, Administration, Challenges/Tracks, Daily, Debug, Workspace, Economy, Notifications, Progress, Profile, Notes, Requests, Solutions, Certificates and WizBit. Access uses its 15-row extraction inventory, with current approved decisions taking precedence. Selected detailed checks additionally used the Assessment, measurement, messaging, AI and access rules. This is not a claim that all source technical implementation documents were audited line by line.
