# Credits

**Status:** Reviewed  
[Economy](Economy.md) · [Administration](Administration.md)

## Purpose and visibility

Credits pay for optional generated assistance only. They cannot buy content, execution, submissions, quizzes, project storage or certificates. Ordinary learning remains usable without them.

When generated AI help is off, hide the balance display, Credit history, How Credits Work and out-of-Credits messages together. Do not show empty placeholders, a purchase link or a promise of availability. XP history and levels remain visible. Allowance records continue according to membership eligibility while Credit pages are hidden; enabling the capability reveals the existing record, not an extra activation grant.

The AI capability has one owner-controlled operational switch. It is not a separate switch for each action or a normal Economy numeric setting. Turning it off does not erase balances or affect ordinary features.

## Membership allowance

| Item | Default |
|---|---:|
| Base allowance each membership month | 5,000 Credits |
| Additional continuation allowance | Up to one 5,000-Credit grant per cycle |
| Maximum allowance granted in a cycle | 10,000 Credits |
| Unused allowance | Expires at the cycle end; no rollover |

A cycle follows the membership-start date on the platform's product clock. A month without that day uses its last day without changing the anchor for later months. If the anchor cannot be established, show the cycle as unavailable rather than inventing a refresh date.

Both grant amounts are fixed for a cycle when it begins. Later configuration changes apply to future cycles only. Each base or continuation grant happens once, even when delivery is retried. The maximum is a cycle-grant limit, not a second hidden cap on the balance.

### Automatic continuation

Grant the continuation when the learner confirms a valid priced action that genuine completed use has left the remaining base allowance unable to cover. Do not wait for a literal zero. Grant it at most once per cycle, before reserving the new request's price, and keep any unusable base remainder.

Temporary holds, releases, failed or refunded requests, corrections and staff activity do not trigger it early. The learner does not request or claim the continuation. History identifies it separately from the base grant. If the configured continuation is zero or still insufficient, explain the ordinary insufficient-Credits outcome.

### Expiry and membership changes

Unused Credits expire at the cycle boundary. Explain the cycle and next refresh before expiry, not only afterwards. A request already holding Credits at that boundary resolves against its original cycle; it neither consumes the new month's allowance nor adds released expired Credits to that allowance.

Lapsed membership pauses spending and new grants, releases live holds, and leaves recorded balances unusable. Scheduled expiry still applies. Restored membership uses the original anchor and does not backfill missed cycles. Access owns membership eligibility; Economy does not introduce a separate subscription or checkout.

## Prices

| Action | Default price | Staff-adjustable range |
|---|---:|---:|
| Explain an execution error | 100 Credits | 50–200 |
| Explain a lesson passage | 150 Credits | 100–300 |
| Analyse the learner's own code | 250 Credits | 200–500 |

These are the only priced actions. A page may offer an action only where its domain permits it. Show the action's current price and the learner's available balance before confirmation. If the price changed since it was shown, refresh the offer rather than silently charging more. An agreed in-flight price never changes retrospectively.

Credits come from membership allowance, not solves, streaks, achievements, purchases, referrals or time spent. There is no sale, transfer, gift, cash-out, XP conversion or learner request for more. A verified accounting correction is a repair, not another allowance source.

## Using Credits

**Journey:** Choose a permitted AI action → see price and available balance → confirm → reserve the price → receive a valid available answer → charge once, or return the hold on failure.

A hold temporarily reduces available Credits but is not yet a charge. Available balance excludes all live holds. A completed charge appears once in history; releasing an uncharged hold creates no fictional spend or refund entry. Neither availability nor balance goes below zero.

The shared AI request rules permit one generated request in flight per learner across the platform. A repeated press for that same request returns it rather than buying another. A different request refused because one is running holds no extra Credits.

Capture occurs only when a technically valid answer is durably available to the learner. A temporary failure to display it must not lead to a second charge for the same completed request. The owning AI experience supplies its recovery behavior.

### Failed requests

Return the whole hold after timeout, service outage, malformed or refused output, platform failure, cancellation before dispatch, an untouched hold reaching fifteen minutes, or membership lapse. No partial charge applies to these failures. A failed release remains repairable and must not conceal the action's original outcome or present a permanent unexplained deduction.

Dissatisfaction with a technically valid answer is not an automatic refund. Duplicate charges, missing entries and wrong prices follow the verified-correction process. Cancellation before dispatch differs from leaving the page after a request has already been sent.

## Balance, history and errors

Credit history is newest first, twenty entries per page. Name the base or continuation allowance and its cycle, the AI action behind a charge, unused-credit expiry, and any verified refund or correction. Do not expose internal incident details beyond the safe reference and explanation. Empty history and an unavailable read are different states.

How Credits Work explains the allowance source, permitted actions, cycle, actual current-cycle amounts, next refresh and expiry. It offers no payment or request-more route.

| Situation | Learner experience |
|---|---|
| Enough available Credits | Confirm at the displayed price |
| Insufficient Credits after any eligible continuation | Explain price, balance and next refresh; keep ordinary features available |
| Balance or cycle cannot be read | Explain unavailability and offer a safe retry; reserve nothing against a guess |
| Membership lapsed | Explain paused access/spending, not insufficient funds |
| AI capability off | Credit controls and pages are absent |
| Failed generated request | No completed charge; restore its hold under the failure rules |
| Retry or repeated charge delivery | Return the original outcome without charging again |

An insufficient-balance action stays understandable rather than disappearing to avoid explaining the refusal. Do not direct learners to support to request an allowance that the product does not offer.

## Checks

Verify month-end anchors, grant replay, genuine-use continuation, retained base remainder, price changes before and after confirmation, insufficient funds, one request in flight, failed answers, holds crossing a cycle boundary, membership lapse/restoration and switching AI off/on. History and the available balance must agree without duplicate grants or charges.
