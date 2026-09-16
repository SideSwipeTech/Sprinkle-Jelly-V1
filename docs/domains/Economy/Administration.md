# Administration

**Status:** Reviewed  
[Economy](Economy.md) · [Credits](Credits.md)

## Purpose

Staff manage bounded Economy settings, repair verified accounting faults and recover rewards that failed to arrive. These capabilities do not provide arbitrary gifts, a badge builder or permission to change test scores.

Actions require the appropriate permission. Corrections on a learner's balance are super-administrator actions. Configuration and retry permissions are granted explicitly. Record who changed what, why where required, and the previous and resulting values. A change whose required record cannot be saved must not be reported as applied.

The later admin-workflow review will decide the final screen arrangement. This document defines capabilities and consequences, not a multi-stage planning interface.

## Configuration

| Setting | Default | Allowed range |
|---|---:|---:|
| Monthly base allowance | 5,000 Credits | 0–5,000 |
| Monthly continuation allowance | 5,000 Credits | 0–5,000 |
| Easy first-solve award | 30 XP | 0–500 |
| Medium first-solve award | 60 XP | 0–500 |
| Hard first-solve award | 100 XP | 0–500 |
| Extreme first-solve award | 150 XP | 0–500 |
| Default authored Daily bonus | 40 XP | 0–200 |
| Written-subject completion award | 250 XP | 0–1,000 |
| Explain execution error | 100 Credits | 50–200 |
| Explain lesson passage | 150 Credits | 100–300 |
| Analyse own code | 250 Credits | 200–500 |

Five further shared settings appear in the configuration collection but belong to Progress: active time per learner/item/day, default 120 minutes within 15–480; and the Easy, Medium, Hard and Extreme practice-evidence values, defaulting to 55, 70, 85 and 100 within 0–100. Their meaning and application are Progress's rules. Display their owner clearly; storing an editable value does not transfer ownership to Economy or make it an XP rate.

The first-completed and first-passed Mock awards are fixed catalogue amounts, not extra configuration controls. The level curve and achievement conditions are also not arbitrary editable formulas. There is no hint penalty, daily earn cap, save reward, project reward or Credit-sale setting.

### Applying changes

Show current and proposed values, allowed ranges, effective scope and effective time. Explain whether the edit affects future cycles, future requests or future reward occasions. For allowance/AI-price edits, show a clearly approximate indication of the default-priced actions represented, without guaranteeing a particular mixed-use count.

Validate the submitted set together; one invalid value rejects the edit and names the field rather than silently applying a partial change. Preserve entered work. Recheck a stale preview instead of confirming against values another administrator already changed. Unreadable current settings are not replaced by launch defaults as though those defaults were saved values.

Confirmed changes govern later occasions only. They do not rewrite earned XP, an existing request's agreed price or an allowance cycle already underway. A setting not yet enforced must say so; do not claim a stored number has changed behavior before it actually has.

## Verified corrections

Corrections repair duplicated, missing or mispriced entries caused by the platform. They cannot reward new behavior, resolve a subjective complaint with a gift, choose a test result or create an achievement.

Before confirmation, show the learner's current total, the signed change, the resulting total and any resulting level change. Require a written reason, a nonempty incident reference and explicit typed confirmation. Keep additions and deductions distinguishable.

| Bound | Limit per correction |
|---|---:|
| XP adjustment | Up to 100,000 XP in either direction |
| Credit adjustment | Up to 10,000 Credits in either direction |

Reject a change outside those limits or one taking the total below zero. State the actual permitted amount rather than silently trimming it. An unreadable current total cannot be corrected against an estimate.

A correction adds an explanatory entry; it never edits or deletes the original. Repeating the same confirmed correction applies it once. Repair an erroneous correction with another recorded correction, not by erasing its history. A Credit repair counts as neither genuine AI usage nor a trigger for the continuation allowance. Credit repairs remain hidden while the Credit experience is disabled, like the rest of Credit history.

## Failed rewards

Distinguish an award waiting for delivery, an award delivered, and one that stopped trying after three automatic failures. Show the recorded occasion, learner, age and safe failure information to permitted staff. No parked awards is a genuine good state; an unreadable list is not an empty list.

Staff can retry one parked reward using its original identity. The retry cannot pay twice; another failure keeps it visible. There is no write-off control or invitation to replace it with a discretionary correction. Separate notices or celebration failures do not turn an applied reward back into unpaid work.

## Operational summary

Keep a bounded aggregate view, without learner rankings or a top-users panel:

| Figure | Period |
|---|---|
| Credits granted | Each learner's current allowance cycle, aggregated |
| Credits charged, by AI action | Current cycles |
| Credits released or refunded | Current cycles |
| Credits cleared unused | Most recently completed cycles |
| Continuation grants | Current cycles |
| Failed allowance grants | Current cycles |
| Parked rewards and oldest age | Current backlog as of the read |

Counts and amounts describe what happened, not a currency-cost estimate or proof of provider billing. Every figure states its window and last calculation time. No denominator or unavailable source must not become a fabricated zero. The backlog view and owner operational alerts serve different purposes; a visible list alone is not an alert.

## Ownership and checks

Economy owns balance correction and reward recovery; it does not own activity CRUD or grading. Keep learner code, private notes and unrelated content out of these screens. Account erasure removes learner-linked records while retaining platform configuration and permitted anonymous aggregates.

Verify permission checks, unavailable settings, a conflicting edit, out-of-range values, future-only changes, positive and negative corrections, repeat confirmation, blocked negative balance, a failed reward retry and honest operational figures. No staff control may grant an unapproved reward or alter historical prices silently.
