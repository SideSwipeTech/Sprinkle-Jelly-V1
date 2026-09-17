# Execution

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Languages](Languages.md) · [Evaluation](Evaluation.md)

## Purpose

Execution starts an allowed program, accepts the supported input, reports output and resource outcomes, and stops the program safely. It does not own problems, select rewards, complete projects or decide Assessment policy.

The caller supplies its owned activity, selected enabled runtime, allowed source/files, prepared input or approved case package, and permitted operation. Access establishes the actor. Execution reports whether the request started, its current state, output that may be disclosed, and its actual ending. The caller cannot choose another learner or wider privileges.

## Three experiences

| Experience | Use |
|---|---|
| Standard execution | Prepared-input runs and case evaluation for Practice, Assessment coding questions and reference validation |
| Interactive execution | Live program output and typed input in Code Lab, Workspace and eligible lesson examples |
| Browser preview | Browser-native examples/projects in an isolated preview, without a server-running slot |

Resolve the experience from runtime capability and the declared operation. A language label does not authorize every experience. The execution services selected in Architecture implement these capabilities; users do not select infrastructure.

Code Lab alone can offer standard execution when its interactive program never started and that runtime supports the alternative. Explain the loss of live input and offer Run with standard execution, Retry interactive terminal or Cancel before starting anything. It cannot bypass a capacity, access, pace or maintenance refusal. No page silently falls back after a program has already started.

## Start, output and Stop

**Journey:** Confirm access and operation → check source, runtime and limits → admit or explain the refusal → execute → show the actual ending → release resources.

A run uses the source captured when requested. Later typing does not alter that program. Repeating the same request does not start a second program. Output from an old or stopped run cannot overwrite a newer run's panel.

Interactive input reaches only the running program. Waiting for input is still a live program. Prepared input need not be consumed for the run to succeed. Stream output in order, identify truncation and retain only the allowed amount. Do not turn an output limit into a false claim that the full output is present.

Stop ends the selected owned program or cancels its waiting start. Report an unconfirmed stop honestly; a click alone does not prove the process ended. A normal program exit, a program error, a resource limit, a learner stop and a platform failure remain different outcomes. A program printing nothing can finish normally.

## Shared capacity and limits

There is one allowance of three simultaneous programs per learner across Code Lab, personal and Course Workspaces, and runnable lesson blocks. A program admitted but still starting, waiting for input or briefly detached holds its place until released. An open editor, empty terminal panel, completed output or browser preview uses none. This is not three programs per project or tab.

At the learner's allowance, list their own programs with relevant area/project context and an appropriate Stop action. An unreadable count is not permission to exceed it. Separate platform capacity, the learner's own allowance, requests sent too quickly, maintenance and an unavailable runtime. A refusal preserves source and input, changes no solve and spends no result allowance.

Code Lab shows a real waiting position where one exists. Workspace explains waiting without inventing a position or estimate. Its start wait is at most 90 seconds. No estimate is displayed without a basis. Cancelling a wait must release its place.

| Standard-execution bound | Default / maximum |
|---|---|
| Source per submitted file | 64 KiB, fixed |
| Processor time per case | 5 seconds; authored ceiling 60 seconds |
| Elapsed time per case | 10 seconds; authored ceiling 90 seconds |
| Memory per case | 128 MiB; authored ceiling 1,024 MiB |
| Retained combined output per case | 1 MiB |

An authored limit cannot exceed the configured platform ceiling. Interactive sessions use their own declared profile, not these per-case numbers. Display the actual relevant source, time, memory, output and temporary-storage limits through the environment view. A project storage allowance is not an execution allowance. Keep configured values in their single technical home, not copied as literals into pages.

Server-executed code has no network or internal-service access and no persistent execution filesystem. Browser code uses the learner's browser/network and must not be described as a disconnected server sandbox. Its preview cannot read Labs sign-in state, other projects or the host page, or silently trigger host navigation, downloads or device permissions.

## Deliberate caller differences

| Caller | Boundary |
|---|---|
| Code Lab | One scratch run; leaving, refreshing or losing the connection ends it |
| Lesson example | Run-only example; leaving does not promise process or edited-code recovery |
| Workspace | Validate/save/prepare before replacing an existing run; text files only; two-minute bounded reattachment |
| Practice | Prepared-input execution; Run does not record a graded submission |
| Recorded Assessment | Visible-case Run follows its section allowance; final grading must complete an accepted grading obligation |
| Staff validation | Validate authored reference/starter material without learner awards or statistics |

Workspace cannot launch arbitrary commands, install packages or reinterpret a file extension as a changed runtime. A binary asset stored in the project is not silently supplied to terminal execution.

## Failure, maintenance and recovery

Capacity failure on a practice request offers a real retry and is not a wrong answer. A finalized Assessment submission awaiting execution remains pending for its owning recovery process; temporary capacity cannot turn acknowledged answers into zero marks. Missing required grading material is handled as a platform/content fault.

Planned maintenance refuses affected new starts and applies the declared drain behavior to existing programs. Independent browser previews remain available where their own capability works. Access/security endings stop protected execution without erasing stored learner files.

Operations sees safe health, age, failure and resource facts, not learner source, input or terminal contents. Execution records no new learner run-history feature where the caller excludes it. Temporary execution material follows Data and Privacy even when a run is stopped or a service fails.

## Checks

Verify each runtime/operation pair, input-waiting capacity, admitted-but-starting slots, double starts, real versus unavailable queue readings, stop confirmation, stale output and each resource bound. Exercise Code Lab fallback, Workspace reattachment, browser isolation, maintenance and recorded-test grading through an outage. Preserve the distinction between a refusal, program failure and platform failure.
