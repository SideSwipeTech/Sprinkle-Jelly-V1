# Debug Detective

**Status:** Reviewed  
[Practice](Practice.md) · [Authoring](Authoring.md) · [Solutions](Solutions.md)

## Purpose and ownership

Debug Detective asks the learner to repair a supplied broken program. Acceptance means the repaired program passes the full case set, not that the learner selected a bug line or named the right bug. There is no partial score, bug-location quiz or per-bug reward.

Debug owns each case's broken code, reference fix, test cases, hints, debrief, modes and learner results. A related Challenge is a separate exercise. Any optional twin link is advisory navigation and shares no content, completion, reward, evidence or statistics.

## Browse cases

The case board is searchable and paged, newest first. Filter by topic, bug type, language, difficulty, personal status and mode. Each card shows its title, planted-bug information, languages, difficulty, applicable XP and the learner's own state. Timed cases disclose their duration and remaining allowance before Start.

Show learners and administrators the same content **Fix rate**, using eligible distinct learners rather than repeated validation counts. Timed and practice populations remain separately labelled and are never averaged into one rate. Small samples say Not enough data under Practice's rule. A filtered board changes what is listed, not lifetime personal counts.

Keep the previous list usable while another page loads. No cases published, no filter matches and failed loading are distinct; a topic request helps an empty library and clearing filters helps an empty search. An unknown total is not an exact invented number.

An explicit prerequisite can restrict a not-yet-started case. Show its requirements, the learner's status and a route to satisfy them. Difficulty, ordering, XP, skill estimates and streaks do not create inferred locks. Later prerequisites do not close an already-started case.

## Work on a fix

**Workflow:** Open case → read expected behavior → work from broken code → Run → Validate Fix → accepted fix, saved solution, reward and debrief.

Use the shared workbench with statement, single-file editor, output, visible-case results and hints. The brief identifies console or SQL behavior, comparison policy, full visible cases and hidden-case count. It never supplies the reference fix, internal bug note, hidden data or unrevealed hints. Remembered dividers do not risk the editor content.

Seed the selected language from this learner's device draft, otherwise their retained last submitted source for this case/language, otherwise the broken starter. On another device only acknowledged retained work can be recovered. Save status must distinguish local draft from platform-held source.

Reset asks before replacing the editor and local draft with the broken starter. Cancel does nothing, an unavailable starter blocks reset, and reset is unavailable during execution. Restore last submitted code similarly asks before replacement and is offered only while that language's source is retained. Neither returns the private reference fix.

Run checks visible samples or one supplied input, ungraded and free. Empty custom input or an empty editor cannot start the corresponding run. The first failing practice run of a visit may show the authored This is the bug cue once. Console and SQL runs use prepared input/datasets, not an interactive terminal.

Validate Fix checks the complete visible and hidden set and accepts only all-pass results. A failing visible case can be named; hidden values and per-case hidden rows remain private. Show the actual shared execution outcome rather than inventing a Debug score. A platform failure is not a wrong fix, and a never-completed run must not become an invented result in solve history.

Repeated requests produce one recorded submission. A job completes even if the tab closes. If the case content changed while it was being evaluated, explain the content conflict and invite validation again without recording a mismatched verdict. Request-rate and capacity refusals say what is limited and how to recover; they spend no learner-result allowance or reward.

## Practice and timed mode

Each published case is **Practice only** or **Timed then practice**, disclosed before entry. Practice permits freely changing among the case's offered languages. It has no countdown-based skill evidence.

A timed case uses an explicitly started window. Choose a language, then Start timed window. Its language, duration and allowance are fixed for that window. The timer does not pause when leaving or disconnecting. Defaults are thirty minutes and three windows per case, configurable within five to 120 minutes and one to ten windows. The allowance spans all languages; changing language cannot obtain more windows.

Only one timed window can be active across Debug Detective. Starting another names the current case and time remaining and offers Resume or an explicit finish. If current window state cannot be established, do not offer a misleading Start. Other practice content stays browsable.

A failed validation does not consume an additional window or immediately end the current one. Acceptance ends it. Once timed allowance is exhausted, unlimited practice is available without a wait or dead end.

### Saving for the deadline

During the window, keep one private acknowledged checkpoint of current editor code. Update it on explicit Run, explicit Save, and after thirty seconds of idle in the focused editor where saving is available. The initial broken starter is itself acknowledged. Show whether current visible code has reached this checkpoint; locally typed text is not automatically a promise of a saved deadline answer.

Closing the page does not discard the window. At expiry, submit the latest acknowledged checkpoint against the full cases, not unseen local typing. Finish now also submits that checkpoint after confirmation. There is no silent abandonment outcome. Remove the temporary checkpoint after the window finishes.

| Ending | Outcome | Uses one timed window |
|---|---|---|
| Accepted validation | Finish immediately with the accepted timed result | Yes |
| Finish now | Grade the current acknowledged checkpoint | Yes |
| Time expires | Grade the last acknowledged checkpoint | Yes |
| Platform cannot honestly complete it | Explain platform invalidation; preserve recoverable code | No; restore the allowance |
| Material content correction or retirement | Explain the change, preserve acknowledged code and end the affected window | No; restore the allowance |

Refused or duplicate starts consume nothing. If execution or checkpoint storage prevents honest deadline grading, restore the allowance instead of inventing a learner failure.

## Acceptance, learning and debrief

The first accepted fix records this case's completion, accepted source in Solutions and difficulty-based XP once, whichever mode produced it. Later successes can create normal history but never another case reward. A first accepted source in another language can be retained separately without duplicating the case's reward or evidence.

Only a qualifying acceptance inside a timed window contributes skill evidence, at the shared practice weighting and the difficulty/classification captured then. A practice acceptance can still earn the case's first XP and solution but creates no skill evidence. Runs, hint use, opening a case and platform failures produce none. Active time follows the shared primary-skill rules.

A solved banner appears before another action and explains free re-practice. Accepted source cannot be overwritten by a later failure. An unavailable capture does not become a falsely recorded solve with no saved solution.

A published per-language debrief unlocks after the first accepted fix. It explains the root cause, why the starter failed, the repair approach, an important edge case and corrected learner-facing code, with an optional complexity/safety note. It is separately authored and checked, never copied automatically from the private reference or internal note.

Exhausting timed attempts does not unlock the debrief. A learner without an accepted fix still has the available hints and practice, with no Give up or paid Reveal control. Hints are optional, ordered, free and independent of WizBit; absent, exhausted and unavailable hints are different states.

## History and figures

Recent submissions show the learner's own outcome, cases passed, language and time. Detail and source remain within ninety days or the most recent forty Debug submissions, whichever retains more. Expiry explains the unavailable source while keeping the case's solved state. Solutions owns accepted-code retention.

Personal volume can show cases submitted, cases fixed, timed fixes, practice fixes, bug types practised and XP earned. Keep filters from changing lifetime counts. Profile can show the completed-case summary. Detailed learner performance belongs in Skills, while public Fix rate describes the case population, not the viewing learner. Do not invent Bugs found or sum planted bugs into a claim of Bugs fixed.

## Staff capabilities

Staff use the shared form inside Debug's own collection to create, edit, preview, publish, archive and safely delete cases. Deletion is an ordinary authorized admin action, not a maintenance-only hidden feature. Safe removal still protects learner summaries and retained solutions.

Author broken starter and private reference fix for every offered language, cases, difficulty, classification, bug metadata, optional hints, debrief and valid timed settings. The curated bug-type list initially includes off-by-one, boundary, state, logic, resource and typo. Staff maintain that list separately from choosing a case's values. A case may state one to ten planted bugs and one to three bug types; those are content metadata, not measured bug counts.

Publication and valid live edits require at least one visible and hidden case, well-formed expected results, a reference that passes all cases and a broken starter that fails at least one in every language. Broken and fixed source cannot be identical. SQL validates its datasets and ordering rule. Every offered language requires a checked debrief; hints remain optional. Unknown validation cannot be marked Passed, and a case losing its last runnable language becomes honestly unavailable.

Changing cases, datasets, expected reference behavior, offered languages, comparison policy, timed duration or timed allowance is material. Before applying it, explain the exact active-window impact. A missing impact count blocks the destructive confirmation rather than becoming zero. Affected windows end as platform-caused, their allowances are restored and acknowledged code remains recoverable. Cosmetic text changes do not break windows.

Archiving or safely deleting a live case applies the same active-window protection, stops new starts and leaves earned records readable. No in-app notification is invented for this change; the persistent affected-window message explains what happened. A new independently created replacement receives no copied learner activity.

Staff review case-level aggregate participation, fix rates, time, hints and failures, keeping timed and practice results separate. Exports disclose bounds and truncation. Staff never inspect learner source. The case and board support scoped topic requests; a content report uses the shared report reasons and preserves privacy.

## Checks

Verify broken-code seeding, Cancel on Reset, unavailable last source, per-language drafts, free Run, all-case validation, no hidden feedback, same case solved in both modes without duplicate XP, one active window, failed validation before the deadline, closed-tab expiry, unsent edits, platform-invalidated allowance restoration and material edits. Check both learner/staff Fix rates, the required debrief unlock, source expiry, independent paired Challenges and account erasure of all private Debug records.
