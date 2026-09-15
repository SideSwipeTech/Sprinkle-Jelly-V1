# Authoring

**Status:** Draft for review  
[Assessments](Assessments.md) · [Taking a Test](Taking%20a%20Test.md) · [Results](Results.md)

## The staff workspace

One assessment studio manages Mock and Company papers. Choose the type first, then show only its applicable fields. Staff can create, read and update drafts; preview, validate and publish; duplicate and archive papers; manage permitted published settings; and permanently delete an eligible pristine draft. There is no Trash or soft-delete workflow.

Actions require assessment permissions and retain who changed what. The permissions for authoring, invalidating a result and reviewing proctoring events are distinct. The draft default gives paper and company management to the super administrator and Recorded Event review to moderators; other roles need an explicit grant. A role that can view one staff page does not automatically receive every action.

If another edit has made the page stale, preserve the typed work and offer a choice between keeping those edits and loading the saved version. Never silently overwrite a newer version or discard the staff member's input.

## Companies and roles

Create a company with its name and descriptive details, then add the roles associated with it. A role name must be unique within that company, and renaming must not break existing links.

A Company paper always belongs to a company. Its role must belong to the same company; company, role and year are not moved around after publication.

Companies can hold optional default marks and negative-mark amounts. These prefill blank values when a question is created and never change existing questions. The studio says whether company-specific or platform defaults apply. Reset to platform defaults is offered only when custom defaults exist.

A company with published papers or dependent history cannot be permanently deleted. Deactivate it instead: remove it from browsing and availability counts while preserving records. Restoring it returns it to the catalogue. Delete is offered only for an eligible pristine company, with a confirmation naming what will be removed. If dependencies cannot be checked, do not guess that deletion is safe.

## Creating a paper

### Details and settings

Both types need a title, description, sections, questions, duration and marking configuration. Availability can have an optional opening and closing time. Featured marking affects catalogue ordering, not scoring or readiness.

Mock adds category, difficulty, a passing percentage, navigation controls and optional question/option shuffling. Its description also supplies the learner instructions. It has no proctoring configuration.

Company adds its owning company, role, year, separate briefing instructions, Actual/Pattern label, section-navigation policy and browser-proctoring configuration. It has no passing percentage.

### Sections

Add, name, order and remove sections while the paper is a draft. Each carries its subject and an introductory briefing, and can have a suggested duration and a visible-case run allowance. A draft section may be excluded from publication. Once published, the included section set and its order are fixed.

Suggested duration helps pacing; it is not an enforced sectional time limit. No coding-run allowance means unlimited visible-case runs. A configured allowance must be shown to learners.

### Question types

| Type | Staff provide |
|---|---|
| Single-choice | Prompt, options and one correct answer |
| Multiple-choice | Prompt, options and the correct answer set |
| Numerical | Prompt, correct number and the permitted tolerance |
| True/false | Prompt and the correct boolean answer |
| Coding | Prompt, supported languages, appropriate starter/reference material, visible/hidden cases, expected results and execution limits |

Every question also has marks, any fixed negative-mark amount, difficulty and live skill/topic classification. Explanations and target answer time are optional. The answer key must match the question type; a mismatched key is refused. A created question's type is fixed—create the appropriate replacement in a draft rather than silently converting its answer meaning.

Quantitative and aptitude questions use these formats. This does not introduce unsupported free-text, essay or manually marked answers.

### Bulk import

Offer a template, file upload and pasted input using the shared question importer. Map questions to section names and validate every row. Show actionable row-specific failures, and either import the whole valid batch or none of it. An over-limit batch is refused whole with the limit stated; do not import only the rows that fit.

Imports are for drafts, not a way around the published-content freeze. Supported formats and import/export size limits follow the shared import capability rather than a second Assessment-specific format.

## Preview and publish

Staff can preview a draft without creating a learner result, evidence or reward. The readiness checklist reports every failure together rather than stopping at the first.

Check for a usable title, valid positive duration, a correctly ordered availability window, at least one included section and question, positive total marks, valid skill/topic classifications and well-formed answer keys. Coding questions need supported languages, cases and validated reference solutions. Validate every offered language; a check that could not run is **Not yet verifiable**, not Passed.

Mock also needs a valid passing percentage. Company needs its owning company and a matching role. An **Actual** paper requires a dated source and documented permission to reproduce the questions. A **Pattern** paper must not imply those rights or claim to be an employer's actual released paper.

Publication follows the shared staff-approval permissions. Before confirmation, explain which content becomes fixed and which settings remain editable. Publish only after all required checks and approvals pass.

**Workflow:** Create → arrange sections → add or import questions → configure → preview → fix readiness failures → confirm publication.

## Editing after publication

Publication fixes questions, options, keys, marks, penalties, explanations and the included sections/order. Company, role and year are fixed too. This restriction remains a review point in the overview; ordinary CRUD must not silently override it.

| Type | Settings that remain editable |
|---|---|
| Both | Duration, submission grace, availability window, per-question target time, featured marking and description |
| Mock | Title, category, difficulty, passing percentage, reveal settings, navigation features and question/option randomization |
| Company | Separate briefing instructions and its proctoring response/settings |

Company reveal settings are configured in the draft; this list does not silently make them editable after publication. Mock never gains proctoring from a settings edit.

An Actual Company paper may be downgraded to Pattern through a recorded staff action. The label changes on subsequent views, including finished results, without changing scores. Pattern is not upgraded to Actual after publication. If the label cannot be read, explain its absence rather than guessing.

Changes affect later starts, not tests already under way. Reveal settings, where editable, determine what an existing result shows when next opened; they do not change its marks. Invalid values are refused just as on a draft.

### Settings-change notice and a fresh test

A staff member can choose to notify learners; the choice is off by default. Confirmation lists each old and new value, the eligible recipient count and that a sent notice cannot be recalled. If that count cannot be calculated, do not confirm a notification against an invented audience.

The same save may grant a fresh recorded test to learners who had already finalized that paper at the moment of the change. Learners not yet tested or still in progress get no extra grant. Grants do not stack.

A grant requires the notice to remain on. Explain that a new finalized result will replace the previous measured result while keeping the previous result in history. A failed notice delivery does not roll back the settings change or pretend the message reached everyone.

## Archive, duplicate and delete

**Archive** retires a paper from catalogues and prevents new starts. Existing tests finish under their original rules and history stays readable. Archival does not invalidate a score, remove earned history or reopen editing. A paper archive is final; there is no restore-to-draft or Trash path.

**Duplicate** works from draft, published or archived. It makes an independent draft of the same type with no learner attempts. A Company copy retains its company context and must pass its own checks. Results from the two papers are not merged.

**Correct published content:** Archive → duplicate → fix the draft → validate → publish as a new paper. A timing or instruction setting that is expressly editable can instead be changed in place; a calculation bug follows Results' correction process, not an unnecessary content duplicate.

**Delete** permanently removes only a pristine draft whose dependencies allow it. Published content and papers needed by learner records are archived instead. Confirmation identifies the paper and relevant attempt count. When deletion is disallowed, offer Archive rather than a destructive control that repeatedly fails.

## Accommodations

An authorized staff member can assign extra time for a learner and paper before Start: 1.0, 1.25, 1.5 or 2.0 times the normal duration. No assignment is not silently reported as an explicit 1.0 accommodation.

The multiplier changes answering duration, not submission grace, and cannot change mid-test. Requests are handled through the main site's contact route. Labs stores the approved adjustment, not medical reasons or supporting documents, and has no evidence-upload form for this purpose.

## Reviewing and managing results

### Recorded Events

For Company Tests, authorized staff can read the count, ending reason and ordered event timeline, including which observations counted. The timeline is read-only. It contains no screen/audio/video capture, clipboard contents or inferred misconduct. Mock Tests have no proctoring timeline.

### Invalidation

Authorized staff can invalidate a test with a required note. The learner receives a neutral reason; the staff note stays private. The history entry remains, the appropriate fresh test is restored, and Skills/Economy apply the consequences described in Results. Repeating invalidation has no duplicate effect.

Staff cannot assign a new score, select a pass result or manually retry a pending grade. Proven calculation defects follow the bounded correction workflow rather than an arbitrary re-grade.

### Aggregate analytics

Mock analytics include participation, starts/completions, completion rate, average score, pass rate, accuracy, time, score distribution, section averages, daily counts and question usage. Question views include accuracy, skips, measured time, partial marks and reasons to review the question.

Company analytics provide participation, outcome and trend views by paper, question and company, but no pass-rate or pass/fail measure. The overview highlights the lowest completion rates first, breaking ties by the oldest item. Marked-paper exports use the staff paper flag; it is not a judgement of learners.

Outcome figures use finalized recorded tests, not open practice. Staff activity and analytics-exempt learners are excluded. Explain the population each rate uses; no denominator means no figure, not a fake zero. Views and exports remain aggregate, never a learner ranking or employer roster. Exports state their generation time and the shared row limit.

### Questions that may need review

Six neutral prompts help staff inspect content: unusually low accuracy, unusually high accuracy, frequent skipping, slow answering, frequent partial credit and grading-platform failures. These are advisory signals, not automatic verdicts that a question or learner is bad.

Use the latest ninety days. Rate-based prompts need at least twenty distinct eligible learner tests. Thresholds are accuracy below 25% or above 95%, skipping above 35%, median answering time above 150% of the authored target, partial credit in at least 40% of graded answers, and at least three platform grading failures affecting at least 2% of eligible grading work. No authored target means no invented slow-answer judgement. A reason clears after two consecutive daily checks no longer meet it.

## Key settings

| Setting | Draft value / allowed choice |
|---|---|
| Test duration | 60 minutes by default; 5–240 minutes |
| Submission grace | 60 seconds by default; 0–300 seconds; never extra answering time |
| Mock passing percentage | 50% by default; 1–100% |
| Strict Company event limit | Three by default; 1–10 |
| Numerical tolerance | Exact by default; nonnegative absolute tolerance or 0–10% relative tolerance |
| Question target time | Optional; ten seconds to sixty minutes |
| Proctoring observation switches | Clipboard/context-menu and restricted-navigation counting are optional and off unless enabled; fullscreen is optional |

Shared limits, notification preferences and retention rules have one owner. Their use here does not create independent copies of platform-wide policy.

### Check this journey

Create both paper types, import a batch with an invalid row, attempt publication with missing coding validation, edit from two staff tabs, change settings during a live test, grant a fresh test, archive a used paper and attempt unsafe deletion. Check Actual/Pattern honesty, company deactivation/restoration and the separation between viewing events and changing results.
