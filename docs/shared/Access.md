# Access

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Role responsibilities](../domains/Administration/Administration.md) · [Account settings](../domains/Profile/Settings.md)

## Purpose and ownership

Access supplies the verified person, their grounds for entering Labs, their normalized role and current session restrictions. Every domain applies that answer to its own records and actions. A menu being hidden is not an access check.

WordPress owns account identity, sign-in, password changes, membership, eligibility and the main site's consent requirements. Labs has no registration, password, billing, age-verification or guardian-management experience. It does not infer eligibility from an email, course choice or browser claim. The connector and security mechanisms belong in Architecture, not this product description.

## Entering Labs

A successful main-site handoff establishes or refreshes the appropriate Labs session. Return to the requested internal destination when valid; otherwise use Home. A return address cannot redirect to an arbitrary external destination or reveal protected content.

A valid membership or a verified staff role supplies a ground for entry. Neither creates the other. A staff-only account has no invented membership, price, end date or renewal message. Staff can walk permitted learner experiences without adding learner awards, evidence or aggregate participation. They are excluded from learner broadcasts, not from every ordinary notice concerning their own activity.

| Situation | Experience |
|---|---|
| Signed out | Use the main-site sign-in/handoff, not a Labs password form |
| Verified, never had learner access and no staff ground | Explain that access is required and point to the main site |
| Previously entitled, access lapsed and no staff ground | Explain the lapse and main-site renewal route |
| Access cannot currently be checked | Explain verification unavailability, not missing membership or misconduct |
| Banned or suspended | Show the factual restriction and its end when applicable |
| Erasure completed | Show that state without exposing the former private record |

The gate rechecks after membership changes within the shared 60-second interval. Display the end date supplied by the main site; do not calculate a membership term or independently expire access from a device clock. An ordinary lapse preserves saved records and issued certificate validity.

## Three roles

| Labs role | Verified source |
|---|---|
| User | An eligible verified account without either staff mapping |
| Admin | The WordPress role designated for Labs administration |
| Super Admin | WordPress administrator |

Super Admin takes precedence when both staff mappings apply. Only the designated Admin mapping qualifies; unrelated WordPress author/editor roles are not automatically staff. The specific mapping is main-site integration configuration, not a role editor in Labs.

The fixed action responsibilities are in Administration. Labs offers no role assignment, staff invitation, permission editor or per-person override. Authoring, reviewing and support describe work, not extra roles. Check current authority when the action occurs. A verified downgrade removes that authority; unavailable verification never promotes someone or enables an otherwise forbidden write.

## One account, one active place

Learners and both staff roles share the same session policy. Several tabs in one signed-in browser context share one session; another browser/device requests entry rather than acquiring a second active session.

| Existing session | New sign-in outcome |
|---|---|
| None active | Proceed |
| Attended | Ask that session for approval and explain the wait to the requesting device |
| Confirmed unattended under the presence threshold | Replace it and explain the change to the previous device |
| Inside a live recorded test | Refuse the new sign-in for the test's duration; do not prompt or interrupt the test device |
| State cannot be established | Treat it as in use and explain the uncertainty; do not silently remove it |

The approval prompt identifies device type and request time, not location. Only the existing session can approve or deny. Silence is not consent: a later unattended replacement is a separately established presence outcome, not a recorded approval. A denied request changes no active session. Competing requests must never create two active sessions.

A replaced session explains that the account was opened elsewhere, leaves unsaved work visible where safe, stops protected actions and does not sign itself back in. It must not look like a random logout or automatically erase local work before the applicable recovery rule is applied.

## Session and verification limits

| Rule | Product value |
|---|---:|
| Session life from the latest successful handoff | 12 hours |
| Ordinary session inactivity allowance | 2 hours |
| Unattended-session presence threshold | 2 minutes |
| Recent verification for protected confirmations and Super Admin writes | 15 minutes |
| Remaining session margin beyond accommodated test duration and grace | 5 minutes |
| Routine gate recheck | 60 seconds |
| Reuse of a resolved authority answer | At most 5 seconds |
| Last-known-valid access during a main-site verification outage | At most 24 hours from the first failed required verification |

Refreshing through the main-site flow on the same identity/session renews its handoff-based life. Background activity is not permission to extend total life indefinitely. A recorded test uses its admitted clock rather than ordinary idle expiration; Start verifies that its session can cover the test and margin.

Outage continuation is for an existing session with previously verified access only. It permits no new sign-in, account switch, privilege expansion or extension of required recent-verification authority. A known restriction or revocation wins. At the bound, stop protected access and explain the verification problem; do not call it a purchase failure.

## Ending access and protecting work

Main-site sign-out and verified account/security changes reach Labs through the same Access boundary. There is no separate Labs password or identity-management system. Ended sessions cannot restart their programs or retain protected administrative rights.

A recorded restriction is enforced on subsequent protected actions and propagated promptly to live work; the standing-change target is five seconds from Labs recording it. Delivery failures and fallback stopping are operational faults, not a reason to claim an immediate stop that was not confirmed.

An ordinary entitlement lapse discovered after a test was admitted does not interrupt that test. It finishes under its captured conditions and access is evaluated afterward. A security action is different: Assessments safely finalizes acknowledged answers or invalidates when safe finalization is impossible. Another-device sign-in is never a way to end the test.

Save outstanding work where permitted, but say Saved only after confirmation. Ending access does not mean deleting retained projects, notes, results or rewards. Account erasure and confirmed payment reversal follow their distinct owning rules.

## Privacy, attribution and recovery

A learner reads only their own private records. Missing, hidden and another person's records reveal no private existence information; a genuine storage outage remains an outage. Public certificate verification is the limited exception defined by Certificates, not a public learner profile.

Both staff roles are barred from private learner code, Notes, project files and terminal contents. The permitted audited support view and text deliberately submitted for staff review retain their specific exceptions. Every protected staff change is attributed to an individual; its required record and change succeed together. Required audited reads refuse disclosure if their record cannot be made.

Account switching clears private device state before the arriving learner can read it. Preserve only the documented exceptions: device appearance and the same-account Notes recovery behavior. Erasure removes owned records through their domains and preserves only the permitted non-identifying or protected records. A hold delays deletion honestly; an offline device is not falsely reported as remotely wiped.

## Consumer checks

Check membership-only and staff-only entry, all role mappings, downgrade, unknown verification, invalid return destinations, session refresh, attended/denied/unattended entry and concurrent requests. Test the live-test refusal, expiry versus security ending, outage bounds, required recent verification, recovery on sign-out and account switching, private-record refusal and attributed staff actions. Development sign-in must not provide a production bypass.
