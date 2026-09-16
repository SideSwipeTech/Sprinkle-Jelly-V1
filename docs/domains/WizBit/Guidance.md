# Guidance

**Status:** Reviewed  
[WizBit](WizBit.md) · [Messages](Messages.md) · [Administration](Administration.md)

## Authored help, not generated answers

The page guide, authored hints, progress guidance and product knowledge base work without generated AI assistance and cost no Credits. They do not read hidden questions, answer keys, private grading references, another learner's data or Quick Notes text.

WizBit presents help through the same guide and help panel. It does not create a separate tutor, support conversation or saved chat history.

## Hints belong to the activity

The owning activity defines hint text, order, reveal state and whether another hint exists. WizBit passes the text unchanged, including through the optional hint slot in a page guide. It neither rewrites a hint nor generates a replacement.

| Situation | What happens |
|---|---|
| Another authored hint exists | Reveal the next permitted hint through the owning ladder |
| All hints have been revealed | State that the hints are exhausted |
| No authored hints exist | Explain that none are supplied; do not offer a reveal that cannot happen |
| Delivery is unavailable | Name the platform problem without substituting encouragement or invented help |

Hints are free. No XP deduction, reduced award, reward floor, Credit charge or skill penalty is introduced. Authored hints remain available in practice that produces no measured skill evidence.

An absent or failed character does not remove the activity's hint controls. Quiet pages present hints only when requested. Recorded Assessment restrictions are different: when outside assistance is prohibited, neither the guide nor the normal hint path bypasses that prohibition.

**Journey:** Request a hint → the owning activity checks its current rung and permission → read that authored hint or its precise unavailable/exhausted state → continue working.

## Guidance from existing facts

Guidance covers three things: where to go next, the learner's existing progress figures, and existing observations about strengths or areas needing practice. Each comes from its owning page or Progress; WizBit computes no independent figure and creates no new destination.

Use the producer's exact skill vocabulary, evidence minimum and next-action rules. Below the evidence minimum, navigation can still be offered without claiming ability or inability. Phrase observations about the recorded evidence, not judgments about the person. A practice-only judgment remains identified as practice-only.

A figure must arrive with its calculation time and measured/derived/estimated status. Explain these in words when presenting it. Missing freshness or status means omit the figure; an unavailable reading says it cannot be established now, never zero. Retired, unauthorized or prerequisite-blocked destinations do not become clickable recommendations.

In the help panel, recognized guidance intents take priority over knowledge-base matching. If the knowledge base fails, guidance may still answer what it knows while identifying the unavailable part.

## One proactive suggestion source

The only proactive suggestion is the existing Skills next action, presented on Home. The suggestion must have a currently reachable authored target and a meaningful change since it was previously seen or dismissed. WizBit does not create a second recommendation system.

| Limit | Rule |
|---|---|
| Current producer allowance | At most one admitted nudge per learner per product day; staff can lower it to zero |
| Platform headroom | At most two per product day if a further producer is ever separately approved; not a promise of two now |
| Minimum gap | 60 minutes between admitted nudges |
| Same skill or target | Seven-day minimum cooldown; staff can lengthen it to 30 days |
| Meaningful change | The skill verdict crosses a band boundary or the next action points to a different item |

The first unseen eligible suggestion may be presented. After dismissal, time alone does not bring the same suggestion back. Even a changed suggestion must respect the cooldown. Slight numerical movement inside the same band does not count as a new reason to interrupt.

Count a nudge when admitted, even when immediately dismissed, and apply the limits across tabs and devices. Requested hints, requested guidance and the Skills page's own next-action row consume none of this allowance.

Withhold nudges in Quiet, during any suppression, while a recorded test is live, or while a blocking dialog, error, warning or unsaved-work risk needs attention. An unreadable policy also withholds. Discard withheld nudges without a later burst or a learner message announcing the suppression. Do not duplicate the Daily reminder, course Continue card or result-remediation prompt.

**Journey:** Open Home → a changed eligible Skills suggestion passes the limits → read, follow or dismiss → no unchanged repeat after dismissal.

## Product knowledge base

The knowledge base answers how Labs works, not general programming questions. Answers are published text authored by the content team. It searches authored questions, synonyms and answer text, with current-page relevance considered before other entries; the wider published corpus is still searchable. No outside service is needed for this lookup.

An out-of-scope question can receive an authored explanation pointing to the appropriate learning area, but only when that entry genuinely matches. Do not silently route an uncertain product question to a generative model, add a guess or pretend a lookup outage is a missing topic.

| Outcome | Learner experience |
|---|---|
| Answer | Show the clearly matched authored answer |
| No match | State that the search found no sufficiently clear answer and clarify with at most three likely topics |
| Unavailable | State that the platform could not look up an answer and offer a safe retry |

The answer needs both a sufficiently strong match and sufficient separation from the next-best match. A lone weak result must not win just because no better one exists; tied plausible answers require clarification. The learner sees no numerical confidence score masquerading as certainty.

### Matching settings

| Setting | Initial value | Staff range |
|---|---:|---:|
| Minimum match score | 0.60 on a 0–1 scale | 0.50–0.80 in 0.01 steps |
| Minimum margin over runner-up | 0.15 on that scale | 0.05–0.30 in 0.01 steps |

Both conditions must pass. A missing runner-up has score zero. An unreadable corpus or either unreadable setting means Unavailable, not No match. These are internal matching controls, not a promise of answer accuracy. Their controlled editing is described in Administration.

A small or empty authored corpus is allowed; there is no artificial launch minimum or placeholder content. Unpublish an answer and it immediately stops answering. An overdue review raises its review priority but does not silently remove an otherwise published answer.

**Journey:** Open help → choose a question or type one → resolve an authored guidance intent or search published entries → answer, clarify or explain unavailability.

## Content gaps

A genuine No match can contribute a short, safe, generic phrase to the staff Content Gaps view. Do not store the learner's original question. Remove URLs, email-like values, numbers, quoted values, code-like spans and secret-like material before considering a phrase. If it cannot be made safely generic, retain no exposed phrase or alternative raw copy.

A phrase becomes visible only after at least five matching misses within a rolling 90-day window. It contains a count, no learner identity, raw query, sample code or unique personal value. Do not convert it into an automatically filed Topic Request.

Content Gaps shows this search-miss information separately from Topic Requests' Asked for demand. They have different sources and denominators and must not be merged. An outage contributes no miss; affected-period reporting explains possible incompleteness. A failed counter update does not block an otherwise valid answer. Publishing a suitable answer can resolve the corresponding gap.

Offer the established topic-request route only where its owning domain permits it. The help panel cannot introduce an Assessment or Workspace-editor request entry point that those domains forbid.

## Checks

Check hint ownership and all four hint states, help without the character, no hint charges, evidence-minimum guidance, missing freshness, partial help-panel failure, unseen and dismissed nudges, meaningful-change rules, cross-device caps, withheld-message discard, strong/weak/tied/single-entry matches, empty or unavailable corpus, immediate unpublication, safe phrase removal, five-in-90-day visibility and separation from requested-content demand.
