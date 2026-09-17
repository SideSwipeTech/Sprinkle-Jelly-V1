# Evaluation

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Execution](Execution.md) · [Assessment marking](../domains/Assessments/Results.md) · [Course quizzes](../domains/Courses/Lessons.md)

## Purpose and ownership

Evaluation checks supplied answers or code against the owning activity's valid grading material. It returns factual comparison outcomes and permitted feedback. It does not own questions, decide attempt eligibility, issue rewards or invent missing expected answers.

The content owner supplies the question/case set, expected answers, comparison policy, supported runtime and captured grading conditions. The activity supplies the permitted learner answer. Neither a browser-provided expected output nor a later content edit replaces the authoritative material for an existing recorded test.

## Run is not submission

A visible-case Run may show sample comparisons. A custom-input run without an expected answer shows output, not a correctness verdict. Neither records an accepted solve, a test answer of record, XP or skill evidence merely because the output looks correct.

A submission checks the full required case set. Practice accepts only an all-pass outcome. Assessments uses case outcomes for its approved proportional marks. The evaluator must not apply Practice's all-or-nothing policy to a partially correct Assessment answer.

## Coding outcomes

| Outcome | Meaning |
|---|---|
| Accepted | Every required case executed successfully and matched |
| Wrong answer | A completed case did not match under the stated comparison policy |
| Compile error | The learner's source could not compile |
| Runtime error | The learner's program failed while executing |
| Time limit exceeded | The program exceeded its permitted time |
| Memory limit exceeded | The program exceeded its permitted memory |

Pending, stopped, refused and platform unavailable are not extra coding verdicts. A platform fault is never a learner's wrong answer. When multiple valid case outcomes exist, use the shared precedence: compile error, runtime error, time limit, memory limit, wrong answer, then accepted when all pass. A security/refusal or platform-fault outcome takes precedence over claiming an honest learner verdict.

Keep actual case outcomes where the owning grading policy needs them. Do not use a single summary label as a substitute for Assessment's passed-case calculation. Feedback remains subject to hidden-material protection.

## Comparison rules

Console comparison normalizes line endings and ignores one final newline while preserving other whitespace. State the policy before submission. Do not silently trim arbitrary spaces or invent a different checker on one page.

SQL questions use the supported dialect and authored schema/datasets. Compare returned columns and values, with row order significant or insignificant as authored. Validate the fixture and expected results before publication. Hidden datasets remain hidden. No arbitrary executable administrator-written checker is introduced.

Numerical question tolerance is exact unless its author supplies an allowed absolute or relative tolerance. The supported bounds and question rules remain with Assessments or Courses. An unsupported comparison mode fails validation rather than defaulting to a supposedly close result.

## Non-coding answers and scoring

Shared controls can collect single-choice, multiple-select, numerical and true/false answers. The owner selects the policy, not the form's visual appearance.

| Owner | Policy boundary |
|---|---|
| Assessments | Original per-question marks, negative marking, multi-select partial credit, numerical tolerance and proportional coding marks; one final total calculation |
| Courses | Course-quiz marks and completion rule; multi-select is all-or-nothing, without negative marks or Assessment history |
| Practice | All required coding cases must pass; no partial score |

A multi-select answer is a set; repeated option identifiers count once. A missing learner answer is different from missing grading data. Do not silently borrow another question's key or the paper's latest key to grade an older recorded test.

[Assessment Results](../domains/Assessments/Results.md#marking) is the authoritative marking description, including the approved wrong-only multi-select penalty and final total floor. Assessment also supplies its separate bounded Skills evidence value. Evaluation does not change the actual marks to make them resemble that evidence value.

## Hidden material and review

Visible-case feedback can show its permitted input, expected result, actual output and failed-case identity. A hidden failure shows only the permitted summary, never hidden input, expected output, actual hidden output, datasets or per-case rows. A compiler/runtime diagnostic must not disclose protected material through an error string.

Private reference answers and staff notes are not learner-facing worked solutions. An authored editorial or Debug debrief has its own publication and acceptance-based reveal rule. Assessment review follows its own flags; hidden coding material stays protected even after the test. A missing explanation is not permission to expose the private reference.

## Recording and recovery

Report evaluation results to the owning activity, which records its outcome once and invokes permitted downstream effects. A closed tab does not discard completed evaluation. A repeated result delivery does not duplicate a solve, reward, result or evidence.

If Practice grading material materially changed during evaluation, use the approved content-conflict behavior rather than record a mismatched verdict. Assessment grades the original retained material. Missing, empty, corrupted or unreadable required cases are platform/content faults: preserve acknowledged work and recover or use the owner's honest invalidation rule. Do not call them skipped answers.

Reference validation uses the same comparisons without learner statistics. A reference must pass the required cases; Debug's broken starter must also fail at least one. An unavailable evaluator cannot be reported as Passed for publication.

## Checks

Check whitespace, SQL order, numerical tolerance, duplicate multi-select options, partial Assessment marks and all-or-nothing Practice/course-quiz distinctions. Exercise a visible failure, hidden-output leakage, resource failure, missing cases, changed content, delayed grading and duplicate delivery. No failure of the platform should become an invented learner mark.
