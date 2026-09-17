# Interface

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Settings](../domains/Profile/Settings.md) · [WizBit messages](../domains/WizBit/Messages.md) · [Notifications](Notifications.md)

## Purpose

The shared interface provides navigation, appearance, controls, accessible interaction and consistent feedback. Domains compose it and supply their own content and permitted actions. Visual similarity is not a reason to duplicate component behavior or move domain data into the shell.

The Demo is the visual reference; approved product behavior governs when a demonstration conflicts with it. Admin workflow refinement remains a separate pass. These definitions do not freeze every form into the Demo's existing screen sequence.

## Shell and navigation

The learner shell hosts the header, navigation, common notices, eligible Quick Notes entry points, fixed WizBit corner, system confirmation host and independent error boundaries. Focused coding/testing pages may reduce surrounding chrome, but retain essential warnings and recovery controls.

Administration uses its permitted console presentation without learner Notes or WizBit. Reuse common notice, navigation and error components, not a second competing control system. A page does not create another header, global notice stack or sign-in policy.

Navigation choices change presentation, not the set of authorized destinations. Use each domain's actual destination; direct links and refresh reach the intended page. Profile is reached from the account menu. A navigation group is a label, not an empty page. Unsupported future actions stay absent rather than becoming dead controls.

A valid destination still applies ownership and availability when opened. A missing or unauthorized private item gives no existence clue; a service failure is not Not found. The main-site contact route is the escape path for a refusal the learner cannot resolve, not a new Labs support product.

## Appearance and accessibility

Settings owns the choices: six themes, Light/Dark/Follow system, navigation model, accent, typeface and separate editor/terminal palette. The header theme/mode switcher writes the same device preference and reflects changes from Settings immediately. It creates no second theme state. Appearance survives sign-out; account-level reduced motion and the operating system's preference use the more restrictive reading.

Theme and motion changes must not discard source, reset navigation, restart a timer or alter a result. Labels and icons carry meaning beside color. Keep contrast, keyboard access, visible focus, readable sizing, reduced-motion still states and sensible touch targets across supported layouts.

Dialogs trap focus when modal and return it when closed. Non-modal Notes keeps its own behavior. Narrow navigation uses the shared drawer treatment; Workspace's desktop requirement does not make other learner pages unavailable on mobile. Drag-only operations need a keyboard alternative.

## Common controls and states

Use consistent buttons, forms, menus, dialogs, drawers, tabs, lists, tables, meters, paging and save indicators. An action names what it does, applies the same rule through keyboard and pointer, and avoids duplicate requests while in flight.

| State | What it means |
|---|---|
| Loading | The requested content has not arrived yet |
| Empty library | No available authored material exists |
| No matches | Material exists, but not under the selected search/filter |
| Nothing yet | This learner has no relevant recorded activity |
| Not enough evidence | The stated measurement minimum has not been met |
| Unavailable | A required read or calculation could not be established |
| Conflict | Newer saved state exists; preserve the unsaved work and explain the permitted resolution |
| Archived/changed or expired detail | Authorized history remains with the owner's explanation and valid actions |
| Duplicate request | Return the existing outcome rather than repeat its effect |
| Partial completion | State exactly what succeeded and what remains unresolved |

Keep readable data during a failed refresh with understandable freshness information. An unknown number is not zero. Lists state an exact total only when known; otherwise show loaded rows and the unavailable total. A required exact destructive-impact count cannot be replaced with an estimate.

A genuine optional absence can omit its region. It must not hide a required feature whose service failed. Use Retry only when it can repeat that operation safely. Do not clear an entire page because an optional panel failed.

## Four different message experiences

| Experience | Responsibility |
|---|---|
| Local feedback | Field validation, save status, execution output and persistent result on the owning page |
| Common notice | Short system feedback; success/information may close, warnings/errors require deliberate handling |
| WizBit message | Authored companion or Plain presentation with its own queue, Quiet and suppression rules |
| Inbox notification | Durable event delivered through Notifications and its preferences |

A confirmation is separate from all four: only explicit Confirm permits its action. Closing, Escape, navigation or a failed dialog does not count as consent. Warn in proportion to the consequence; preserve the agreed exact-item/person confirmations for destructive actions. The absence of WizBit does not remove essential confirmations.

Use one common notice stream, not a stack per feature. Coalesce repeat delivery, pause dismissal while interacting, and never silently evict a required acknowledgement. The producer retains the essential outcome on its page even when transient display cannot be admitted. WizBit's authored timing and queue remain in Messages rather than borrowed for unrelated alerts.

## Notification category presentation

Give the seven categories one consistent, accessible treatment across bell, inbox and previews. Theme changes may alter styling, not meaning. Use the same category name and its standard visual identity; a caller cannot invent another category or provide arbitrary per-event artwork.

Only staff broadcasts carry an authored icon choice, using the configured default when absent. Other notification kinds use their category treatment. This closes the shared presentation rule without adding another notification state, preference or icon-management system.

## Content and checks

Render learner text and program output as content, not instructions or executable UI. Safe formatted course text is different from code intentionally placed in an isolated preview. Keep hidden material, secrets and internal errors out of every visible state.

Check all themes/modes, the header/Settings round trip, reduced motion, keyboard-only flows, narrow layouts, notices versus inbox events, category/icon consistency, failed counts, stale refreshes, confirmation cancellation and per-panel failures. No visual reference overrides an approved privacy or result rule.
