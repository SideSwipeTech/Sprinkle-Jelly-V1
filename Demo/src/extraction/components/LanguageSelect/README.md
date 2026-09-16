# LanguageSelect

The language/runtime picker: the controls family's **Select** anatomy
(`x-select` / `x-select__input` / `x-select--sm` — sibling class reference,
contract §6) plus the canonical `LANGUAGES` option set and an optional visible
micro label. Native `<select>` semantics all the way down.

The shared Select canonicalises `.workbench__select` (lab.css:259-292) and
already retires the inline selects at Practice.tsx:472-491 and
Learn.tsx:658-676; this component supplies what workbench pickers actually
want — the supported-language list.

## Props

| Prop | Type | Notes |
|---|---|---|
| `value` | `string` | |
| `onChange` | `(value: string) => void` | |
| `options` | `readonly (string \| {value,label})[]` | defaults to `LANGUAGES` |
| `label` | `string` | accessible name; visible when `showLabel` |
| `showLabel` | `boolean` | renders a mono micro label before the select |
| `disabled` | `boolean` | real `disabled` + `aria-disabled` |

## States

`toolbar` · `labelled` · `string-options` · `disabled`

## Depends on

- Sibling class hooks: `x-select`, `x-select__input`, `x-select--sm`,
  `.x-select > .icon` chevron slot (owned by `Select/`).

## Used on

- `/codelab` toolbar (runtime starter picker)
- `/challenges/:challengeId` (challenge language)
- `/courses/:courseId/video/:videoId` (playback speed — via `x-select` hooks in VideoStage)
