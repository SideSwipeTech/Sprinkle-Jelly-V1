# Messages

**Status:** Reviewed  
[WizBit](WizBit.md) · [Guidance](Guidance.md)

## One stream, two presentations

WizBit presents one stream of authored, passing messages. Companion and Plain are two ways to present it, not two delivery systems. The shared global notice, the durable Notifications inbox and this passing stream stay distinct. A generated answer belongs to its invoking page and is not inserted into any of those message channels. Different channels may serve different purposes for the same event; do not copy one message across them merely to amplify it or evade a duration limit.

Each authored response has one required factual sentence, up to 500 characters, and an optional flourish, up to 240 characters. The fact must stand alone. Companion shows both; Plain shows the fact without losing necessary information. There are not two independently maintained copies of the same response.

Five tones are available: Neutral, Informational, Encouraging, Warning and Serious. Tone has an identifying symbol as well as color. Success is an expression and a display class, not a sixth tone. Message timing follows its class, not its tone.

The owning page supplies the confirmed event and relevant values. The published response rule controls wording, tone, expression, stickiness and celebration. Supplied data cannot override those choices or be treated as instructions. Never display unresolved placeholders, raw errors, hidden-case values or an invented outcome. Missing optional facts use approved fallback wording; an unknown message kind uses a safe non-critical informational fallback and is reported as a platform defect.

## Complete message catalogue

These 39 kinds cover the supported event vocabulary. A kind is not permission to send everywhere: it still requires a real originating fact, permitted presence and any kind-specific restrictions. No new kind is invented by an individual page.

| Kind | What it communicates |
|---|---|
| Work saved | Confirmed durable saving; not a promise about unsent work |
| Saved locally | A device recovery copy exists; platform saving is not implied |
| Conflict | Another acknowledged version prevents silently overwriting work |
| At risk | The platform cannot establish that work is safely saved |
| Completed | The owning action confirmed completion |
| Refused | An action was not admitted, with its safe explanation |
| Failed but retryable | A failure for which a real, safe retry is available |
| Execution started | The execution system confirmed startup |
| Execution stopped | The current program stopped under the owning execution rules |
| Execution succeeded | A confirmed successful program outcome, not an accepted submission |
| Execution failed | The safe execution outcome, distinguishing program and platform problems |
| Accepted | The owning evaluator accepted the submission |
| Not accepted | The owning evaluator did not accept it; no hidden-case details are exposed |
| Hint revealed | The owning page's authored hint, unchanged |
| Editorial unlocked | The owning page made its authored explanation available |
| Answer | A permitted authored guidance or knowledge-base answer |
| No match | A search ran but found no sufficiently clear match; never a lookup outage |
| Skills next action | The existing Progress suggestion, under its admission rules |
| Daily completed | Confirmed Daily completion, under the Daily celebration limit |
| Track completed | Confirmed Track completion, without another invented reward |
| Subject completed | Confirmed written-subject completion |
| Course completed | Confirmed video-subject completion; shared hierarchy does not change its reward rules |
| Solutions milestone | A milestone from Solutions' actual saved-entry total, using its label |
| Test submitted | Assessment confirmed that submission was accepted |
| Test auto-submitted | Assessment's actual reason for ending the test |
| Grading | Assessment is still calculating the result; not a guessed score |
| Result ready | A finalized result is available on the owning page |
| Test invalidated | Assessment's confirmed invalidation and its safe next step |
| Changed after use | An applicable published-content change; factual, never celebrated |
| Progress reset | The actual reset scope and what it left untouched; factual, never celebrated |
| Achievement unlocked | A genuinely unlocked, named achievement |
| Level crossed | A confirmed Economy level crossing |
| Streak milestone | The reached Daily milestone, with any associated badge named once |
| Certificate issued | The certificate is actually issued and available, not merely generating |
| Certificate revoked | The issuer's confirmed status change without private staff reasons |
| Dependency unavailable | A supporting capability is unavailable; unrelated work remains usable |
| Maintenance active | The declared maintenance condition and its learner-safe information |
| Tour step | A step of the Home orientation only |
| Tour completed | The Home orientation's completion only |

Work saved is not a separate Progress saved event. Existing save indicators remain authoritative. A domain that forbids companion save messages, such as Quick Notes, keeps that rule; this catalogue does not introduce messages on its behalf.

Execution success and acceptance are different facts. A hidden failure never identifies the hidden case, dataset, expected answer or private reference. Auto-submit wording distinguishes deadline, integrity enforcement and security action only when Assessment supplies that reason; lost connectivity alone is not an invented terminal reason. Test moments raised while the test still suppresses the stream are not shown as an exception to suppression; the test page communicates its own status.

## Timing, ordering and dismissal

| Setting | Behavior |
|---|---|
| Informational message | 8 seconds |
| Success message | 6 seconds |
| Warning message | 12 seconds |
| Error or acknowledgement required | Remains until acted on or dismissed |
| Minimum before manual advance | 2.5 seconds |
| Waiting messages | At most five behind the visible one |

Show one message at a time, in arrival order. A repeated kind for the same page combines with its already-waiting counterpart before taking another place. If the waiting line is full, drop its oldest non-sticky message. If all waiting messages are sticky, refuse the new one instead; report that refusal to its originating operation without changing the underlying result. Do not silently grow the queue or evict an unacknowledged warning that requires action.

Every message has a dismiss control. Announce its full text once to assistive technology, politely for ordinary information and assertively for errors. Do not announce animated text character by character. Pause automatic dismissal while a message contains keyboard focus, then resume when focus leaves. Return focus appropriately before removing a focused dismiss control. Messages must not steal or trap focus.

No listener means no passing delivery. Messages have no inbox identity, read/unread status or history surviving refresh. A message that never appeared does not remove its underlying fact. Drop/refusal reporting distinguishes suppression, no listener, queue overflow and an all-sticky waiting line.

## Presence and suppression

| Level | Delivered behavior |
|---|---|
| Present | Normal permitted messages and requested help |
| Quiet | Relevant verdicts/errors and requested help; no unsolicited tips, celebrations or nudges |
| Suppressed | No assistant messages or assistance entry points |

Ordinary pages default to Present. Solve workbenches, Code Lab and Workspace are Quiet. The learner's Present/Quiet setting may tighten a page's rule but never loosen it. An unreadable volume preference leaves the page's rule in force; it does not override an unreadable test restriction.

Restrictions apply to the stream, not just the character. Changing to Plain, using another tab or directly requesting help cannot bypass a recorded test. Restricted help consumes no Credits or hint allowance. When test standing is missing or unreadable, keep the restriction rather than guessing that the test ended.

Several restrictions can exist together. Ending one does not clear another. Resume ordinary behavior only when the relevant restrictions actually end, even if the learner has navigated away. Unexplained lasting silence is a platform fault, not a new preference.

Messages raised during a test's integrity suppression are discarded, not played after the test. Under a temporary non-integrity context suppression, otherwise eligible messages can wait for release; celebrations are discarded. Nudges are always discarded when withheld and never accumulated for a later burst. Check permission again before presentation. Suppression does not delete saved notes, results, rewards or other owning-domain records.

## Celebrations are optional presentation

Only recorded facts can trigger celebrations. An unknown or unavailable result produces none. Suppression, lost delivery or failed artwork does not delay a reward or replace a required notification.

Daily completion celebrates at most once per learner per product day. Solutions uses its existing milestone totals: when several thresholds are crossed together, celebrate the highest and record all crossed ones as handled. The platform retains this personal no-repeat state across devices. If that state cannot be established, skip rather than replay.

An achievement without a readable human name is not celebrated. A streak tier that also unlocks a badge is one coordinated milestone announcement, not two identical celebrations. Each domain keeps its own once-only rules; this document adds no reward or milestone.

Where a durable notice is defined, its producer delivers it independently. Daily completion and Solutions milestones do not acquire an inbox item merely because they have a passing celebration. Content changes and progress resets are factual and never celebrated.

## Confirmations and critical information

One system-presented learner confirmation host exists separately from the corner, with one dialog open at a time. It has no character or tone icon and replaces native browser confirmations. Its action and consequences come from the owning operation.

Only explicit Confirm means yes. Cancel, dismissal, navigation, a newly raised suppression, no mounted confirmation host or any failure means no. A caller unable to present its required confirmation explains that the action was not performed. Do not assume consent from disappearance or silence.

An already-open dialog cancels when suppression begins. Necessary system confirmations may subsequently open while companion messages remain suppressed: a submission or destructive-action confirmation is not assistant guidance. The dialog manages focus while open and returns it on closure. Dialog exchanges are not retained as a message history; any required record of the confirmed operation remains with that operation.

This learner host is absent from Administration. Administrative confirmations use the admin area's own shared controls, not WizBit. Critical failures, unsafe-save conditions, access/security problems and essential results are fully presented by the ordinary page, regardless of character loading, Quiet, Plain or suppression.

## Checks

Verify all 39 kinds and required values; the single fact/flourish source; all tones and expressions; visible-case-only verdict copy; timing and keyboard dismissal; queue combination, overflow and all-sticky refusal; Quiet celebrations; multiple restrictions and their release; blocked cross-tab requests; once-only celebrations across devices; unavailable no-repeat state; and confirmations before, during and after suppression. Confirm that no missing passing message hides the original fact or a critical action.
