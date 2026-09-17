# Code Editor

**Status:** Reviewed product definition  
[Shared](Shared.md) · [Languages](Languages.md) · [Solving](Solving.md)

## Purpose and ownership

One editing experience serves learner code, authored examples, reference solutions and read-only accepted code. An activity supplies its buffer, runtime, permitted actions and saved-state reading. The editor does not decide access, grading, rewards, deadlines or where the code is stored.

Use the editor already selected in Architecture through the shared component. A visually similar editor copied into a domain is not the intended reuse. Domain-specific appearance may vary; editing behavior and accessibility remain consistent.

## Common controls

Provide syntax highlighting, line numbers, undo and redo, find and replace, indentation, bracket matching, preserved whitespace, normal selection/clipboard behavior and keyboard navigation with visible focus. Keep an accessible editor mode, cursor line/column, wrapping, a page-local font-size control and the current save/draft state. The minimap is off.

Read-only views permit reading, selection and finding text, not mutation. An absent runtime highlighter can render plain text without pretending that the text can execute. Never display an editable buffer whose changes go nowhere.

| Action | Shared behavior |
|---|---|
| Run | Ctrl+Enter invokes the same permitted action as the button |
| Submit / Validate Fix | Ctrl+Shift+Enter invokes the owning page's submission action where available |
| Format | Ctrl+Shift+F when a formatter and editing are available; one undoable edit |
| Find | Ctrl+F opens the editor's find controls |
| Expand | Give the editor the work pane's height; restore output from the same control or Escape |
| Save | Offered only where the owner defines a deliberate Save action, such as Workspace or the Debug checkpoint |

Show the active shortcut beside the control. A missing or disabled operation remains unavailable through its shortcut and must not become an accidental newline or a second request. Read-only mode disables editing operations. Account/test restrictions still govern clipboard and other protected actions.

Per-language snippets are short authored editing aids, not generated solutions or a package-management feature. Formatting is not running, saving to the platform or creating a recovery version by itself. A failed format leaves the original source unchanged.

## Configurations, not separate editors

| Use | What surrounds the editor |
|---|---|
| Code Lab | One scratch, runtime selection and terminal or preview |
| Practice problem | Statement, hints, cases, Run and submission controls |
| Assessment coding question | Question controls, allowed runtime and Assessment-owned answer-saving feedback |
| Lesson example | Its authored starter, Run/Stop and output; no persistent draft promise |
| Workspace | File explorer and tabs over the same editor, project saving and execution |
| Solutions | Read-only accepted source and permitted worked explanation |
| Staff authoring | The current area's authored code and validation, without learner progress |

Do not give Code Lab a file tree or Solutions a Submit button. A Track's fixed language is not a user-selectable control. Project files do not become global editor-owned documents.

## Output and layout

One output area presents the program's output, errors and visible cases through named tabs where supplied. Empty output is explained. A page without cases has no empty Cases control. Terminal output stays output, not executable interface content. Case details obey Evaluation's visibility rules.

Resizing and expansion preserve source, cursor and the owning run state. Keyboard-operable dividers keep both principal panes reachable. Narrow layouts stack where the domain supports it; Workspace's desktop-oriented boundary and Notes' mobile support are not changed by a common editor component.

Expand collapses output to its heading rather than removing its state or stopping a process. Returning restores the work area and focus. Theme/mode and the separate editor/terminal palette come from the shared appearance preference; no page keeps a competing palette setting. Reduced motion applies to transitions without removing necessary feedback.

## Saving and interruption

The owner states whether code is device-local, durably stored, temporarily checkpointed or not retained. Display that exact meaning rather than a generic Saved label. Initial source follows the owning area's precedence; selecting a runtime never borrows another item's or learner's code.

Reset requires the owning confirmation, states what will replace the buffer and updates any corresponding draft together. Cancel changes nothing. Active execution restrictions are the page's existing rules. A failed source load must not replace known work with a falsely saved empty buffer.

## Checks

Exercise the same controls across learner, staff and read-only configurations. Verify undo after formatting, unsupported format, disabled shortcuts, selected-language draft separation, Expand/restore, keyboard focus, output truncation, failed loads and truthful saved states. No editor operation independently awards, submits or publishes anything.
