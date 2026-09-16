# Administration

**Status:** Reviewed  
**Group:** Administration

## Purpose

Administration is one place to manage Labs: prepare and publish content, review requests and reports, help learners, inspect operations and carry out explicitly permitted account actions. It is not a second owner of every domain.

Each domain owns its content, validation, outcomes and management actions. Administration hosts those capabilities and owns the cross-domain console, people lookup, report review and administrative oversight. Shared forms do not create shared problem ownership.

| Document | Covers |
|---|---|
| [Administration](Administration.md) | Roles, console behavior, permissions, confirmations and boundaries |
| [Content](Content.md) | Authoring, approvals, classification, sources, reports and curation |
| [People](People.md) | Support, restrictions, corrections, resets, certificates and erasure |
| [Operations](Operations.md) | Health, delayed work, recovery, maintenance, alerts and retention oversight |
| [Reports](Reports.md) | Participation, content review, exports, audit and list behavior |

These are product descriptions. The arrangement of admin screens will be refined separately using the Demo. Technologies, import rules and technical security enforcement belong in Architecture and Rules.

## Three roles, all controlled by WordPress

| Labs role | How it is determined | Purpose |
|---|---|---|
| User | A verified account that does not qualify for either staff role | The learner experience, subject to ordinary membership/access requirements |
| Admin | The WordPress role designated for Labs administration by the main-site integration | Routine content preparation, review and permitted learner support |
| Super Admin | The verified WordPress `administrator` role | Full approved administration, publishing approval and sensitive controls |

WordPress is the only place where staff roles are assigned or removed. Labs reads the verified result through Access. It has no role creator, role assignment, permission editor, local staff invitation, manual promotion, per-user privilege override or emergency promotion control. A staff role cannot be chosen through a learner preference, email address, display name or browser-provided claim.

The integration has one explicitly designated Admin-role mapping. Do not automatically treat every WordPress editor, author or unrelated custom role as Admin. Its configured role identifier belongs to the main-site integration; it is not another learner setting or a Labs-managed role.

If a WordPress account qualifies for both staff mappings, Super Admin takes precedence. Otherwise it resolves to Admin or User. Display one normalized Labs role, not a list of unrelated WordPress roles. Author, reviewer, moderator and support describe work, not additional assignable roles.

A verified account with no staff mapping is a User. An unreadable role result is different: administrative access stays unavailable, not guessed or elevated. Recheck current authority when an action is performed; a stale page cannot retain a removed privilege. A verified downgrade removes the corresponding controls and prevents further privileged work. Access owns the bounded refresh and outage behavior.

Staff access does not require buying a learner membership. User status alone does not grant paid access, bypass a restriction or restore an expired membership. Staff activity remains excluded from learner reward and measurement populations under the shared rule. Role changes do not rewrite historical awards or erase staff attribution.

## Fixed responsibilities

The role policy is shared by every domain. There is no editable role-to-action matrix inside Labs.

| Work | Admin | Super Admin |
|---|---|---|
| Enter the console and read permitted operational summaries | Yes | Yes |
| Create/edit drafts, use available authoring tools and submit changes | Yes | Yes |
| Publish or apply live content/settings changes; approve publication | No | Yes |
| Archive, remove from publication or permanently delete live authored content | No | Yes |
| Delete an eligible unpublished draft through its normal safe controls | Yes | Yes |
| Review content reports, Topic Requests and factual proctoring events | Yes | Yes |
| Search people and read permitted, audited support facts | Yes | Yes |
| Read permitted aggregate reports and take their audited exports | Yes | Yes |
| Suspend, ban, lift restrictions, invalidate results or reset progress | No | Yes |
| Grant Assessment accommodations or a fresh recorded attempt | No | Yes |
| Repair XP/Credits, change Economy settings or retry protected failed work | No | Yes |
| Decide certificate names, reissue, revoke or retry generation | No | Yes |
| Send/stop broadcasts, change live curation or global assistant controls | No | Yes |
| Change the shared skill/topic vocabulary and its labels | No | Yes |
| Place/release holds, initiate account erasure or confirm payment reversal | No | Yes |
| Assign/remove roles or edit account identity inside Labs | No | No |
| Read private learner code, Notes, project files or terminal content | No | No |

Admin combines the routine work without creating several specialist roles. Admin can prepare changes to an existing item; only the approved live update takes effect for learners. The Super Admin can work directly without submitting work to themselves. This does not restore a compulsory archive-and-duplicate editing process.

A named operational or owner action still obeys its own restrictions. Super Admin is not permission to invent scores, bypass privacy, rewrite audit history or make an unsupported product action available. Host-level operational authorization is not replaced by a console toggle.

## The console

Use one persistent shell with grouped navigation, the current destination and breadcrumb, a compact health indicator, and account/actions. Destinations appear only when the role permits them. Groups organize navigation; they are not separate applications or additional permission systems.

The operations hub is the administrative landing page. Domain studios open inside the same shell and fail independently. A direct address receives the same access decision as its navigation link. Do not disclose administrative titles, counts or private data while role verification is unresolved or refused.

There is no global cross-studio search, command palette, second overview dashboard or empty future-feature destination in the approved scope. Local search remains available where its owning page defines it. Navigation remains usable with a keyboard and moves to the shared drawer treatment on narrow screens.

WizBit, Quick Notes and the learner confirmation host do not appear in Administration. Staff receive ordinary system feedback, not a second per-feature message stack. Warning and error notices remain until deliberately dismissed.

## Confirmation and accountability

Match confirmation to the consequence. Archiving uses an ordinary confirmation; permanent deletion names the item and requires typed confirmation; an action affecting a person requires typed confirmation and a reason. Unbanning is the explicit exception: require typed confirmation and attribution but no reason. Staff-initiated account erasure always requires a reason.

A mistyped confirmation or absent required reason performs nothing. Restoring access must read differently from taking it away. Show the exact affected person or content and any required impact counts. If an irreversible action needs an exact count and that count is unavailable, do not offer confirmation against an estimate.

Super Admin writes retain the shared recent-verification rule: main-site verification no older than fifteen minutes. A stale verification explains how to verify again through the same access flow, without a new Labs password form. The later workflow review may improve presentation, not silently remove this safeguard.

An administrative change and its required attributed record succeed together. Repeating a confirmed operation returns its existing result instead of duplicating it. Record the actual individual, action, target, time and required reason; automatic transitions are identified as platform actions, not attributed to a fictitious staff member.

## Common failure behavior

Keep usable information when another panel fails. Distinguish nothing authored, no search matches, unauthorized, unavailable and a genuine zero. Health that cannot be read is Unknown, never Healthy. A saved change that could not be announced is still saved, with delivery handled separately.

Do not silently discard typed work after a save conflict. Do not report partially completed multi-domain work as finished. Lists show actual counted totals only; a failed ordinary count does not erase readable rows. Raw errors, secrets, hidden content and learner-written private work stay out of notices and reports.

## Checks

Verify WordPress-controlled User/Admin/Super Admin mapping, precedence, unknown verification, role downgrade and staff access without membership. Confirm that Labs has no role-assignment or permission-editing route. Exercise Admin draft/review work, Super Admin publication and protected actions, expired recent verification, direct-address access, failed audit recording and repeated confirmations. Confirm private learner work remains inaccessible to both staff roles.
