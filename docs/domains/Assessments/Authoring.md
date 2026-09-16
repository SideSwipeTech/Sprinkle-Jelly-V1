# Authoring

**Status:** Reviewed  
[Assessments](Assessments.md) · [Taking a Test](Taking%20a%20Test.md) · [Results](Results.md)

## The staff workspace

One assessment studio manages Mock and Company papers. Choose the type first, then show only its applicable fields. Staff can create, read, update and permanently delete papers and questions, preview and publish, archive and optionally duplicate. Direct editing is available after publication. There is no compulsory archive-and-duplicate correction process, Trash or soft-delete workflow.

Roles follow [Administration](../Administration/Administration.md): User, Admin and Super Admin, determined only by WordPress through Access. Admin prepares drafts, submits changes and reviews factual Recorded Events. Super Admin manages companies, publishes/applies live changes and performs protected operations including invalidation, accommodations and fresh-test grants. Authoring, publication and result changes remain distinct actions under this fixed role policy. No role assignment or per-person permission grant exists inside Labs.

If another edit has made the page stale, preserve the typed work and offer a choice between keeping those edits and loading the saved version. Never silently overwrite a newer save or discard the staff member's input.

## Companies and roles

Create a company with its name and descriptive details, then add the roles associated with it. A role name must be unique within that company, and renaming must not break existing links. These are company job roles, not Labs account roles.

A Company paper always belongs to a company, and its role must belong to that company. The paper's owning company and type remain its identity; direct content editing does not turn a Mock paper into a Company paper or transfer learner history to another company. Changing descriptive information does not rewrite the company/role information of a recorded attempt.

Companies can hold optional default marks and negative-mark amounts. These prefill blank values when a question is created and never change existing questions. The studio says whether company-specific or platform defaults apply. Reset to platform defaults is offered only when custom defaults exist.

A company with published papers or dependent history cannot be permanently deleted. Deactivate it instead: remove it from browsing and availability counts while preserving records. Restoring it returns it to the catalogue. Delete is offered for a company without those dependencies, with a confirmation naming what will be removed. If dependencies cannot be checked, do not guess that deletion is safe. Company deactivation is a visibility control, not a Trash workflow.

## Creating and editing a paper

### Details and settings

Both types need a title, description, sections, questions, duration and marking configuration. Both support browser-proctoring settings: Off, Standard or Strict, the Strict event limit, optional fullscreen and the optional observation categories. Availability can have an opening and closing time. Featured marking affects catalogue ordering, not scoring or readiness.

Mock adds category, difficulty, a passing percentage, navigation controls and optional question/option shuffling. Its description also supplies the learner instructions.

Company adds its owning company, role, year, separate briefing instructions, Actual/Pattern label and section-navigation policy. It has no passing percentage.

### Sections

Add, name, order, edit and remove sections directly. Each carries its subject and an introductory briefing, and can have a suggested duration and a visible-case run allowance. Choose which sections are included in the paper. Changes to a published paper apply only to future starts.

Suggested duration helps pacing; it is not an enforced sectional time limit. No coding-run allowance means unlimited visible-case runs. A configured allowance must be shown to learners.

### Question types

| Type | Staff provide |
|---|---|
| Single-choice | Prompt, options and one correct answer |
| Multiple-choice | Prompt, options and the correct answer set |
| Numerical | Prompt, correct number and the permitted tolerance |
| True/false | Prompt and the correct boolean answer |
| Coding | Prompt, supported languages, appropriate starter/reference material, visible/hidden cases, expected results and execution limits |

Every question also has marks, any fixed negative-mark amount, difficulty and live skill/topic classification. Explanations and target answer time are optional. The answer key must match the question type; a mismatched key is refused. A created question's type is fixed; replacing a question with a different type is allowed through the normal add/remove controls, without duplicating the entire paper.

Quantitative and aptitude questions use these formats. This does not introduce unsupported free-text, essay or manually marked answers.

### Bulk import

Offer a template, file upload and pasted input using the shared question importer. Map questions to section names and validate every row. Show actionable row-specific failures, and either import the whole valid batch or none of it. An over-limit batch is refused whole with the limit stated; do not import only the rows that fit.

Imports use the same validation and history protections as direct editing. Importing into a published paper must not change an ongoing attempt or leave invalid live content. Supported formats and import/export size limits follow the shared import capability rather than a second Assessment-specific format.

## Preview and publish

Staff can preview without creating a learner result, evidence or reward. The readiness checklist reports every failure together rather than stopping at the first.

Check for a usable title, valid positive duration, a correctly ordered availability window, at least one included section and question, positive total marks, valid skill/topic classifications and well-formed answer keys. Coding questions need supported languages, cases and validated reference solutions. Validate every offered language; a check that could not run is **Not yet verifiable**, not Passed.

Mock also needs a valid passing percentage. Company needs its owning company and a matching role. An **Actual** paper requires a dated source and documented permission to reproduce the questions. A **Pattern** paper must not imply those rights or claim to be an employer's actual released paper.

Initial publication follows the shared staff-approval permissions. Publish only after all required checks and approvals pass. Publishing does not permanently lock editing.

**Workflow:** Create → arrange sections → add or import questions → configure → preview → fix readiness failures → publish.

## Direct updates and existing tests

Staff edit the existing paper in its normal form. Questions, options, answer keys, marks, penalties, explanations, sections and settings can be corrected without archiving or duplicating the paper. The same validation applies to direct updates; incomplete changes must not replace a valid live paper or partially alter what a new learner starts. A rejected change preserves the staff member's input and explains what needs fixing.

A saved update affects future starts. An ongoing or completed test keeps the questions, options, correct answers, marks, section order, proctoring settings and timing it started with. Saved learner answers remain attached to that original content. Its result and later review must not substitute newly edited questions or newly edited answer keys.

This requires no user-facing paper version selector or separate change-plan workflow. A normal content edit does not automatically re-grade old tests, grant a fresh attempt or change earned rewards. Genuine result defects use the correction and invalidation rules in Results.

Reveal settings apply when a result is opened: they change whether original answers and explanations may be shown, not what those original answers were or the score. Preserve the Company provenance safeguard: an Actual label can be downgraded to Pattern through a recorded action without changing scores; a finished Pattern attempt must not be relabelled as Actual. A missing label is reported, not guessed.

### Change notice and a fresh test

A staff member can choose to notify learners; the choice is off by default. Confirmation lists each old and new setting, the eligible recipient count and that a sent notice cannot be recalled. If that count cannot be calculated, do not confirm a notification against an invented audience. Routine direct editing does not require sending a notice.

The same settings save may grant a fresh recorded test to learners who had already finalized that paper at the moment of the change. Learners not yet tested or still in progress get no extra grant. Grants do not stack.

A grant requires the notice to remain on. Explain that a new finalized result will replace the previous measured result while keeping the previous result in history. A failed notice delivery does not roll back the settings change or pretend the message reached everyone.

## Archive, duplicate and delete

**Archive** retires a paper from catalogues and prevents new starts. Existing tests finish under their original rules and history stays readable. Archival does not invalidate a score or remove earned history. A paper archive remains final; ordinary corrections use direct editing before retirement rather than an archive-and-republish loop.

**Duplicate** is optional and works from draft, published or archived. It makes an independent draft of the same type with no learner attempts. A Company copy retains its company context and must pass its own checks. Results from the two papers are not merged.

**Edit** is the normal correction path: open → change → validate → save. A calculation bug affecting recorded results follows Results' correction process rather than silently changing historical scores.

**Delete** permanently removes the paper or question from the live authoring/catalogue content. It is not limited to never-published drafts. Before confirmation, identify the object, any dependent content affected, and whether existing attempts/results reference it. Keep the original material required to finish, grade and review those attempts under their normal retention rules; deleting the catalogue item does not delete learner history or invalidate scores. This is retained attempt history, not a restorable Trash item.

Never cascade a deletion into learner results or leave another live paper with broken references. If the platform cannot preserve the required history or validate dependencies, refuse that deletion with a clear reason and offer Archive. There is no surprise loss of learner work and no silent partial deletion.

## Accommodations

Super Admin can assign extra time for a learner and paper before Start: 1.0, 1.25, 1.5 or 2.0 times the normal duration. No assignment is not silently reported as an explicit 1.0 accommodation.

The multiplier changes answering duration, not submission grace, and cannot change mid-test. Requests are handled through the main site's contact route. Labs stores the approved adjustment, not medical reasons or supporting documents, and has no evidence-upload form for this purpose.

## Reviewing and managing results

### Recorded Events

For both Mock and Company Tests, Admin and Super Admin can read the count, ending reason and ordered event timeline, including which observations counted. Off records none; a recorded Off setting must not be presented as missing monitoring data. The timeline is read-only and contains no screen/audio/video capture, clipboard contents or inferred misconduct.

### Invalidation

Super Admin can invalidate a test with a required note. The learner receives a neutral reason; the staff note stays private. The history entry remains, the appropriate fresh test is restored, and Skills/Economy apply the consequences described in Results. Repeating invalidation has no duplicate effect.

Staff cannot assign a new score, select a pass result or manually retry a pending grade. Proven calculation defects follow the bounded correction workflow rather than an arbitrary re-grade.

### Aggregate analytics

Mock analytics include participation, starts/completions, completion rate, average score, pass rate, accuracy, time, score distribution, section averages, daily counts and question usage. Question views include accuracy, skips, measured time, partial marks and reasons to review the question.

Company analytics provide participation, outcome and trend views by paper, question and company, but no pass-rate or pass/fail measure. The overview highlights the lowest completion rates first, breaking ties by the oldest item. Marked-paper exports use the staff paper flag; it is not a judgement of learners.

Outcome figures use finalized recorded tests, not open practice. Staff activity and analytics-exempt learners are excluded. Explain the population each rate uses; no denominator means no figure, not a fake zero. Views and exports remain aggregate, never a learner ranking or employer roster. Exports state their generation time and the shared row limit.

Direct paper edits do not relabel or re-score earlier question outcomes. Where different question content cannot honestly be combined, keep those readings distinguishable rather than presenting a misleading statistic. The original attempted content remains the basis of each recorded outcome.

### Questions that may need review

Six neutral prompts help staff inspect content: unusually low accuracy, unusually high accuracy, frequent skipping, slow answering, frequent partial credit and grading-platform failures. These are advisory signals, not automatic verdicts that a question or learner is bad.

Use the latest ninety days. Rate-based prompts need at least twenty distinct eligible learner tests. Thresholds are accuracy below 25% or above 95%, skipping above 35%, median answering time above 150% of the authored target, partial credit in at least 40% of graded answers, and at least three platform grading failures affecting at least 2% of eligible grading work. No authored target means no invented slow-answer judgement. A reason clears after two consecutive daily checks no longer meet it.

## Key settings

| Setting | Value / allowed choice |
|---|---|
| Test duration | 60 minutes by default; 5–240 minutes |
| Submission grace | 60 seconds by default; 0–300 seconds; never extra answering time |
| Mock passing percentage | 50% by default; 1–100% |
| Proctoring response, both types | Off, Standard or Strict |
| Strict event limit, both types | Three by default; 1–10 |
| Numerical tolerance | Exact by default; nonnegative absolute tolerance or 0–10% relative tolerance |
| Question target time | Optional; ten seconds to sixty minutes |
| Proctoring observation switches | Clipboard/context-menu and restricted-navigation counting are optional and off unless enabled; fullscreen is optional |

Shared limits, notification preferences and retention rules have one owner. Their use here does not create independent copies of platform-wide policy.

### Check this journey

Create both paper types, import a batch with an invalid row, attempt publication with missing coding validation, edit from two staff tabs, and directly change a published question and its marks. Confirm a new attempt receives the changes while an ongoing or completed attempt does not. Grant a fresh test, archive a used paper, permanently delete an eligible published paper without destroying results, and verify unsafe deletion is refused. Check Actual/Pattern honesty, company deactivation/restoration and both types' Off, Standard and Strict proctoring settings.
