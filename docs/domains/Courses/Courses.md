# Courses

**Status:** Reviewed  
**Group:** Learning

## Purpose

Courses teaches through written lessons and video lessons. Learners explore subjects, work through chapters and complete lessons at their own pace or in the order the subject requires.

Both formats use **Subject → Chapter → Lesson**. There are no nested chapters and no lessons directly under a subject. The two catalogue tabs remain **Lessons** and **Video Courses**; sharing a hierarchy does not merge their learning records or reward rules.

## Reading guide

| Document | Covers |
|---|---|
| [Lessons](Lessons.md) | Reading, content sections, executable examples, videos, quizzes and assigned activities |
| [Authoring](Authoring.md) | Staff capabilities, editing, imports, publishing, updates and content management |
| [Certificates](../Certificates/Certificates.md) | Certificate names, issuance, downloads, verification and staff controls |

These are product descriptions. Technical architecture and the later review of admin screen flows are separate; this set does not prescribe a complicated publishing interface.

## Finding and starting learning

### Catalogues

Each tab has its own search over titles, descriptions and tags, difficulty/topic filters, counts and subject cards. Cards show the learner's state using learning and coverage language, such as Not started, Learning and Completed, not a proficiency claim. Remember the selected tab for the visit.

Distinguish nothing published, no matches for the current filter, and a catalogue that cannot load. Offer clearing filters where appropriate. One tab failing does not make the other unusable. Unknown progress or time is unavailable or unmeasured, never a fabricated zero.

### Subject overview

Before starting, explain the subject using its existing information: overview, learning outcomes, intended audience, prior knowledge, chapter/lesson structure, estimated time, languages and tools, required and optional work, navigation and completion rules, projects, and certificates. State None where no prior knowledge is expected. The overview can be reopened later and does not itself enroll, complete or reward anything.

Each subject carries one to eight short learning outcomes and each published lesson one to five, up to 240 characters each. Outcomes explain what is taught, not what ability has been proven. A temporary failure to assemble the orientation is explained and does not itself prevent otherwise permitted learning.

### Start and Continue

Opening a video subject's details does not enroll the learner. **Start Course** enrolls once; repeated clicks do not create duplicate enrollment. A written subject leads to its first available lesson. Returning learners get the appropriate Continue action.

The Courses header has at most one Continue card, using the shared Continue behavior to return to the unfinished item and position. Completed subjects are not offered as unfinished. No target means no card; failure to load Continue does not block catalogue browsing.

## Access and navigation

Membership or the appropriate staff role permits access; neither role nor membership is inferred from the other. Courses has no separate price and charges no Credits for access, lessons or quizzes. Optional generated help follows its own shared rules.

New discovery and starts require published content and published parents. A lesson also needs usable content. Hidden or unauthorized content is not disclosed by direct links. An archived subject leaves new discovery but remains available to already-enrolled learners through their learning record, including their assigned Course Workspace.

A subject may use open navigation or sequential navigation. Sequential navigation leads through required lessons and respects the learner's saved continuation preference. A direct link beyond what is reachable shows the outline and an explanation, not the protected lesson body. If the navigation rule cannot be confirmed, explain the restriction rather than guessing that everything is open.

### Prerequisites

Administrators can set explicit completion requirements on a subject or lesson. Show all required items, the learner's status against each and a route to reach them. All listed requirements must be met together. Only agreed, recorded completion facts qualify; course-assigned projects are not prerequisite targets.

Adding or tightening a prerequisite affects learners who have not started that content. Removing it opens access immediately. Meeting a prerequisite does not automatically start or enroll the learner. Skill estimates, XP, levels, streaks and balances do not create inferred content locks.

## Completion and rewards

| Learning item | What completes it | Recognition |
|---|---|---|
| Reading lesson | Explicit Mark complete | Lesson completion only |
| Video lesson | Verified watched coverage reaches 95% | Lesson completion only |
| Quiz lesson | Submission, or passing where its author requires that | Lesson completion only |
| Assigned project lesson | Learner confirms their own work is complete | Lesson completion only |
| Linked activity lesson | Its referenced activity supplies the completion fact | Lesson completion; do not invent a second activity verdict |
| Written subject | All published lessons complete | Its configured subject XP and achievement; certificate only if enabled when completion is recognized |
| Video subject | All required lessons across its chapters complete | Certificate and achievement; no course-completion XP |

Video lessons can be required or optional. Optional work is shown separately and does not block completion. Chapter progress derives from required lessons; a chapter with only optional work is labelled Optional and grants no independent reward. Written subjects use all published lessons for completion.

Repeated completion requests produce one completion and one recognition. There is no per-lesson, chapter or quiz XP. A video subject does not inherit written-subject XP merely because both use the same hierarchy. Certificates are generated by the Certificates domain, not by the lesson page.

### Progress during learning

For unfinished learning, show completed applicable lessons against the currently published requirements. Added content can change the remaining work and percentage, but previously completed work is not discarded. Optional lessons remain outside the required-work denominator. Unknown progress is explained rather than drawn as zero.

### Completed learning stays completed

Once the learner has completed a subject in either format, later content additions, edits, moves, archival or deletion do not remove that completed status, reduce it to in progress, reset earned progress or demand new work to preserve an issued award. New material can be explored without awarding the same completion again.

For example, completing a ten-lesson subject remains a completion after two new lessons are added. The learner is notified about the change; their completed record and issued certificate do not change. Current curriculum information and previously earned completion must not be presented as contradictory percentages.

### Progress reset

An explicit learner-requested reset clears that learner's written-subject completions and reports the count. Clearing zero items is valid. This deliberate reset is different from a content update. Earned XP, achievements and certificates remain; the once-earned recognition prevents duplicate rewards on recompletion. The shared preference reset may also clear continuation preferences without clearing recognition.

## Published changes

Learners with access are notified about published course changes, including learners who already completed the subject. Draft autosaves do not announce unfinished edits. Describe meaningful learner-facing changes without exposing private staff notes or internal details. Sending a notice and keeping the change history are separate responsibilities; delivery failure does not reverse the content update or claim the notice was delivered.

Returning enrolled learners can read a dismissible inline Change Brief grouped into Added, Updated, Moved and Removed or no longer available. Show up to five entries with access to the full history. First visits show no invented changes-since-last-visit. Dismissal advances only through changes actually shown. An unavailable brief does not block learning.

Course-content changes never rewrite an issued certificate's title, name, dates or presentation and never revoke it merely because the curriculum changed. The certificate's award information and public verification survive removal of the catalogue content. Separate authorized certificate correction, revocation and account-erasure actions remain governed by Certificates.

## Shared capabilities and connections

Courses uses shared Access, Languages, Code Editor, Code Execution, content/media handling, common states, confirmations, notifications and data-deletion behavior. It supplies enrollment, completion and active-learning facts to Progress and eligible recognition to Economy and Certificates. It supplies no skill-assessment evidence: studying a subject is not the same as demonstrating a skill.

Learning time is recorded through the shared active-time rules. Paused video does not count as watching. An unavailable time report does not block reading or completion and is not replaced with an invented time figure. Previously finalized daily time is not reassigned after a content edit.

**Now try these** and the next-course suggestion are administrator-selected links to available subjects, lessons, challenges, tracks or debugging activities. No inferred ranking or hidden unlock is introduced. Omit absent or unavailable targets.

Topic requests, an improvement request carrying the subject/lesson context, a lesson content report, shared Quick Notes and WizBit are available where permitted. Quick Notes is not a separate note per lesson. Content reports use Spam, Incorrect, Inappropriate or Other; Other requires an explanation. WizBit can provide authored guidance but never run, submit or edit on the learner's behalf. Its failure does not break the lesson.

## Membership and data

Ordinary membership expiry stops protected content access but preserves progress, history and public certificate validity. Renewed access resumes existing learning. A confirmed payment reversal follows the separately authorized access and certificate rules; it is not an ordinary content change.

Learner records remain for the account's life. Account erasure removes enrollment, completion, watch coverage, quiz outcomes and personal continuation/change-brief records; shared activity data is removed by its owner. Authored content remains with a departing author's identity removed, and aggregates retain no personal attribution. An authorized hold delays erasure honestly rather than reporting a deletion that did not complete.

## Boundaries and checks

Custom HTML/CSS/JavaScript animation sections are outside this release. Standard executable web examples remain supported. No video downloads, course proctoring, course-based skill grading, per-course purchasing or automatic project grading are introduced.

Verify both catalogue tabs, identical Subject → Chapter → Lesson hierarchy, direct-link restrictions, Continue, prerequisites, duplicate completion, optional-only chapters, learning without a time report, an explicit reset, and membership expiry/return. Add and remove lessons after completion and confirm the learner remains completed and the existing certificate unchanged. Verify that a published change reaches the notification process without announcing private drafts.
