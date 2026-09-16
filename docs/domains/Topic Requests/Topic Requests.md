# Topic Requests

**Status:** Reviewed  
**Group:** Personal Utilities  
[Notifications](../Notifications/Notifications.md)

## Purpose

Topic Requests lets learners ask the content team for missing learning material and follow the outcome. It is a private suggestion channel, not technical support, a discussion forum or a delivery promise.

This domain owns requests, their statuses, staff review and the counts of asked-for content. It does not create the requested lessons, problems or templates. Those remain with their owning domains. Notifications communicates status changes without deciding them.

This document defines capabilities and behavior. Detailed admin screen-flow refinement and technical mechanisms are separate.

## Where requests begin

| Source area | What can be requested |
|---|---|
| Courses | Written or video subjects, lessons and learning topics |
| Challenges & Tracks | Challenges, language tracks and practice topics |
| Daily Challenges | Topics for future Daily problems |
| Debug Detective | Debugging cases and topics |
| Project templates | Starter templates and project topics |

The current page supplies the area and appropriate target. Do not ask the learner to select the area again or offer an unrelated type. Written and video learning use Subject → Chapter → Lesson; request context identifies the learning format without inventing another hierarchy. Challenge and Track content remain distinguishable even where titles match.

Show the callout beneath content on mapped catalogues, and the relevant inline action on eligible Challenges, Daily and Debug pages. Nothing appears on unmapped pages. No request entry point appears on Assessment paper, test or result pages, or inside a personal or Course Workspace editor. Template requests belong to the catalogue/template experience. Recorded-test restrictions cannot be bypassed through another tab.

Use simple contextual wording: Request a course for learning material, Request a topic for practice, and Request a template for project starters. Explain that account and technical issues belong at the main site's contact route.

## Sending a request

One form contains Title, Description, a read-only context summary, Send and Cancel. There are no category, priority or attachment fields.

| Limit | Value |
|---|---:|
| Trimmed title | 120 characters |
| Trimmed description | 2,000 characters |
| Safe captured search phrase | 120 characters |
| Learner and staff list page | 20 requests |
| Counts-only demand export | 5,000 rows |

Both typed fields are required. Validate after a field is touched or Send is pressed, preserve the input and name the field and limit. The description has a live count. Overlong typed content is refused rather than silently shortened.

The context summary shows exactly what accompanies the request: page, target type, relevant content, allowed filters, a safe search phrase when available and a readable context label. Do not include raw browser addresses, arbitrary query parameters, page dumps or private learner work. Omit unsafe identifying or credential-like context rather than masking and retaining it. A phrase too long or unsafe is omitted whole. No safe context is a valid state, and Send remains possible with the title and description.

While sending, disable repeated Send presses. Confirm success in words before the dialog closes and point to Your Requests. Say that the request arrived, not that a person read it or that work has been promised. A failed send keeps the draft and says what happened; retry must not create a duplicate if the original request was accepted.

Cancel closes the form and discards its unsent text. No persistent local draft or recovery copy is promised. A request failure leaves the original page usable and does not create a global interruption.

**Journey:** Notice missing content → open the contextual form → write the request and inspect its context → send → receive acknowledgement → follow its status in Your Requests.

## Duplicate requests and independent content

Requests from different learners remain separate, even with identical wording. Each represents demand; they are not votes or a shared discussion.

For one learner, the same normalized title in the same topic/content context returns their existing Pending or Approved request instead of creating another. Explain this and link to Your Requests. A differently titled request in the same context is permitted. Once the earlier request is Implemented, Rejected or Archived, a new request is permitted.

Comparison ignores simple case, surrounding/repeated spacing and accent differences; it does not infer that differently worded topics mean the same thing. No AI clustering, global duplicate merging or linking of requests is added. A request concerning one owned Challenge is not silently combined with a separate Track problem merely because their displayed names match.

Keep the request's counting context stable when a referenced item is renamed, moved or removed. Readable labels may reflect current content, but must not regroup past demand or erase the original request's meaning. Where no current content resolves, retain a clear source-area label.

## Your Requests

Show only the learner's own requests, newest first, twenty per page. Each row has the title, filing date and current status. Implemented requests also offer Open content when that learner can access the fulfilment.

There is no learner-facing text search, request discussion, reviewer identity, private team note or other learner's demand count. A failed load is Unavailable with Retry, not Nothing requested yet. Another person's request is not disclosed by a guessed link.

| Status | Meaning |
|---|---|
| Pending | Received, with no decision yet |
| Approved | Accepted for content planning; no commitment or delivery date |
| Implemented | Suitable content exists and was verified as accessible to the requester |
| Rejected | The team decided against it; the request remains in history |
| Archived | The learner withdrew it while Pending |

Submitted wording cannot be edited by the learner or by staff. The learner can withdraw a Pending request through Archive after a simple confirmation. This is final: no restoration or reconsideration of that same archived item. They may file a new request instead.

If staff have already changed its status, Archive refuses with the current state visible. A simultaneous staff decision and learner withdrawal must resolve to one outcome, not both. A failed archive leaves the request unchanged. The learner's own withdrawal does not produce an unnecessary notification.

## Staff review and status changes

The staff review list is newest first, paged and searchable across titles and descriptions. It has a status filter including Archived; archived requests are absent from the normal working queue. Show the title, target/context, status, description and the private team note, without attaching the requester's account identity. Only explicitly submitted request text belongs here; no private Notes, code or project files are exposed.

| From | To | Requirement |
|---|---|---|
| Pending | Approved | Staff decision |
| Pending | Rejected | Staff decision |
| Pending | Archived | Learner only, with confirmation |
| Approved | Implemented | Accessible fulfilment content linked |
| Approved | Rejected | Staff decision |
| Approved | Pending | Staff reason required |
| Rejected | Pending | Staff reason required |
| Implemented | Approved | Staff reason required |

Other moves are unavailable. Re-selecting the current status changes nothing and sends no notification. Missing reasons or invalid transitions leave the current state intact. Record meaningful staff changes and their attribution; do not silently accept a change whose required record could not be saved.

Each request carries one staff-only team note, which can be written, edited or cleared. It is not a thread or correspondence with the learner. A note-only edit records its own change without replacing the last status-decision attribution or notifying the learner.

Staff cannot rewrite learner wording, delete requests, assign them, merge them, apply bulk actions or archive on the learner's behalf. Archived requests are read-only to staff. Simple content CRUD elsewhere does not grant CRUD over a learner's submitted request.

## Showing what fulfilled the request

Approved → Implemented requires at least one link to suitable content the requesting learner can actually open. A draft, deleted item or staff-only preview does not qualify. Store the actual content reference rather than hiding a URL in the private note.

The learner's Open content action lives in Your Requests. When their access no longer permits opening it, do not offer an apparently working action. If the content becomes unavailable later, say so without silently moving the request out of Implemented. Reopening it is a deliberate staff transition with a reason.

Staff may attach or replace fulfilment references while Pending or Approved. After implementation, replacement requires a super-administrator override with an audit note. Replacing a reference alone sends no new status notice. No request action creates, edits or publishes the linked content.

## Notifications

Every accepted staff status move, including permitted reversals, creates one System notice pointing to Your Requests. Include the request title and new status without private team notes or reviewer identity. An Implemented notice identifies the supplied content, while Open content remains on the request list.

Respect the learner's System preference. Status remains visible on Your Requests when that preference is off, and a failed notification never reverses the decision. Duplicate delivery sends no second notice. Learner Archive, note-only edits, unchanged status and reference-only corrections are silent. Topic-request notices are not the mandatory course-change exception.

## Demand and Content Gaps

Asked for groups requests by stable source/topic/content context and shows total demand, still-open requests and a status breakdown. Still open means Pending or Approved. Implemented and Rejected requests stay in total demand but leave the open count. Learner-archived requests contribute to no demand count because they were withdrawn.

Offer four windows: 30 days, 90 days by default, 365 days and All Time. State the selected window and when the figures were produced. Order the view by demand. There is no custom date range or date picker.

Asked for and Searched for and not found are separate Content Gaps panels with different owners and meanings. Do not merge them into one count or turn an unsuccessful search into a filed request. Either panel may be unavailable without blocking the other.

The aggregate view and its CSV download contain safe context labels and counts only, no request wording, identities or team notes. Export the same selected window, capped at 5,000 rows, and identify a truncated file as partial. A failed export produces no misleading empty file. A missing total does not block an otherwise readable request list; distinguish an exact zero from an unknown count.

## Retention, privacy and failures

Retain requests indefinitely as content-planning records, without an age-based purge. Account erasure removes the requester reference, title, description and identifying free-text context or attribution from searchable views and retained change records under the shared erasure rules. Replace removed personal content with a neutral label. Keep only non-identifying request status, context and counts so demand remains unchanged; an archived request still contributes zero. A hold delays erasure honestly, and an interrupted erasure must not expose a half-cleared request as complete.

Only the requester sees their own learner list. Staff access is limited to the submitted content and planning capabilities described here. The aggregate never becomes a learner ranking, a public request board or an inbox of private learner work. Treat all supplied text as content, not instructions or executable markup.

Pace limits say Try again shortly; outages say the request could not be sent. Keep the input on a failed send and do not reveal technical errors. No request action earns XP, Credits, achievements, streaks or skill evidence. No AI action reads, writes, answers or groups these requests.

## Check the experience

Send from each eligible area, inspect the context and test sensitive-context omission. Check duplicate Send, the same learner's active duplicate and separate requests from two learners. Verify every status transition, Pending-only withdrawal, immutable submitted text, private team notes, accessible fulfilment and a later unavailable link. Check System-off behavior, archive versus rejection in demand counts, partial exports, account erasure and isolation from recorded tests and project editors.
