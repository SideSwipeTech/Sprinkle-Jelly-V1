# Running

**Status:** Reviewed  
[Workspace](Workspace.md) · [Files and Saving](Files%20and%20Saving.md) · [Templates](Templates.md)

## The build workspace

Keep the file explorer, tabbed editor, output and supporting checklist/help area together. The header identifies the project, shows save status and checklist progress, and provides relevant Save, Download and execution controls. Shared editor shortcuts, formatting, find, expansion and accessibility stay familiar.

Open the surrounding workspace while files load rather than leaving an indefinite blank page. A panel failure stays within the affected area where possible. Critical messages remain readable without WizBit. A project with no files states that fact and offers file creation; an empty output panel is not presented as a failed run.

The full building experience requires a suitable desktop-sized layout. At a narrow size, identify the project, explain the limitation and provide a way back. Narrowing during editing warns and attempts to save outstanding work. A layout change itself never stops the running program.

## Runtime and entry file

The project runtime is chosen when the project is created and cannot be changed later. Reading its environment is available without leaving the workspace. Naming a file with a different extension does not change the project's runtime.

The learner can pin the entry file used by subsequent runs. Without a pin, the platform identifies an entry file and shows its choice. If a valid starting file cannot be determined or read, explain what must be fixed instead of guessing silently. Setting an entry file is a project setting, not a custom command prompt.

Browser-native projects offer **Preview**. Terminal-runtime projects offer **Run**. Do not offer both as though every project supports both. The supported-language catalogue determines capability; unavailable runtimes are not replaced by another language.

## Browser preview

Preview renders the current browser-project content in an isolated panel. Each refresh uses a fresh preview context. Its console and error messages appear in the workspace, with a notice if output begins to be dropped. A missing starting document or nothing renderable gets a clear explanation.

A preview does not consume a server-running slot and remains usable during an execution-service outage. It cannot control the surrounding Labs interface, read another project or silently open windows, downloads or navigation. Preview isolation is not a promise that browser code has no internet access; it runs on the learner's device and network. Security enforcement belongs in the technical design.

## Starting a terminal run

Run uses a complete, validated set of the project's supported text files. Uploaded binary assets remain stored and downloadable but are **not included in terminal execution**. The workspace explains this explicitly; it must not silently promise that every saved asset is present in the running program.

Before replacing an existing program, validate paths, runtime and entry file; save modified files; read and prepare all required text files; and confirm that the new run can start. Only then replace the old program and connect the new terminal.

A save failure, missing required file, invalid entry file or failed preparation aborts the new launch and names the cause. Leave the existing program running rather than stopping it before discovering the replacement cannot be prepared. An empty project cannot launch.

**Journey:** Press Run → save and validate → prepare the required files → obtain a running slot → replace the previous program → show live output and input.

## Terminal and limits

Output appears as the program produces it, and the learner can type input while it runs. Switching output tabs preserves terminal scrollback. Stop ends the selected program. Show relevant resource usage, warnings near a limit and the limit that ended a program. Output must remain output, not actions against the surrounding page.

The platform allows three simultaneous programs per learner across Code Lab, personal projects, Course Workspaces and runnable lesson blocks. It is one shared allowance, not three per project. Open editors, completed output and terminal panels with no live program do not occupy a running slot.

A live program occupies one slot until it exits, is stopped or reaches its permitted bound, including while waiting for input or detached during Workspace's reconnection window. A quiet display is not evidence that the process ended. Release the slot only when the program actually ends; browser previews remain outside this server-running allowance. Code Lab and lesson examples use the same slot meaning, with their own leaving/stopping behavior.

At the allowance, explain which owned programs are running and provide a Stop Process action for each. Stopping one releases that program only. If the running-program state cannot be checked, say so rather than admitting more or inventing a list.

A busy start can wait for at most ninety seconds. Workspace shows a waiting outcome without a fabricated queue position or completion estimate. An expired wait becomes unavailable and preserves code and input. A learner-owned slot limit needs a stopped program, not an invitation to wait in a queue that cannot help.

There are no custom run commands, package-installation workflow, general-purpose remote shell or standard/batch fallback for a project run. The terminal provides interaction with the launched program, not unrestricted server administration.

## Leaving and returning

Leaving a running workspace detaches the page and keeps the program for up to two minutes. Returning within that window reattaches to the same owned project session and displays missed output without duplication. After the window, stop the program; it does not remain orphaned indefinitely.

This bounded reconnection is different from Code Lab's stop-on-leave behaviour. It is not a promise of a permanently running project or a saved terminal history. Reconnection belongs to the learner, project and browser session that started it and is not a transferable share link.

If reattachment cannot complete, explain the failure once rather than retrying forever or starting a second program silently. Access ending stops protected execution while saved files remain intact. Planned maintenance prevents affected new runs and gives existing runs the disclosed drain period before stopping them with maintenance named.

## Outcomes and interruptions

| Outcome | What the learner is told |
|---|---|
| Normal exit | The program finished normally |
| Program failure | The program failed, including its own nonzero exit or a run limit ending it |
| Platform failure | The environment, execution service or connection could not provide the run |
| Learner stop | The learner stopped the program; do not count this as a failed submission |
| Start refused or waiting | Nothing has run yet; explain the capacity, pace or availability condition |

A normal exit is the only successful-run outcome. Platform failures do not count against the learner. Waiting time is not execution time. Results are recorded at most once for the relevant activity summary, not on every replay of an output event.

An execution outage leaves editing and saving usable when their own services are healthy. Browser preview is independent. Offer Retry when it can genuinely retry that operation; do not pretend an already-replaced program is still running or reroute a project into a different execution mode.

Workspace has no graded verdict, solve rate or learner-facing run-history page. Current output and short-window replay do not become a permanent execution archive. Source, prepared input and terminal output are not included in staff run statistics.

## Generated help

When shared generated assistance is enabled, offer two deliberately requested actions: **Analyse attached code** and **Explain this execution error**. Show the price and available Credits before confirmation. Hide these actions and their Credit controls when the capability is off.

Read only the selection/files the learner explicitly attaches, or the safe error text already displayed. Do not crawl unrelated files, inspect terminal history or reach outside the project. The answer is labelled generated help to check, in the page's own panel rather than WizBit's conversation stream.

An answer never writes, renames or deletes files, ticks tasks, declares completion, changes a run result or grants rewards. At most one generated request may be in progress across the platform's generated actions. A duplicate request returns its existing state; a distinct concurrent request does not reserve another charge.

Provider failures and refused requests follow the shared release/refund rules and leave editing, saving, previewing and running unaffected. These are optional help actions, not a dependency for ordinary development.

## Completion checks

Test entry-file selection, a missing required file, unsaved-file failure before Run, text-only launch with a stored binary asset and replacement of an existing program. Verify interactive input, scrollback, shared-slot refusals, expired waiting, return inside/outside the two-minute window and layout narrowing mid-run. Count an input-waiting or briefly detached live program as one slot, an empty/completed terminal as none and browser preview as none; unknown process state must not free a slot by assumption. Stop the executor and confirm web preview still works. Check that optional help reads only attached material and cannot change files or completion.
