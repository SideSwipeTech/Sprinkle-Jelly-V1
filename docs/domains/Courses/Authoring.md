# Authoring

**Status:** Reviewed  
[Courses](Courses.md) · [Lessons](Lessons.md) · [Certificates](../Certificates/Certificates.md)

## Staff capabilities

Staff manage both Lessons and Video Courses using the same **Subject → Chapter → Lesson** structure. The selected format determines the relevant content and completion fields, not a different hierarchy.

This document defines what staff can do and the consequences. The detailed arrangement of admin screens, repeated steps and confirmations will be refined in the platform-wide admin workflow review after the domain features are complete.

Create, read, update and permanently delete content, with Archive and optional Duplicate. Published content can be edited without mandatory archive-and-duplicate steps. There is no Trash or soft-delete workflow. Protect existing learner records and issued certificates as described below.

Staff permissions govern actions, not just whether a menu is visible. Keep a record of who changed content and when. A stale editor must preserve typed work and present the conflict rather than silently overwrite a newer save.

## Subjects and chapters

For either format, manage the title, address name, description, difficulty, tags, icon, catalogue position, estimated duration, skill/topic classification, learning outcomes and orientation information. The orientation reuses these fields; staff do not maintain a second free-form overview with duplicated facts.

Create, name, arrange and remove chapters, then arrange lessons within them. No chapter contains another chapter and no lesson sits outside a chapter. Draft structures may remain incomplete while being authored.

Video subjects have open/sequential navigation, the continuation behavior and required/optional lessons. Their chapters derive progress from required lessons only. Written subjects retain their written-subject completion rules.

Administrators can set explicit prerequisites, choose next-learning links and choose a next course. Show actual completion requirements; do not introduce inferred prerequisites from skill scores, levels or Credits. A course-assigned project cannot itself be a prerequisite target.

## Lessons and content

Choose a lesson type: reading, video, quiz, assigned project or linked activity. Add its title, chapter position, learning outcomes, classification and format-specific content. The learner's reading and video views follow Lessons.

Reading content supports headings, text authored with Markdown/formatted text, note/tip/warning callouts, images, display-only code and executable examples. Code uses the shared editor and platform language catalogue. Custom HTML/CSS/JavaScript animation sections are outside this release.

Video lessons carry the uploaded video, preparation state, captions and transcript. Staff see Processing, Ready or Failed. A long-running preparation remains Processing rather than being labelled successful; the operator is informed after thirty minutes. Staff can replace a failed upload. Do not publish an unready video or a required video without captions/transcript.

Quiz authoring includes its four question types, answer keys, whole marks, optional numerical tolerance, optional timer, shuffle settings, optional pass threshold and authored review-lesson links. Quiz multi-select is all-or-nothing, not Assessment partial marking. Project lessons select an available template and required/optional status; staff cannot invent a project grader or completion override.

Changing lesson type warns about actual type-specific content that will be discarded and names the source and destination types. Do not show a loss warning when there is nothing to lose. Any change must preserve existing completion and award records; type changes are not a hidden progress reset.

### Content bounds

| Item | Limit |
|---|---|
| Subject outcomes | One to eight |
| Published lesson outcomes | One to five |
| Each outcome | 240 characters |
| Heading or optional callout title | 120 characters |
| Formatted text section | 50,000 characters |
| Display or executable source section | 64 KiB |

Shared media, language and upload rules still apply. Reject an exceeded limit clearly without silently truncating the content.

## Saving, preview and recovery

Incomplete drafts can be saved. Show Saved only for work the platform has actually stored; local-only saving is a separate state. A failed save keeps the input and offers a genuine retry. Leaving with unsaved changes is guarded without trapping the author indefinitely.

Autosave protects unfinished work; it does not quietly replace the live lesson. A deliberate Publish or Update makes validated content available. This uses the same item and requires no learner-visible content versions or version selector.

Preview uses the learner presentation and course order, with required/optional work and the initial sequential frontier visible. Preview creates no enrollment, progress, reward or certificate and does not run executable content. A failed preview is explained and does not, by itself, prevent saving or an otherwise valid publish.

A lesson content save keeps a recovery revision when the content differs. Keep at most the newest ten revisions within ninety days. This is bounded author undo, not a promise of unlimited history. Restoring a revision puts it in the editor/draft, not immediately in learners' live content.

Move lessons between chapters without discarding their existing completions or revision history. Duplicate creates a separate lesson without learner completions or copied revision history.

A staff member may share a read-only draft preview with a signed-in person holding its link. It lasts twenty-four hours and can be revoked immediately. It permits no editing, execution or learning records. A revoked preview explains that it is no longer active rather than falling through to the live content.

## Import and export

Import or export a subject draft as one file, up to 10 MiB and 500 lessons. Validate and preview before importing. Show row/field errors and commit the valid import as a whole, not a partly accepted structure. Importing never directly publishes content.

Exports contain authored content and references suitable for editing, not learner progress, Workspace files, personal analytics, provider credentials or unrestricted media. Failure must not produce an unexplained partial export.

## Publishing and updates

Before an item becomes available, validate its structure and content. Show all blockers with the relevant lesson or field, separately from warnings. Warnings alone do not prevent publication; an unperformed validation is Not yet verifiable, not Passed.

Check that a video subject has required work; outcomes and required orientation fields are valid; each published chapter has a published lesson; address names are usable and unique; linked templates and activities exist; required lessons are reachable; and all required media, captions, transcripts and executable languages are ready. Parents must be available before their children. A failed update does not partly replace a valid live subject.

A super administrator publishes directly. An author without direct publishing permission submits for review; approval publishes, rejection returns the draft with a reason, and editing a submitted draft requires renewed review. No automatic approval is introduced. This permission rule does not require a separate screen for every step.

Published content, chapter/lesson structure, learning outcomes and descriptive fields can be corrected on the existing item. Apply the same checks to an update. Keep valid content live while an edit is unfinished. Classification corrections are recorded; changing an address redirects its old address where appropriate.

### Effects on learners

Notify learners with access when a published course changes, including learners who have completed it. Notifications describe the published change, not individual autosaves. Private staff comments, hidden answers and security details are never included. A failed notification does not reverse the update; delivery state is honest and retry follows the shared notification rules.

Keep a readable change record showing what changed, when, by whom and the reason, with a learner-safe summary. Added, Updated, Moved and Removed information supplies the returning learner's Change Brief. Cosmetic changes do not interrupt learning. Staff analytics and private audit material are not exposed in the learner history.

For unfinished subjects, preserve work already completed while showing the applicable current requirements. For subjects already completed, later changes cannot reduce completion or demand additional work to retain the award. Do not reset a completion because a lesson, chapter or subject was renamed, moved, edited or removed.

## Archive and Delete

**Archive** removes content from new discovery and new starts without deleting it. Existing enrolled learners retain the course access and assigned work promised by the enrollment rule, subject to normal account access. Archiving does not reset progress, revoke certificates or send the content back through an editing loop. The archive is not a Trash state.

**Delete** permanently removes selected managed content. It is not restricted to never-published drafts. Explain the affected children, references and learner-facing consequences before confirmation. Preserve earned completions, historical recognition, certificate award information and verification; removing the catalogue item does not erase the learner's account history.

A parent action must identify affected chapters/lessons and avoid broken live references or orphaned learner projects. Do not partly cascade after the selected content has changed underneath the confirmation. If a deletion cannot safely preserve the required records or validate dependencies, explain why and offer Archive rather than silently destroying related work.

Updating, archiving or deleting a course is not certificate revocation and never rewrites an issued document. Award information belongs to the certificate record and remains readable without the live catalogue item. No new certificate is issued simply because the subject was edited.

## Recognition settings

Written subjects can enable certificates; the setting is off by default and is read when completion is first recognized. Enabling later does not back-issue awards and disabling does not remove existing ones. Written-subject XP is the configured subject award; video-subject completion grants no course XP.

Every completed video subject awards a certificate. Staff choose platform-style or course-specific presentation; unset means platform-style. Presentation references must resolve when set. A change applies only to future issuance and never rewrites an issued document. Certificate names and individual award actions are managed by Certificates, not in the course editor.

## Staff insights and feedback

Show aggregate enrollment/start, completion, drop-off and certificate counts, with when the information was computed. Per-lesson content review compares reach and completion. Missing information is unavailable, not a zero. Do not expose learner-written text, rankings, a full personal answer history, version comparisons or frequently-missed-question reports this domain does not retain.

Course content reports and improvement requests reach their owning review/request areas with the relevant subject and lesson. A learner's private Quick Notes are not course-authoring material. Publication and updates retain one coherent change history rather than a second report that can disagree.

## Check these capabilities

Create both formats using the same hierarchy. Save incomplete work, resolve conflicting edits, preview without recording learning, restore a revision, move and duplicate lessons, and import an invalid or oversized file. Test video preparation, missing captions, unavailable templates, unreachable required lessons and role-specific approval. Update a completed subject and verify notification, unchanged completion and unchanged issued certificates. Archive and delete with dependent records and verify the stated consequences without data loss.
