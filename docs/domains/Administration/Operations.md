# Operations

**Status:** Reviewed  
[Administration](Administration.md)

## Operations hub

The admin landing page shows existing operational signals and links to the work that needs attention. It is not a second reporting dashboard, a live learner-monitoring tool or a page that probes every dependency whenever someone opens it.

Read access follows the three-role policy. Protected recovery, maintenance declarations and operational changes are Super Admin actions. The original domain still performs the action; the console does not invent its own retry or successful outcome.

Show the signal's subject, state, when it was measured and relevant capacity pressure. The states are Healthy, Degraded, Down and Unknown. Missing or unreadable information is never Healthy. A failed panel leaves other panels usable.

| Signal area | What is observed |
|---|---|
| Main-site access | Verification and whether bounded fallback is carrying access |
| Stored data/media | Required data storage, objects and media delivery |
| Standard execution | Batch/judging availability and pressure |
| Interactive execution | Live program availability and pressure |
| Background work | Waiting, running and failed work by producing area |
| Notification delivery | Actual delivery health, distinct from whether a learner read a notice |
| Maintenance | The declared window and affected capabilities |
| Activity summaries | Whether scheduled summaries completed without losing reports |
| Backup and restore | Actual backup and restore-check results and recency |
| WizBit suppression | Silence not explained by a current declared restriction |

Interactive failure with healthy standard execution is a degraded capability, not proof that all execution is down. The hub may link to the monitoring tool used by the operator without recreating its entire interface.

## Attention and background work

The immediate-attention strip contains four items: failed rewards, unapplied main-site verification changes, stuck deletion/erasure, and the nearest missing Daily Challenge. Each links to its owning page where available. Do not mix learner performance, low balances or a generic content inventory into this operational priority strip.

Jobs health covers grading, notifications/broadcasts, certificate generation, erasure/deletion, retention sweeps, media processing and rewards. Code Lab's free sandbox runs are not counted as that background-work throughput.

Waiting and Running are current readings; Succeeded and Failed are counts over the stated window. Separate queue wait from time spent processing. Show actual median and high-percentile turnaround when measured; an empty sample is no figure, not zero. A job that expired without running is a failure rather than silently absent.

Every failed item reports its attempts, waiting/paused age and safe failure class. Prioritize security/privacy/integrity, then lost or wrong learner work, then unavailable dependencies, then bounded backlog. Secondary causes can remain visible. An unclassified failure is surfaced for repair rather than hidden under a reassuring Other category. These describe platform failures, never learner qualities.

Daily schedule health checks the next seven product dates. Tomorrow's missing activity receives priority. A check that could not run is Unknown. A missing date remains honestly empty for learners; an operator alert does not fabricate a Daily. Multiple published entries on one date raise a content-integrity fault, with one deterministic learner-visible item until the owning domain repairs the schedule without deleting earned history.

## Recovery

| Work | Permitted action |
|---|---|
| Failed reward | Retry the owning Economy action one item at a time without duplicate award |
| Main-site change awaiting verification | Retry Access verification and apply only the verified main-site facts |
| Eligible paused background job | Resume that recorded work without editing its payload or erasing its attempt history |
| Paused grade | No generic staff release; Assessment's own recovery process applies |
| Failed certificate generation | Use Certificates' specific retry, preserving certificate and job state together |

A row is readable before a recovery action and the action is attributed. Repeating it cannot apply twice. If required history cannot be recorded, it does not proceed. No bulk release, arbitrary payload editor, manual learner re-grade or recovery of expired private detail is offered.

Main-site delivery shows the cause, when verification became due, attempts and safe last failure. It cannot edit, fabricate or discard the source event. Previously applied entries may remain inside the shared readable window. An empty current-fault view is healthy; a failed read is not an empty view.

Recovery-history readability is bounded to 180 days where this domain defines that window. Aging a row out of the view does not resolve its underlying work. Other owner-specific windows remain with their domains. Pending work is not shown as failed solely because it has not finished.

The broadcast icon default remains a Notifications-owned setting operated by Super Admin. Its eventual placement belongs to the admin workflow review, not to a second icon record inside the recovery system.

## Owner alerts

Operational alerts reach the configured owner contacts, not learner notification channels. They contain safe operational facts and a runbook reference, never learner code, notes, submitted answers, moderation bodies or commercial figures. Delivery failure is visible and must not block product work.

The supported alert conditions are:

| Condition | Trigger |
|---|---|
| Application/host unreachable | External uptime check |
| Grading unresolved | Fifteen-minute grading-wait threshold |
| Other overdue work or exhausted retries | Sixty-minute wait threshold or observed exhaustion |
| Execution service unavailable/refusing work | Its recorded operational condition |
| Main-site access unverifiable | Beyond Access's permitted fallback window |
| Backup or restore failure/staleness | Shared backup/restore thresholds |
| Disk/capacity pressure | Warning at 85%; critical at 95% |
| Sustained grading faults | Recorded grading-platform failure condition |
| Erasure overdue | Shared completion/alarm term |
| Daily scheduled pass unfinished | Its product day ended without completion |
| Daily Challenge schedule gap | Nearest gap in the next seven dates; tomorrow prioritized |
| Super Admin standing changed | Verified WordPress-derived grant/removal of that standing |
| Platform generated-help cap reached | Capability paused at its configured usage ceiling |
| Retention hold overdue for review | Ninety-day review boundary, without releasing the hold |
| Certificate generation paused | Certificates' own age/count threshold |
| Content integrity | Missing supported runtime or duplicate scheduled Daily |
| Video processing delayed | Thirty-minute media-processing threshold |
| Unexplained WizBit silence | No current declared restriction explains it |

Combine duplicate conditions within thirty minutes, repeat a still-standing alert at the six-hour cadence, and report recovery once. Certificate-generation backlog uses its dedicated alert rather than also firing the generic overdue-work alert. The contacts and operational transport belong to deployment configuration; there is no learner campaign or staff role editor for them.

## Maintenance

Super Admin declares the start, expected end, affected capabilities and learner-safe explanation. If the declaration fails to save, it is not displayed as scheduled or enforced.

Each affected page owns its safe behavior: preserving unsaved work, refusing an unsafe new start, or letting eligible ongoing work finish. Administration does not invent another Assessment deadline or terminal-stop policy.

A window ends when its affected capabilities are actually healthy. Passing the expected end does not hide an outage, and there is no manual Force healthy or End maintenance control that bypasses the health condition. Show overruns and unavailable health honestly. No separate public status website/link is introduced by this feature.

## Safe age-based cleanup

Before scheduled expiry of old detail may destroy data, it runs a counting rehearsal. The owner authorizes one exact reviewed report covering the policy, data examined, what survives, protected records, holds, object/record checks, backup and completed restore evidence, load expectations, batch size, abort conditions and recovery plan.

Both the operational enablement and that exact authorization are required. Begin with a small batch and compare its outcome with the report; drift or a protected-data, integrity, capacity or backup problem stops widening. A material change invalidates the authorization and returns cleanup to rehearsal.

The console shows pass mode, applicable policy, counted/destroyed totals and what is blocking work. It contains no casual purge button or screen for signing/uploading the owner's authorization. This safeguard concerns age-based cleanup; learner account erasure is a separate process and is not held behind this cleanup switch.

## Configuration boundaries

The console hosts only the approved domain settings: Economy values, taxonomy, authored curation, assistant controls and similar named capabilities. It is not a general environment editor, SQL console, cleanup console or arbitrary query runner.

Generated help retains its single owner-controlled operational switch outside normal admin settings. Do not add per-action toggles, display raw credentials or create another configurable permission system. Operational implementation and exact host configuration are defined later, without silently changing the product rules here.

## Checks

Exercise partial outages, unknown readings, separate wait/run timing, unavailable counts, delayed Daily content, failed rewards, repeated main-site verification, protected job recovery and certificate/grade exceptions. Verify alert coalescing/recovery, overdue maintenance, retained work during outage, read-only cleanup oversight and the independence of account erasure from scheduled cleanup authorization.
