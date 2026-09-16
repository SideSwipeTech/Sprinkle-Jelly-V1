# Results

**Status:** Reviewed  
[Assessments](Assessments.md) · [Taking a Test](Taking%20a%20Test.md) · [Authoring](Authoring.md)

## Marking

The marking scheme shown before Start governs that recorded test. Each question has marks and may have one fixed negative-mark amount. Unanswered questions are not treated as incorrect answers for negative marking.

| Question type | How the answer is marked |
|---|---|
| Single-choice or true/false | Full marks for correct; a wrong answer earns no marks and receives the configured penalty |
| Numerical | Full marks when within the configured tolerance; otherwise wrong with the configured penalty |
| Multiple-choice (multi-select) | Proportional credit when at least one correct option is selected; only incorrect selections receive the configured penalty once; an empty selection scores zero |
| Coding | Marks proportional to cases passed out of all visible and hidden cases, using the saved code |

### Multi-select scoring

When at least one correct option is selected, multiply the question's marks by **(correct selections minus incorrect selections) divided by the number of correct options**. This proportional result cannot fall below zero, and no additional penalty applies to that partly correct or mixed answer.

When the learner selects one or more options but none is correct, subtract the question's configured penalty once. That question may therefore score below zero. With negative marking disabled, it scores zero. Nothing selected is unanswered and scores zero without a penalty. Repeated selections count once and never change the score.

For a four-mark question with two correct options and a one-mark penalty:

| Learner's selection | Marks |
|---|---:|
| Both correct options, no incorrect options | 4 |
| One correct option, no incorrect options | 2 |
| One correct and one incorrect option | 0 |
| Only incorrect options | -1 |
| Nothing selected | 0 |
| Only incorrect options, with negative marking disabled | 0 |

A six-mark question with three correct options gives two proportional marks when the learner selects two correct options and one incorrect option. A coding answer passing three of four cases earns three quarters of that question's marks.

### Total and final grading

A coding question with no saved code, or no cases, is skipped. Publication and live-edit validation must prevent a coding question without cases from becoming available; no missing test case is invented during marking.

Add the question marks at full precision, round the total once to two decimal places using half-up rounding, and do not let the final total fall below zero. The overall zero floor does not remove a valid wrong-only multi-select penalty before summing the questions. Per-question displays must not change the values used in that sum. Mock pass/fail uses the passing percentage fixed for that test; Company has no pass/fail decision.

Running visible cases while answering is not grading. Final grading checks saved code against the full question case set. If grading cannot currently run, the result waits instead of awarding zero or a wrong answer.

## The result page

| State | What the learner sees |
|---|---|
| Grading | Answers are saved; the result is being prepared. No provisional score, pass/fail, reward, skill evidence or new readiness is presented as final |
| Final | The completed result, its breakdowns and the permitted review |
| Invalidated | A clear reason why the test has no valid result and the restored opportunity to take it |

After thirty seconds waiting for grading, explain that it is taking longer than usual. This changes the message, not the outcome. Leaving the page does not cancel grading; when the service recovers the platform finishes it without requiring a learner or staff Retry grade action. Repeated processing must not duplicate scores, evidence or rewards.

### Mock result

Show the score, percentage, pass/fail against the disclosed threshold, answer counts, time statistics and section breakdowns. The purpose is personal practice feedback. Broader skill judgements and the month-to-month comparison appear in Skills rather than a second competing dashboard.

### Company result

Lead with two summary rings: accuracy and company readiness, followed by difficulty and question-type breakdowns, time information, Actual/Pattern label, permitted review and next actions. There is no pass/fail label or reward at stake.

Accuracy is correct answers divided by answered questions, not all questions. With nothing answered, show no accuracy figure rather than an invented zero percent. Score percentage and accuracy are different measures, especially where partial marks or negative marking apply.

If readiness is being recalculated after a new result, show that it is unavailable while updating. Do not pair a fresh result with an apparently current old readiness figure.

## Reviewing answers and edited papers

The paper controls whether learners can see question review, correct answers, explanations and solutions after finishing. Apply the relevant reveal settings when the result is opened. A reveal-setting change changes visibility, not the recorded answer or score.

A recorded test retains the questions, options, answer keys, marking and supporting material used when it began. Direct paper editing or removal never replaces those with the latest content during grading or result review. Correcting a question for future learners does not silently re-grade a completed test. Existing-result defects follow the separate correction/invalidation rules below.

Review never reveals hidden coding-case material. A withheld review explains that policy rather than looking broken. A result whose older question detail is no longer retained explains that separately; it is not the same as staff withholding review.

A result cannot be opened by another learner. Missing and inaccessible results do not reveal whose result exists. None is a public certificate or employer-facing report.

## Practice and further attempts

Each learner has one recorded test per paper. After it finalizes, unlimited open practice becomes available. This applies to both Mock and Company Tests.

Open practice uses the available paper's questions and sections without a clock, proctoring or Recorded Events. Before beginning, clearly explain that it is unrecorded. It gives immediate temporary score and correctness feedback, follows the same answer-reveal permissions, and allows repeated practice. It adds no history, skills, XP, Credits, achievement or notification. Its answers and temporary score are not promised to survive leaving.

Practice is not available before a recorded test finalizes. Invalidation closes practice until the restored test finalizes. Generated help remains unavailable even in open practice. An archived or deleted paper cannot be newly opened for practice; preserved historical result review is a different capability.

A new recorded test is available when an invalidation restores it or staff grant one through a settings change. At most one such unused grant exists for the learner and paper; repeated grants do not accumulate attempts. A normal content edit alone grants no additional recorded test.

The previous result remains in history. A granted new test replaces the old measured result only when the new one finalizes, not merely when the grant is issued or the test starts. The old result is marked archived and stops being the current measured attempt. Invalidating an already-displaced result does not disturb the newer current result or create another attempt.

## History and saved detail

Mock and Company have separate paged histories, newest first, filterable by status. Keep finished tests visible, including invalidated tests with their reason and archived tests with their marker. An unfinished test past its submission time is visibly Overdue rather than lost.

Summaries remain for the life of the account: result, date, duration, counts, breakdowns and applicable status markers. Mock retains its pass decision; Company does not gain one. Both retain their applicable proctoring counts and section movement. Off means no recorded events, not a missing monitoring result.

Question-level detail remains while a test is within ninety days **or** among the learner's twenty most recent tests of that type, whichever retains more. Mock and Company have independent twenty-test protections, not one shared pool. Older results open as summaries with an explanation and no dead review button. Pending grading keeps the work needed to finish it.

Deleting live paper/question content does not delete these histories or the original material still needed under those retention rules. Retention does not prevent taking a test and does not silently delete a history row. Account deletion is a separate action described below.

## Skills and company progress

### Skill evidence

Finalized recorded tests contribute question-level evidence to Progress under separate Mock and Company labels and the shared assessment weighting. Practice, preview, excluded staff activity and repeated processing create no extra evidence. Invalidation removes that result's contribution; a corrected result updates affected skills. Direct editing does not move an existing test to a different question or skill classification.

### Company readiness

Readiness describes preparation on Labs' material for that company, not hiring probability or an employer judgement. It combines **40% coverage** of company papers with **60% performance** on recorded tests. Untaken papers affect coverage, not performance as fictional zero scores.

A readiness verdict requires at least two finalized tests and coverage of at least half the company's currently published papers. Below either requirement, show **Not enough evidence** with the relevant count. An entirely untested company remains visibly untested.

Readiness bands are Not ready below 50, Developing from 50 to below 75, and Well prepared from 75 to 100. The figure is capped at 100 and recalculated after a finalized, invalidated or repaired Company result and when its relevant paper availability changes.

### Recent form

Recent form is separate from readiness and is shown in Skills. It uses Company test scores for that company from the last 180 days, giving a test half as much weight for each sixty days since completion. It needs two finalized tests; otherwise no figure is shown.

Its bands are At risk below 25, Needs work from 25 to below 50, On track from 50 to below 75, and Excellent from 75 to 100. Coverage and recent performance may move in opposite directions, so neither figure substitutes for the other.

### Completed papers, strengths and Mock trends

Company progress shows completed papers versus currently available papers, also grouped by role. Completion counts do not shrink simply because content is archived or removed from the catalogue; invalidation can remove a completed paper. Cap any completion percentage, and use a dash when there is nothing available rather than an invented zero-out-of-zero percentage. A More available indication is not labelled New since your last visit without evidence.

Recent activity can include invalidated tests, clearly labelled. Strongest area, weakest area and pace come from the shared skills model filtered to that company's tests. Insufficient evidence must not manufacture a weakness.

The Mock month-to-month figure is this calendar month's average finalized score minus last month's. If either month has no test, show **Not enough history**. If calculation fails, show **Unavailable**. Zero is reserved for genuinely equal averages. Do not combine Mock and Company into a single readiness score.

## Rewards and messages

Mock recognition includes first completion, first pass, a high score, a perfect score and a perfect section. First completion awards 200 XP; first pass awards 300 XP. The high-score threshold is 90%. High score, perfect score and perfect section are recognition only. Each recognition is granted once per learner; repeating delivery grants nothing twice. A reward-delivery fault never changes a valid test result.

Company Tests grant no XP, Credits or achievements. Neither test type changes Credits or the daily streak.

Each type uses its own notification preference for four messages: a closing-paper reminder, an optional settings-change notice, a result invalidated with a fresh test restored, and a result repaired. A repair is not described as an invalidation. Messages do not expose staff notes or technical fault details.

Closing reminders are checked at 9 a.m. on the product clock for papers closing during the next product day. Send at most one per learner and paper per day, only while the paper is published/open and the learner is eligible and has neither taken nor started its test. Company reminders also require a listed company. Respect the learner's notification preferences.

## Incorrect or interrupted results

### Invalidation

A result is invalidated for an irreparable platform input, defective authored content whose intended answer cannot be recovered, an account-security action leaving unsafe unfinished work, or an explicit staff invalidation. Explain the actual reason neutrally; do not blame the learner or claim a platform outage for an unrelated staff decision.

The history row remains visible. The paper becomes eligible for a fresh test, subject to normal availability and access, and open practice closes until it finalizes. Remove the invalidated test from skills and readiness; reverse its applicable Mock rewards through the Economy rules. Repeating the action creates no duplicate effects or extra grants. Invalidation does not restore a permanently deleted catalogue paper.

### Automatic correction

A provable calculation defect with intact original inputs is corrected by recomputing the affected results, not choosing new scores manually. Identify and preview the exact affected tests and the direction of score changes before applying it. Tell affected learners on their result and recalculate affected skills and company readiness.

A question whose original intended answer cannot be recovered uses invalidation instead. Staff have no score editor, choice of outcome, re-grade button or grading retry queue. An ordinary calculation repair does not itself create another attempt or change Mock rewards; invalidation follows the separate reversal rule. Certificates are unaffected because assessments do not issue them.

### Account deletion

Delete the learner's tests of both types, including archived attempts, answers, saved code, retained question material held only for those attempts, proctoring timelines, runs, readiness inputs, personal totals and reminder records. Keep authored papers, companies and roles that still exist as product content. Retain only anonymous aggregate statistics, recalculated to reflect removal. A valid hold delays deletion rather than pretending it completed; interrupted deletion resumes without leaving part of the account's assessment data behind.

### Check this journey

Verify a zero-answer result, partial marks, negative marking, grading during an outage, withheld review versus aged-out detail, repeat grants, invalidation, a bounded calculation correction and account deletion. For multi-select, check fully correct, partly correct, mixed, wrong-only, unanswered and repeated selections, with negative marking both enabled and disabled; verify that penalties reduce the sum and only the final test total is floored at zero. Edit a published answer key and remove a paper from the catalogue, then verify that original attempts remain correctly gradable and reviewable. Confirm that histories remain honest and no action duplicates a result or reward.
