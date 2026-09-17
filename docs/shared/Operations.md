# Operations

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Administration operations](../domains/Administration/Operations.md) · [Reports](../domains/Administration/Reports.md)

## Purpose

Operations provides common behavior for work that outlives a page, safe repetition, maintenance, recovery and truthful health reporting. The originating domain still decides what the work means and what counts as complete.

These are product guarantees, not a new deployment design, generic command console or requirement to split services. Architecture owns the worker, storage, scheduling, monitoring and allowed dependency mechanisms.

## Durable work and repeated actions

A confirmed obligation must survive closing the page or losing a worker. Record the necessary work with the originating change so a successful result cannot quietly omit its required downstream obligation. The implementation may deliver subsequent effects later; do not claim they already arrived.

Repeat delivery, refresh or a double-click returns the existing operation/result where it is the same request. Do not create a second solve, test, certificate, notice, project or Credit charge. A deliberate new action is not deduplicated merely because its text resembles an older one.

Each owner defines retryability and a bounded recovery policy. Keep completed portions completed; resume unfinished work without silently repeating successful effects. A general retry button cannot bypass an owner's restrictions or alter the original payload.

## Owner-specific recovery

| Work | Recovery rule |
|---|---|
| Practice acceptance | Preserve its valid result and required accepted-source/reward occasion consistently |
| Recorded-test grading | Keep original grading material and automatically resume; no generic staff re-grade or guessed score |
| Reward delivery | Retry the original occasion; after the defined automatic attempts, expose its specific recovery action |
| Certificate generation | Keep its award identity and use the certificate-specific retry |
| Notification/broadcast delivery | Continue the eligible audience without duplicate notices; stopping is not recall |
| Erasure | Resume the first unfinished required work, respecting holds and completion truth |
| Media preparation | Show pending/failed/ready accurately and do not publish an unready required asset |

A failed optional notice, animation or analytics display does not reverse the valid original action. A required durable acceptance record failing is different: do not claim an accepted solve before that record exists. Partial progress must state exactly what is complete and what remains.

## Background state and health

Show waiting, processing, completed, failed or paused as the owner actually knows them. Waiting time is not processing time. An unreadable queue is not empty; a timed-out request is not proof that background work did nothing. Avoid a generic retry that duplicates work whose state is uncertain.

Health identifies the affected capability and measurement time: Healthy, Degraded, Down or Unknown. Interactive execution and standard grading can differ. A cache failure does not prove the database or the whole product is down. Preserve independently working pages/panels.

Operational reporting uses safe references, counts, ages, attempts and failure classes. It does not expose private code, answers, Notes, project files, raw prompts or terminal output. Learner quality is not an operations-health signal.

## Limits and fair admission

Distinguish access refusal, the learner's own allowance, request pace, platform capacity and unavailable verification. State the remedy applicable to that limit. Do not spend a result allowance for work refused before it starts or treat the refusal as a wrong answer.

A recorded Assessment ending already owes grading; temporary capacity does not remove that obligation. Staff activity uses the approved staff boundaries without consuming another learner's allowance. Unknown limits cannot be replaced by guessed defaults that widen access.

## Maintenance and alerts

A declared window states start, expected end, affected capabilities and safe explanation. Each owner applies its own start refusal, drain, read-only and work-preservation rules. An existing Assessment does not gain a different deadline and a stored project does not disappear.

Passing the expected end is not proof of recovery. Keep overruns and unknown health visible until affected capabilities are genuinely healthy. There is no Force healthy shortcut. Unaffected browser preview or readable content may remain usable.

Owner alerts cover the named security, availability, delayed-work, backup, capacity, deletion, Daily scheduling and assistance conditions in Administration. Coalesce recurring alerts and report actual recovery. These operational contacts are distinct from learner inbox categories and do not contain private learner text.

## Deletion, history and safe oversight

Age-based cleanup begins with the approved non-destructive rehearsal and owner authorization, then bounded execution with abort conditions. Account erasure is separate and cannot be indefinitely blocked behind the routine-cleanup switch. Record actual removed, protected, failed and remaining work.

Protected administrative writes and required audit records succeed together. Read/export actions needing attribution cannot disclose content when that attribution fails. Histories are not editable status reports: record corrections and safe resumption rather than deleting evidence of failure.

## Checks

Interrupt a worker after an obligation is accepted, deliver it twice, lose the page acknowledgement and fail a downstream notice. Verify owner-specific retry restrictions, partial outcomes, unknown health, separate wait/run timing, maintenance overrun, alert recovery and erasure resumption. No common recovery mechanism may fabricate a result or bypass privacy.
