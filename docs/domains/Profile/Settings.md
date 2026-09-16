# Settings

**Status:** Reviewed  
**Group:** Overview and Account  
[Profile](Profile.md)

## Purpose and sections

Settings explains what the learner can control and where each choice applies. Its six addressable sections are Notifications, Appearance, Companion, Certificates, Account, and Data & privacy. Technical enforcement and the detailed console workflow review belong elsewhere.

Preferences about the person follow the account. Preferences about this screen stay on the device. State the scope beside the control rather than implying everything synchronizes.

| Scope | Choices |
|---|---|
| Device | Interface theme/mode, navigation model, accent, typeface, code-editor and terminal palette |
| Account | Reduced motion, companion preferences and personal name, Solutions list/grid view, notification preferences, certificate display name and certificate visibility |

Other domains continue to own the preferences listed under them. Hosting a control here does not duplicate its underlying rule.

## Independent saving

Each changed setting saves independently and takes effect without a reload. Show its own saving result. An account-setting failure returns that control to its previous value and explains the failure; it does not revert a neighboring setting that saved.

A device choice that applies but cannot be stored remains active for the visit and says Applied but not remembered. Do not claim it will survive the next visit. Do not offer Save All, Reset Everything or one apparent operation that combines account and device state.

Invalid values identify the relevant field and leave the previous value intact. An unavailable setting read is not a set of fake default choices.

## Appearance and the header switcher

| Choice | Options | Initial behavior |
|---|---|---|
| Interface theme | Halo, Voyage, Forge, Meridian, Atlas, Atelier | Atlas |
| Mode | Light, Dark, Follow system | Follow system |
| Navigation model | Rail, Spine, Command, Dock, Dual | Rail |
| Accent | Ember, Jade, Orchid, Glacier, Azure | Theme default |
| Typeface | Theme default, Bricolage, Sora, Archivo, Inter | Theme default |
| Editor and terminal palette | The shared supported palettes, separate from the interface theme | Shared designated default |

Each of the six themes has light and dark appearances. Follow system chooses a mode; it is not a thirteenth theme. Theme, navigation, accent and typeface choices do not change product behavior. On narrow layouts, navigation uses the shared drawer behavior regardless of the chosen desktop model.

**Keep the header theme/mode switcher.** It is a convenient second entry point to the same device preference controlled in Settings. A header change is immediately reflected in Settings and a Settings change in the header. There is no independent header preference, second default or conflicting saved value. The full set of appearance controls remains in Settings.

Apply remembered appearance before the interface first appears so the default does not flash unnecessarily. Choices remain device-scoped and survive sign-out; using another device does not imply they followed the account. Offer only the shared supported values, not arbitrary colors or guessed editor palettes.

### Reduced motion

Reduced motion follows the learner across devices. Honor the operating system's own preference as well; either requesting reduced motion is enough to reduce it. If the account preference cannot be read, honor the available operating-system signal and the shared safe fallback rather than enabling an animation-heavy experience by assumption.

Reduced motion is different from a Quiet companion. Quiet controls unsolicited presentation, not whether every animation is permitted.

## Notification controls

Host the seven switches owned by [Notifications](../Notifications/Notifications.md), preserving separate Mock and Company settings. Changes normally stop new items being created rather than merely hiding them; they do not remove previous notices or backfill an off period.

**Published course-change notices remain mandatory even when System is off.** Explain this beside the System switch. General broadcasts and other optional System notices still follow the preference. Settings does not create a new category, global mute, channel selection, digest or quiet-hours control.

## Companion controls

Provide Present or Quiet, Companion or Plain presentation, the learner's personal companion name with Reset, and orientation replay. The first three are account preferences; replay starts the existing orientation and does not reset the learner's preferences or progress.

The personal name is trimmed plain text from 2 to 32 displayed characters, without markup, control characters or impersonation of reserved platform/staff names. Renaming affects presentation, not identity, knowledge, permissions or personality. An empty/invalid name leaves the old name standing. Reset restores the product default WizBit; resetting to the default is different from accepting an impersonating custom name.

There is no Hidden option. Page restrictions win over preferences: neither Present, Plain nor orientation replay opens help inside a prohibited activity. A replay may temporarily present the allowed orientation and then returns to the learner's previous presentation rules. WizBit's domain defines the detailed orientation and presence behavior.

## Certificate controls

Display the existing name-setting/proposal block and per-certificate Hide/Show controls from [Certificates](../Certificates/Certificates.md). Do not unlock a locked name here, let staff substitute another proposed value or add a learner revocation action. An unavailable name is not an unset name, and a pending proposal is not a failed save.

Certificate visibility remains independent of validity. Ordinary course changes keep completed recognition and issued certificates unchanged. Account erasure has the separate consequences described below.

## Account information

Show seven read-only facts as text, not disabled inputs: display name, email, Labs role, whether access is active, access end date, current sign-in expiry and member-since. Identify the main site or Access as appropriate and link to the main site for permitted identity/membership changes.

Reread account/access facts through the shared Access boundary when opening the section. A bounded last-verified view must carry its freshness if fresh verification is unavailable. Could not verify access, Signed out, Inactive and Past its end are different conditions; an upstream outage must not pretend that membership expired.

The single Labs role is User, Admin or Super Admin under [Administration](../Administration/Administration.md). WordPress `administrator` resolves to Super Admin; the WordPress role designated for Labs administration resolves to Admin; other verified accounts resolve to User. Super Admin takes precedence when both mappings apply. Show that WordPress controls the role. An unreadable role is Unavailable, not an inferred staff role or a confirmed User result. There is no role picker, grant/removal control or permission editor inside Labs. Account dates and the displayed role are information here, not a second implementation of admission rules.

No plan, price, invoice, renewal, payment management, password form, biography editor, session list or Sign out everywhere screen is introduced in this section. Those concerns stay with their designated owners.

## Data & privacy

Link the main site's privacy policy, terms and consent information. Do not maintain competing copies of those policies in Labs. Explain browser-held non-setting state in plain words, including relevant saved layouts, recovery data and dismissed presentation state, from the same inventory used by the platform. This is disclosure, not a new collection of reset buttons or a view of private stored values.

Account and device preferences retain their declared ownership. Switching accounts clears the previous learner's private browser-held material under each area's rules, while device appearance stays. Quick Notes' explicitly approved same-account recovery exception remains; do not erase it merely to simplify another area's sign-out rule.

### Request account erasure

Erasure is initiated by the learner, not approved by an administrator. Explain the affected records, information retained without attribution where applicable, the certificate consequence, the cancellation period and the completion term before confirmation. The main-site membership and payment records remain governed by the main site's own processes; this action does not silently perform a purchase refund or cancellation there.

Require recent identity confirmation through Access and typing the account's email. A mismatch records no erasure request. A stale verification names the need to verify again. Repeated confirmation of the same unfinished request returns that request rather than creating another.

| Stage | Learner experience |
|---|---|
| Cancellable | Seven days from the recorded request, with the exact cancellation deadline; the account works normally |
| Scheduled | The cancellation period has ended and processing begins automatically; no approval is needed |
| In progress | The platform is carrying out the erasure; do not claim it already finished |
| Held | A data-retention hold delays processing; explain the delay without confidential details |
| Unable to continue | A platform processing failure, distinct from a hold, with repair owned by the platform |
| Complete | Report completion only when the complete required process is finished |

The ordinary completion term is within 30 days after the cancellation window closes, subject to a disclosed retention hold. Cancellation is available only in its window; a failed cancellation must not appear successful. Processing resumes safely after interruption or release of a hold. A hold may pause work already started but cannot restore material already erased. Material delay is surfaced to the operator, not left as an endless invisible retry.

**Certificate consequence:** account erasure invalidates the erased account's certificates for public verification and removes their identifying presentation. This is not an ordinary course edit and must not be described as certificates continuing to verify after erasure. Topic Requests and other approved anonymous planning records can retain de-identified facts, so do not promise that every platform record disappears.

There is no broad account-export feature or prepared export prerequisite. Existing project, source and certificate downloads retain their own rules. Erasure and cancellation create no new notification category or confirmation email; this page reports their state.

## Staff boundaries and errors

Neither Admin nor Super Admin can edit main-site identity here, read Quick Notes or approve/reject/cancel a learner's erasure request. Super Admin decides the learner's exact certificate-name proposal and manages genuine retention holds in Administration. These are responsibilities of the existing role, not separate certificate-reviewer or retention-operator roles or an Approve erasure queue.

Keep errors local to the affected section/control. Never replace unknown account facts with zeros or inferred membership states. Preserve saved neighboring preferences and distinguish missing information from blocked permission. All controls must work by keyboard and remain understandable without color alone.

## Completion checks

Check every setting's scope, independent failures, no-storage appearance, the header-to-Settings round trip, Follow system and reduced-motion precedence. Check restricted-page companion behavior, the mandatory course-change exception, certificate states and read-only identity. Exercise erasure confirmation, stale verification, cancellation success/failure, seven-day expiry, holds, interruption, final completion and certificate privacy. Verify the WordPress-derived three-role display and that no local role editor, broad export, identity editor or staff erasure-approval workflow appears.
