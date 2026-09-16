# Certificates

**Status:** Reviewed  
**Group:** Learning  
[Courses](../Courses/Courses.md)

## Purpose

A certificate records that Wizly awarded a learning completion to a learner on a stated date and whether that award is valid. It is not an assessment score, legal-identity check, proof of outside attendance, accreditation or employment guarantee.

Certificates owns issuance, the displayed name, generated documents, download, verification, visibility and authorized corrections. The learning item supplies completion; Certificates does not re-grade it.

## Earning a certificate

Only two learning completions issue certificates: a completed video subject, and a completed written subject whose certificate setting was enabled when completion was recognized. Lessons, chapters, quizzes, challenges, tracks, standalone projects, assessments and streaks do not independently issue one.

Issuance is automatic and free, with no application. Repeated delivery of the same completion returns the existing award, not a second certificate. There is at most one current valid certificate for a learner and awarding item. A replacement reuses that recognition rather than creating another earned item.

Turning on a written subject's certificate setting later does not back-issue previous completions. Turning it off does not invalidate certificates already earned. Every completed video subject awards one; using the shared Subject → Chapter → Lesson hierarchy does not change that distinction.

**Workflow:** Complete eligible learning → confirm certificate name when needed → document generates → certificate appears → download or share its verification link.

## Display name

Use one certificate display name for the learner, separate from their account name, email and sign-in identity. Preview the exact printed name before confirmation; never print a username or placeholder because the name is missing.

A name is trimmed and repeated spaces normalized, preserving case and writing system. Allow names from different scripts with ordinary name punctuation such as spaces, apostrophes, hyphens and periods. The normalized name must be two to one hundred characters, include a letter and contain no markup, control characters, web address or unsupported symbols. Invalid input explains the rule and preserves the previous value.

The name is freely editable until the first certificate begins generation, then locked. An earned certificate without a valid name waits without penalty; completion still succeeds. Saving a valid name releases all waiting certificates independently. Home shows Set certificate name only when something is genuinely waiting.

### Correcting a locked name

The learner proposes a corrected name with a reason. They can cancel a pending proposal or replace it with another; only one is current. Authorized staff approve that exact proposal or reject it with an explanation. They cannot silently substitute a different name or approve an outdated proposal.

Approval updates the certificate name and the proposal together. A rejection leaves the existing name and shows the safe reason on the learner's page. No identity-document upload or legal-identity verification is introduced.

Certificates not yet generated use the approved name. Documents already issued keep their existing name unless staff separately confirm reissue. Reissue affects eligible valid certificates, including hidden ones, and preserves their identifier, completion date, issue date and validity. Revoked certificates are excluded.

Before reissue, show the affected count. If that set changes, refresh the preview rather than silently expanding the action. A replacement becomes downloadable only when ready; a failure leaves the previous document usable and is reported per certificate. A previously downloaded document cannot be recalled, but its QR continues to show current verification for the same identifier.

## Certificate states and collection

| State | What the learner sees |
|---|---|
| Awaiting name | Completion is recorded; set the certificate name |
| Generating | The platform is preparing the document; no false Download link |
| Generation failed | A platform problem, not a learner mistake; the award is not lost |
| Issued | Valid document, with Download and the available visibility/share actions |
| Revoked | Award is not valid; no document download |

The first three are explanations of a pending certificate, not separate kinds of award. Lack of generation capacity is still Generating, not a failure. Generation retries through shared background processing; a persistent failure remains visible and retryable by authorized staff rather than being dropped.

The personal certificate collection lists all the learner's awards with learning item, date where issued and status. It does not split or rank them by written/video source. No awards, no search matches and a failed read are different states. Courses may show a small earned-certificate count; unknown counts are not zero. Certificates is not a Continue target.

## Document and download

The certificate contains its display name, awarding-item name, completion date, issue date, unique identifier, verification QR, branding and assurance statement. Dates name the product timezone. It contains no score, readiness measure, skill judgment or measured period.

Use the chosen platform-style or course-specific presentation, defaulting to platform-style. The issued document preserves its award information and presentation. Later content, naming, branding, ordering or curriculum changes do not silently rewrite it.

The fixed assurance statement on both document and public check is:

> Wizly issued this certificate for completion of the named learning item under the displayed certificate name on the stated date. Verification confirms only that award and its current validity; it does not verify legal identity, attendance outside Wizly, employment suitability, or external accreditation.

Only the signed-in owner downloads a valid issued certificate, with no quota or cooldown. Download earns nothing. A temporarily unavailable file is reported as unavailable with a retry, not as a nonexistent certificate. Revoked certificates cannot be downloaded through an old document link either.

## Public verification and visibility

Anyone with the identifier can verify without signing in. A valid visible result shows exactly the identifier, display name, awarding item, issue date and current status, with the time checked and the assurance statement. It reveals no email, internal account identifier, payment detail, score, download location or private revocation reason.

| Situation | Public experience |
|---|---|
| Valid and visible | Current award information and validity |
| Unknown, malformed, pending, hidden or erased | No certificate can be verified for this identifier; do not reveal which situation applies |
| Revoked | This certificate is not valid; no private reason or payment detail |
| Request allowance exceeded | Explain that verification is temporarily throttled and can be retried |
| Verification cannot run | Explain that validity cannot be confirmed right now; do not label it invalid or give a misleading successful-check time |

Verification reads current validity, not a stale answer. It uses the shared availability protections, with a sixty-lookups-per-minute visitor allowance. Its exact protection mechanisms belong to the technical documents.

### Hide, show and copy link

The learner can hide a valid certificate from public verification and show it again without a frequency limit. Explain before hiding that its verification link will return the non-disclosing result until shown again. Hiding changes visibility, not validity or owner download.

Copy verification link returns the existing public address, creates no new certificate and never unhides it. The document already contains the QR; there is no separate learner QR-management workflow. A revoked certificate still answers not valid regardless of an earlier hide choice. An erased certificate remains non-disclosing.

## Content changes and lasting awards

Published course changes notify learners, but an already-completed subject remains completed. Course updates, archival and permanent catalogue deletion do not rewrite, revoke or otherwise change an issued certificate. Keep the award's original information and public verification independently of the live content. Do not require the learner to complete newly added lessons to keep it.

An ordinary progress reset, membership lapse or account closure is not revocation. The record and public verification remain as before; owner download still requires the applicable ability to sign in and reach it. Certificates have no time-based expiry.

These content-change protections do not remove the separately authorized name-correction, wrongful-issuance, payment-reversal or account-erasure procedures. An ordinary course edit is never used as a substitute for those explicit actions.

## Staff controls

Staff can search/filter by learner, awarding item, status and date, open private certificate history and perform only authorized actions: revoke, decide a name proposal, reissue after an approved correction, or retry a failed generation. Private status and document history record who did what and when. Viewing does not grant editing powers.

Each awarding item's staff view shows pending, issued and revoked counts independently; hidden certificates still count as issued. The learner's earned count is their own, not a platform total. A count that cannot be computed is not replaced with zero.

Certificate references do not require preserving a removable catalogue entry forever. However, content deletion must preserve earned records and the information needed for certificate verification. If it cannot, refuse the unsafe deletion and offer Archive. There is no arbitrary certificate-delete action or discretionary manual award.

A generation with exhausted retries appears in the appropriate staff/operations view with its failure, retry count and waiting time. An oldest parked generation of one hour, or ten parked generations, raises one grouped owner alert. That alert contains no learner data and creates no new learner notification category.

### Revocation and corrections

Revocation requires an authorized actor, a stated permitted reason, a private reason note and explicit confirmation. Reasons concern an invalid awarding record, duplicate issue, a genuinely defective award, administrative issuance error or completed account erasure. A confirmed payment reversal uses the authorized invalid-award/access procedure. Routine content edits are not defective awards and cannot trigger revocation.

A failed revocation leaves validity unchanged and says so; repeated revocation has no duplicate effect. Applied revocation changes public validity immediately, blocks download and preserves private history. No arbitrary staff score, name substitution, learner revoke control or reinstatement toggle exists.

When a previously invalid awarding fact is objectively valid again, reissue the same recognized certificate with its identity preserved; do not create a discretionary new award. Name correction and ordinary progress reset never revoke an award. Assessment corrections affect no certificates because Assessments is not an issuing source.

## Notices and data

First issuance and issuer revocation each create one learner notice in the shared System category, respecting its notification rules. A failed notice never reverses the certificate action. Hide/show, name-proposal decisions, and name-based reissue do not create issuance/revocation notices; the proposal outcome is available on the learner's own page.

Completed account erasure removes identifying certificate presentation, name proposals and identifying documents. Retain only non-identifying status protection so the erased identifier cannot later become valid or expose the erased person. Public lookup is non-disclosing; create no notice against an account being erased. An unsuccessful document removal or an applicable hold means erasure is not yet complete, not that all data has already gone.

Ordinary account closure is different: it leaves the existing certificate status unchanged. Explain the chosen account action's consequence before confirmation.

## Check these experiences

Complete learning without a name, save one name for several pending awards, replay completion, fail generation and retry. Test the name lock, replacement/cancelled proposals, stale approval, partial reissue and download failure. Check valid, hidden, revoked, erased, unknown and unavailable verification. Edit, archive and delete course content while ensuring completed progress and issued awards stay unchanged. Confirm no duplicate notices, no public private-data leak and no certificate expiry caused by ordinary membership lapse.
