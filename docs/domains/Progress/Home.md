# Home

**Status:** Reviewed  
**Group:** Overview and Account

## Purpose and ownership

Home is the signed-in landing page. It helps the learner return to unfinished work, find an activity and see a small, truthful view of their record. It is not a second Skills page or a collection of competing domain reports.

Home, Skills, activity measurement and the Annual Recap belong to one product domain. Profile & Settings is separate and displays the relevant facts without calculating them again.

| Document | Covers |
|---|---|
| [Home](Home.md) | Re-entry, Continue, curated content and shared cards |
| [Skills](Skills.md) | Skill evidence, judgments, trends, explanations and guidance |
| [Activity](Activity.md) | Learning time, charts, retained summaries and content review |
| [Recap](Recap.md) | The private annual review |
| [Profile](../Profile/Profile.md) | The learner's accumulated record and certificate collection |
| [Settings](../Profile/Settings.md) | Appearance, preferences and account controls |

These documents describe product behavior. Architecture, implementation mechanisms and the detailed admin workflow review are separate.

## Home regions

| Region | What the learner sees and can do |
|---|---|
| Greeting | A friendly greeting using the available main-site display name. A name-free greeting is used when the name is missing. |
| Continue | Resume one eligible unfinished activity at its recorded position. |
| Curated suggestion | Open one administrator-selected published learning or practice item, optionally accompanied by an authored line. |
| Quick launch | Open Challenges, Daily Challenges, Debug Detective or Code Lab, in that order. |
| Daily Challenge | Today's problem and its actual state, using Daily's actions and rules. |
| My Notes | Preview confirmed saved text and open the same private Quick Notes panel. |
| Announcements | Read the recent inbox preview without marking items read merely because Home displayed them. |
| Recent activity | Open recent accepted-solution entries or go to Solutions. |
| Achievements | See Economy's existing achievement state and open its gallery. |
| Activity chart | View recent activity at daily, weekly or monthly grain. |
| Activity record | See the recorded Daily streak, level and lifetime activity with the shared day-by-day grid. |
| Seasonal recap | Open an eligible annual recap in season, see what eligibility is still missing, or dismiss its teaser. |

A Set certificate name action appears beside the greeting only when an earned certificate genuinely waits for a name. It is not a permanent task or another progress goal. The device clock may personalize the greeting; product dates, streaks and time windows use the platform's product clock.

Home displays the actual facts supplied by Daily, Economy, Notes, Notifications, Solutions and Certificates. It does not keep alternative streak, reward or completion rules. The header theme/mode switcher is part of the shared shell and changes the same preference as Settings.

## Continue

Continue selects the most recently active item whose owning domain confirms that this learner's work is both unfinished and resumable. The owner applies its access, applicable prerequisites and retained-work rules. Skip completed or non-resumable work without exposing unavailable content; Home does not add a blanket refusal based on the catalogue's archived status.

An unfinished archived subject can remain a candidate for an enrolled learner when Courses still permits resuming it. A test already started can remain a candidate after its catalogue paper is retired or deleted when Assessment still permits Resume. These exceptions do not permit a new enrollment, new test or solving of a withdrawn practice problem. A preserved historical result or completed subject is not unfinished work merely because it remains readable. If resumability cannot be verified, explain the unavailable resume decision rather than guessing access.

Open the saved position inside that item. If the exact position no longer works, open the start of its section, not the next lesson or another invented task. Resolve equal activity times consistently. A completed item never returns merely because an older saved position still exists.

With no eligible unfinished activity, provide the existing Practice entry point rather than an empty clickable card. An unavailable resume service is a different state and offers a retry; do not disguise it as nothing to continue.

Other global resume presentations use the same selection. A domain's Continue within a specific course or track remains constrained to that named context and must not unexpectedly open an unrelated activity. The owning domain still decides whether its saved work can resume.

**Journey:** Open Home → see the latest eligible unfinished item → Continue → return to the saved place → finish or leave → the next global resume result reflects the updated state.

## Curated content and onward navigation

An authorized administrator selects one published learning item, track, challenge or debugging case for the suggestion slot and can add a short explanatory line. There is no inferred recommendation, random replacement, paid placement or generated explanation. If nothing is selected, its target is retired or this optional slot cannot be read, omit the slot without a placeholder.

Ordinary onward navigation remains authored: the next lesson, an author-selected next course where supplied, or current quiz remediation. It is not a learner planning system. Do not introduce goals, target dates, personal checklists or hidden recommendation scores here.

Quick-launch tiles always lead to working destinations. Suggestions do not bypass prerequisites, membership restrictions or the owning area's availability rules. A badge, XP total or streak never opens an otherwise restricted destination.

## Recent activity and shared cards

Recent activity shows accepted work recorded by Solutions, not an invented feed of every click. Opening an entry whose accepted code has expired still reaches its retained summary and explanatory message. It must not become a broken editor or a promise that deleted detail can be recovered.

Achievements, Notes, the Daily card and announcements retain their own domain rules. Displaying one does not create, award, mark read or complete anything. Notes stays private even though Home hosts its preview. Credit-related elements appear only under Economy's shared AI-availability rule.

The activity grid and chart are defined in [Activity](Activity.md). Profile uses the same grid, including its empty and unavailable states. Nothing on Home turns a volume statistic into a skill judgment or compares this learner with anyone else.

## States and errors

Each region loads and fails independently. Keep an already loaded region visible if its refresh fails, label its freshness and offer the relevant retry. An inline page message can name the affected regions; it should not require reloading unrelated working content.

A genuinely empty region, a value not yet calculated, a stale value and a failed read are different. Never show zero achievements, zero activity or no notes because the producer failed. Only a first load where the entire page failed and nothing usable exists becomes a full-page load error.

Optional content may be absent where its rule says so. Do not fill empty space with fake learning items, demonstration metrics or dead controls. Every visible action must lead somewhere valid, and a late response after navigation must not replace the newly opened page.

## Staff capabilities and boundaries

Staff manage the one curated suggestion through its authorized control. The detailed console layout will be refined later; it does not change the fact that Home only reads that selection.

Home offers no learner ranking, proficiency claim, public sharing, AI-written judgment or second per-domain reporting destination. Visiting Home earns no active learning time, XP or achievement.

## Completion checks

Check a new learner, a returning learner, completed and removed resume targets, expired solution detail, pending certificate names and a dismissed recap teaser. Compare shared figures with their owning pages. Fail one region and then every first-load region; preserve good data and never turn failure into learner inactivity. Verify that the header switcher and Settings always show one consistent theme and mode. Check an unfinished archived course with retained enrollment, an existing test whose paper was retired, a withdrawn practice problem and an unreadable owner decision: only work the owner still allows to resume can enter Continue, and completed/history-only records stay out.
