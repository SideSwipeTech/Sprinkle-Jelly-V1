# Workspace

**Status:** Reviewed  
**Group:** Build

## Purpose

Workspace lets learners create small projects, work with real files, run or preview their work and download it. The learner decides when the work is complete. Workspace does not grade projects or present self-confirmed completion as proof of skill.

These documents describe product behaviour. Architecture, security mechanisms and the later review of admin screen flows are separate.

## Reading guide

| Document | Covers |
|---|---|
| [Files and Saving](Files%20and%20Saving.md) | File operations, uploads, saving, conflicts, recovery, versions, downloads and deletion |
| [Running](Running.md) | Editor workspace, runtime, entry file, preview, terminal, interruptions and generated help |
| [Templates](Templates.md) | Staff-owned starters, validation, CRUD, publishing and independent learner copies |
| [Courses](../Courses/Courses.md) | Course assignments and the learning completion they contribute to |

## Two separate collections

**My Projects** contains the projects a learner creates for themselves, either blank or from a template. **Course Workspaces** contains projects created for assigned course activities.

Both use the same file management, editor, saving, recovery, preview, terminal and checklist capabilities. Their project lists, paths, identifiers and allowances remain separate. A course assignment never silently consumes a personal project slot, and a personal project never becomes a course assignment.

Workspace owns learner files and project state. Courses owns the assignment, its visibility and whether its lesson is required. Courses receives the relevant reference, access and completion facts, not the learner's source, input, terminal output or checklist text.

## Finding and creating personal projects

My Projects lists the learner's own projects, most recently edited first. Show project names, relevant status, project-count and storage meters, and the actual limits together. Search by project and filter by languages present in the collection; the language filter becomes useful once more than one project exists. Cards provide Open, Download and Delete. A template strip and the shared topic-request action help learners start something new.

No projects yet is different from a failed list read. A failed refresh keeps an already loaded list visible with a retry. A template-library failure affects that strip, not the learner's saved project list.

### Blank or Template

There are two creation choices. **Blank** creates a project with the selected runtime's basic starter. **Template** copies a published starter's files and checklist into a new independent project. Before confirmation, show its description, runtime, file list, checklist and storage footprint.

Blank remains offered when templates are empty or unavailable. Languages come from the shared catalogue; a runtime not yet ready to use cannot be selected and explains why. A selectable starter must run or render without learner repairs.

The runtime is selected at creation and stays fixed for that project's life. Project name and description remain editable. Later template edits, archival or deletion never update the learner's files.

Check the available slot and all limits before completing creation. Repeated requests must not create unintended duplicate projects. Failure leaves no half-created project, empty consumed slot or orphan files. At the project limit, explain that an existing project must be removed before another can be created.

**Journey:** Create blank project or choose template → inspect the starting content → create → edit and save → run or preview → complete when appropriate → download.

## Project limits

| Limit | Value |
|---|---:|
| Live personal projects per learner | 10 |
| Current file content per project, in either collection | 20 MB, exactly 20,000,000 bytes |
| Files per project | 40 |
| One text or code file | 2 MiB |
| One binary asset file | 10 MiB |
| Combined Course Workspace storage per learner | 250 MiB |
| Checklist tasks per project | 12 |
| Normalized relative file path | 240 characters |
| Project/template name, task title or technology label | 120 characters |
| Project or template description | 2,000 characters |
| Template-provided task instructions | 500 characters |

The 40-file ceiling is fixed when a project is created. Neither the file ceiling nor the per-project storage allowance has an extension, upgrade or exception-request control. Course Workspaces have no separate project-count cap; their additional restriction is the combined course-storage allowance.

Count current file content only. Retained versions, temporary build files and execution overhead do not inflate the learner's meter. Empty folders consume no file slot. Every authored or uploaded file must satisfy the applicable limits; an over-limit write is refused whole and leaves existing work and its usage unchanged. Name the actual limit and remedy rather than reporting a generic save failure. Staff cannot change these limits from the template studio.

These limits do not promise that every stored asset is usable by every runtime: terminal runs carry text files only. Binary files remain stored and downloadable, but are excluded from terminal execution.

## Checklist and completion

The learner can add, edit, reorder, tick, untick and delete checklist tasks by pointer or keyboard. A template may supply instructions and a file pointer beside a task. Tasks in a blank project are learner-written checklist items, not automatically evaluated requirements.

| State | Meaning |
|---|---|
| In Progress | Some tasks are unchecked, or the project has no tasks |
| Ready to Complete | At least one task exists and every task is checked |
| Complete | The learner pressed Mark Complete and confirmed their own judgment |

A project without tasks cannot be marked complete. A checklist that cannot be loaded does not count as an empty or finished checklist. Checking the last task only makes the project ready; it never completes it automatically.

Mark Complete explains that the learner is assessing their own work. There is no automatic check, run-required condition, submission, staff grading or completion override. The first project a learner completes earns one achievement, once, with no XP. A delayed achievement does not reverse a valid completion and must not grant twice on retry.

Adding an unchecked task or reopening a task returns a completed personal project to In Progress. It can be completed again without earning the first-project recognition again. In a Course Workspace, the same change affects the workspace's current checklist state but never reverses an already-earned lesson or subject completion.

## Course Workspaces

An assigned course activity opens its Course Workspace from the lesson. Repeated opening returns the existing workspace rather than creating another. The assignment retains the starter chosen when it was made available; later template changes do not rewrite that assignment or any existing learner project. An approved course update may change the starter used for future creations, not existing files.

A separate Course Workspaces management view lists course and assignment, last edit, current size and completion state. It shows the combined course-storage meter and offers Open, Download, Delete and Back to Course. My Projects never includes these rows in its list or personal meters.

A learner at the personal project limit may still create an eligible Course Workspace within its own storage allowance. The same per-project file, size, task and runtime restrictions apply.

### Content changes and access

Archiving a subject removes it from new discovery and stops new Course Workspace creation. Existing workspaces remain accessible to eligible enrolled learners, including through the management view. A removed or unavailable course link must not make saved files silently unreachable; show the course's availability honestly beside the workspace.

Membership expiry blocks protected workspace access while leaving stored files untouched. Access restoration reopens that work. Course-content changes must not replace files, reset completed learning or change issued certificates.

### Delete and Start Again

The learner may download and permanently delete a Course Workspace to recover course storage. Deleting a completed workspace does not undo its historical lesson or subject completion. Deleting an incomplete workspace leaves its lesson incomplete.

Where the course still allows creation and the learner has access, Start Again creates a fresh workspace from the assignment's retained starter. It is not recovery of the deleted edits, and the confirmation says so. An archived course admits no new creation. An unreadable starter or invalid access produces a clear refusal and no empty project.

## Activity, privacy and shared features

Workspace uses shared Access, Languages, Code Editor, Code Execution, common states, confirmations, generated help and active-time measurement. File and content ownership remain in Workspace even when the interface is reused by Courses or Templates.

Count genuine active build time, not time spent in an unattended tab. The personal catalogue can show a compact summary of projects held, building time, days building, successful runs and completed tasks. Missing or unmeasured data is not replaced with zero. Historical volume does not disappear simply because a project was deleted.

Workspace supplies no skill evidence, XP, assessment score or standalone project certificate. The first-project achievement is its one completion recognition. Courses applies its own historical lesson completion when an assignment is confirmed.

Only the owner can access a project, its files, tasks, runs or downloads. A request for another learner's project reveals no private existence information. No staff page exposes learner project names, descriptions, file contents, checklist text, prepared input or terminal output. Staff manage templates, not private projects.

Current output and bounded run reconnection are available, but there is no learner or staff run-history list, replay archive or per-run export. The domain creates no notification category of its own. Report-a-problem controls are absent inside the build workspace; the normal surrounding experience resumes on leaving.

## Retention and boundaries

Saved projects and current files remain until the learner deletes them or account erasure runs. Previous file versions follow their short recovery period. Account erasure removes both collections, files, folders, retained versions, personal names and descriptions, tasks, run details and personal build summaries. An authorized hold delays erasure honestly; an interrupted erasure must not be reported as complete. Staff-authored templates survive with departed authors de-identified.

An explicit completion/checklist reset does not erase project files. Ordinary deletion is permanent: projects have no Archive or Trash state. Templates have a separate Archive action.

There is no public hosting, portfolio publishing, collaboration, share link, repository import, folder upload, automatic archive extraction, general project/file duplication, cross-project copying/moving or custom run command. No dormant controls promise these capabilities.

## Completion checks

Check blank creation without templates, independent template copies, both project collections and meters, each quota, runtime fixed at creation and text-only terminal runs. Confirm that no-task projects cannot complete, personal checklist reopening behaves correctly, and course completion and certificates survive workspace deletion or later edits. Verify membership expiry/return, private access, explicit reset without file loss and account erasure. Reviewed describes the agreed behaviour, not a claim that it has been implemented or manually tested.
