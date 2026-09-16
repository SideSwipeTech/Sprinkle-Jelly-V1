# Tracks

**Status:** Reviewed  
[Practice](Practice.md) · [Challenges](Challenges.md) · [Authoring](Authoring.md) · [Solutions](Solutions.md)

## Purpose and ownership

A Track provides ordered practice in one language. It belongs to the Challenges & Tracks product area but has its own track-problem collection. Every problem is created inside its track and inherits that track's language.

A track does not link to a standalone Challenge as its grading source. Staff may author the same exercise again, but its statement, starters, cases, hints and learner records are independent. Problems in two tracks are also independent items, not synchronized references.

For example, Reverse a string in Challenges may offer Python, Java and C++. Reverse a string in a Python Track is a separate Python-only problem. Neither completion, edit, archive nor deletion affects the other. The common editor and evaluation capabilities are reused, not the problem record.

## Track page and starting

Show the track's description, language, ordered published problems, progress and the learner's state. Each problem shows its difficulty, applicable XP, own solved state and the content Solve rate used by staff and learners. Low sample counts and unavailable figures are labelled using Practice's rule.

| Track state | Meaning |
|---|---|
| Not started | The learner has not started this track |
| In progress | The learner started but has not earned its completion |
| Completed | Completion has been recorded, even if content is later added |

Start Track records the start and opens the first unsolved published problem. Opening a problem within the track also records its start. Starting creates no deadline, submission, reward or cost. Continue returns to the appropriate track position rather than creating a new attempt.

A track with no published problems says No challenges yet. It cannot start or report a completion based on an empty set. Missing content and a failed read are different states.

## Working through problems

**Workflow:** Open track → Start or Continue → read a track problem → write in its language → Run → Submit → see acceptance → continue to another entry.

The shared solving experience applies: device-local draft, that problem's retained accepted code, then its starter; visible cases or custom input for Run; all visible and hidden cases for Submit; free authored hints; private hidden data; honest pending and platform-failure states. Drafts remain scoped to learner, track problem and language, never borrowed from a standalone Challenge.

The language is fixed by the track. No other language can be run or submitted for that problem. A runtime that is temporarily unavailable keeps the work safe and explains the unavailable capability, rather than switching languages.

The author's order is guidance, not a lock. Mark the first unsolved entry as current and provide a stepper, but allow any published entry to be opened in any order, subject only to any explicit approved prerequisite. Solving elsewhere never satisfies this entry automatically.

## Acceptance, rewards and Solutions

A first accepted solve records this track problem's solve and date, its first-solve XP through the shared difficulty table, its own practice evidence and a saved solution under Tracks. The calculation is for this owned problem, not text-matching across the platform.

Re-solving that same track problem earns no more XP or evidence. Solving a separately authored equivalent problem in another area or track is independent work with its own first-solve rule. Difficulty/classification changes affect future activity without rewriting historical awards or evidence.

An optional per-language worked explanation, authored separately from the private reference answer, unlocks after acceptance. It remains available when accepted source later expires. No paid reveal or give-up unlock is offered. A failed later submission cannot overwrite the accepted source or remove the solved state.

The learner's history shows only their own submissions and retained code. Track submission detail uses the shared ninety-day window or the learner's eighty most recent Track submissions across all tracks, whichever keeps more. Accepted source retention is described in Solutions; there is no eighty-item limit on how many track problems can be completed.

## Progress and completion

For a track in progress, coverage is solved published track problems divided by the current published problem count. Adding problems can change unfinished coverage, while removing one changes the current requirement rather than erasing an earned solve. Unknown coverage is not zero.

Completing all currently published entries records track completion once, with its date and completed coverage. It earns the track-completion achievement but no bonus XP; its individual problems already earn their own first-solve XP. A repeated completion signal creates no duplicate recognition.

Completed stays completed after later content changes. Show the original completion date and a separate indication of newly available problems rather than changing the learner back to unfinished. New independent problems can earn their ordinary first-solve rewards, but the same track achievement is not awarded again.

After completion, the onward action can lead to the learner's saved Track solutions. An archived current entry does not strand navigation; offer another available entry or the track overview. Removing a problem cannot revoke recorded track completion, XP or the retained solution history.

## Staff management

Staff create and edit tracks, choose their language, create their own problems with the common form, arrange entries, import destination-owned content where supported, preview, validate, publish, archive and safely delete. The language becomes fixed once a track contains problems; a different language requires a separately authored track rather than reinterpreting existing source and results.

Problem creation is not an Add existing Challenge selector. An import creates independent track-owned content, not references or copies of learner progress. Reordering is applied coherently and leaves problem identity, source and completion unchanged. Duplicate entries or unsupported language templates are rejected with a clear reason.

Archiving an entry removes it from current availability. Permanent removal identifies the track-owned content affected and preserves learner histories as described in Authoring. Deleting a track cannot remove a separately owned Challenge, Daily, Debug case or another track's problem.

Staff content review reports rates and aggregate diagnostics for this track's own problems. It is not learner ranking or staff access to source. An optional link to a related exercise does not turn it into shared content.

## Boundaries and checks

No timed track mode, sequence lock inferred from progress, extra track XP, shared problem bank, cross-track completion, shared source reference, public solution collection or track certificate is introduced.

Check independent similar problems, a fixed language, an empty track, opening an entry out of order, repeated Start, separate first-solve rewards, no repeat reward, content rates by owned item and accepted source filed under Tracks. Complete a track, add or remove problems, and verify its earned completion remains while current new work is shown separately. Account erasure removes that learner's track starts, positions, problem results and completion records without deleting authored tracks.
