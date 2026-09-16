# Notifications

**Status:** Reviewed  
**Group:** Supporting domains  
[Broadcasts](Broadcasts.md)

## Purpose and ownership

Notifications is the learner's in-app inbox for things that happened elsewhere. The original course change, test result, certificate or reward remains on its owning page. Deleting a notice never deletes the event it describes, and a notice failure never reverses that event.

Activity domains decide what happened, who is eligible and what factual message is appropriate. Notifications owns delivery, category preferences, inbox state and unread counts. It does not re-grade, award completion, calculate streaks or inspect another domain's private learner work.

The launch channel is in-app only. There is no learner email, SMS, push notification, digest or quiet-hours system. Passing toasts and companion messages are separate shared experiences, not additional durable inboxes.

## Reading notifications

| Feature | Behavior |
|---|---|
| Bell | Opens a preview and shows the whole inbox's unread count |
| Badge | Hidden at a confirmed zero; shows up to 99, then 99+ |
| Bell preview | The latest six items, loaded when opened, with access to the full inbox |
| Full inbox | Newest first, grouped by Today, This Week and Earlier |
| Filters | All or one of the seven categories |
| Paging | Twenty items at a time, then explicit Load More; scrolling alone loads nothing |
| Home announcements | A read-only view of the newest four items from the same window and the relevant new-item count |

Date groups follow the product clock; This Week starts on Monday and excludes Today. Hide empty groups. New items and read-state changes update without a full-page refresh. Where live updates fail, keep the last confirmed reading and refresh on return; do not claim All caught up from a stale or missing count. Announce an unread count accessibly once, not once for the bell and again for its decorative badge.

Filtering and paging affect the visible list, not the whole-inbox badge. A failed refresh or Load More retains already loaded rows and offers a real retry. Home displaying a message does not mark it read. Empty categories explain what belongs there; a switched-off category may link to preferences, but an empty inbox should not send the learner on tasks just to manufacture notices.

## Reading and clearing

Opening a row marks it read and follows its valid internal destination. A readable item may have no destination; show it without a dead Open control. A destination that later disappears reaches that area's normal unavailable/not-found experience, not an invented notification error page.

Learners can mark individual items read, return them to unread and permanently delete them after confirmation. There is no Undo, Trash, Archive or save-for-later state. Deletion does not revoke an award, remove a result or acknowledge a separate required action.

Bulk Mark Read and Clear cover every stored item in the current view, including unloaded pages. Under All, that is the whole inbox; under a category, the whole category. Mark All Read from the bell also means the whole inbox, not its six preview rows. State the scope before acting and again if the action fails. Repeated presses must not produce inconsistent counts.

A fresh-test settings announcement protected by Assessment cannot be cleared through ordinary deletion/clearing. Keep it, explain why and report which items were actually removed; one protected item does not block clearing all eligible ones. Required course-change delivery is different: those notices are still readable, markable and deletable under normal inbox rules.

## Categories and settings

| Category | Messages |
|---|---|
| Achievements | Non-streak achievement unlocks |
| Level Ups | Reaching an XP level |
| Daily Challenges | The evening Daily reminder |
| Streaks | Achieved Daily streak milestones, including associated streak badges |
| Mock Tests | Closing-paper reminders, announced changes, invalidations and result corrections |
| Company Tests | The corresponding Company Test messages |
| System | Staff broadcasts, course changes, topic-request status changes, certificate notices and administrative progress resets |

There are seven category switches, initially on. Mock and Company remain separate. No category editor, global mute or per-message preference is added.

Normally a switched-off category creates no new items. It does not hide existing items or remove them from unread counts. Re-enabling it does not backfill the missed period. Save one preference without overwriting the other six; an invalid or failed multi-switch save must not partially apply. An unreadable preference is not silently defaulted to on.

### Mandatory course-change notices

Published course changes in both learning formats generate System notices automatically for the eligible learner audience, including learners who already completed the subject. **These notices are delivered even when the learner's System switch is off.** There is no author-side option to suppress the required announcement and no additional eighth category.

Explain beside the System setting that general System messages can be disabled, but course-change notices remain on. This exception changes delivery, not membership eligibility or privacy. Do not send draft autosaves or private staff notes as course updates, and do not treat unrelated broadcasts as mandatory course changes.

The course page and its change history remain authoritative whether the notice is read, deleted or temporarily delayed. Course updates never reset completed learning or rewrite an issued certificate. General broadcasts and the other System producers still respect the System switch.

## What messages say

A level crossing and a non-streak achievement unlock are separate events and can produce two notices. A streak milestone that also earns a badge produces one Streaks notice naming the badge, not a duplicate Achievements item. A daily completion or Solutions milestone celebration alone does not create an inbox message.

The Daily reminder names its exact date and opens that date's problem, even on the next visit. Daily owns its eligibility, product-time 21:00 schedule and streak-aware wording. An in-app reminder is not a promise to reach a learner who is away. There is no separate at-risk reminder.

Assessment owns closing reminders, announced changes, invalidations and repairs. Name the actual change and relevant old/new values. An invalidation restoring a test differs from a repaired score that leaves the finished test in place. Pending grading is not an invalidation or a zero-score message. Announcing a fresh-test grant does not imply another attempt was already completed.

Course changes explain meaningful learner-facing updates, not merely that something changed. Topic-request notices name the request and its new status, not private team notes or reviewer identities. Certificates notify only when an issued document is available, or when the issuer revokes an issued certificate. Missing names, generation in progress and generation failures are not ready notices.

An administrative progress reset notifies once after its whole requested scope is consistent, only when it affected records. State what changed and what was preserved, including files, notes, accepted code, earned economy records and certificates where the reset rules protect them. Do not send one conflicting message per internal step.

Account-standing restrictions use Access's factual experience rather than a new inbox producer. Display-name correction/reissue outcomes stay with Certificates. A product event with no agreed notification producer does not acquire one just because it could make the inbox busier.

## Reliable delivery and failures

One event creates at most one item for each eligible learner. Retrying must not duplicate it; two genuinely different events may produce two messages. A producer's audience rules remain with that producer rather than being guessed again by Notifications.

A failed notification must not block or reverse its solve, award, publication, request status, reset or certificate action. Report delivery faults to operations without presenting a learner's original activity as failed. Do not replace unavailability with an empty inbox or fake badge count.

Preference failures, refused actions, delivery failure and an empty result are different conditions. Keep text and current state where safe, explain the problem and offer a retry only for an operation that can safely repeat. A broadcast already underway is not sent again through a generic Retry control.

No internal errors, stack traces, private staff reasons or another learner's information appear in messages. The owner operational alert channel is separate from learner notifications.

## Retention and privacy

Items expire 180 days after creation; there is no volume cap that evicts them earlier. Explain the age limit. Expiry or deletion updates the unread count correctly, and an item disappearing on the next read is not a broken link to an archive. Shared hold rules can delay permanent removal.

Learners see only their own inbox, counts and preferences. Staff may inspect broadcast/delivery operations, not read, search, export or count an individual's inbox or preference choices. A producer does not receive a list of who read, deleted or muted its notice. Account erasure removes learner inbox data without deleting the original platform content announced by it.

## Checks

Verify category filters versus global unread count, read/unread, replayed events, all-page bulk scope, protected fresh-test notices, age expiry, private ownership and failures retaining loaded rows. Test System off: a course update still arrives, a general broadcast does not, and neither changes completed progress or issued certificates. Verify original actions succeed independently of notification delivery and that in-app notices never claim an external delivery channel.
