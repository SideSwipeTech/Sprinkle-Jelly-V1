# Daily Challenges

**Status:** Reviewed  
[Practice](Practice.md) · [Authoring](Authoring.md) · [Solutions](Solutions.md)

## Purpose and ownership

Daily Challenges offers one staff-selected coding problem per product date, the same for every learner. Daily owns its problems, starters, cases, hints, schedules, submissions and completions. It does not use a live reference to a Challenge or Track problem. Equivalent content elsewhere remains independent.

This area owns the platform's daily streak. It adds scheduling, full-reward catch-up, an optional XP bonus, a completion calendar and an evening reminder to the common practice-solving experience. There is no separate timed mode or interactive terminal.

## Today and past problems

Today's page shows the scheduled problem as unsolved, solved or a neutral day. Show its facts, difficulty, base reward and bonus where present, supported languages, learner state and Solve rate. Learners and staff use the same eligible attempted/solved counts and small-sample rule from Practice.

A countdown states when the next product day begins and never becomes negative. The product clock determines today and the completion date; the device clock does not change them. An open page refreshes at the boundary. A failed refresh keeps the previous view under an explicit stale-view notice and Retry rather than claiming yesterday is still today.

Past published Dailies remain discoverable and solvable, without a catch-up deadline or reduced reward. Load older history and navigate earlier relevant months; the initial batch is not a permanent history limit. Future dates disclose no future problem title, difficulty or other hidden content to learners.

The calendar and past-problem list describe the same available dates and learner records. Archived items remain read-only for learners whose records refer to them; they are not offered as new solving opportunities. Empty history and failed loading have different messages.

## Solve a Daily

**Workflow:** Open today or a past date → read the problem → select an offered language → edit → Run → Submit → accepted solution, reward and eligible streak update.

Use the shared statement, editor, output, visible cases and hidden-case count. A Daily can be a console program or SQL query, with its comparison rule stated first. Run uses visible cases or custom input, costs nothing and creates no submission. Submit checks all cases and accepts only all-pass results.

Seed from the learner's device draft for that Daily and language, otherwise retained accepted code for it, otherwise its authored starter. Preserve other language drafts. Reset returns to the starter after confirmation. Device-only saving is stated honestly and never implies cloud recovery.

Hints are optional, authored, ordered and free, and remain available without WizBit. Private reference answers, hidden cases, internal explanations and unrevealed hints are not disclosed. WizBit can present approved guidance and result moments, not produce a ready-to-paste answer or bypass an unlock.

A waiting grade is pending. A platform failure or refused execution changes no solve, reward, evidence, streak or valid-submission count. Preserve the code and offer an appropriate retry. If a submission's required content changed while grading, reject the mismatched outcome as a platform/content conflict rather than blame the learner.

Acceptance is stored even if the page closes before it renders. A first accepted solve, its saved solution and applicable award must be recorded coherently, with no duplicate result from repeated delivery. Work that never actually ran is not invented into a completion; explain that resubmission is needed.

## Rewards and evidence

The first accepted solve of this Daily pays its shared difficulty-based XP plus any authored bonus. The bonus is 0–200 XP and is paid once with the base award. Reward values and difficulty at acceptance are preserved; later configuration changes do not reprice a finished solve.

A first solve of an old date pays the same full award. Re-solving this item, changing language or resetting progress does not pay it again. Reopening a solved Daily says when it was solved and that another solve is free practice.

A first accepted language can create its own Solutions entry, filed under Daily Challenges. The source remains separate from similar Challenges or Track problems. The first eligible solve supplies one practice-weighted skill contribution, with classification and difficulty at that time. Runs, hints, further languages and repeats do not multiply it. Active time follows the shared primary-skill rules.

A completion celebration requires a real recorded result and is not replayed by revisiting the page. Completing a Daily does not itself send an achievement notification. Streak milestones are separate.

## The streak

An eligible date is a product date with a published, unvoided Daily. The streak counts consecutive eligible dates completed on their scheduled dates, starting no earlier than the learner's membership. Dates before membership neither contribute nor break it.

Until today's eligible problem is solved, show the streak ending yesterday at its full length with **At risk today**. Solve today to extend it. A missed eligible date ends the sequence when the day changes. Several submissions or accepted languages do not add several days.

Catch-up pays in full but does not repair a missed on-time date or reconnect a broken streak. The current streak is not a count of all historical solved calendar cells. Longest streak is a separate lifetime record and does not shrink when code detail expires.

### Neutral dates

A neutral date neither increases nor breaks anyone's streak. It occurs when no Daily was available for that date, or the date was explicitly voided for a critical content defect or material execution outage. It applies to everyone, not selected learners.

For example, Monday solved, Tuesday neutral and Wednesday solved produces a streak of two. A learner's own incorrect code, slow connection or missed visit does not make their date neutral. Archiving is not a way to grant neutrality; Void Daily is the explicit operation for qualifying problems.

No At risk today warning is shown on a neutral day. Existing valid solves and rewards survive a void, but that now-neutral date does not add a streak day. If the streak cannot be read, show Unavailable rather than zero.

### Explanation and milestones

Explain the strict on-time rule and the product-day boundary in place before the learner can lose their first streak. A lapse is acknowledged once, with the previous length and a fresh-start message, not repeated blame or an offer to buy a repair.

Milestones are 7, 30, 100, 200 and 365 days. Show the distance to the next and an all-complete reading at the last. They award no additional XP or access. The lower two are celebrations; the upper three also connect to achievements. A crossing is announced and celebrated once, not once through Daily and again through Economy. If the backing streak is unavailable, do not fabricate a milestone.

## Calendar and reminders

The seven date states are Solved, Missed, Today unsolved, Today solved, Upcoming, Neutral and Outside loaded history. Catch-up is a label on a solved past cell, not another state or a reduced reward. It is not called Late. An unloaded or failed-to-load month does not draw missed days. Navigation stops at the current month and loads earlier relevant months on request.

One in-app evening reminder may be sent at 21:00 on the product clock to an eligible learner who has not completed that date's published, unvoided Daily and has not disabled the preference. Recheck before delivery so a last-minute solve receives no unnecessary reminder. Neutral dates produce none.

The reminder stores the actual date and problem. Opening it tomorrow opens that problem as catch-up, not tomorrow's problem under yesterday's wording. Show the date and relevant timezone rather than a stale Today label. A missed delivery can be caught up before the product date ends, not after. An already-delivered reminder is not recalled if its date is later voided; it opens that date's explanatory page.

It is in-app only and makes no promise to reach an absent or offline learner in time. At risk is an on-page state, not an additional notification producer.

## Staff scheduling and management

Use the shared authoring form within Daily's own collection. Staff create drafts and edit problems, languages, cases, starters, reference solutions, hints, difficulty, classification and bonus. The shared practice checks apply in full, including per-language grading validation. An incomplete draft can be saved.

Schedule one valid problem onto a free future date. A conflict names the occupying problem/date and changes nothing. Publishing requires a permitted date and valid bonus. A future scheduled problem untouched by learners can be moved to another free date or unscheduled to draft; confirmations name both dates or explain that the date is freed.

When its product date begins, the date, difficulty, bonus, classification, offered languages, cases/datasets, reference answers and comparison rule lock. A date that began with no Daily remains neutral that day; do not introduce a late first publish. Cosmetic corrections do not change grading. Normal CRUD cannot bypass these fairness rules.

**Void Daily** handles a critical defect or material execution outage after the date began. Confirm the affected date and reason, stop new submissions, make the date neutral for everyone and preserve existing valid solves and awards. The problem can still open for Runs and hints; it is not falsely described as missing. Void is a date outcome, not a new content lifecycle or an extra automatic reward.

Schedule health shows the next seven dates as scheduled, empty or blocked, with an unknown state when checks cannot run. An empty tomorrow is highlighted. Staff review this Daily's own solve rate, valid participation, time and hints without learner source; exports state their scope and any truncation. Delete and Archive follow Authoring's safe-history rules and cannot silently replace Void on a begun date.

## History, privacy and checks

Each valid finalized submission leaves its own history entry with retained source, outcome and time. Source/detail is kept within the shared ninety-day window or the most recent thirty Daily submissions, whichever keeps more. Accepted source uses Solutions' related retention rule. Solved dates, rewards and the longest streak do not disappear with code expiry.

Account erasure removes the learner's Daily completions, submissions, hints, reminder/celebration records and streak records; Solutions and Economy remove their corresponding personal data. Authored Daily problems and schedules remain distinct from learner records.

Check rollover, offline refresh, duplicate date, future move/unschedule, a missing Daily, void after existing solves, midnight submission, full catch-up XP without streak repair, no reward for repeat solves, neutral-date counting, both audiences' solve rates, old-month loading and the reminder's exact-date destination. Verify no independently authored problem elsewhere is changed or completed by a Daily operation.
