# Economy

**Status:** Reviewed  
**Group:** Supporting domains

## Purpose

Economy manages XP, levels, achievements and the Credits used for optional generated help. These are different things: XP recognizes completed activity, achievements recognize milestones, and Credits provide an allowance for the three priced AI actions. None is a skill score.

| Document | Covers |
|---|---|
| [Economy](Economy.md) | XP, levels, achievements, histories and reward delivery |
| [Credits](Credits.md) | Membership allowance, prices, spending, failures and renewal |
| [Administration](Administration.md) | Configuration, verified corrections and delivery monitoring |

These are product descriptions. Technical mechanisms and the later review of admin screens belong elsewhere.

## XP awards

| Completed activity | Default award |
|---|---:|
| First accepted Easy problem | 30 XP |
| First accepted Medium problem | 60 XP |
| First accepted Hard problem | 100 XP |
| First accepted Extreme problem | 150 XP |
| Daily Challenge bonus, alongside its difficulty award | 40 XP by default; authored from 0 to 200 |
| Completed written subject | 250 XP |
| First completed Mock Test | 200 XP, once per learner |
| First passed Mock Test | 300 XP, once per learner |

The difficulty awards apply to independently owned Challenges, Track problems, Daily Challenges and Debug Detective cases. A Debug case can earn its first-fix award in timed or practice mode; its skill-evidence rule remains different.

Each area's problem is independent even when similar content exists elsewhere. A Challenge and a separately authored Track problem can each pay their own first-solve award. Re-solving that same owned item, in the same or another language, pays no further first-solve XP. Do not match titles or source text to combine awards across areas.

A first Daily acceptance earns its difficulty award and any authored bonus, including when solved as catch-up. A learner's first completed Mock that is also their first passed Mock earns both Mock awards. The occasions are distinct, but retrying either never pays it twice.

The amount earned is the amount in force when the qualifying action occurred. Later changes to difficulty or configured rates do not reprice an existing award. An unfinished grade does not produce an estimated award. Solve pages display the actual applicable reward; an unavailable reward figure is not guessed from a local default.

### What does not pay XP

Individual lessons, chapters, course quizzes, video-subject completion, Track completion, project actions, Code Lab runs, authored hints, notes, topic requests and time spent do not pay XP. Company Tests generate no XP, Credits or achievements. Video subjects do not inherit written-subject XP because they share the Subject → Chapter → Lesson hierarchy.

Completing a written subject pays once. Later content changes do not take the award away or make it payable again. An explicit progress reset does not reset award eligibility. There is no daily earning cap; once-only rules apply to each defined occasion.

## Levels

A new learner begins at Level 1. Level L begins at **250 × (L − 1)² XP**.

| Level | Total XP required |
|---|---:|
| 1 | 0 |
| 2 | 250 |
| 3 | 1,000 |
| 4 | 2,250 |

Show total XP, current level, the next threshold and XP remaining. These figures have one shared definition wherever they appear. Displayed levels stop at 100; XP may continue increasing. At the cap, show a full progress indicator and Highest level reached, without inventing another level or negative remaining XP. There are no named level tiers.

XP and level measure engagement, not proficiency, readiness or employability. They do not unlock content. Explicit completion prerequisites belong to the content that declares them, not Economy.

## Achievements

Achievements unlock automatically; there is no Claim action. Each unlock and its applicable bonus happen at most once per learner.

| Family | Members |
|---|---|
| Mock Tests | First completion, first pass, score of at least 90%, perfect score and perfect section |
| Daily streak | 100, 200 and 365 days |
| Projects | First completed project |
| Written subjects | One completion achievement per published written subject |
| Video subjects | One completion achievement per published video subject |
| Tracks | One completion achievement per published Track |

The two first-Mock members carry the awards in the XP table. A subject achievement adds no second payment to its subject award. Video, Track, streak and project achievements carry no XP bonus. Completion badges use Completed: followed by the item's published name. There is no arbitrary badge creator, hidden achievement or additional point currency.

The gallery offers Closest to unlocking, Earned and All. Closest shows up to three unearned badges by percentage of their requirement completed; Earned is newest first; All follows the catalogue order. Filters are All, Earned and In Progress. Closest is a view of existing progress, not a separately saved goal.

Each card shows its artwork, name, description, requirement and threshold, plus its bonus or Recognition only. Earned cards show their date. Unearned cards show exact numerical progress, or Unavailable when it cannot be read. No bare lock implies undisclosed conditions. There is no rarity, ranking, sharing or comparison with another learner.

Achievements remain earned through ordinary time passing, progress resets and content updates. When the underlying awarding fact is explicitly invalidated, retain a visible record of the correction instead of silently deleting history. Solutions review milestones and the lower Daily streak tiers are celebrations, not additional achievements.

## History and shared displays

XP history lists the learner's own awards, verified corrections and compensating reversals, newest first, twenty per page. Each entry explains its source and amount. Repeated processing produces no duplicate entry. Empty history means nothing has been recorded; a failed read is Unavailable, not empty.

The shell can show level and XP, plus Credits when generated help is enabled. Re-read after an applicable change and when returning to a stale view. Show the last confirmed figure as stale when possible; otherwise show unavailability. Do not fabricate a zero balance or a level from inconsistent figures. No stale display authorizes Credit spending.

The total must match its recorded changes. A mismatch is a platform problem: do not silently clamp or invent a learner figure. Learning stays available while it is repaired.

## Reward delivery and recognition

**Journey:** Complete eligible activity → record its reward occasion → apply the award once → update XP and level → show applicable recognition and notices.

A reward that is still waiting is not described as paid. Delivery attempts are isolated so one failed award does not hold up everyone else's. After three automatic tries, a persistent failure is visible to staff for an individual retry using the same original award. It is not written off or recreated as a new grant.

A missing animation or failed notification never reverses an applied award. Level crossings and non-streak achievement unlocks have their respective inbox notices. A badge whose bonus also crosses a level may produce both notices because they describe different facts. A streak achievement is named in the Daily milestone notice rather than generating a duplicate achievement notice.

Celebrations are optional presentation of recorded facts, never the only proof that an award happened. Unavailable or hidden WizBit does not prevent earning or reading an achievement.

## Corrections, resets and data

Invalidating a rewarded Mock appends a reversal for exactly what that test paid. Do not alter the original award. Its level may decrease as a consequence; do not hide the change or announce the same already-announced level again. Assessment's invalidation notice explains the event. A score repair without invalidation follows Assessment's agreed rule and does not silently reprice rewards.

Staff corrections repair verified platform defects only. They are not discretionary grants and cannot manufacture completion, skill evidence or a test outcome. Their controls are in Administration.

Ordinary progress resets leave XP, award identities and achievement records intact. Account erasure removes the learner's reward records, balances, histories, reservations and unlocks, subject to the shared hold rules; it does not delete the platform's catalogue or settings.

## Ownership and checks

Activity domains own their qualifying actions. Economy owns award amounts, balances, levels and achievement recognition. Notifications owns notice delivery. Progress owns skill interpretation; it does not infer skill from XP. Economy pages contribute no active learning time and are not Continue targets.

Verify independent Challenge/Track rewards, repeat solves, a first passed Mock earning both awards, Daily catch-up, changed rates, completion after curriculum edits, progress resets, invalidation, failed reward retry, level-cap rendering, private histories and unavailable totals. No failure should invent points or duplicate an award.
