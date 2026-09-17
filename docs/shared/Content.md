# Content

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Administration content](../domains/Administration/Content.md) · [Practice authoring](../domains/Practice/Authoring.md)

## Purpose and ownership

Content provides reusable authoring controls, validation, publication, imports and safe lifecycle behavior. Each domain owns its authored items, eligibility, changes and learner consequences. Reusing the same form does not create a central problem bank or a second owner inside Administration.

The area opening the form supplies its destination and supported fields. A Challenge can offer several languages; a Track problem uses its Track's one language; Daily adds date/bonus; Debug adds broken code, bug information, timing and debrief. Assessment question types and course lessons show their own controls rather than being forced into one coding form.

## Create and edit

Allow incomplete drafts to save. Preserve typed work after validation failure, outage or a conflicting edit; do not silently overwrite a newer stored draft. Autosave protects editing but does not publish it.

Shared tools appear only where the owner supports them: preview, validation, move/reorder, duplicate, restore an editing revision, imports and exports. A duplicate creates independent authored content without learner submissions, rewards, completion or history. A revision restore returns to editing and must pass current checks before going live.

Titles, descriptions, numbers, collections and file sizes follow the owning bounds. Explain the failing field and value. A shared form cannot bypass platform checks, silently shorten content or substitute guessed defaults after a settings read fails.

## Publication and live updates

**Journey:** Create or edit in the owning area → save → preview/validate → Super Admin publishes directly, or Admin submits for approval → reviewed content becomes available.

The fixed WordPress-derived role policy governs every action. Admin preparation does not create a local author role or permission editor. Approval applies to the exact submitted content and publishes in the same action. A changed submission requires renewed review; a rejection includes its reason and preserves the draft. Super Admin does not approve their own work through a second queue.

Publication and live updates check complete content, supported languages, reference validation, media readiness, required classifications/outcomes and safe dependencies as applicable. A required check that cannot run is not Passed. Keep blockers distinct from warnings and point at their source. A failed update leaves valid existing content available.

Direct validated updates are permitted. Ordinary correction does not require Archive, duplicate content or a new learner-facing version. Safe preview does not create enrollment, learner progress or rewards, and is not an unrestricted execution environment. Explicit reference/template validation is a separate permitted operation.

## Lifecycle actions

| Action | Meaning |
|---|---|
| Save draft | Retain unfinished editing without changing learner availability |
| Publish / Update | Apply valid authorized content to its learner-facing item |
| Unpublish / Return to Draft | Temporarily remove availability while keeping the same editable item, only where supported |
| Archive | Retire content under its owning retention/access rules |
| Delete | Permanently remove eligible authored content, not erase earned learner records |
| Duplicate | Create a new independent item without learner activity |

Challenges, Tracks, their problems and Debug support optional Unpublish. Republish uses current checks and does not re-arm rewards. An unpublished Track blocks access through it while retaining each child's own state. Debug protects active windows and restores affected allowances. Daily can only Unschedule an untouched future date; begun dates keep their locks and Void Daily behavior.

Do not give every object every lifecycle action. Recorded tests, certificates, audit records, requests and delivered notices keep their own non-CRUD rules. Learner projects have permanent Delete but no Archive. Archive restoration is not inferred from Unpublish: use the owning domain's explicit retirement rule.

## Protect existing work

An Assessment attempt keeps its original questions and grading conditions. A completed course or Track remains completed after ordinary changes. Issued certificates retain their award information. Template changes do not rewrite learner projects. Practice content edits do not reprice past solves or merge equivalent problems.

Before destructive parent actions, show the affected children and required dependency/record counts. If a necessary count or protection cannot be established, refuse the action rather than assume it is safe. Protect retained learner history, remove unsafe live references and explain an unavailable target. No soft-delete, Trash or compulsory duplication loop is introduced.

Published course changes generate the approved mandatory notice; draft autosaves do not. Assessment notices/fresh-test grants and other producers keep their different rules. A delivery failure does not reverse a valid publication.

## Classification, prerequisites and sources

Use the shared skill/topic vocabulary and language catalogue. Super Admin can correct a classification label without changing its identity or meaning; Archive/Merge apply their impact checks. Renaming does not merge problems or rewrite old grades. The vocabulary's limits and permitted actions remain in Administration.

Explicit prerequisites list each required completion and the learner's status, with a reachable route. They never derive from XP, readiness, levels or an inferred learning path. Apply them only to supported targets and preserve the owning rules for already-started content. A configuration creating a dead-end required journey cannot be published as usable learning.

Record effective authorship, source and permission information and preserve the published record when a parent default changes. Actual Company material requires the agreed source/permission evidence; Pattern must not imply endorsement. These are content-publication facts, not legal advice or a separate legal-review product.

## Imports, review and checks

Validate the full proposed import, preview supported changes and commit all or none. An oversized or malformed batch names the problem without silently dropping rows. Imports create destination-owned content; no live cross-domain references or learner progress are copied. Exports keep the owner's privacy, bounds and media restrictions.

Report review, topic demand, aggregate quality signals and worked-solution authoring remain with their owning areas. A report does not provide a publication bypass or permission to inspect private learner code.

Check independent duplicate content, stale drafts/approval, failed validation, live edits, Unpublish/republish, Daily locks, Debug recovery, safe parent deletion, retained history, source records and mandatory course notices. The later admin workflow review may simplify the screens, not these agreed consequences.
