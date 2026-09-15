# Assessments

**Status:** Reviewed — one marking clarification remains  
**Group:** Assessments — Mock Tests and Company Tests

## Purpose

Mock Tests let learners practise different subjects and understand their skills. Company Tests prepare learners for a company's assessment pattern and are grouped by company. Both include the same browser-based proctoring capability, with the paper's Off, Standard or Strict setting determining its response.

Both use the same basic testing experience: sections, questions, marking, time limits, answer saving, submission, results and history. Their differences remain visible. A paper is the configured set of questions; a test is the learner's attempt at it. A paper is either Mock or Company and is not converted between them.

## Read by workflow

| Document | Covers |
|---|---|
| [Taking a Test](Taking%20a%20Test.md) | Entry, checks, questions, navigation, saving, interruptions, proctoring and submission |
| [Results](Results.md) | Marking, results, practice, history, skills, rewards, corrections and data removal |
| [Authoring](Authoring.md) | Companies, papers, sections, questions, publishing, direct editing, archives, deletion and staff review |

These describe product behaviour. Technology, data structures and implementation rules belong elsewhere.

## Finding a test

Direct links and refresh open the intended catalogue, paper or history page.

### Mock Tests

Learners browse published papers, search and filter by category and difficulty, and move through the results in pages. Featured papers appear first, followed by the most recently updated. The page shows a simple paper count and a way to continue an unfinished test.

Paper detail explains the title, instructions, sections, question counts, marks, negative marking, duration, availability and proctoring rules. It shows the settings that will apply to a new test and calls out relevant recent changes.

### Company Tests

Learners browse and search companies, then open a company to see its roles and papers. A company card shows its identity, paper count and the learner's readiness ring and band when enough evidence exists. A summary shows how many companies the learner is currently well prepared for.

A company's page contains only that company's papers, completed-versus-available progress, recent activity, readiness and skill strengths. Each paper belongs to one company and can identify a role and year.

Each company paper card, briefing and result shows whether it is **Actual** or **Pattern**. The briefing explains its instructions, sections, marking, duration, availability and proctoring rules. Actual means released company questions with a recorded source and permission to reproduce; Pattern means a paper designed to follow the company's pattern. Neither label means the company administers or endorses the learner's test.

### One clear next action

Each paper card offers the relevant primary action: **Start**, **Resume**, **Practice**, **View result**, or a clear reason it cannot currently be started. Opening a catalogue, company, detail or briefing never starts a timer or creates a test. Continue returns to an existing unfinished test, not a paper the learner has never started.

## Main journeys

**Mock:** Browse → paper details → readiness check and test terms → start → answer → submit → result → review or practice.

**Company:** Browse companies → company and role → paper briefing → readiness check and test terms → start → answer → submit → result and company readiness.

**Staff:** Create company/role when needed → create paper → arrange sections and questions → preview and validate → publish → edit directly, inspect aggregate results, archive or delete safely.

## Shared features used

| Shared feature | Use in Assessments |
|---|---|
| Access | Learner membership, staff permissions, account restrictions and ownership of results |
| Languages and Code Editor | One supported language catalogue and familiar editing controls for coding questions |
| Code Execution and Evaluation | Visible-case runs, final answer checking, safe limits and protection of hidden answers |
| Common States and Interactions | Loading, unavailable, save feedback, confirmations and actionable errors |
| Content and Imports | Drafts, preview, validation, publishing and bounded question imports |
| Progress | Question-level learning evidence and shared skill interpretations |
| Economy and Notifications | Mock recognition and messages about closing papers or changed results |
| Data and Privacy | Clear history-retention and account-deletion behaviour |

Assessment owns its papers, test rules, marking policy, result history and company-readiness definition. Shared features are referenced rather than redefined. It does not define databases, backend modules or import rules.

## Agreed rules

Both types retain browser-based proctoring, the recorded-test saving and timing rules, the one-sign-in restriction and the in-test help restrictions. Off records no proctoring events, Standard records and warns, and Strict can automatically submit at the event limit. Open practice is unproctored.

Each paper permits one recorded test per learner, followed by unlimited unrecorded practice. Invalidation or an administrative fresh-test grant provides the specified exception; repeated ordinary retakes are not added.

Administration uses direct Create, Read, Update and Delete, plus Archive and optional Duplicate. A published paper can be edited without compulsory archival, duplication or a new paper. Edits affect future starts, not the content, answers, timing or marking of an ongoing or completed test. Permanent catalogue deletion must not destroy the material needed to finish or review those tests. There is no Trash or soft-delete workflow.

## Boundaries

Results are for the learner, not employers or colleges. There are no leaderboards, percentiles, employer reports, hiring predictions or result certificates. Company Tests award no XP, Credits or achievements. Neither type changes the Daily Challenge streak.

Generated AI help is unavailable throughout Assessments, including results and open practice. Correct answers and hidden cases are not exposed while answering a recorded test. Result review follows the paper's review settings; hidden case inputs and outputs remain protected.

An unavailable catalogue is not an empty catalogue. A company with no tests taken is untested; insufficient evidence is not a poor readiness score. Learners can read their own results only. Staff actions require the relevant permission, not merely access to a staff page.

## Open point

**Multiple-choice penalty:** the proportional partial-mark rule is clear, but the wrong-only penalty and the per-question zero floor conflict. Settle that calculation before implementing this scoring case; an agent must not invent the answer. See Results.

The feature briefing has been reviewed. This status does not claim the product has been implemented or manually tested. Future domains are briefed and approved before their documents are written.
