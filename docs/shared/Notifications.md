# Notifications

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Inbox rules](../domains/Notifications/Notifications.md) · [Broadcasts](../domains/Notifications/Broadcasts.md) · [Interface](Interface.md)

## Shared responsibility

Notifications gives event-producing domains one durable in-app delivery capability. The producer owns the original fact, eligible audience and safe wording. Notifications owns the inbox item, category preference, delivery, read state and unread count.

It is not the owner of a solve, score, reward, certificate, request or content update. Deleting a notice deletes none of those. Passing messages and confirmations are separate interface capabilities, not additional durable inboxes.

## Producer input

A producer supplies a stable event identity, its approved kind/category, intended eligible recipient or audience, safe factual fields and a valid internal destination where one exists. Recipients come from verified eligibility, not a browser-selected account list. A known event is not repeated merely because delivery resumes.

Use only the seven existing categories: Achievements, Level Ups, Daily Challenges, Streaks, Mock Tests, Company Tests and System. New product activity does not automatically authorize a new category or notice. Only the approved domain producers send notifications.

No raw errors, hidden material, private staff note or another learner's information is included. A Topic Request status notice can name its title but not the private team note. Certificate generation in progress is not a certificate-ready event. Correction and invalidation describe different results.

## Delivery and preferences

**Journey:** Record the original event and required delivery work → check eligible recipients and preference rules → create each item once → update the inbox → report actual delivery state.

Most disabled categories stop new item creation. They do not hide old items, reset read state or backfill the muted period when restored. An unreadable preference cannot be assumed on.

Published course-change notices are the approved exception: deliver their System items to the eligible audience even with System off. General broadcasts and other System producers still respect that switch. No producer may disguise an announcement as a course change to bypass a preference. The preference label explains the exception.

Staff accounts are excluded from general learner broadcasts, not all ordinary notices about their own permitted activity. Offline eligible learners can receive an inbox item for their next visit; in-app delivery makes no promise to alert them externally while absent.

## Shared readings

Bell, inbox and Home preview use the same item and unread state. Showing a preview does not mark items read. Filters/paging change the list, not the whole-inbox unread badge. Preserve loaded rows during a failed refresh and never report All caught up from an unreadable count.

Category visual treatment and the broadcast-only authored icon rule are defined in Interface. Pages do not create independent per-event category artwork. Destination availability is checked honestly; a readable item may have no Open action without being broken.

Read/unread and deletion are the learner's actions. Whole-view bulk operations include unloaded items under the stated scope. Assessment's protected fresh-test announcement follows its special clearing rule; mandatory course-change delivery does not make those notices undeletable.

## Once-only recognition and scheduling

A level crossing and a non-streak achievement can produce distinct notices. A streak milestone carrying a badge uses the one combined Streaks notice. A Solutions milestone or ordinary Daily completion does not acquire an inbox producer just because it celebrates.

Daily owns the dated evening reminder and rechecks its own eligibility. The notice preserves its original date/target when opened later. Assessment owns its closing/change/invalidation/repair eligibility. Request status and certificate events remain with their domains. Notifications does not independently schedule a new deadline, reward or outcome.

## Broadcasts, failures and privacy

Broadcast composition, confirmations, fixed audience, Stop and history follow Broadcasts. Stop prevents remaining delivery; it does not recall delivered items. A terminal broadcast cannot be edited or resent through a generic Retry. History reports safe aggregate delivery, not who read or muted it.

A failed notice never blocks or reverses its valid originating action. Preserve recoverable delivery work and report faults to operations without showing the learner a false failure of their solve or certificate. Repeated delivery must not create duplicate inbox items.

Items follow the owner's 180-day age limit without volume eviction. Erasure removes private inbox/preferences while leaving authored source content. Staff do not browse, search, export or count an individual's private inbox or preferences. Operational delivery counts are not a bypass.

## Checks

Test duplicate events, System-off course changes versus broadcasts, offline recipients, staff exclusion, whole-inbox counts, protected clearing and old destinations. Fail delivery after the original action succeeds and preserve that success. Check category appearance, quiet companion independence, expiry, account erasure and no unintended external delivery channel.
