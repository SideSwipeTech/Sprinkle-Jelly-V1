# Files and Saving

**Status:** Reviewed  
[Workspace](Workspace.md) · [Running](Running.md) · [Templates](Templates.md)

## Working with files

Select a file to open it; selecting it again activates the same tab. Text and code files use the shared editor. An unfamiliar text extension opens as plain text, not an error. Binary assets show their file information and a preview where supported rather than being interpreted as text.

Create, rename, move and delete files or folders within one project. Find and open files by name. A successful rename or move updates affected tabs and paths together; a failed move leaves the original intact, never at two locations or neither. No operation can reach another personal project or a Course Workspace by changing a path.

Paths must remain relative to the project, avoid parent-directory escapes, leading slashes, invalid control characters and symbolic links, fit the path limit and not collide with another path even when only letter case differs. Explain an invalid name while preserving what was typed. Do not silently invent a different filename.

### Uploads

Upload individual files into a selected folder in either collection. Check per-file size, project size, file count and paths before an upload is finalized. A refused upload leaves no empty placeholder, partial file or storage charge. Do not silently import only the part of a submitted batch that fits.

An archive is stored as an ordinary file and never unpacked automatically. Folder upload, repository import and cross-project copying are not available. A stored binary file is not sent to terminal execution; explain that limitation rather than treating storage as proof it can run.

### Current-file actions

Download This File exports the content currently in the editor, including unsaved edits. It remains an escape route during a save conflict or storage-limit refusal.

Format Document is available only where the language/type has a supported formatter. It changes the current document in one undoable, unsaved edit, touches no sibling file and creates no recovery version merely by formatting. Failure leaves the original code intact. Unsupported formatting is not offered as a control that repeatedly fails.

## What Saved means

Two different safeguards exist: a local recovery checkpoint and a confirmed platform save. A device checkpoint must never make the interface claim the platform has saved the file.

| Situation | Feedback |
|---|---|
| Work is being sent | Saving |
| The platform confirmed all relevant edits | Saved |
| A recovery copy exists only on this device | Saved locally / not yet saved to the platform |
| Sending failed | Not saved, naming affected files and offering an appropriate retry |
| Device recovery is unavailable | Explain that local recovery is unavailable; do not claim a checkpoint exists |

A local recovery checkpoint is written after two seconds of quiet for modified files. It belongs to the signed-in learner and project and is cleared at sign-out or identity change. It is not cross-device synchronization or a permanent backup.

While edits remain unsaved, attempt a platform save every fifteen seconds. Warn visibly after thirty seconds unsaved. The Save action/shortcut, switching files, Run and leaving trigger a save of every modified file, not only the foreground tab. Show Save when there is work to save.

A failed save leaves the editor content and any valid local recovery copy intact. Warn before leaving unsaved work; do not hang navigation indefinitely or report success simply because leaving was requested. A browser that closes before confirmation does not establish that unacknowledged edits reached the platform.

## Conflicting edits

When a file changed elsewhere since this editor loaded it, report a conflict. Never silently choose the last writer or disguise the conflict as a service outage. Preserve the learner's local content while showing the available choices.

| Choice | Result |
|---|---|
| Keep mine | Deliberately save the learner's version over the stored one |
| Take the stored version | Load the stored content instead of the local edits |
| Save mine as a new file | Preserve the local version under an available sibling name and load the stored content into the original tab |
| Download my version | Export local content without requiring another storage slot |

If there is no room for a sibling file, Download My Version remains available. If the stored side cannot be read, explain that limitation and keep the learner's text. A fresh conflicting change requires a fresh comparison rather than an unchecked overwrite.

**Journey:** Save detects a newer stored copy → show both available versions and the choices → learner chooses → confirm the actual outcome → continue editing.

## Recovering after interruption

On reopening, compare available device checkpoints with saved files. Show a prompt only where they differ, naming the files. Offer Restore or Discard and apply neither automatically. Restored content is unsaved until a platform save succeeds.

Where the saved file no longer exists, restoration creates a new file at its former name only if that path is still available and limits allow it. Existing files are never overwritten silently. A failed restoration preserves recoverable content and states the problem. An unreadable checkpoint cannot be presented as recovered work; the saved project still opens normally.

Checkpoint recovery is limited to the device holding that copy. Signing out clears it. Other devices see confirmed saved files, not a promise of every unconfirmed keystroke.

## File history

Keep the current file plus at most two prior versions, with prior versions retained for seven days. These versions do not count against the learner's storage meter. State this recovery horizon; do not promise unlimited undo or permanent source history.

Create a useful prior version when an explicit save follows a material change, before restoring a version over current content, and before a conflict choice replaces a side. Identical content creates no new version. Routine background saves do not rotate away useful history on every interval.

Restoring makes the selected content the new current file. It does not rewrite history. Distinguish No prior versions from History unavailable. An inaccessible version must not restore as an empty file. Expired versions are removed, and deleting the file or project also removes its retained versions.

## Downloading a project

Download Project works from the workspace header and the catalogue card. First save every modified file, then produce one archive with the coherent saved project, including folders and empty folders. An empty project explains that there is nothing to export. A second request during preparation does not start a competing download.

If saving is blocked by a conflict or service failure, name the files that could not save and offer a clearly labelled recovery archive. It combines the learner's current local edits with the last readable saved files. List missing or unreadable files; do not call a partial recovery archive a complete saved snapshot.

The normal archive and the recovery archive are different outcomes. A download failure says so and never pretends that a usable file was delivered. Downloading earns no XP or achievement.

## Deleting files and projects

Deleting a file with unsaved edits requires confirmation. Offer download first and a way to preserve the edits under a new name. If the learner chooses preservation and it fails, do not proceed with deletion. Cancellation leaves the file unchanged.

Before deleting a folder, identify the affected contents and unsaved work. A confirmed operation removes the selected content and its retained versions without touching unrelated files. Release the corresponding file slots and current-content storage only as the deletion actually completes.

Delete Project names the project, offers download before destruction and states that it cannot be undone. Confirmation permanently removes the project, files, folders and retained versions and releases its slot and storage. A deleted project cannot continue accruing run outcomes or build activity from an old open page.

A failed deletion must not be reported as complete or leave an apparently empty project while inaccessible files still consume its allowance. A repeated request for an already deleted project is handled safely. Projects have no archived state, restorable Trash or hidden soft-deletion workflow.

A Course Workspace deletion frees course storage, never a personal slot. It does not reverse previously earned course completion. Start Again is a new creation under the course rules in Workspace, not recovery of deleted files.

## Completion checks

Try case-colliding filenames, invalid paths, rename/move failures, over-limit uploads, an archive upload, unknown text types and binary assets. Edit several files and verify Save covers all of them. Exercise every conflict choice, including a full project, recover after interruption, expire an old version and attempt an unavailable restore. Compare normal and recovery archives, delete unsaved work with preservation failing, and confirm project deletion releases the correct collection's allowance without affecting other projects.
