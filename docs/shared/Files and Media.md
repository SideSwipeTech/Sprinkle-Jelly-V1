# Files and Media

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Workspace files](../domains/Workspace/Files%20and%20Saving.md) · [Course authoring](../domains/Courses/Authoring.md) · [Certificates](Certificates.md)

## Purpose and ownership

Provide common upload, validation, processing, preview and delivery behavior. The receiving domain owns the material and its permissions. A common storage capability is not a learner file browser or a place where staff may inspect private projects.

The caller supplies its permitted destination, allowed type, limits and required use. Access establishes the person and ownership. Return the actual saved/processing outcome and allowed reference, not provider secrets or unrestricted storage addresses.

## Upload and save

Explain the accepted format and applicable limit before selection. Validate the real content and safe name/path, not just a filename extension. A refused upload preserves existing material, creates no empty placeholder and consumes no permanent file slot or learner quota.

A submitted batch is not silently reduced to the files that fit. Apply the receiving domain's whole-batch validation and failure rule. Upload retry must not create duplicate files merely because the first acknowledgement was lost. Replacing an existing item needs its normal authorization and conflict protection.

Show actual states such as uploading, saved, processing, ready, failed or refused. Successful transfer is not the same as ready-to-publish or playable content. Required safety checks and processing must succeed before the material is available for the intended use. If a check is unavailable, do not call the file safe or discard a valid existing version.

## Different consumers

| Consumer | Boundary |
|---|---|
| Workspace | Individual file uploads into an owned folder, under file/project/course-storage limits |
| Project template | Staff-authored starter files under the same applicable project limits |
| Course image | Appropriate alternative text/decorative designation, permitted presentation and caption/credit |
| Course video | Protected streaming after successful preparation, with required captions/transcript |
| Authored import | A bounded data file validated by its owning importer, not arbitrary executable content |
| Certificate | A generated owner-downloadable document under certificate validity/visibility rules |
| Reporting export | The permitted bounded filtered report, with scope and any truncation stated |

Workspace archives stay ordinary uploaded files and are not automatically unpacked. Folder upload, repository import and cross-project copying are not introduced. Unknown text formats open as plain text; binary files show information/preview where supported and never become text-editor content.

Stored binary assets are not included in Workspace terminal runs. A storage allowance therefore does not promise that every stored file can execute. Browser preview and server execution have distinct capability and isolation rules.

## Limits and identity

Read each domain's limits rather than inventing a universal upload size. Distinguish one-file size, file count, current project content, course-workspace total, request size and runtime source limit. State MB/MiB accurately.

Use safe relative paths for project files, reject escapes and collisions, and preserve the original path on failed rename/move. A filename does not select another project or learner. Empty folders, retained versions and temporary processing data follow their owner's counting rules rather than inflating the learner's displayed meter.

Template/project copies are independent once created. Shared physical storage must not become shared editing or shared deletion of another owner's logical file. Changing a template never rewrites the learner's saved copy.

## Playback and preview

A video becomes playable only when its processing and access checks allow it. Refresh protected playback access quietly during permitted viewing; do not expose permanent provider access. Courses offers streaming, not video download. Watch coverage and completion remain Courses' rules, not a claim made by the media player after loading.

Captions/transcripts are distinct resources with honest failed-loading states. Missing captions are not disguised as disabled captions; failed transcript search is not no matches. A required video lacking its mandated material cannot publish.

An image or example that fails should not unnecessarily remove the rest of the lesson. Browser-native code runs only in the isolated preview and cannot act on the Labs page. Ordinary lesson text does not execute pasted scripts. Custom animation sections remain excluded from this release.

## Download, deletion and recovery

Offer only the downloads the owner supports. Workspace exports current-file content and coherent project archives, with a separate labelled recovery archive when necessary. Certificates offers valid owner downloads. Neither capability creates a bulk learner-data export, public project share or video download.

Name partial content or missing files rather than delivering an incomplete archive as complete. Reporting truncation follows its own row cap. A download failure is not a usable file, and an unavailable object is not automatically an expired one.

Deletion removes the intended content and required retained copies under the owner's rules, releasing allowance only as the operation succeeds. Do not delete shared physical content still referenced by other valid logical owners. Holds, retention and erasure follow Data and Privacy. An interrupted cleanup remains unfinished, not a falsely completed removal.

## Checks

Test invalid types/paths, over-limit batches, upload acknowledgement loss, replacement conflicts, processing failures, inaccessible objects, independent template copies, missing captions, partial recovery downloads and interrupted deletion. Confirm that staff content tools never expose learner project files and that storage success never substitutes for runtime or publication readiness.
