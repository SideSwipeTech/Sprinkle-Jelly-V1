# Data and Privacy

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Account settings](../domains/Profile/Settings.md) · [Administrative erasure](../domains/Administration/People.md)

## Purpose and ownership

Every domain states what learner data it owns, why it keeps it, how it is recovered and when it is removed. The shared lifecycle coordinates those rules without becoming a second owner or a universal promise to retain everything.

Private source, Notes, answers, project files, terminal contents and generated prompts do not become staff-readable merely because a shared storage or diagnostic capability handles them. Use the explicit support/review exceptions from Administration; do not create an emergency bypass into private work.

## What Saved means

| Reading | Promise |
|---|---|
| Saving | A write is in progress |
| Saved on this device | This device holds a recoverable copy under the owner's clearing rules |
| Saved | The storage named by the experience confirmed the relevant write |
| Not saved / work at risk | Confirmation failed or reliable recovery cannot be established |
| Detail no longer retained | The record's permitted detail expired; Retry cannot restore it |

A local checkpoint is not a platform save. Opening an empty editor before existing content has loaded must not overwrite unseen work. A killed tab or power loss does not prove its last write succeeded. State the actual recovery horizon and the device boundary.

## Intentional recovery differences

| Area | Promise and important exception |
|---|---|
| Code Lab / Practice draft | Device-local, scoped by learner/item/language; clear at sign-out or identity change |
| Lesson executable example | No promise of edited code/output on a later visit |
| Workspace | Saved files plus explicit local recovery and bounded previous versions; conflict choices preserve unsaved text |
| Recorded Assessment | Acknowledged answers persist; unsent typing can return only from its device before the deadline |
| Timed Debug | One acknowledged deadline checkpoint, distinct from the local draft |
| Quick Notes | One stored note; unacknowledged recovery survives the same learner's sign-out, never a different account |
| Topic Request draft | Discard on Cancel; no persistent unsent draft promised |
| Appearance | Device preference survives sign-out; it is not learner content |

Notes' deliberate-next-edit replacement rule is not Workspace's merge/conflict dialog. Generalizing either would change an approved product behavior. A different account must never see the previous learner's text even when local cleanup failed; block disclosure and retry cleanup.

## Retention is not a feature quota

The domain descriptions own exact periods and recent-item floors. Where the rule is an age window OR a recent-entry protection, retain detail satisfying either, not only entries satisfying both. Counts for Challenges, Tracks, Daily and Debug stay separate.

Practice solves and solution entries survive code expiry. Assessment summaries survive question-detail expiry. Workspace keeps current files until explicit deletion/erasure, with separately bounded previous versions. Notes has no inactivity purge. Notifications has an age limit, not a volume eviction policy. Annual/lifetime summaries are preserved before shorter-lived activity expires.

Pending work must retain what is required to finish it. Do not delete original Assessment grading material while its obligation is unresolved or treat an expired detailed row as an absent earned outcome. Do not claim a retained summary includes source that is no longer held.

## Different removal operations

| Operation | Meaning |
|---|---|
| Unpublish / Archive authored content | Changes learner availability under that domain's rules; not deletion of private histories |
| Delete authored content | Removes eligible content while preserving required earned records and safe dependencies |
| Delete learner project | Removes that project and versions; does not revoke historical course completion |
| Reset progress | Alters only explicitly selected resettable facts; preserves the stated awards, solves, files and certificates |
| Detail expiry | Removes eligible short-lived detail, not lasting earned facts |
| Account erasure | Removes the person's owned data through every applicable owner and completes only after required work finishes |

Course changes do not rewrite issued certificates. Account erasure has its separate identifying-certificate consequence. A certificate-name correction, payment reversal and ordinary membership lapse are not interchangeable with erasure.

## Erasure, holds and backups

Learner-initiated erasure follows the seven-day cancellation window and then automatic processing; it has no admin approval gate. Super Admin initiation requires exact-person confirmation, recent verification and a mandatory reason, without that cancellation window. Only one unfinished erasure operates for an account.

Work proceeds through the owning records and related file objects, is safe to resume and reports its real progress. A failure midway is not Erased. Keep only the explicitly permitted non-identifying planning/aggregate facts and protected administrative history; remove learner free text and attribution wherever their disposition requires it. Do not promise that a retained de-identified request preserves its title or description.

A genuine scoped hold delays applicable deletion and explains that state without exposing confidential details. Review and release follow Administration. Releasing the last applicable hold resumes unfinished work; a hold never restores already-erased data.

Live deletion is not a claim that every backup vanished at that instant. Backup age-out and restore handling must honor the approved retention policy, and a restore must not silently resurrect erased accounts or deleted private content. Precise storage/key/backup mechanisms belong in Architecture and operations procedures.

When an erased or different-account device next participates, clear its applicable private recovery state. Do not claim remote deletion from a device that remains offline. Privacy/terms wording and legal policy remain on the main site; these documents describe the product's promised behavior.

## Generated help and reporting

The 24-hour generated-help recovery record is bounded request information plus its separate response, not retention of the original prompt/attachments or an indefinite conversation. Provider controls must match Generated Help before activation. No raw learner text enters logs, ordinary analytics, content-gap reports or staff exports merely for troubleshooting.

Aggregate reports show safe counts and retain their exclusion rules. Public certificate verification discloses only its approved narrow response, not an account profile. Shared data capabilities create no bulk learner-code export, public solution library or staff impersonation path.

## Checks

Exercise every save/recovery meaning, sign-out versus account switch, Notes' exception, OR-based retention floors, pending grading protection, expired-detail views and selective progress resets. Test erasure interruption/hold/release, separate object removal, backup restoration safeguards and offline-device honesty. Neither a retention cleanup nor an admin report may widen access to private data.
