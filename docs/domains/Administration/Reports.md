# Reports

**Status:** Reviewed  
[Administration](Administration.md)

## Purpose and ownership

Reporting helps staff understand platform participation and find content needing review. It is not a learner leaderboard, employer roster, engagement-intervention system or second source of skill judgments.

Admin and Super Admin can read the permitted aggregate views and their recorded exports. Each domain supplies its own defined figures. Administration hosts a coherent reporting area and links to appropriate domain views without recomputing conflicting versions of the same number.

A named learner's support picture is the deliberate, audited exception described in People. Aggregate reports and their exports do not expose personal identities or private learner work.

## Participation

Choose daily, weekly or monthly buckets on the product clock and a valid supported range. Use prepared summaries rather than requiring a learner's page request to scan everyone else's activity.

Each bucket distinguishes first-time active learners from returning active learners. First-time means the person's first qualifying platform activity falls inside that bucket, not that they purchased or registered then. Returning means earlier qualifying activity exists, including after a long absence.

The two categories total that bucket's eligible active population. Do not add weekly distinct-user counts and label the sum a monthly unique count. Where a wider-window distinct count is not available, say so rather than double-count return visits.

Break activity down by area and by kind: practice solves, Daily solves, debugging completions, lessons completed, quiz submissions, tests taken, projects completed and Code Lab runs. Show actual zero-activity areas as zero rather than hiding them. Exclude staff and test/exempt activity using the shared eligibility rule, without rewriting historical populations simply because someone's role later changes.

An invalid range receives a useful validation message. No activity, insufficient data and failed calculation are different states. Figures state when they were computed; a fast response carrying yesterday's summary remains a yesterday summary.

## Content review

Per-area reports share the same layout and meanings. Show flagged-item count, age of the oldest unresolved flag, items resolved in the last thirty days and median time to resolution. Use twenty rows per page where the shared report page size applies.

Order Most-reported unresolved content by unresolved report count, then age with stable ties. This is not a worst-performing learner or content label. Reports are inspection signals, not automatic judgments.

Show an owning area's Solve/Fix rate only with its actual population and threshold. A complaint count is not a solve-rate denominator. Preserve separate timed/practice Debug readings, independent problem collections and the difference between a saved-solution count and a unique-problem count.

Advisory content signals retain their registered meaning, period, numerator/denominator and threshold. Do not reword them as proof a learner cheated or a question is defective. Unknown advisory classifications are reported for correction, not silently turned into a new category.

Topic-request demand and product-help search misses remain separate panels, and a failed lookup is not a content gap. The same product statistic can appear on a domain page and in the reporting area, but it remains one owner-produced figure rather than a second report calculation.

## Exports

An export uses the originating view's permissions, filters, columns and privacy rules. Export the complete bounded filtered view, not just rows already visible. The maximum is 5,000 rows; identify a truncated result clearly in its filename and content so it cannot be mistaken for a complete report.

Include the generation time in the file and its name. An empty view returns headers and zero rows, not an error. Protect spreadsheet readers from text interpreted as a formula. Never include learner source, private notes, project files, raw generated text or identifying learner detail in reporting exports.

Downloads are on demand, not scheduled or emailed. Record the originating view, filters and bounded scope before producing the file; if that record fails, do not provide an unrecorded export. This rule concerns reporting exports and does not remove separately approved authored-content downloads.

## Administrative history

Super Admin reads the whole administrative trail. Admin can see the permitted history accompanying their content/review work and audited support picture, not acquire unrelated protected controls by following a history link.

Filter the trail by actor, target, action and date, newest first with stable paging. Each entry identifies who did what, to which object/person, when, and the reason where required. Keep original attribution when an account's WordPress role changes or a staff member leaves.

No role can edit or delete trail entries. Record an approved correction as a new act rather than rewriting the original. Platform transitions, such as suspension expiry, remain identifiable as automatic actions linked to the initiating human act.

History contains safe administrative facts, not private learner body content. A content-report note or Topic Request belongs in its explicitly permitted review view, not copied into every audit export. A filter matching nothing differs from a trail read failure. Do not manufacture a total from the loaded page.

## Lists, reads and failures

Every list has real pagination, stable ordering and its applicable bound; an administrative page never returns more than one hundred rows per page. Smaller domain page sizes continue to apply. Search/filter state must agree with the rows and any stated count.

Use Loaded N of T only when T was counted under the same permission, filters and snapshot. Otherwise say N loaded, total unavailable. An unavailable ordinary total does not hide readable rows or block safe work. An unavailable exact impact count does block the irreversible action relying on it.

Estimates are labelled estimates. Null, unavailable and expired detail are not zero values. Previously read figures can remain visible with their freshness when a refresh fails, and one panel failure does not blank the reporting area.

Administrative work must not consume a learner's action allowances. Reports and downloads still need their own bounded execution and the shared download protections. This product boundary does not prescribe the later rate-limiter or database mechanism.

## Checks

Verify first-time/returning populations, staff exclusion, zero buckets, non-additive distinct counts, independent content statistics and calculation freshness. Check empty/partial exports, formula-like text, the 5,000-row cap, audit failure, unauthorized downloads, paginated search totals and protected history. Confirm no report becomes a learner ranking or a private-work viewer.
