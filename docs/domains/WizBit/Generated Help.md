# Generated Help

**Status:** Reviewed  
[WizBit](WizBit.md) · [Credits](../Economy/Credits.md) · [Administration](Administration.md)

## Purpose and release state

Generated Help provides three optional, explicitly requested explanations. It is separate from WizBit's authored messages, page guides and product knowledge base. It is built for this release but initially switched off. No generated-help controls or related Credit surfaces appear while off, and ordinary learning and authored help keep working.

A single owner-controlled operational switch enables or disables the whole capability. There are no learner or ordinary staff per-action enable switches. Enabling requires the safety, privacy, cost and quota checks to pass; the capability can return to off without deleting Credit balances or changing normal product behavior.

## Three actions and their places

| Action | Permitted material and placement |
|---|---|
| Explain a passage | Only a selected passage in a published, eligible lesson |
| Analyse my code | Only the learner's selection or explicitly attached files in Code Lab, a personal/course Workspace, or their own accepted Solutions entry |
| Explain this error | Only the safe execution error already shown on an eligible Code Lab or Workspace page |

Solutions permits analysis of the learner's recorded accepted code only; it gains no Run, error-explanation workflow or editing capability. Each host can use only its approved actions. No generic chat, second conversational turn, history page or additional AI action is introduced.

No page opening, run, error, save, grade or completion starts a request automatically. The learner explicitly selects the action and confirms its price. Nothing selected means explain what must be selected, not an empty paid request.

The generated answer belongs to an inline panel on the page that owns the material. It does not appear in the companion corner, authored-message stream, global notice or inbox. The visible label is **Generated assistance — check it before you rely on it.** Render provider output as safe plain text, not executable markup, links or styles.

## Scope and restrictions

Analysis reads only the explicitly attached selection/files. It never walks the rest of a project, opens neighboring files, runs code, operates a terminal, browses the network or writes, renames or deletes anything. An error explanation does not silently attach source code that the learner did not provide.

Generated help is unavailable throughout Assessments, including briefings, recorded tests, results and unrecorded test practice; inside course quizzes; in Challenge/Track and Daily solving; in Debug Detective solving; and in hidden-case or private-reference workflows. Post-acceptance analysis through the learner's own Solutions entry is the defined exception, not a loophole inside a solving page.

A recorded Mock or Company Test restricts help across the account's active context regardless of strictness. Unknown permission or test standing fails closed. A direct request, another tab or a different presentation cannot bypass the restriction. Another learner's material is not disclosed or confirmed to exist.

Generated output changes no verdict, score, readiness, skill evidence, access, XP, Credits, achievement, lesson completion, task, project or submission. It cannot become an authored editorial or grading reference automatically. Reading it creates no additional skill or active-learning credit.

## Before sending

Check the request in this order: **context and size → page permission → safe material → Credits**. All refusal checks that can run without cost precede dispatch. Repeated requests and a second in-flight request are recognized before reserving another price.

| Limit | Value |
|---|---:|
| Learner's typed instructions | 2,000 characters |
| Explicitly attached context in total | 16 KiB of text |
| Complete assembled input budget | 8,000 request units, including platform instructions and metadata |
| Generated output budget | 1,200 provider units |
| Provider-call deadline | 30 seconds |
| Recoverable request/answer | 24 hours |

The input budget uses the shared pre-send measurement; it is not an invitation to send unlimited hidden instructions beside a short visible attachment. These are independent bounds. Reject oversized input with the affected limit and a remedy; do not trim or discard attachments silently. Technical counting and provider integration belong in the architecture.

An answer reaching its permitted output length visibly ends with **— This answer reached its length bound and ends here.** Keep the marker in its recovered answer too. Reaching the stated length bound is not itself a failure.

### Unsafe attachments

Refuse the entire request when it includes restricted Assessment material, hidden cases, private reference answers or detected credentials such as access tokens, private keys or credential-bearing connection strings. Identify the affected selection/attachment and the safe reason without echoing the secret. Send nothing, charge nothing and do not redact the content and send the remainder anyway.

Detection is a safeguard, not a guarantee that unflagged material is safe. Explain that the learner must review what they attach. Typed words, code and error text are content, not instructions that can override these restrictions.

## Prices and one active request

Economy owns prices, balance, allowance cycles and charging. Default prices are 100 Credits for an error explanation, 150 for a passage explanation and 250 for code analysis; use the live authorized price from Economy rather than a competing local price.

**Journey:** Select permitted material → choose action → see price and available balance → confirm → validate and reserve → receive a valid recoverable answer → charge once. If the request fails, release the full hold.

Only one generated request may be in flight per learner across all three actions and all pages together. A different second request is refused without a second hold. Repeating the same request, including a double click, refresh or reconnection, returns its existing state and never creates another charge.

A hold is not yet a payment. Capture it only when a valid answer is durably recoverable. If a completed answer cannot currently display, recover it rather than charge again. Once confirmed, that request's price does not change even if the configured price changes.

## Cancellation, failure and fallback

Cancel before dispatch releases the full reservation. After dispatch, closing the panel does not cancel the provider's work or justify displaying Cancelled; the request may still complete and remains recoverable for its window.

A timeout, service outage, malformed/refused answer or platform failure returns the full hold under Economy's rules. Incomplete streamed text is identified as a failed answer, not a complete paid result. Retry after a terminal failure is a new deliberate request and waits until the old hold is released. A technically valid delivered answer is not automatically refunded for dissatisfaction.

If the platform cannot tell whether an unanswered provider call was processed, do not silently regenerate. A safe retry of that same provider operation requires protection against duplication or confirmation that it never ran. Otherwise keep the uncertainty honest and leave any new request to the learner.

A configured fallback may try another provider before any answer text arrives, and only for an allowed configuration/transport failure, timeout, service/rate failure or empty answer. Never use fallback to evade a safety refusal, content refusal or forbidden page, and never splice a second provider into a broken partial answer. All providers failing means unavailability without a completed charge. Models and provider choices are operational values, not product features selected here.

## Availability and cost limits

| State | What the learner sees |
|---|---|
| Switched off | No generated-help controls or advertising placeholders; related Credit surfaces absent |
| Enabled but not configured | A plain statement that assistance is not configured |
| Missing selection | What must be selected or attached |
| Forbidden context | No eligible control; a direct request is refused without revealing restricted facts |
| Unsafe or oversized request | The affected selection/limit and what can be changed; nothing sent |
| Insufficient Credits | Economy's balance, price and refresh explanation |
| Balance or eligibility unavailable | Unavailability, not an invented zero or lack of funds |
| Request in flight | Its real progress and recovery state; no purchase of a second simultaneous request |
| Platform cost allowance exhausted | Generated help is paused; ordinary features and authored help continue |
| Learner usage allowance exhausted | Generated help is paused for this learner's cycle; other learners remain unaffected |
| Request failed | Honest failure and hold release; a safe deliberate retry where applicable |
| Recovery window expired | The answer is no longer retained, not a blank implying no request existed |

Credit allowance and provider-usage limits are separate. Provider usage has a platform-wide calendar-month ceiling and a per-learner ceiling of 800,000 units in the same calendar month, on the product clock. The platform ceiling is required before activation and sized from the approved worst-case audience/cost budget; there is no uncapped operating state. These usage months are not the membership-start-based Credit cycles.

Reaching a usage ceiling pauses the affected scope until the calendar month resets automatically. A Credit balance does not promise exemption from that pause, and a quota refusal does not spend Credits. An explicit operational off-switch remains off across month changes. Pacing can also refuse bursts before sending or charging. The UI must distinguish these states rather than labeling them all insufficient Credits.

## Privacy and retention

Keep only the bounded request facts needed to identify and recover the operation, its safety outcome and its separate response body for 24 hours. Do not retain the original typed instructions, attached passages/code/error text or detected secret values as prompt history. The original domain still owns any source the learner saved there. A returned answer may quote attached code and remains subject to the same private 24-hour response treatment.

Remove request metadata and response together when their recovery window ends. The Credit history keeps what was charged, not what was said. There is no durable chat thread, response export feature or staff access to learner prompts and answers. Exclude prompts, attachments, responses and provider errors from ordinary logs, traces and analytics.

Provider-cost reporting keeps non-identifying usage counts, action type and service outcome, not learner content. Personal in-flight, quota and recovery bookkeeping exists only for its defined purpose, not to create an individual behavior profile. Account erasure removes the relevant personal records through their owning domains; private generated answers do not survive it as an anonymous text archive.

Use learner material neither to train nor to evaluate platform or provider models. Each enabled provider must meet the approved API privacy/region requirements before activation, including no training on inputs. Treat this as a condition that must be verified, not an unverified promise about every provider.

## Checks

Verify each permitted and forbidden host, all four size/context gates, secret/hidden-material refusals, no implicit attachments, safe plain-text output, one request across pages/tabs, same-request recovery without recharging, uncertain outcomes, cancellation before/after dispatch, midstream failure, safe pre-text fallback only, price changes, Credits across their cycle boundary, both calendar-month usage caps, operational off/on, 24-hour expiry and account erasure. Confirm authored help still works throughout AI failure or disablement.
