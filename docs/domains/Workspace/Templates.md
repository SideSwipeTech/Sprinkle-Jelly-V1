# Templates

**Status:** Reviewed  
[Workspace](Workspace.md) · [Files and Saving](Files%20and%20Saving.md) · [Running](Running.md)

## Purpose and ownership

Templates are staff-authored starting projects. A learner previews a template and creates an independent personal project from it. Courses can select a starter for an assignment; that assignment retains its selected starting content rather than continuing to depend on a mutable template.

Templates do not give administrators a view into learners' projects. Reusing the workspace editor is interface reuse, not shared ownership of private files.

## Staff capabilities

Staff can create, list, search, read, edit and permanently delete templates; preview, validate and publish; return a published template to draft; archive; and optionally duplicate into an independent draft. Use simple CRUD without requiring archive-and-duplicate for a normal correction. The final arrangement of staff pages will be reviewed with the other admin workflows.

| Template content | What staff set |
|---|---|
| Identity | Name, description and relevant technology information |
| Classification | Primary skill and topic |
| Runtime | A supported runtime and entry file |
| Files and folders | Starting content inside the learner project limits |
| Checklist | Ordered tasks with optional instructions and relevant file pointers |

Choose compatible runtimes from the shared catalogue. The editor, file controls and preview should show the starter as the learner will receive it. Display file counts and sizes while authoring. Explain unavailable actions instead of offering controls that cannot work.

A template itself consumes no learner project slot or learner storage. Once copied, its files count as the learner project's current content under the ordinary rules.

## Saving and preview

Incomplete drafts may be saved. Preserve unsaved work across ordinary navigation and warn before leaving a dirty editor. A stale save must expose the conflict and preserve both available versions rather than silently overwrite another author's change.

Preview is read-only with respect to learner records. It does not enroll anyone, create a personal project, grant rewards or move learning statistics. A preview failure should identify the failing part without discarding the draft.

**Journey:** Create template → choose runtime → add files and optional checklist → preview and validate → publish → learners create independent projects.

## Validation and publishing

Templates obey exactly the project limits in Workspace, including forty files, twenty million bytes total, per-file limits, path rules and twelve checklist tasks. A template that the learner could not store is not a valid creation source.

Before publishing or applying a live update, recheck the stored files, paths, entry file, checklist references, runtime and classification. Verify that a terminal starter runs as provided or a browser starter renders as intended. Explain each blocker. A validation that could not run is not a pass.

Incomplete drafts remain editable, but an incomplete live update cannot replace a usable published starter. A failed publish keeps the previous live content and the author's work intact. Staff actions require their actual publishing/authoring permission, not merely visibility of the form, and record who changed what.

## Editing and independent copies

Edit a published template directly through its normal authoring experience. Apply validated updates for future personal-project creation; never push those changes into existing projects. Runtime changes on a template do not change any previously created project's fixed runtime.

A course assignment keeps the starter selected when the assignment was made available. Editing or removing the original template does not alter or break that assignment. An approved course update can change the starter for future assignment-workspace creations, never existing learner files.

There is no learner-facing template version selector, automatic migration of projects or synchronized file editing. Duplicating a template copies authored starting content only; it creates no learner projects, completions, rewards or activity.

## Draft, archive and permanent delete

**Return to Draft** removes a template from new personal-project creation while keeping it editable. Existing learner projects and course-assignment starters are unaffected.

**Archive** retires the template from the picker and new selection. It is not project deletion and does not remove previously copied files. Archive is final; optional duplication can create a new draft when a separately identified replacement is needed.

**Delete** permanently removes the staff template and its own content, not the independent projects or assignment starters already created from it. This is not limited to never-published drafts. Before confirmation, explain the effect and show safe dependency counts where relevant. Never expose learner project names or files as a dependency report.

Only allow deletion when existing projects and assignment starters remain intact. If independence or dependent content cannot be confirmed, refuse clearly and offer Archive; do not guess that there are no dependencies. Update any active template selector so it no longer offers a missing creation source. No Trash or soft-delete workflow is introduced.

## Boundaries and completion checks

Staff manage templates, not learners' project content. There is no open-as-learner, file-inspection, grade-project, completion-override or promote-learner-project-to-template action. Project limits are not adjustable from this studio.

Check an empty library versus a failed read, creation while templates are unavailable, invalid paths and sizes, a starter that does not run, stale edits and leaving with unsaved work. Create a personal project and course assignment, then update, return to draft, archive or delete the original template: their starting copies and learner edits must remain independent. Confirm that deletion never exposes private dependency content and that staff previews create no learner activity.
