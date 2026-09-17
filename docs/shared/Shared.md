# Shared

**Status:** Reviewed product definition

## Purpose

These documents describe behavior used in more than one part of Labs. They explain what a capability provides, what its callers supply, what each domain still owns, and what happens when work is interrupted or unavailable.

Shared does not mean a new domain, a shared problem bank or a separate service. Assessments, Analytics, Economy, Notifications, Solutions and Certificates provide reusable capabilities while retaining their existing domain ownership. Technical placement and permitted dependencies are defined in [Architecture](../Architecture.md).

## Reading guide

Read the capability needed for the current task and the linked domain behavior. Do not load this entire set for every small change.

| Document | Shared responsibility |
|---|---|
| [Access](Access.md) | Identity, membership, WordPress roles, sessions, restrictions and private ownership |
| [Languages](Languages.md) | The supported runtime catalogue, capability checks, starters and availability |
| [Code Editor](Code%20Editor.md) | Common editing controls, shortcuts, output presentation and configurations |
| [Execution](Execution.md) | Running, input/output, preview, stopping, limits and execution failure |
| [Evaluation](Evaluation.md) | Checking answers and cases without exposing hidden material |
| [Solving](Solving.md) | The reusable practice workflow, drafts, hints, acceptance and repeat practice |
| [Assessments](Assessments.md) | The common recorded-test lifecycle used by Mock and Company |
| [Analytics](Analytics.md) | Activity, evidence, shared measurements, Continue and explanations |
| [Content](Content.md) | Reusable authoring, validation, publication, imports and content lifecycle |
| [Files and Media](Files%20and%20Media.md) | Safe uploads, processing, storage feedback and permitted delivery |
| [Interface](Interface.md) | Shell, navigation, appearance, controls, common states and messages |
| [Data and Privacy](Data%20and%20Privacy.md) | Saved work, recovery, retention, erasure and information boundaries |
| [Operations](Operations.md) | Durable work, safe retries, maintenance, recovery and operational truth |
| [Economy](Economy.md) | Reward occasions, balances and Credit reservation/settlement |
| [Notifications](Notifications.md) | Domain events entering the one inbox and its preference rules |
| [Solutions](Solutions.md) | Accepted-code capture and reading across independent practice areas |
| [Certificates](Certificates.md) | Completion-based issuance and the shared credential experience |
| [Help](Help.md) | Authored guidance, messages and separately controlled generated assistance |

## One owner for each rule

The linked domain documents remain the home of domain-specific formulas, limits, workflows and exceptions. These shared definitions describe how other areas use them; a repeated summary is not a second configurable rule. A summary must not override its linked owner. Change an approved behavior deliberately and update its affected references together.

A consumer supplies the relevant identity, owned content and permitted operation through the approved access boundary. It does not select another learner, invent a success, send hidden material to a public panel or overwrite another domain's records. Reusing a form or editor never transfers ownership of its content.

| Item | Owner |
|---|---|
| Challenge, Track problem, Daily or Debug case | Its independent problem-owning area |
| Recorded test and original grading conditions | Assessments |
| Course assignment and lesson completion | Courses |
| Personal and course-project files | Workspace |
| Accepted-source entry | Solutions |
| XP, level and Credit balance | Economy |
| Skill estimate and activity summaries | Analytics |
| Daily streak | Daily Challenges |
| Company readiness and recent form | Assessments |
| Issued credential | Certificates |
| Durable inbox item | Notifications |

Home, Profile, staff reports and WizBit display these facts without creating competing calculations. Shared definitions do not add direct cross-domain imports or weaken the architecture's isolation.

## Common conventions

A paper is authored Assessment content; a test is its learner's recorded attempt. A coding test case is an input/check, not a recorded Assessment. Run experiments with code; Submit records a graded response where the owning activity permits one. A runtime includes its execution environment: browser JavaScript and server JavaScript are not interchangeable.

Product dates use one platform clock and timezone. Daily scheduling, streaks, reminders, reporting and recap boundaries use that same clock, not the learner's device setting. Show the relevant timezone beside consequential deadlines. Calendar months and membership-month Credit cycles remain different. The device clock can personalize a greeting but cannot change eligibility or a deadline.

State units explicitly: MB means decimal bytes and MiB means binary bytes. Do not silently equate a per-file limit, project allowance, execution-source limit and retained-history allowance. An unavailable count is not zero. Examples are explanatory, not another set of defaults.

## Deliberate differences

Code Lab stops on leaving; Workspace has a bounded reattachment period. Notes recovery can survive the same learner's sign-out; ordinary coding drafts do not. Course quizzes do not gain Assessment proctoring or history. Debug timed windows are not recorded Assessment tests. Courses does not grade self-confirmed projects. Generated help is not the source of authored hints or normal WizBit messages.

Before signing off a slice, exercise the shared behavior with its real consumer, including the consumer's exception. An isolated component demonstration does not prove the connected workflow. Reviewed means the product description was prepared from the approved direction, not that any application tests have passed.
