# WizBit

**Status:** Reviewed  
**Group:** Companion

## Purpose

WizBit helps learners understand and navigate Labs. It presents confirmed outcomes, offers authored page guidance and hints when asked, answers product questions from an authored knowledge base, and presents the next actions and progress facts supplied by their owning domains.

Its everyday behavior is authored and deterministic. Optional generated assistance is a separate capability, built but switched off initially. Neither kind of help grades work, changes results, awards rewards or completes activities for the learner.

| Document | Covers |
|---|---|
| [WizBit](WizBit.md) | Character, fixed corner, preferences, orientation, page guide and domain boundaries |
| [Messages](Messages.md) | All message kinds, presentation, timing, celebrations, quiet mode, suppression and confirmations |
| [Guidance](Guidance.md) | Hints, progress guidance, product answers, nudges and content gaps |
| [Generated Help](Generated%20Help.md) | The three optional AI actions, permitted contexts, limits, charging, recovery and privacy |
| [Administration](Administration.md) | Authored content, artwork, publication, bounded settings, monitoring and verification |

These are product descriptions. Technical architecture, security mechanisms and the later refinement of admin screen flows are separate. Appearance changes must not silently change product behavior.

## One companion in a fixed corner

One companion belongs to the signed-in application and persists across navigation without remounting, reintroducing itself or creating a separate copy on each page. Its expression can continue across a page change; the page guide resets to the newly opened page.

**The corner is fixed.** The learner cannot drag WizBit around the screen, and it does not wander. Keep it above page furniture but clear of primary actions. When a narrow layout cannot accommodate both, the page's essential action takes priority. A hidden or unavailable character must not remove essential help or warnings.

The corner provides the character, its expression, a message when one exists, the page-guide activation, entry to the help panel and dismissal. An allowed idle character may remain without a message; do not show an empty speech container. Suppressed contexts render no companion or usable assistance entry point.

Load essential page content before artwork. A failed or delayed artwork load uses the expression's safe fallback; it never blocks navigation, hides a result or makes a necessary action depend on loading the character.

## Expressions and motion

| Expression | Meaning |
|---|---|
| Neutral | Resting, with no active moment to present |
| Attentive | The learner is engaging the guide or help panel |
| Thinking | The platform is working on a requested answer |
| Informational | Presenting useful factual information |
| Encouraging | Supportive authored guidance, without judging the person |
| Warning | A condition needing attention |
| Serious | Work, account or other consequential information |
| Success | A confirmed successful outcome |
| Celebration | An eligible recorded milestone |

One expression is active at a time. Each has an approved animated treatment where motion is used, a still treatment for reduced motion, a distinction that does not rely on color alone, and a safe artwork fallback. Do not add expressions without a real trigger and a visible meaning.

Ambient motion and idle flourishes are subtle. Pointer-following eyes are optional, never required for understanding. Stop eye tracking on touch-first devices, during suppression and while the character is asleep. Pause motion when the page is not visible and honor the shared reduced-motion preference. Quiet mode reduces volunteered messages, not animation; reduced motion is the separate control.

The artwork can be replaced while keeping the same expression meanings and behavior. There is no alternate persona, skin shop, cosmetics unlock, premium appearance, sound effect, speech input, transcription or spoken output. WizBit's voice means authored wording, not audio.

## Learner preferences

Settings hosts four controls. The three saved preferences follow the learner's account; replay is an action, not a fourth saved preference.

| Control | Behavior |
|---|---|
| Companion or Plain | Select the character presentation or the same essential messages in plain form |
| Present or Quiet | Reduce unsolicited interaction without overriding page restrictions |
| Personal name and Reset | Choose the displayed name or restore WizBit |
| Replay orientation | Temporarily show the orientation; leave preferences unchanged unless its closing choice is answered |

Until the learner chooses, the presentation is Companion. Plain messages are a complete supported presentation, not a degraded substitute. They carry the same facts and tone; the optional flourish is omitted. There is no separate Hidden preference. Page suppression can hide assistance regardless of preference.

A personal name is trimmed plain text, from 2 to 32 displayed characters, with no markup or control characters. Reject empty names and names that match or impersonate the platform, staff roles or reserved product names. The product default is WizBit; choosing a custom name is different from using Reset to restore that default.

The chosen name appears consistently in visible wording, greetings and accessible controls without a reload. It changes no persona, permissions, behavior or artwork and never becomes an internal identifier or an analytics label. A failed name save leaves the previous name intact and explains the failure. An unreadable name uses WizBit, not an invented name. A staff artwork choice cannot change the product's default name.

## First-run orientation

On Home, a short orientation introduces WizBit and exactly four landmarks: Continue, primary navigation, where help is, and Settings. It does not navigate the learner away or tour every domain.

Skip is available from the first frame, before the introduction. Skip records no completion or presentation choice; it is not rejection of the companion and does not silently select Plain. The closing question neutrally asks which presentation to keep; the choice remains changeable in Settings.

Replay remains available from Settings and brings the companion back only for the orientation's duration. Without an answer to the closing question, replay leaves the saved choice unchanged. The orientation never appears inside a recorded test, including for a returning learner who previously skipped it.

**Journey:** Open Home → watch or skip the short orientation → optionally choose a presentation → continue using the platform.

## Page guide and help panel

A page can register one greeting, ordered tips and an optional connection to its authored hint ladder. Each guide activation advances one item; after the last it wraps to the beginning. Changing page resets this sequence. A page with no registered guide uses an authored default greeting; an intentionally empty guide does nothing rather than showing an empty message.

The help panel opens over the current experience with suggested question chips and a text field. Recognized guidance intents are answered first; other questions use the authored knowledge base. There is no separate assistant navigation destination, general-purpose AI chat or saved conversation history.

The guide, knowledge base and any authored hints remain usable when generated AI help is off. A knowledge-base outage can leave available guidance working; explain which part is unavailable rather than saying that every form of help failed.

**Journeys:** Activate page guide → read a tip or requested hint → continue the same activity. Open help → choose a chip or type a product question → receive guidance, an authored answer, a clarification or an honest unavailable state.

## Ownership and shared features

| Area | Ownership |
|---|---|
| WizBit | Character behavior, page-guide presentation, authored response rules, product knowledge entries and personal celebration bookkeeping |
| Application shell and shared controls | The fixed corner, accessible overlays and an independent learner confirmation host |
| Activity domains | Their problems, hints, results, progress and factual events; they are not rewritten by WizBit |
| Progress | Skill judgments, evidence minimums, explanations and deterministic next actions |
| Notifications | Durable inbox, shared passing-message discipline and nudge admission; WizBit creates no inbox items |
| Economy | XP, achievements, prices, available Credits, reservations and charges |
| Profile & Settings | Saved companion preferences and the controls that change them |
| Invoking page and shared AI capability | Generated-help placement, request lifecycle, safe attachments and response recovery |

WizBit reuses these capabilities without taking ownership of their data. It does not keep a competing streak, readiness score, Credit balance or hint-reveal state. Ordinary confirmations and critical warnings work independently of the character.

## Availability and boundaries

Solve workbenches, Code Lab and Workspace are Quiet. A recorded Mock or Company Test suppresses assistant-related help regardless of proctoring strictness. Neither another tab nor Plain presentation bypasses this. Unreadable test standing keeps assistance restricted until the platform can establish that it is allowed.

WizBit and its learner confirmation host do not appear inside Administration. Staff management uses its own shared administrative controls. On ordinary not-found or failure pages the character may appear as decoration only; the page states the complete problem itself, and restricted assistant access remains restricted.

The companion has no independent Continue target, learner inbox, run history, source-code browser, public profile, learner-to-learner view or direct staff-to-learner messaging channel. It grants no access, produces no skill evidence or learning-time credit, and issues no certificate or reward. Critical behavior never depends on whether a companion message was delivered.

## Checks

Check navigation without duplicate hosts, fixed-corner placement at all supported widths, primary-action clearance, all nine expressions and their still/failure treatments, reduced motion, hidden-tab and touch behavior, preference persistence and failed saves, reserved names and Reset, orientation skip/replay, guide cycling, help-panel partial failure and independence from generated assistance. Confirm that the companion never exposes hidden material or bypasses a domain restriction.
