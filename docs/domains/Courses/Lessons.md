# Lessons

**Status:** Reviewed  
[Courses](Courses.md) · [Authoring](Authoring.md)

## Reading a lesson

A lesson opens inside the normal application shell with its chapter/lesson rail, lesson body, Previous and Next controls, reading-progress indicator and adjustable font size. Lessons can be linked directly. Previous and Next replace the current reader step so Back leaves the reader rather than replaying every lesson visited.

Search in the rail matches lesson titles across all chapters and groups the matches without closing the current lesson. No match is explained while the open lesson remains readable. An On this page outline uses authored headings only; omit it for fewer than two headings or where the narrow layout cannot accommodate it.

The reading-progress indicator is not completion. A reading lesson completes only when the learner presses Mark complete. If saving completion fails, say so and keep the action usable. Repeated clicks and retries do not create duplicate rewards.

### Content sections

| Section | Learner experience |
|---|---|
| Heading | Clear section title, with a linkable position in the lesson |
| Text / Markdown | Readable paragraphs, lists, emphasis, safe links, inline code and accessible tables; administrators can author plain text sections using Markdown |
| Callout | A note, tip or warning with text and an identifying symbol, not color alone |
| Image | Image with appropriate alternative text or decorative designation, optional caption and credit, with space reserved while loading |
| Display code | Syntax-highlighted, copyable code with its language and optional filename; it does not run |
| Executable code | An editable example with Run, Stop and the appropriate output or browser preview |

Custom HTML/CSS/JavaScript animation sections are not included. Ordinary text does not execute pasted scripts. This does not remove browser preview from executable HTML, CSS or browser-JavaScript examples.

A failed image or code block reports its own problem without unnecessarily taking down the entire lesson. An unsupported or damaged section is shown as unavailable rather than silently disappearing. A link to a removed lesson leads to the current subject outline with an explanation.

## Executable examples

The example opens with authored starter code in the shared editor. The learner edits it, presses Run, sees output and can type input for supported interactive programs. Browser-native examples render in their isolated preview. The language determines the experience; the page does not silently switch between execution methods.

**Workflow:** Read the example → edit → Run → view output or enter input → Stop or finish → try again.

One example holds one active run or preview; starting it again replaces the previous one. Stop must stop or cancel the requested run, and an unconfirmed stop is explained instead of reported as successful. Runs do not resume after leaving.

Server-executed examples use the shared program allowance across Labs. When capacity or execution is unavailable, preserve the code, explain the problem and leave a meaningful retry path. No waiting-room feature is introduced here. Browser previews do not consume server execution allowance and can remain usable during a server-execution outage. A learner's code error, an unavailable service and a maintenance stop have different messages.

These examples are run-only: no correctness verdict, submission history, skill evidence, XP or Credits are created. Edited example code and output are not retained for a later visit. Make no draft-recovery promise the lesson does not provide.

Executable examples may be used in written subjects. In video subjects, they remain optional learning content rather than required executable lessons. This restriction does not make them unavailable to explore.

## Video lessons

A video lesson provides protected streaming playback, captions, transcript and watched coverage. Both video and written formats still sit under Subject → Chapter → Lesson. Playback is offered only when the learner may open the lesson; expired access must not be bypassed by an old playback link. No video download is offered.

### Watching and completion

A video lesson completes at **95% verified watched coverage**. Seeking is allowed, but skipped ranges stay unwatched. Watching the same portion again counts it once. Paused, buffering, hidden-tab and disconnected time does not count as watched time.

A missing progress report must not invent coverage. Once completion is confirmed, a delayed report does not roll it back. Completed subjects remain completed after curriculum changes as described in Courses.

### Captions and transcripts

Each video carries captions and a transcript; a required video missing either cannot become available. Transcript text supports in-course search. Captions that fail to load are described as unavailable, not nonexistent; a transcript-loading failure is not reported as a search with no matches.

A playback outage explains what cannot work without scoring the learner as unsuccessful. Confirmed coverage stays saved. Access renewal should happen without repeated learner prompts during otherwise permitted playback.

## Quizzes

A course quiz is unproctored learning practice, not an Assessment. It supports single-choice, multiple-select, numerical and true/false questions. Administrators choose the questions, marks, completion requirement, optional timer and optional shuffling.

### Before answering

Explain whether submission alone completes the lesson or whether a passing score is required. State that leaving the page loses an unfinished take and that full question review is available immediately after submission only. No score is recorded merely by opening the quiz.

### Answering and marking

Each question is worth one mark unless the author chooses another whole-number value from one to ten. The result is earned marks divided by possible marks, shown as a whole-number percentage.

Multiple-select is all-or-nothing, with no partial marks or negative marking. This is intentionally different from Assessment multi-select scoring. Numerical answers are exact unless an absolute tolerance or a relative tolerance up to 10% is authored. Correct answers and explanations are hidden before submission.

Question and option shuffling are independent and off by default. They change order only, never the question set, the meaning of an answer or its marks. Returning an answer refers to the option itself, not its displayed position. If shuffling cannot be produced, use authored order rather than a broken quiz.

An optional five-to-120-minute practice timer submits the current answers when it expires. It creates no proctoring or skill evidence. Confirm unanswered questions as skipped when the learner submits normally.

### Submission and review

Submission stores the outcome, pass status, score and time on the lesson; latest and best scores are available. It does not store a full question-by-question history. A failed submission is retryable and is not recorded as zero or shown as completed.

The full answer review appears immediately after submission and is not recoverable on a later visit. State that boundary before the take and on the review screen. A failed review display explains both the failure and its temporary nature.

Up to three distinct Review this lesson links may be offered from missed questions in the current take, ordered by how often their associated material was missed. The author chooses the targets; unavailable targets are omitted. These links are not saved as a permanent diagnosis or reconstructed after leaving.

Completion defaults to submission regardless of score. An author may instead require a pass percentage from 1% to 100%; the lesson stays incomplete until passed. Retaking is always available. A passed quiz does not add another subject-wide pass requirement, award XP or become skill-assessment evidence.

**Workflow:** Read the rules → answer → submit → see score and immediate review → retry or continue.

## Assigned projects

A project lesson opens its assigned template in a **Course Workspace**. Courses owns the assignment, its position and whether it is required. Workspace owns its files, editor, terminal, preview, saving, execution and project limits.

A Course Workspace does not consume the learner's personal project count, but its per-project limits still apply. A missing or archived template must not be used to publish a broken assignment.

Completion uses [Workspace's checklist and completion rule](../Workspace/Workspace.md#checklist-and-completion): at least one task must exist and every task must be checked before Mark complete is available. An unreadable checklist does not count as ready. Checking the last task only makes the project ready; the learner must still press Mark complete and confirm that this is their own assessment of their work.

Courses records the Workspace's valid completion once and applies its ordinary required-lesson rule. No separate course-side button bypasses the checklist, and no automatic grader, staff review, verification or completion override is added. Completion creates no additional skill evidence or XP. Reopening tasks or deleting the Course Workspace later does not reverse a lesson or subject completion already earned.

**Workflow:** Open the assignment → work in its Course Workspace → finish a nonempty checklist → explicitly confirm completion → return to learning.

## Linked activities

A linked-activity lesson points to an authored platform item. Opening it goes to that item, and its own completion fact determines whether the linked lesson is complete. Courses does not recreate its checking or reward rules. Related practice links shown after completion likewise go only to valid, available targets selected by the author.

## Help and feedback

When the shared generated-help capability is enabled, a learner can select a published passage and explicitly request an explanation. It uses the selected context, is labelled generated assistance to check, and appears in an inline panel. It never runs automatically on opening or scrolling and changes no completion or progress. It is unavailable inside course quizzes. When the capability is off, its control is absent rather than dead or advertised as coming soon.

Shared Notes, content reports, improvement requests, topic requests and authored WizBit guidance follow their owning domains. None may make the lesson fail merely because the supporting feature is unavailable.

## Check these experiences

Verify reading without completing, explicit completion with a failed save, outline search with no matches, a broken image, executable input/output and Stop, browser preview during an execution outage, and leaving an edited example. Watch, seek, pause and reconnect a video without fabricating coverage. Test quiz scoring, failed submission, unlimited retakes, temporary review, optional timer and unavailable review links. Confirm that a project completes only after a nonempty all-checked checklist and the learner's explicit confirmation; reopening tasks or deleting its workspace preserves earned learning completion. Linked activities use their actual completion.
