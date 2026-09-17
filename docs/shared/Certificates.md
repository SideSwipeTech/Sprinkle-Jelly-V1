# Certificates

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Certificate rules](../domains/Certificates/Certificates.md) · [Courses](../domains/Courses/Courses.md)

## Shared responsibility

Certificates turns an eligible, durable learning completion into the existing completion credential. It owns the award identity, issuance state, document generation, public verification and allowed correction/revocation history. Courses owns whether the required learning was completed.

There are two eligible sources: completed video subjects and completed written subjects whose certificate setting was enabled when completion was recognized. Sharing Subject → Chapter → Lesson does not merge their eligibility or XP policies. A lesson, quiz, individual project, Track, Practice problem or Assessment does not independently issue a certificate.

## Completion input and issuance

Courses supplies the learner, original awarding-item identity and eligible completion facts, with the relevant presentation policy. Certificates verifies the permitted source and resolves one existing award for duplicate delivery. It cannot recompute course progress or accept a discretionary staff award.

**Journey:** Record eligible learning completion → resolve certificate name → generate the document → make the valid issued document available → notify once.

A missing certificate name leaves a pending award and an actual action for the learner. It does not undo completion or print a username as a substitute. Saving a valid name releases waiting awards without duplicate issuance. Generation is separate from the completion transaction and may finish after the learner leaves.

Use the domain's real states: awaiting name, generating, generation failed, issued or revoked. They are user-visible readings of the owner's state, not new independent records in Home/Profile. A generation failure remains recoverable through its specific process.

## What other domains consume

| Consumer | Permitted use |
|---|---|
| Courses | Its eligible award outcome and earned count |
| Home | A pending-name action only when an award truly waits for it |
| Profile / Settings | The learner's collection, name controls and visibility actions |
| Notifications | Actual document-ready and issuer-revocation events |
| Administration | Authorized name decisions, explicit reissue, revocation and generation retry |
| Public verification | The narrow approved certificate response, not a learner profile |

The collection does not rank or split certificates by which learning format issued them. Another domain does not create its own certificate status, expiry rule or verification identity.

## Names, documents and public visibility

The certificate name is editable until the owner's generation lock, then corrected only through the exact learner-proposed value and authorized decision. Approval does not silently replace already-issued documents. Reissue is a separate explicit action; a failed replacement leaves the prior usable document available.

Issued award information survives ordinary course edits, new lessons, archive/deletion of catalogue content, membership lapse and progress resets. Those events do not rewrite the name, title, dates or presentation or revoke the award. Account erasure and approved invalid-entitlement/revocation actions retain their separate consequences.

The owner can download an issued valid document and copy its existing verification link. Hide/Show changes public visibility, not validity or the owner download. Copying the link does not unhide, mint another credential or send a notice.

Public verification needs no learner sign-in and discloses only the domain's approved identifier, display name, awarding item, issue date and status, plus when verification was checked. It shows no email, payment details, score, private reason or unrelated account record. Unknown/hidden, revoked, unavailable and rate-limited responses retain their distinct privacy-safe behavior.

## Recovery and safeguards

A valid completion cannot issue twice because its message retried. Failed generation does not create a second award; the specific retry continues the same credential. A generic background-job control cannot create an arbitrary certificate or choose its content.

Revocation follows the owner's permitted grounds with exact confirmation and history. It is not a name correction or punishment invented by another domain. No destructive course action may remove original award facts required for verification. Erasure removes identifying presentation as specified while retaining only permitted protected records.

Notifications follows its own preferences and once-only delivery. A failed or muted notice does not affect the certificate's actual validity. An old downloaded document cannot be remotely recalled; its verification destination must report the current allowed state honestly.

## Checks

Test duplicate completions, both eligible sources, a non-certificate subject, missing name, generation failure and exact-name correction/reissue. Update/delete catalogue content without changing an issued award. Verify owner-only downloads, Hide/Show, public-field limits, notification failure, permitted revocation and account erasure. No shared consumer may invent an award or bypass validity.
