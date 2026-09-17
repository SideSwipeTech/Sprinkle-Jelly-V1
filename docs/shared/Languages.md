# Languages

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Execution](Execution.md) · [Code Lab](../domains/Practice/Code%20Lab.md)

## Purpose

One platform catalogue describes each supported language and execution environment. Code Lab, lesson examples, Workspace, problem authoring and Assessment coding questions use it rather than maintaining competing lists.

A listed name is not evidence that an environment has passed its readiness checks. Availability is established against the actual configured runtime. This document defines the catalogue scope, not a report of tests already executed.

## Catalogue scope

| Runtime entry | Standard case execution | Interactive programs | Browser preview |
|---|---|---|---|
| HTML | No | No | Yes |
| CSS | No | No | Yes, with its supplied page |
| JavaScript in the browser | No | No | Yes, with its supplied page |
| JavaScript on the server | Yes | Yes | No |
| Python | Yes | Yes | No |
| Java | Yes | Yes | No |
| C++ | Yes | Yes | No |
| C | Yes | Yes | No |
| SQL using the supported SQLite environment | Yes | No | No |
| React | Not enabled for this release | Not enabled for this release | Not enabled for this release |

React may be identified as Coming soon in the catalogue; it cannot be selected for a run, project or published problem. A language logo, syntax highlighter or snippet does not imply execution support. Do not expand the catalogue from the languages an underlying vendor happens to offer.

The entry identifies its stable runtime key, readable name, current version, file extension, supported operations, availability and reason, last readiness result, relevant limits, supplied browser page where needed and formatting capability. Compile commands and service credentials are not learner-facing information.

## Availability

| State | Meaning |
|---|---|
| Enabled | Its declared operations have passed the required checks and can be offered |
| Coming soon | Not ready; explain the reason and prevent selection by learners and authors |
| Disabled | Not offered for new selection, starts or publication; historical work keeps its language label |
| Catalogue unavailable | The catalogue cannot be read; preserve current work and do not guess an environment |

A starter must run unedited in each offered execution mode. Check input/output, the supplied page for browser entries and the formatter when one is offered. A failed readiness check is not a successful capability merely because a container or service exists.

Where one language has standard and interactive capability, their declared version must be compatible with the promised single runtime entry. Do not route between materially different versions without making the runtime distinction explicit and approved. Exact images, compiler commands and provider identifiers belong to technical configuration.

## Each activity selects its subset

A Challenge may offer several enabled, evaluated languages. A Track problem permits only its Track's language. Daily, Debug and Assessment questions use the languages authored and validated for that item, not every enabled language automatically.

Code Lab chooses terminal or browser behavior from the entry. Workspace requires interactive or browser-project capability and fixes its runtime at creation; SQL-only standard execution does not create an unsupported SQL Workspace. Runnable lesson examples use their authored runtime. Display-only code can show text without promising execution.

Authors provide starter/reference material for every language offered by a problem. A disabled or invalid required language blocks publication until the offering is corrected. Runtime failure during use preserves the learner's work and explains availability; it does not silently select another language.

## Selection, starters and updates

Manual selection remains authoritative. Code Lab's Auto detection may identify current source, but uncertain or ambiguous environments require a choice before Run. Detection never translates code, discards the current buffer or overwrites another language's draft. Other pages do not acquire Auto merely because the catalogue is shared.

Each Code Lab language has its own runnable starter and friendly welcome. Activity-specific starters remain with the activity. CSS and browser JavaScript receive the read-only surrounding page needed for their scratch preview. A supplied page is not silently appended to downloaded learner source.

Updates to a runtime, starter, formatter or supplied page never rewrite existing learner drafts, projects or accepted code. Explain relevant changes and preserve historical labels. Only a deliberate reset replaces a scratch with the current starter. Formatting is offered only when supported; failure leaves source unchanged and its successful edit is undoable.

## Ownership and checks

Platform operations maintains runtime readiness and support configuration. Domain administration reads that availability and manages its own authored language subset; it does not create a second runtime catalogue. Shared form use does not share problems.

Verify every offered operation on the configured environment, a missing/failed catalogue, disabled-runtime history, single-language Tracks, unavailable formatting, uncertain Auto and updates with existing drafts. Check SQL's actual dialect and browser/server JavaScript distinction before promising compatibility.
