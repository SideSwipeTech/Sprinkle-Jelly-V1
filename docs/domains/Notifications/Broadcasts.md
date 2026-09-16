# Broadcasts

**Status:** Reviewed  
[Notifications](Notifications.md)

## Purpose and audience

An authorized administrator can send one System announcement to all eligible active learners. Active means valid access without an active restriction, not currently online. Staff-role accounts are excluded from broadcasts but remain eligible for ordinary notices about their own activity.

General broadcasts respect the learner's System preference. They do not use the mandatory course-change exception. There is no audience picker, single-learner send, cohort, segmentation or scheduling. A broadcast is an immediate send to the defined audience, not a campaign system.

## Compose and preview

Enter a required title up to 120 characters and a required message up to 4,000 characters. An optional icon uses the configured platform default when omitted. Treat authored text as content, not executable markup or instructions.

Show a preview matching the inbox item. State its System category, eligible audience and that delivery continues after the composer closes. Show an estimated recipient count as an upper bound, not a guaranteed delivered count; preference and eligibility are checked for actual delivery. No estimate is represented as zero when it could not be calculated.

**Journey:** Compose → preview → confirm the audience and consequences → send → inspect actual delivery status.

Require explicit confirmation before sending, including the audience, the permanent nature of delivered messages and attribution to the sender. At 5,000 estimated recipients or more, require a second confirmation. An unavailable estimate also requires that safeguard. Cancelling either confirmation sends nothing and preserves the draft.

If sending cannot start, explain why and keep the entered text. Repeating the same Send must not start another broadcast. A deliberately new announcement is a different event even if its wording happens to match an older one.

## Delivery and stopping

Delivery continues after the page is closed. Interrupted processing resumes without duplicating messages or silently skipping the rest of the audience. Recheck recipients as needed; count people no longer eligible rather than pretending they received an item.

After sending begins, an authorized operator may Stop remaining delivery. This is not recall: items already delivered remain, and work already being settled can finish before the final stopped count is known. Report the settled result, not a premature number claiming that nothing else can arrive.

A stop is repeat-safe. A stop after delivery already finished reports that it finished. Stopped delivery cannot resume or be edited and resumed. A correction is a new message rather than a rewrite of the previous one.

| Final status | Meaning |
|---|---|
| Delivered | Processing completed with the real delivered and skipped counts; a genuine zero is possible |
| Stopped | Remaining delivery was halted, with settled counts including items already in flight |
| Failed | Processing failed; show the reason and actual known counts, not a fabricated zero or success |

None of these final outcomes is reopened, resent or overwritten. There is no edit-sent-message or recall action. A delivery in progress shows its real progress rather than a final success panel.

## History

Keep read-only broadcast history, newest first. Show sender, time, title, status, original estimate, delivered/failed/skipped/stopped counts, and any stop's actor, time and reason. Do not show which learners received, read, deleted or muted a notice.

No broadcasts yet is different from unreadable history. The record of an earlier broadcast does not grant permission to resend it. When a sender's account is erased, remove personal attribution as required without rewriting the delivered content or abandoning delivery already underway.

## Staff permissions and operations

Send and Stop require their explicit permissions and recorded attribution. If the required change record cannot be saved, do not begin an unrecorded staff action. The configured default icon is a platform identity control, not a new notification category or audience selector.

Operational monitoring covers recurring producers as well as broadcasts: when a pass last ran, eligible audience reached, messages created, skips, failures and work remaining. Track preference suppression honestly. Mandatory course changes are not counted as suppressed merely because System is off.

A pass unfinished near the end of its delivery window must remain visible to operations. Retention and account-erasure work report completed, skipped, failed and remaining work. Monitoring contains permitted operational counts, not access to a private inbox. Broadcast history and delivery health serve different purposes; neither requires another learner-facing reporting page.

The detailed layout of the composer and operations screens will be simplified in the later admin-workflow review. The permission, audience, confirmation and record-preservation requirements remain.

## Checks

Verify staff exclusion, offline eligible learners, System preferences, estimated versus actual reach, the large-send safeguard, cancelled confirmation, double Send, interrupted delivery, stopping with work in flight, repeated Stop, completed-zero delivery and failed history reads. Confirm that nothing edits or recalls an already-delivered notice and that course-change delivery cannot be impersonated by a general broadcast.
