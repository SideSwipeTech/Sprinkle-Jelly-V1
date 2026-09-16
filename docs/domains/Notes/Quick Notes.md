# Quick Notes

**Status:** Reviewed  
**Group:** Personal Utilities

## Purpose

Quick Notes is one private, plain-text scratchpad per learner. It follows the learner across eligible pages without navigating away or changing their place. There is no notebook to organize: no second note, title, folder, tag or lesson-specific copy.

Notes owns the saved text and its recovery behavior. The application shell supplies its entry points, Home shows its preview, and shared access rules determine where it is available. No other domain or staff screen gains access to the note by displaying an entry point.

This document describes product behavior. Technical mechanisms and the arrangement of shared controls belong elsewhere.

## Opening and using Notes

| Entry point | Behavior |
|---|---|
| Quick Notes toggle | Opens the panel over the current eligible page |
| Keyboard shortcut | Ctrl+Alt+N on Windows/Linux or Cmd+Option+N on macOS opens the panel and focuses the editor |
| My Notes card on Home | Shows the first 320 characters of confirmed saved text and opens the same panel |

The toggle shows the applicable shortcut. Do not advertise the browser's private-window shortcut as a Notes shortcut. All entry points share the same note and loaded state; reopening a successfully loaded panel does not fetch or create another note. A reload or a new signed-in session loads afresh.

On desktop, the panel is movable, minimizable, restorable and closable. Its initial position must already be usable; moving it is optional. Keep it within the viewport and make movement and other controls available by keyboard. It does not trap focus. Escape pressed inside the desktop panel closes it and returns focus appropriately without triggering another page action.

On small screens, show a full-width bottom sheet rather than refusing Notes or directing the learner to a desktop. Moving between eligible pages keeps the scratchpad experience together. Panel position and minimized state are temporary for that open browsing context, not a lasting preference.

**Journey:** Open from an eligible page → wait for existing notes → write → see saving status → close or minimize → return to the same note.

## Text and limits

Keep the text exactly as written. Markdown, markup and web addresses remain plain text rather than being executed, formatted, embedded or followed. There are no attachments, generated-help actions or automatic rewrites.

| Limit | Value |
|---|---:|
| Note body | 20,000 characters |
| Approaching-limit warning | From 18,000 characters |
| Home preview | First 320 saved characters |
| Autosave pause after typing | 2 seconds |
| Automatic recovery attempts after a retryable save failure | At most 5 while the panel remains open |

Show a live character count, including during saving or failure. Count characters consistently in the editor, limit checks and Home preview. At the maximum, additional typing stops. An oversized paste inserts only what fits and explicitly states how many characters were left out; the counter alone is not sufficient notice.

Selecting and deleting all text saves an empty note. This is the clearing action: no separate Clear button, Trash, archive or confirmation dialog is added. An empty saved note is valid, not a missing record or error.

## Load before editing

The editor stays disabled until the existing note has loaded successfully. Never present an editable blank box while existing text is unread, because it could overwrite work the learner has not seen.

A new learner sees an enabled empty editor and Not saved yet. A failed load shows Couldn't load your notes, a working Retry and a disabled editor; it must not save an empty value or create a recovery copy from that failure.

The Home card has its own loading, empty and unavailable states. It shows confirmed saved text only, not unacknowledged edits, and adds no separate last-edited figure. A failed Notes read must not take down Home or the surrounding learning page.

## Autosave and recovery

Typing saves after the two-second pause. Only one save is in progress at a time; newer typing becomes the next latest value rather than a queue of outdated saves. There is no manual Save control and no routine unsaved-changes prompt when leaving.

Use Saved only after the platform confirms the text is stored. A device recovery copy is not a platform save. The footer distinguishes Not saved yet, Saving, Saved with its relative time, a retryable save failure, a newer-version warning, maintenance read-only and Work at risk. Saved time reads just now, minutes ago, hours ago or the date as appropriate. The status never replaces the character counter.

Write unacknowledged edits to a recovery copy on the learner's device as they change, before the autosave pause. Keep it until the corresponding text is confirmed saved. Reopening on that device can recover it through the ordinary save path; a fresh deliberate edit takes precedence over older recovered text. Recovery must respect the newer-save rule below.

The recovery copy survives the same learner's sign-out and return on that device. It is cleared when a different learner signs in, and it is never shown to that arriving account. The saved note can be read on another signed-in device, but unacknowledged local edits are not promised to be there.

A save failure does not clear, replace or shorten the visible text. While the panel remains open, retry connection/storage failures automatically with increasing gaps, up to five tries. After that, stop unattended retries; the next edit retries with the newest text. A newer-version conflict is not an outage and must not be retried automatically over another saved version.

Where no reliable save or recovery can be established, say Work at risk. Do not claim to know whether a killed tab, crash or power loss completed its last save.

## Two tabs or devices

The latest acknowledged save is authoritative. An older tab's save must not silently overwrite it. Keep that tab's text visible and immediately explain that a newer version exists elsewhere.

There is no merge, revision history or conflict-resolution dialog. An idle older tab stops sending. Its learner's next deliberate edit submits that tab's text as a new value, which can replace the text saved on the other device. Make this consequence clear in the newer-version message; it is not a promise that both texts will be combined or retained.

A simultaneous first save still creates one scratchpad. Reopening Notes from a different entry point never creates a second one.

## Where Notes is unavailable

| Context | Behavior |
|---|---|
| Personal or Course Workspace editor | Hide the toggle, close an open panel and disable the shortcut |
| Administration | The same suppression |
| Identity not yet known | Do not load or expose note content |
| Recorded Mock or Company Test | Suppress Notes and prevent reading or writing it through another tab or stale page |

Suppression is not a load failure and does not show an error or a contact prompt. No role or preference bypasses it. Starting a recorded test removes displayed note content from that experience, but preserves unacknowledged recovery text for access after the test. Ending suppression restores ordinary access without deleting the saved note.

## Maintenance and failures

When a declared maintenance period permits safe reads but not writes, show selectable read-only text with the reason in the footer. When reads are not known safe, do not open the editor; explain unavailability beside the toggle. If maintenance begins with unsent work, attempt the permitted final save. An unconfirmed result leaves the text and recovery copy intact and says Work at risk.

Return to normal editing when saving is genuinely available again, not just because an estimated end time has passed. Keep all Notes feedback in its own footer or toggle area, without blocking the surrounding page or turning a scratchpad failure into a global error.

## Privacy, retention and boundaries

Only the owning learner can read or change their note. There is no administrator, support, moderation, export, search, count or reporting view of another learner's Notes. Note content is not sent to AI, logs, analytics, diagnostics or error reports. Requests for another person's note disclose neither its text nor whether it exists.

Keep the saved note for the account's lifetime. Age, inactivity and progress resets do not delete it. Account erasure removes the note and its saved-time record, with no retained excerpt or anonymous copy. An authorized hold delays erasure honestly. Device copies clear under the account/device rules when the device next participates; server erasure does not claim to remotely wipe an offline device.

Notes has no standalone page, Continue target, export/download feature, list of notes, manual Save, revision history, attachment or formatting. Normal text selection remains available. It produces no XP, Credits, achievements, streak changes, learning completion, skill evidence or notification. Active time, where applicable, follows the shared group-level rule rather than a second Notes timer.

## Check the experience

Open the same note through all three entry points. Test load-before-edit, an empty save, the character limit and an oversized paste. Check a save outage and recovery, two conflicting tabs, same-account return after sign-out, different-account cleanup, mobile access, recorded-test suppression and maintenance. Confirm a progress reset preserves Notes, account erasure removes it, and no staff view or generated-help action can read its content.
