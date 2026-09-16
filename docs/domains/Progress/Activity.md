# Activity

**Status:** Reviewed  
**Group:** Overview and Account  
[Home](Home.md) · [Skills](Skills.md) · [Recap](Recap.md)

## Purpose

Activity records what the learner did and how much qualifying time they spent. It is not a skill score. One shared measurement supplies the activity figures used by Home, Profile, domain summaries and the annual recap; those pages do not create competing clocks or totals.

## What counts as active time

Count genuine engagement while an eligible page is visible. Ordinary idle activity stops counting after five minutes without engagement. Waiting for the platform, hidden ordinary tabs and paused video do not add time. Video uses verified playback rather than mouse movement.

Overlapping intervals across tabs count once, not once per tab. Replayed activity reports add nothing. A window crossing the product-day boundary belongs to the two days it actually touches. Activity normally reports once per minute while active; a failed report must not block navigation or later invent unobserved time.

| Measurement bound | Value |
|---|---:|
| Ordinary idle threshold | 5 minutes |
| Per-item daily active-time ceiling | 120 minutes by default; configurable within 15–480 |
| Per-test active-time ceiling where time measurement applies | 6 hours |
| Total active time credited per product day | 8 hours |

These are independent measurement limits, not restrictions on how long someone may study. A capped value says it reached a measurement ceiling. A timed test follows its own recorded clock rather than ordinary idle rules. Proctored tests collect no active-learning time; their test duration and outcomes remain Assessment facts. An authored lesson duration used instead of measured time is labelled Estimated.

## Attribution

Attribute time on a skill-bearing activity to exactly one primary skill and its product group. Secondary tags do not duplicate the same minute. General work such as Code Lab, Solutions and Quick Notes contributes group-level activity without a guessed skill. Workspace contributes build activity without self-confirmed work becoming skill evidence.

Home, Skills, Profile, Settings, Notifications and Economy are record-reading pages and add no learning time. Skill-attributed time cannot exceed its group's time. Any legitimate unattributed portion remains visible as such rather than being redistributed to make totals look complete.

The source activity is owned by the producing domain. Shared measurements do not grant access to the learner's Notes, source, answers, files or terminal output.

## Charts and the activity grid

| Presentation | Window |
|---|---|
| Daily chart | 30 daily buckets |
| Weekly chart | 26 weekly buckets; weeks begin Monday |
| Monthly chart | 12 monthly buckets |
| Activity grid | 365 product days ending today |

The grid uses one cell per day and intensity relative to this learner's busiest day in its window. A day with recorded activity is visibly different from a day with none. Days before a new account existed remain honestly empty. A summary names the exact window; the grid is not a lifetime heatmap.

With recorded activity, show the grid including genuine zero-activity days. With no recorded activity anywhere in the window, show the explanatory empty state instead of a decorative all-zero grid. With unreadable history, explain the failure and do not draw apparent inactivity. Home and Profile use this same behavior.

Charts use real denominators for percentages. Do not add distinct-person counts across buckets, or treat failed reads as empty buckets. Grain changes are presentations of the same recorded activity, not new measurements.

## Current results, summaries and retention

The owning activity page can confirm a solve or completion immediately. Derived charts and totals may wait for the relevant calculation and must state when they were computed. A product day is finalized after it closes; a still-unfinalized day is not presented as a complete measurement.

| Record | Retention |
|---|---|
| Fine-grained activity detail | 90 days |
| Daily activity summaries | 13 months |
| Lifetime and annual summary records | Account lifetime |
| Skill evidence and its historical outcome facts | Account lifetime, with separate freshness rules for current judgments |

Record lasting summary facts before shorter-lived detail expires. Fine-detail expiry must not reduce an earned lifetime total, erase an old recap year or change a historical outcome into an error. Explain unavailable fine detail without promising a recovery queue or export that does not exist.

A wrong summary is rebuilt from the durable facts for its affected scope, not patched with guessed adjustments or reconstructed from deleted learner code. Routine summary repair does not reopen already finalized days or silently rewrite lifetime figures. Account erasure removes personal activity, evidence, summaries, resume records and recap dismissals; anonymous content-review aggregates remain separate.

## Freshness and honest presentation

Every derived figure states when it was actually calculated, not merely when the page opened. Use the applicable label: Measured, Derived, Estimated or Unavailable. A chart window reflects the least reliable contributing measurement rather than hiding estimates inside a precise-looking total.

A last confirmed figure may remain visible with its age after a refresh failure. Without a confirmed figure, show Unavailable. A genuine zero, no history, insufficient evidence and a platform failure remain distinct. Stale information never authorizes access, spending or a new test start.

## Staff content review

Content review is aggregate and learner-anonymous. It helps staff inspect potentially unclear or defective material, not rank learners. Each owning area supplies its own review facts; it does not share problem ownership with other areas.

| Area | Advisory reasons |
|---|---|
| Coding practice | Missing classification, unusual solve rate, slow solves against an authored target, high hint use, many submissions per acceptance, possible case/reference failure |
| Debug Detective | Missing classification, unusual timed fix rate, slowness against the authored budget, high hint use, many validations per fix, possible case/reference failure |
| Assessments | Very low/high question accuracy, frequent skipping, unusual slowness, high partial-credit use, possible grading failure |

These are inspection prompts, not automatic declarations that content is wrong. State the measured value, actual population, threshold, period and calculation time. Unworked content does not get a zero-success warning. No authored time target means no guessed pace judgment. Hint use is never converted into learner misconduct or reduced skill.

The review window is 90 days. Ordinary rate checks need at least 20 eligible observations; missing classification can be reported immediately. Clear a reason after two successive daily calculations no longer meet it, retaining its history. Debug's advisory fix-rate check uses timed activity separately from practice.

Review pages retain their owning area's headline figures, ordered flagged items, honest counts and freshness. Exports are learner-anonymous and limited to 5,000 rows with partial results named as partial. A failed export produces no misleading empty file. The central console arrangement is part of the later admin workflow review.

Authorized staff can maintain the relevant bounded measurement settings and run the explicit evidence reset defined in Skills. No learner-level administrative analytics report, scheduled personal-statistics email, public comparison or shareable evidence snapshot is added.

## Completion checks

Check concurrent tabs, idle pages, paused videos, proctored tests, day boundaries, measurement ceilings, failed reports and recently completed activity not yet in a summary. Compare the same grid across pages. Verify older totals after detail expiry and an eligible historical recap after daily rows expire. Check advisory flags with no data, enough data, no authored target and a missing source; none should become a judgment about a learner.
