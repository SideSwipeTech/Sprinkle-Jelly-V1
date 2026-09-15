# Taking a Test

**Status:** Reviewed — marking clarification in Results remains  
[Assessments](Assessments.md) · [Results](Results.md) · [Authoring](Authoring.md)

## Before starting

### Paper details and availability

The entry page explains the rules before Start: sections, marking, negative marking, total time, navigation restrictions, proctoring response and any coding-run allowance. Company briefings also name the company, role, year and Actual/Pattern label.

A learner with an unfinished test resumes it. Otherwise, Start is available only when the paper is published, its availability window is open, access is valid and the services needed for the test can be used. An archived or deleted catalogue paper cannot be newly started, but existing attempts and results remain reachable. A never-published paper is not exposed to learners.

A blocked start states one clear reason and an appropriate remedy. Examples are signing in again when the session cannot cover the test, returning when availability opens, or retrying when a required service recovers. A paper with missing questions cannot start. When availability cannot be confirmed, show that uncertainty rather than an apparently usable Start button.

### Readiness check

Before a new recorded test, a readiness check examines platform connectivity, whether answers can be saved and read back, browser capabilities, device draft saving, clock agreement, viewport/input readiness, fullscreen where required, and coding availability when coding questions exist. The same checks apply to Mock and Company Tests as relevant to their settings.

Each applicable item says **Passed**, **Warning**, or **Could not check**. Warnings require acknowledgement. Could not check is not a pass and cannot be acknowledged as though it were a known warning. These results are advisory, not a promise the device or service will stay healthy. Start still applies the actual access and availability checks.

The check creates no test, timer, grade, reward or charge. It requests no camera, microphone, screen capture or personal file and runs no hidden test cases. A result is reusable for ten minutes only for the same paper, device and sign-in; otherwise the check runs again.

### Start and acknowledgement

Before starting either type, explain the recorded-attempt rule, that time does not pause, that re-entry resumes the same test, and the applicable account restrictions. State the proctoring setting, what is recorded and what can end the test. Off must not imply that observations are being collected.

Start creates the test and begins the clock only when starting succeeds. Repeated clicks open the same test rather than creating duplicates. Opening details or completing the readiness check alone never consumes an attempt.

The content and settings used for a test stay fixed for that test. Staff can edit the paper directly, but those changes apply to future starts. They do not replace questions, change saved answers or marks, move the deadline or introduce restrictions midway through an attempt. Closing availability, archiving or deleting the catalogue paper does not cancel a test already started or remove what it needs to finish.

## Answering questions

### Questions and sections

Papers may mix single-choice, multiple-choice, numerical, true/false and coding questions. Quantitative, aptitude and similar subjects describe the material; they do not require a different answer format.

Sections have a title, subject, instructions and ordered questions. A suggested section duration is guidance only: there is one test deadline, not an additional section countdown. A question may also have a target answer time used for pacing feedback.

Single-choice and true/false take one answer. Multiple-choice selections form one set; choosing the same option twice never changes the score. An empty selection is unanswered. Numerical questions accept an answer checked against the question's stated tolerance.

### Coding questions

The learner uses the shared editor and chooses from languages supported for that question. Run checks the currently written code against visible cases for experimentation. Hidden cases appear only as a count; their inputs, expected answers and reference solutions are not disclosed.

Output, errors and case results are clearly separated. Shared editor controls, shortcuts, formatting where supported and accessibility behaviour remain familiar. Run is not final submission of the paper, and a previous successful run does not replace final grading of the saved answer.

A section may limit visible-case runs. The remaining allowance is shown, and reaching zero explains why Run is unavailable. No configured allowance means unlimited runs, not zero runs. A request refused because execution cannot start consumes no allowance and is not marked as incorrect; the test clock continues.

## Moving through a paper

### Mock navigation

The paper's settings decide these six features. Their meaning is disclosed before Start.

| Feature | When enabled | When disabled |
|---|---|---|
| Countdown display | Show remaining time | Hide the countdown, but still enforce and disclose the duration |
| Question palette | Show numbered questions and their status | Use previous/next navigation without the grid |
| Mark for review | Let learners flag a question to revisit where permitted | Do not offer the mark |
| Skip | Allow moving forward without an answer | Require an answer before moving forward |
| Revisit | Allow returning to reachable questions already seen | Lock a question once it is left |
| Section switching | Allow moving between sections | Complete sections in order; completed sections lock |

The controls never bypass each other. A palette or review mark cannot reopen a locked question or section. Marking for review is not answering. With no palette, the review mark remains visible on its question. Revisit works only inside sections that remain reachable.

Skip-off restricts forward question movement, not an otherwise permitted backward move or section switch. Revisit-off keeps previously left questions locked even when returning to their section is allowed. A skipped question cannot be revisited when Revisit is off. Hiding the timer never changes the deadline.

Question and option order can be shuffled where configured, without changing answers or marking. Returning to an unfinished test must not present it as a different paper.

### Company sections

Where sectional locking is enabled, learners work only in the active section and advance to the next adjacent section. A closed section cannot be re-entered. Attempts to answer or run code in another section explain which section is active.

Repeated section advances count as one move. Saving an answer does not move the learner into a new section. A section's suggested time does not end it automatically.

## Saving and interruptions

Each edited answer shows its own save state:

| State | Meaning and learner action |
|---|---|
| Saving | The answer is being sent |
| Saved | The platform has confirmed the answer is stored |
| Saved on this device | It is held locally but has not yet reached the platform |
| Not saved — Retry | Sending failed; Retry resends that answer |

One failed save does not blank the paper or discard other answers. Repeated delivery does not overwrite a newer answer with an older one. An unavailable local save must not be presented as a successful device copy.

Leaving, refreshing or losing the connection does not give up the test. Time continues, and returning before the deadline restores the learner's place and confirmed answers. Unsent work is recoverable only on the device that still holds it and can be sent only while answers are still accepted. There is no promise that unconfirmed typing appears on another device.

During a recorded test of either type, another sign-in on the account is refused without interrupting the test device. There is no forced device-takeover prompt. If the device fails, confirmed answers still reach automatic submission; a second device does not receive an exception to the sign-in rule.

The learner may leave the page, but there is no discard-test control. Navigation must not hang indefinitely while trying to save or claim success when saving did not finish.

## Proctoring

Both Mock and Company Tests use neutral **Recorded Events**, not accusations. The paper's setting controls the response:

| Setting | Behaviour |
|---|---|
| Off | Record none of the listed events and apply no event-count penalty or automatic submission |
| Standard | Record applicable events and warn; never submit because of their count |
| Strict | Record and warn, then automatically submit at the configured limit |

The Strict limit is three by default, adjustable from one to ten. Show the setting and applicable count clearly before and during the test. The timed-test rules and help restrictions remain in place when event recording is Off.

| Observation | When it is recorded under Standard or Strict |
|---|---|
| The test page becomes hidden | Record the observation |
| The window loses focus without becoming hidden | Record it without counting the same observation twice |
| Leaving fullscreen | Record only when fullscreen is required |
| Copy, cut, paste or context-menu use | Record only when the paper enables this category |
| Restricted navigation or browser shortcuts | Record only when that category is enabled |

Repeated reports of the same event count once; identical signals within two seconds are treated as one observation. Connection loss, slow networks, execution failures, saving retries and platform notices are not proctoring events. Permitted keyboard navigation, assistive technology, zoom, captions and reduced motion do not count.

No camera, microphone, screen recording, clipboard contents or keystroke capture is collected. Staff see event kinds, times, counted status and the reason a test ended—not a recording of the learner or a conclusion about intent.

Where fullscreen is required, request it on entry. Refusal prompts the learner again rather than silently starting a recording or imposing an undocumented failure. These rules apply to both types.

During a recorded test, companion messages, Quick Notes, generated help, outside-help controls and problem-reporting controls are unavailable. Asking for those capabilities elsewhere in Labs does not bypass the restriction. Generated help remains absent throughout the Assessment domain.

## Ending a test

The learner submits, time expires, a Strict test reaches its event limit, or an account-security action ends access. These reasons apply to both Mock and Company. A lost connection alone is never an ending.

Answers stop being accepted at the deadline. The submission grace period is for finishing submission, not extra answering time. A late answer is reported as late, not falsely labelled Saved. A late Submit may still complete the ending using confirmed answers.

Repeated or simultaneous submissions produce one result. The result and history explain whether the learner submitted, time ended, the event limit was reached or access was ended.

If access is forcibly ended, the platform finalizes only when the answered work is safely saved and no submission is unresolved. Otherwise, it invalidates the test with an honest access-related reason. A temporary grading outage leaves the result pending, not failed.

A test that nobody returns to still ends and scores confirmed work. Questions without an answer distinguish Not reached, Skipped and Unanswered where known, rather than being described as wrong. An overdue test awaiting automatic completion is labelled Overdue and completed within five minutes of its auto-submit time.

### Important interruption cases

| Situation | Expected outcome |
|---|---|
| A save fails | Keep the answer, show its state and offer a genuine retry |
| Run cannot start | Explain the execution problem; keep code and do not spend the run allowance |
| Time expires while typing | Stop accepting answers; submit confirmed work, not unconfirmed typing |
| Staff edit questions/settings, archive or delete the paper | The existing test continues with the content and rules it started with |
| Maintenance approaches | Refuse a new test that cannot finish safely under the disclosed maintenance rule; an existing test continues while saving remains available |
| The result cannot yet be graded | Show that answers are saved and grading is pending |

### Check this journey

Try double Start, refresh after a confirmed save, an unsent answer during disconnection, restricted navigation, exhausted Run allowance, late saving and simultaneous submission. Test both types under Off, Standard and Strict. Edit and delete a catalogue paper during an attempt and confirm that the learner can still finish the original test. Each case should preserve confirmed work and produce at most one recorded result.
