# Coverage map — merged teardown survey

Derived from five parallel surveys (2026-09-11). Every element below was found in the demo;
extraction covers it or declares it dead/page-local. Source citations are `file:line`.

## Route reality (the demo is flat, the platform inventory is namespaced)

| Demo route | Page | Inventory address |
|---|---|---|
| `/` | Dashboard | `/` |
| `/courses`, `/courses/:courseId`, `/courses/:courseId/lessons/:lessonId` (+ `/quiz`, `/project`, `/changes`, `/video/:videoId`) | Learn family | `/learn*` |
| `/codelab` | Code Lab workbench | `/build/code-lab` |
| `/challenges`, `/challenges/dashboard`, `/challenges/:challengeId`, `/challenges/random`, `/challenges/history` | Practice | `/practice/challenges*` |
| `/tracks/:trackId`, `/daily`, `/daily/archive`, `/daily/solve`, `/debug`, `/debug/:caseId` | Practice/More | `/practice/*` |
| `/projects`, `/projects/new`, `/projects/templates`, `/projects/:projectId`, `/workspace` | Practice | `/build/*` |
| `/solutions`, `/solutions/:solutionId`, `/achievements` | Practice | `/solutions*`, `/achievements` |
| `/assessments`, `/assessments/browse`, `/assessments/history`, `/mock/:paperId*`, `/company/:companyId*` | Assess | `/assess*` |
| `/settings`, `/profile`, `/certificates*`, `/notifications*`, `/requests`, `/help`, `/honesty`, `/search`, `/restricted`, `/error-states`, `/recap*` | Account/More | `/profile/*`, `/inbox`, `/credits`, `/xp-history`, … |
| `/admin/*` | AdminPages (own shell, outside learner Shell) | `/admin/*` |

## Existing kit — adopt, don't rebuild (`src/components/`)

Token-clean already: `Card`, `CardHeader`, `StateBlock` (7 states, non-colour tells), `Stat`,
`Charge`, `ChargeRing`, `Page`, `Back`, `CoverageTag`, `Icon`, `AppearanceSwitcher` (the gold
standard). Extracted components **import these** rather than duplicating.

Needs tokenization before adoption: `Breadcrumbs` (all inline styles), `ActivityHeatmap`
(hardcoded teal ramp + ~30 inline styles), `CodeEditor` Monaco themes (~20 hexes, always dark),
`EditorTabs`/`FileExplorer` (`alert` icon misused as "+", `window.confirm`).

## Cross-cutting violations (the systematic findings)

1. `.chip` defined twice with different paint — `app.css:66` vs `home.css:46`. One canonical
   definition in extraction; `chip--quiet`, `chip--accent` become real modifiers.
2. `.filters` defined twice — `app.css:60` vs `courses.css:89`.
3. `home__*` classes (`home__note`, `home__list`, `home__row`, `.tile`) borrowed by Learn,
   Account, Assess, Admin pages but living in Dashboard's stylesheet — rehome as shared rows.
4. ~80 literal-color sites, all mapping to the CONTRACT map (teal/amber/rose/indigo/white/shadow).
5. px literals throughout inline styles — `--text-*`, `--space-*`, `--radius-*` cover them all.
6. `--shell-nav-*` token family exists (`tokens.css:106-143`) but shell.css restates every value
   as literals; admin shell has no token family at all (236px/64px/175px/116px/680px literals).
7. Accessibility: `aria-pressed` inconsistent, `aria-disabled` absent (pointerEvents hack),
   color-only state encoding on badges/palette/verdicts.
8. `--c-danger` referenced (app.css:260) but undefined — real token is `--c-error`.

## Dead code — do NOT extract

Unrouted exports in Assess.tsx: `MockDashboard`, `MockBrowse`, `MockHistory`, `CompanyBrowse`,
`CompanyDashboard`, `CompanyHistory` (~290 lines, 28% of the file). `AdminAssistantKnowledge`
unrouted. Dead classes: `chip--accent`, `btn--disabled`, `assessment-filters`, `lab-workspace`,
`stack--md`, `b11-table-wrap`, `.filters__select`, `.is-soon`/`.soon-pill`, `.model-picker`,
`.shell__band-readout`, `.shell__close`, `.drawer__panel .rail`, `.admin-top .header-pop`.
Dead animation: `pulse` (Learn.tsx:692). `FileExplorer.onRenameFile` declared, never implemented.

## The extraction list, by family

### containers/ — Agent C1
| Component | Sources | Notes |
|---|---|---|
| `ListRow` (polymorphic) | app.css:83-102; used ~25 sites across all files | `button`/`article`/`div`/`Link`; `data-on`; hover accent border |
| `InsetPanel` | Learn.tsx:199-208, Assess DiagnosticRow/ProfileFactRow pattern | inset surface rows |
| `KeyValueRow` | Assess.tsx:403-414, 871-883; `.account-facts` app.css:213-217 | merge DiagnosticRow+ProfileFactRow+account-facts dl |
| `GridTwo`, `CardGrid` | app.css:35-42; surfaces.css:29-35; courses.css:133-138 | layout utilities |
| `SplitGrid`/`WorkbenchLayout` | Practice.tsx:379, 879, 1077 (three hand-rolled inline grids) | the `.workbench` shell in lab.css:230-471 is the canonical composition |

### controls/ — Agent C2
| Component | Sources | Notes |
|---|---|---|
| `Button` | card.css:191-239 + ~40 sites | add real `disabled` (aria-disabled), `loading`, `destructive`, `sm`; per-theme `:active` preserved |
| `Field` | app.css:121-136 | label+input/select/textarea; select needs real styling |
| `Select` | lab.css:259-292 (`.workbench__select`), Learn.tsx:658-676 (divergent), Practice.tsx:472-491 | one custom select; native crutch gone |
| `SearchField` | courses.css:96-116; used in Courses/Practice/Assess/Account | icon+input |
| `Chip`, `ChipGroup`, `ChipTabBar` | app.css:66-78 canonical; home.css:46-59 killed | `data-on`, `aria-pressed`; quiet/accent modifiers real |
| `SegmentedControl` | app.css:220-222; Account.tsx:234-259 | aria-pressed |
| `SettingsTabs` | app.css:174-201; Account.tsx:154-160 | icon tabs, horizontal scroll |
| `Slider` | Learn.tsx:1384-1406 | currently unstyled native range — new component |
| `FilterBar` | `.filters` canonical + `filters__search` + `filters__count` | search + chip groups + count |
| `TagCloud` | Practice.tsx:162-175 | chip cloud, `data-on` |
| `AcknowledgeGate` | Assess.tsx:380-384, 851-854 | checkbox-gates-action, aria-disabled |
| `ConfirmByTyping` | AdminPages.tsx:164-169 | disabled-until-echo |

### states/ — Agent C3
| Component | Sources | Notes |
|---|---|---|
| `StateBlock` | kit — adopt + document the 7 keys | already clean |
| `Skeleton`/`LoadingState` | **missing entirely** — only spinners exist | NEW: skeleton rows/cards/text, shimmer respecting reduced-motion |
| `Notice` | Learn.tsx:332-342, 521-528; `.settings-note` app.css:207; `.form-message` app.css:231; AdminPages several | consolidate callout/feedback/message into one component w/ tones |
| `StaleNote` | surfaces.css:113-119 | dashed freshness banner |
| `DifficultyBadge`, `SolvedBadge`, `ProvenanceChip`, `StatusText` | Practice.tsx:194-212, 276, 394, 886, 759; Assess.tsx:679-688; app.css:218 | kill ~30 literal sites; non-colour tells (icon/label) required |
| `BadgeDot`, `IconButton` | shell.css:592-627 | unread count, icon button |
| `Avatar` | shell.css:629 + admin-shell.css:86 + Account.tsx:316 | merge 3 variants, one component |
| `WeekStrip`, `StreakDial` | Practice.tsx:778-799 | WeekStrip new; StreakDial = `ChargeRing centre=` usage example |

### overlays/ — Agent C4
| Component | Sources | Notes |
|---|---|---|
| `Dialog` | **missing** — replaces window.confirm/prompt/alert (FileExplorer.tsx:91, EditorTabs.tsx:1103, AdminPages.tsx:1228) | NEW: typed-confirm variant included |
| `Popover`/`HeaderMenu` | Shell.tsx:135-179 | kill ~15 inline literals |
| `Drawer`, `Sheet` | Shell.tsx:434-455; NotesPanel :458-499; admin drawer admin-shell.css:189-233 | shared scrim+panel anatomy; sheet <tablet |
| `Tooltip` | `.spine__tip` shell.css | CSS-only tooltip |
| `CommandPalette` | Shell.tsx:510-696 | biggest inline-style cluster; needs full class-ification + `aria-selected` |
| `NotesPanel` | Shell.tsx:458-499 | sheet + autosave save-state |
| `Menu`/`ContextMenu` | header-menu pattern | minimal |
| `Tabs`/`FamilyTabs` | courses.css:38-83 | proper tablist; count badges |
| `Breadcrumbs` | components/Breadcrumbs.tsx + admin-crumb (admin-nav.ts:92) | tokenize; fold admin-crumb into one component |

### work/ — Agent C5
| Component | Sources | Notes |
|---|---|---|
| `Workbench` suite | lab.css:230-471 (unused canonical system!) + Practice's 3 inline grids | toolbar, `ToolButton`, `RunButton`, `StdinRow`, `StatusBar`, main split |
| `CodeEditorChrome` | components/CodeEditor/* | tokenize header/statusbar; **Monaco theme generated from palette tokens** (both schemes); kill `wizly-dark` hardcode |
| `EditorTabs`, `FileExplorer` | kit | fix `alert`→`plus` icon, confirm→Dialog, implement/rename `onRenameFile` |
| `Terminal` | kit | tabs (output/tests/judge), test-case cards, judge box — mostly clean already |
| `LanguageSelect` | lab.css workbench select + inline versions | one styled select |
| `HintLadder` | Practice.tsx:409-437; More.tsx similar | kill indigo literals |
| `ProblemPanel`/`StatementPane` | Practice.tsx:382-449 | statement + constraints + tags |
| `SandboxCard` | Learn.tsx:351-388 | in-lesson mini runner — rebuild on Workbench parts |
| `CodeBlock` | app.css:138-146 (`pre.code`) + `.code` textarea | display vs editable |
| `VideoStage`/`VideoPlayer` chrome | Learn.tsx:653-756 | stage + scrubber + speed select + CC + transcript; kill dead `pulse`, fixed `#080B16` |

### domain/ — Agent C6 (assessment + courses widgets)
| Component | Sources | Notes |
|---|---|---|
| `ExamChrome` suite | Assess.tsx:435-566 & 890-1011 (~90% identical) | `IntegrityBanner`, `TimerStrip`, `QuestionPalette` (`.q-rail`, data-on/data-done/marked), `QuestionCard`+`AnswerChoice`, `SittingNav`; `useCountdown`, `useSitting` hooks |
| `BriefingRulesList` | Assess.tsx:364-377, 835-848 | icon+text rows |
| `ScorecardHero`, `ProficiencyRow`, `ReviewItemCard`, `CompletionFactPanel`, `ExamFlagRow` | Assess.tsx:586-645, 871-883, 1022-1045, 420-427 | kill literal verdict colors; non-colour tells |
| `ContinueCard` | Learn.tsx:51-59; Dashboard:72-96 | resume card + empty StateBlock |
| `CourseCard` | Learn.tsx:105-138 (lab.css:65-88) | cover variant + plain variant |
| `OutlineRow`, `SequenceRow`, `HomeRow` | lab.css:90-110; home.css:109-135; Practice.tsx:270, 805 | row variants — ChecklistRow folded into HomeRow (check+title is its pattern) |
| `AchievementTile` | Practice.tsx:1153-1159 | needs real locked/unlocked visual states |
| `DataTable` | `.admin-table` admin-shell.css:133-147 | th micro, self-scroll, selected row |
| `HealthTileGrid` | admin-shell.css:117-131 | `data-verdict` cells hosting Stat |
| `ToolCluster`, `ActionPanel`, `FormGrid`, `MaintenancePreview` | admin-shell.css:149-177 | admin compositions |
| `RequestForm`, `RequestRow` | app.css:227-234; Account.tsx:591-616 | form + status chip |
| `CertificateCard`, `CertificateSeal` | Account.tsx:415-533 | kill literals; data-URI download util |
| `ErasureFlow` | Account.tsx:277-298 | already token-clean — adopt + document |
| `PreferenceRow`, `CompanionNameField` | app.css:203-206; Account.tsx:747-777 | checkbox row + draft/validation pattern |
| `RouteNotFound`, `RestrictedNotice` | Account.tsx:716-739 | adoption + docs |

### companion-shell/ — Agent C7
| Component | Sources | Notes |
|---|---|---|
| `AppFrame`+`ShellHeader` | Shell.tsx:99-188 | header, menu btn, brand, SearchTrigger, HeaderPill, notice slot |
| `NavModel` family | Shell.tsx:246-455 | one interface, five presentations (rail/spine/command/dock/dual) + drawer collapse; wire dormant `--shell-nav-*` tokens; document the five different `.is-active` idioms → unify or name them |
| `AdminFrame`+`AdminPage`+`AdminNav` | AdminShell.tsx, admin-shell.css | fold AdminPage into kit Page; add `--admin-*` token family proposal to report |
| `Companion` trio | Companion.tsx:40-216 + companion.css | Trigger/Moment/Panel; sparky stays an opaque adapter; fix `COMPACT` literal to band token |
| `ActivityHeatmap` | components/ActivityHeatmap.tsx | tokenize teal ramp via accent stops like ChargeRing; kill ~30 inline styles |

## Missing pieces the extraction adds (not found anywhere)

`Dialog`, `Skeleton`/`LoadingState`, `Select` (unified), `Slider`, real `disabled` semantics,
`useAppearance` hook, `--admin-*` token family.
