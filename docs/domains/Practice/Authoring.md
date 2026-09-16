# Authoring

**Status:** Reviewed  
[Practice](Practice.md)

## One form, independent collections

Administrators use one reusable problem-authoring form from Challenges, Tracks, Daily Challenges and Debug Detective. The page that opens the form fixes its destination. Creating inside a Python Track creates that track's own Python problem; it does not create a standalone Challenge or a reference to one.

Each area has its own Create, Read, Update, Delete, Archive, preview and publication capabilities. Each owns its statements, code, cases, hints, explanations, settings and learner outcomes. Identical exercises in different areas remain independent. A track cannot add a live reference to an existing Challenges item. There is no automatic content synchronization, shared problem lifecycle or cross-domain completion.

The form shows the current area and any track context clearly. It reuses controls and common validation while the owning area applies its own rules. Assessment may reuse appropriate coding-question controls, but it keeps its papers, questions and marking separate.

This document states staff capabilities and consequences. Modal size, screen layout and the final sequence of admin screens are part of the later administration workflow review.

## Common fields

| Section | What staff enter |
|---|---|
| Identity | Title, description and a readable address where applicable |
| Learning context | Difficulty, primary skill, any supported secondary skills, topic and tags |
| Problem | Statement, input/output descriptions, constraints and examples |
| Interface | Console program or SQL query, with the applicable output-comparison policy |
| Languages | Compatible languages from the shared catalogue; a track supplies its single language |
| Code | Learner starter and a separate staff-only reference answer for each offered language |
| Cases | Visible and hidden cases, inputs or datasets, expected results and applicable comparison settings |
| Limits | The allowed time and memory settings, no more permissive than the shared execution limits |
| Hints | An optional ordered ladder of up to ten hints |
| Explanation | A separately authored learner-facing worked solution or Debug debrief where supported |

A console comparison normalizes line endings and ignores one final newline, not all whitespace. SQL authors choose whether row order matters and supply the schema and datasets. Any numerical tolerance is stated in the learner's comparison rules. Arbitrary executable custom checkers are not offered.

Drafts may be incomplete. Missing fields block publication when required, not the ability to preserve unfinished authoring. Do not silently truncate an over-limit field or import only the portion of a collection that fits. The common ceiling is one hundred cases per practice item.

## Area-specific additions

| Area | Additional behavior |
|---|---|
| Challenges | Offer one or more supported solving languages. Base XP comes from difficulty, not an editable per-problem XP field. |
| Tracks | Create inside a named track. Its language is displayed and fixed; cases and content belong to this track problem only. |
| Daily Challenges | Choose a free future date and an optional 0–200 XP bonus. Scheduling, moving, unscheduling and voiding follow Daily's date rules. |
| Debug Detective | Provide broken starter code, reference fix, planted-bug count, curated bug types, a debrief per language and the practice/timed settings. |

Optional Challenge/Debug companion links only help navigation. They do not share content, references used for grading, completion or statistics. Removing an optional companion link must not break the remaining item.

## Save, preview and validate

The form preserves staff input, reports saving honestly and offers a genuine retry. A stale edit does not silently overwrite another saved change; show the conflict and let the administrator keep their unsaved work or load the saved content. Shortening a collection explains which cases, languages or hints will be removed.

Preview presents the learner-facing material without creating learner progress, solve counts, XP or evidence. It never includes hidden datasets, reference answers, internal bug notes or unrevealed hint bodies as learner content. A read-only language view can show supported capabilities and limits without becoming a second language catalogue.

Publication checks explain every blocking issue at the relevant item or field. Check title and problem completeness, difficulty and classification, permitted bounds, a stated comparison rule, at least one visible and one hidden case, expected results, and valid per-language starters and reference answers. For each language the reference must pass all cases and the starter must not already solve the complete task. SQL additionally validates its schema, datasets and row-order rule.

Debug requires visibly different broken and fixed code, proof that the broken starter fails at least one case, and a validated debrief for every offered language. An optional hint ladder is not a publishing requirement. Daily additionally needs a free permitted date and valid bonus. A track must have published problems before learners can start it.

A validation that cannot run reads Not yet verifiable, not Passed. Validate every offered language rather than publishing a partly runnable problem. Live edits receive the same required validation; an incomplete update must not replace valid published content.

## Create, edit and organize

**Normal authoring:** Open the destination area → create or edit → save → preview and check → make valid content available.

Direct editing is the ordinary correction route. No compulsory archive-and-duplicate cycle is needed for a wording correction or a normal update. A distinct new exercise may still be created independently. Any duplication offered copies authored material only, never learner submissions, rewards, statistics or completion.

Tracks create and arrange their own problems, with ordering and bulk import where offered. Reordering is one deliberate change, not a series of partially applied moves. Imports produce destination-owned items rather than live references; the track's language and ordinary validation apply. A copy into a different area, if supported by a later import convenience, is still independent and does not remain synchronized.

Change records state what changed without exposing private staff notes or learner source. Previously earned solves, XP and classifications are not repriced by new difficulty or topic settings. Running submissions must not produce an outcome against mismatched case content: affected work follows the owning domain's explicit conflict or timed-window behavior.

## Archive and permanent Delete

Archive removes an item from new discovery and solving while preserving earned learner records. Archive is a retirement action, not a hidden soft-delete or Trash folder. Retired problems do not silently reactivate. Optional duplication creates a new draft identity rather than reinstating the old one.

Delete removes the chosen authored item permanently, with a confirmation naming its affected content and learner-history consequences. It is available through ordinary area administration where safe, not hidden behind a maintenance-only page and not limited solely because an item was once published. There is no restore-from-Trash feature.

Deleting authored content must not delete earned solves, XP, track completion or the learner's retained accepted-code collection. Keep the origin title, date, language and other accepted-record information required by Solutions, and show that the original content is no longer available. Remove or repair live catalogue/track links in the same confirmed operation; never leave a broken selectable problem behind. If dependencies cannot be checked or the required records cannot be protected, refuse with a reason and offer Archive.

Removing a track problem changes that track alone. Deleting a track identifies its own child problems; it cannot reach standalone Challenges or another track's independently created problems. Existing track completion and each learner's saved solutions remain historical records, not a restorable copy of the deleted authoring item.

Daily's current/past date safeguards remain: a begun day's grading conditions are not casually edited, moved or removed. Use Void Daily for a critical defect or qualifying outage, preserving existing solves and making the date neutral. This is not bypassed through Delete. Debug material edits and retirement explain affected active windows and restore their allowances while preserving acknowledged code.

## Staff content review

Staff and learners see the same problem Solve rate definition in Practice. Show attempted/solved populations and Not enough data below the shared minimum. Do not combine identical exercises from different collections. Debug presents timed and practice Fix rates separately.

Staff can inspect aggregate participation, valid submissions, solves, timings, hints and supported review signals. Rates count distinct eligible learners, so one person's repeated attempts do not dominate a headline. Diagnostics about submission volume remain separately labelled. Never-submitted items appear as unknown rather than zero-success failures; missing figures say unavailable and carry no invented denominator.

Challenge review can sort low solve rates first and filter by review reason; track rollups describe that track's own problems. Daily includes scheduling health and its own problem performance. Debug includes its curated bug-type list and separate timed/practice funnels. Exports, where offered, use the same columns and population, state their date, and disclose any truncation. Review signals prompt inspection of content rather than automatically declaring it defective.

Staff permissions apply to the action, not just the menu. Authoring, publishing, scheduling, voiding and content review have the appropriate authorized access and change history. No staff page can open learner source, use it as a reference answer or promote it to a public editorial.

## Checks

Create equivalent problems independently in Challenges, a Track, Daily and Debug. Edit one and verify none of the others changes. Exercise drafts with missing fields, a bad import, conflicting saves, a missing runtime, a reference that fails, an already-correct starter, safe deletion after a solve, and an unsafe Daily/Debug change. Verify learner and staff rates agree while private code remains inaccessible. The form must reuse the experience without turning the collections into one problem bank.
