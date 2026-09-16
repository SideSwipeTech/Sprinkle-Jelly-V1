# Code Lab

**Status:** Reviewed  
[Practice](Practice.md)

## Purpose and page

Code Lab is a free single-file playground. Learners try a language, test an idea and run code without starting a graded activity. A run grants no XP, Credits, achievement, completion or skill evidence. Active time can contribute to group-level activity reporting.

The page has one editor beside its output: an interactive terminal or a browser preview with a message console. On a narrow screen the panels stack. Prepared input, the supplied web-page reference and environment information are collapsible rather than separate workspaces. Divider positions are remembered on the learner's device; unreadable layout preferences fall back without affecting source.

Use the shared editor's highlighting, normal editing controls, shortcuts, supported formatting, text size, wrapping and Expand behavior. No problem statement, Submit button, graded test-case list or solve-rate statistic is present.

## Languages and starters

One platform language catalogue supplies what can be used. Available means checked and runnable. Coming soon cannot be selected; a disabled language is not offered for a new selection. If the catalogue cannot be read, say so rather than guess a runtime; keep existing source visible, make the unavailable selection/run controls honest and preserve the work.

Manual selection always wins. **Auto** may identify the language of the current code and display its detected result. If the result is uncertain or cannot distinguish environments such as browser JavaScript and Node.js, ask the learner to choose before running. Detection never translates code, replaces it with a starter or silently changes the execution environment after Run. An unsupported detected language is explained rather than presented as runnable.

Each language has one scratch and a short runnable starter with a friendly, energetic welcome message. Open that language's device draft when available; otherwise open its starter and say which happened. A manual language change preserves the previous draft and opens the selected language's own draft or starter. Auto detection does not overwrite another language's saved draft or discard the current text.

A new runtime version, supplied page, formatter or starter does not rewrite existing code. Explain a change that may affect a scratch once during the current visit. Reset is how the learner deliberately adopts a newer starter.

## Run, input and output

Run uses the current source at the moment it is pressed. Editing after that does not change the running program. There is at most one active run on this page; waiting for input still counts as active. Display Ready, Queued, Running, Complete, Failed or Unavailable as the actual state.

The chosen language determines terminal execution or browser preview. Learners do not select infrastructure. A program that finishes normally is Complete, including a program that prints nothing; explain empty output. A compilation/runtime or execution-limit failure is a program outcome. An unavailable service is a platform problem, never a claim the code is wrong.

### Interactive terminal

Output arrives as the program produces it. Learners can type into a running program and optionally supply prepared input at its start. Input never read by the program is not itself an error. Waiting for input remains visible and usable until the program ends, Stop is pressed or a stated limit is reached. Terminal resizing follows the display.

### Browser preview

Browser-native examples render in a fresh isolated preview each Run, with their own console messages and errors. CSS and browser JavaScript receive a supplied surrounding page, labelled and readable but not editable as part of the scratch. That supplied page is not included in the source download.

The preview does not require server-execution capacity and is not silently routed to a server during an outage. Copy and Clear operate on the console; changing language clears the previous console. Preview content and program output must not act on the surrounding Labs page.

### Stop and Reset

Stop ends a running program or cancels its queue place. If stopping cannot be confirmed, say so instead of declaring it stopped. Late output from a discarded run must not appear as the next run's result.

Reset asks before replacing source with the selected language's starter and clearing output. Cancel changes nothing. Language changes, Format and Reset are unavailable during an active run; Stop is the way to end it first. A queued run has not started and can be cancelled before a language change or reset.

Leaving, refreshing or losing the connection ends the scratch run rather than promising a persistent terminal. Returning restores available source, language and input with the page Ready, not the previous process. Account-access loss stops the run with the access reason, not a compilation error.

## Waiting and shared limits

There is no daily run allowance or per-learner Run balance. Runs remain free, subject to one active run here, the shared number of simultaneous programs, run limits, request pace and actual platform capacity.

A queued run shows its real position. Show an estimated duration only when there is a genuine estimate. Cancel or leave to give up the place. An expired startup wait is Unavailable, with code and prepared input intact.

If the learner has used the shared running-program allowance across Code Lab, Workspace and lesson examples, explain that limit and list their own running programs by area/project. Stop process ends the selected program after confirmation. A program list or capacity that cannot be checked is stated as unknown; do not admit another run by guessing.

| Situation | What to say or do |
|---|---|
| Platform busy | Explain the wait or offer retry as supported |
| Own running-program limit | Show the learner's running programs and how to stop one |
| Requests too frequent | State the pause needed before retrying |
| Maintenance | Name maintenance and explain the affected run or start |
| Execution unavailable | Preserve code and allow an appropriate retry |
| Capacity cannot be checked | Explain the uncertainty; do not call it busy or a code fault |
| Time, memory or other run limit reached | End with that limit named |
| Output retention limit reached | Show a truncation notice; do not claim all output is present |

A declared maintenance period can refuse new runs and give an active program its agreed finish interval before stopping it. Browser previews remain separate from server-execution maintenance. Limits never authorize access to other learners' programs or files.

## Standard execution when a terminal cannot start

Offer the alternative only when an interactive program never started, the language supports checked standard execution, and no access, capacity, pace or maintenance refusal blocks it. Explain that standard execution uses prepared input but does not accept live typing.

The choices are **Run with standard execution**, **Retry interactive terminal**, and **Cancel**. Start nothing before the learner chooses. Give up the initial live run before another starts. Display the result in the same output area, clearly labelled, without a graded verdict, score or case count.

If a program already started, failure does not trigger a second run automatically. An unsupported alternative stays unavailable, not offered as a broken fallback.

## Saving, formatting and download

The scratch, language and prepared input are device-local and scoped to the signed-in learner. Clear them at sign-out or identity change. Show Saving, Saved on this device until sign-out, or Device saving unavailable. A local failure leaves editing usable and recommends downloading before leaving. There is no cloud-synced scratch or run-history promise.

Download saves the current source using the language's normal extension, or .txt when none is defined. It remains available during a run and includes only the learner's file. Format is offered only where supported, unavailable during active execution, and applies as one undoable edit. A formatting failure changes no source and does not run the program.

The Run keyboard shortcut performs exactly the same operation and checks as the button. A disabled action stays inert when invoked by keyboard rather than inserting an accidental newline or starting another run.

## Environment and help

A compact environment view shows language/version, runtime information, processor and memory limits, elapsed-time and source-size limits, network availability, temporary filesystem behavior and input mode. Read actual available values; an unknown value says Unavailable instead of inventing a number. Server-executed code has no network or internal-service access. Browser previews are identified separately, not described as if they were a server terminal.

When shared generated help is enabled, offer deliberate **Explain this error** and **Analyse this code** actions. Show any Credit cost before confirmation. Attach only the learner-approved source or safe displayed error. The response is labelled generated help and can neither edit the scratch nor assign a verdict, award or language permission.

Only one generated request can run across the shared help experience. A repeated press or refresh returns to that same live request where recoverable instead of buying it twice. Failed/refused requests follow the shared release/refund rules without breaking normal coding. When generated help is disabled, its controls are absent.

## Boundaries and checks

Code Lab has no problem-authoring or learner-source inspection page for staff. Runtime support, capacity and maintenance are platform controls. It has no saved-solution entries, submission history, notification producer or Continue target.

No multi-file projects, file uploads, folders, packages, custom environments, collaboration, public links, repository integration or resumed terminal sessions are included. Those absences keep the scratch distinct from Workspace.

Check language-specific drafts, uncertain Auto detection, runnable starters, both output types, prepared input, no output, Stop, cancelled Reset, unavailable saving, unsupported formatting, queue cancellation, each shared refusal and the explicit standard-execution choice. Reload during a run and verify that code can return but the old process does not. Confirm no XP, solve rate, skill evidence or duplicate AI charge is produced.
