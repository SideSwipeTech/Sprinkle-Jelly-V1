# Practice

**Status:** Reviewed  
**Group:** Practice

## Purpose

Practice lets learners experiment with code, solve problems, practise a language, complete daily activities and repair broken programs. Each area keeps its own purpose and records while reusing familiar editing and execution capabilities.

This is a product description, not a technology or architecture specification. The detailed arrangement of admin screens will be reviewed after the domains are defined.

## Read by area

| Document | Covers |
|---|---|
| [Code Lab](Code%20Lab.md) | A single-file coding playground with terminal or browser output |
| [Challenges](Challenges.md) | Independently authored, multi-language coding problems |
| [Tracks](Tracks.md) | Ordered, single-language practice with its own problems |
| [Daily Challenges](Daily%20Challenges.md) | Scheduled daily problems, catch-up, calendar and streak |
| [Debug Detective](Debug%20Detective.md) | Broken programs, practice and timed fixes |
| [Solutions](Solutions.md) | The learner's read-only collection of accepted code |
| [Authoring](Authoring.md) | One reusable form, independent content ownership and staff capabilities |

Tracks remains the language-focused part of Challenges & Tracks in the product's domain list, but its problem collection is independent from standalone Challenges. This grouping does not require shared problem identities or a new domain count. Workspace belongs to Build, not this group.

## Independent problem ownership

Challenges, Tracks, Daily Challenges and Debug Detective each create and manage their own problems. Each track holds its own track problems. Equivalent exercises may be authored separately, even with identical wording. They do not share their questions, cases, starters, hints, lifecycle or learner records.

A multi-language Challenge and a Python Track problem about the same concept are two items. Editing, archiving or deleting one does not change the other. Solving one does not complete the other. A first solve can earn each item's applicable reward separately; repeats of that same item do not pay again. Progress identifies the area that produced the activity and applies the shared skill rules, without matching similar wording to merge records.

There is no shared problem bank, live reference from a track to a standalone Challenge, automatic synchronization or automatic cross-domain completion. Optional links between related activities are navigation only. Authoring the same content again does not copy learner activity.

The editor, language catalogue, authoring form, execution, evaluation and common feedback are shared capabilities, not shared ownership of problems. Solutions collects accepted work from its named source area without becoming the owner of the original problem.

## Common solving experience

A problem page keeps its statement, editor, output, visible-case results and authored hints together. It states the supported languages, examples, constraints, comparison rules and hidden-case count before the learner submits. Shared editing controls, formatting where supported, resizing, shortcuts and accessibility remain familiar across areas.

**Run** is free experimentation against visible examples or supplied input. It is not a scored submission, completion or reward. A custom-input run shows program output rather than inventing expected results. Empty or over-limit input is refused clearly where that operation requires input.

**Submit**, or **Validate Fix** in Debug Detective, checks all required cases. Acceptance requires all of them to pass; there is no partial assessment score. Pending work remains pending rather than appearing as a failure. A platform fault or refused start does not count as a wrong answer or spend a learner-result allowance.

Problems use one of two forms: a console program with prepared input and output, or a SQL query with an authored schema and datasets. The comparison rule is shown: console output normalizes line endings and ignores one final newline while preserving other whitespace; SQL compares columns and values with row order either significant or insignificant as authored. Any numerical tolerance is stated. No arbitrary executable custom checker is offered.

Code Lab is different: it has no problem, Submit, grading, cases or solve rate. Its terminal and browser preview are described in its own document. The problem-solving areas use prepared-input runs rather than an interactive terminal.

## Work, privacy and feedback

Learner drafts are kept separately by signed-in account, area, item and language. Device-only saving is labelled as such; it is not a promise of cross-device recovery. Each area states its fallback when no local draft exists. Signing out or changing identity clears the applicable local work. Failure to save never becomes a false Saved label.

A submitted job can finish after the learner closes the page. An accepted result and its saved solution must agree; the platform does not report a solved item whose required acceptance record could not be stored. Repeated delivery or double-clicking cannot duplicate the solve, solution, XP or evidence. Delayed reward delivery is described honestly without paying again.

Feedback may identify a failing visible case, but hidden inputs, expected outputs, datasets, private reference answers and unrevealed hint text remain private. A platform failure explains the platform problem, not a supposed flaw in the learner's code. Output limits are explained rather than silently cutting away information.

A learner can read only their own drafts, submissions and accepted source. Staff may author content and read aggregate content statistics, not inspect learner code. An inaccessible private result does not disclose that another learner's record exists.

## Hints and worked explanations

Hints are authored, ordered and free. Reveal the next unseen hint without charging Credits, deducting XP or reducing the skill contribution. Reopening a hint or reordering the ladder does not increase its recorded use. Hint usage is a neutral content-review signal, not a judgment of the learner.

Distinguish no hints authored, all hints revealed and hints temporarily unavailable. Hints live on the problem page and remain usable when WizBit is absent. Generated text never silently fills a missing authored hint.

A learner-facing worked explanation is separate from the private grading reference. It unlocks only after the qualifying acceptance. There is no pay-to-reveal, give-up-for-a-solution or exhausted-attempts unlock. Where an explanation is supported but not authored, say so rather than reveal the internal answer. Debug's required debrief is described in its document.

## Solve rate for learners and staff

**Solve rate = distinct eligible learners who solved this problem / distinct eligible learners who made a valid submission to this problem × 100.** A learner who fails several times and then solves it counts once in each group. Merely opening a problem or pressing Run does not enter this calculation.

Show this content statistic to both learners and administrators, with the attempted and solved counts that support it. For example, 40 solvers among 100 eligible submitters means a 40% solve rate. Use the same definition for both audiences. It is not a skill score for the viewer, a success guarantee or an automatic difficulty rating.

Exclude staff previews, test data, invalidated activity, platform failures and analytics-exempt activity from both groups. Below twenty distinct eligible submitters, show Not enough data instead of a percentage. No denominator is not zero percent. An unreadable figure is Unavailable; a saved older figure states when it was calculated.

Rates belong to individual owned problems. Do not combine a Challenge's outcomes with a similar Track or Daily problem. Debug uses **Fix rate**, separating timed and practice outcomes with matching populations rather than averaging the two. Code Lab and Solutions have no solve-rate statistic of their own.

## Rewards, learning and completion

| Activity | XP and saved work | Skill evidence |
|---|---|---|
| Code Lab run | No XP or saved solution | None; active time only |
| First Challenge or Track-problem acceptance | Its difficulty-based first-solve XP and accepted solution | One contribution for that owned problem |
| First Daily acceptance | Difficulty-based XP plus its optional bonus and accepted solution | One Daily contribution |
| First Debug acceptance | Difficulty-based XP once per case, in either mode; accepted solution | Only a qualifying timed acceptance |
| Re-solving the same problem | No second XP award; a first accepted language can add its own solution entry | No duplicate contribution |
| Completing a track | One achievement, no extra XP | No extra problem evidence |
| Reading Solutions | No reward | Active time only, no new evidence |

The shared difficulty award and skill rules remain the authorities for their figures. Code Lab, Challenges and Debug do not create additional streaks; Daily owns the platform's daily streak. No activity in this group independently awards a certificate.

## Content changes and record retention

Content management must preserve earned solves, solve dates, rewards and saved-solution entries. An edited problem does not retroactively change the difficulty or classification recorded when an earlier solve occurred. A displayed current statement is not presented as the historical statement that produced saved code.

Daily date locks and Debug timed-window protections are explicit domain rules, not reasons to introduce linked problem libraries. A failed dependency check refuses a destructive action rather than guessing it is safe. Archive and permanent Delete are distinct from personal account erasure.

Solve summaries survive while the account exists; source and submission detail have the retention described in Solutions and the owning area. Code expiry does not remove the solved badge or invent recovery. Account erasure removes the learner's private records and source through their owners, leaving authored problems and anonymous content statistics separate.

## Completion checks

Check an equivalent problem in Challenges and a Track: changes, completion, rewards and solve rates must remain independent. Test one learner submitting repeatedly, small populations, both learner/admin rate displays, double submission, closed-tab completion, hidden-case feedback, missing drafts, free hints, source expiry and account separation. Verify the individual journeys in the linked documents before treating the group as implemented.
