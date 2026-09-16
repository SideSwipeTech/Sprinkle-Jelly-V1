/**
 * The Settings › Appearance panel — the one place any appearance axis is chosen.
 *
 * Pack O (O-A) rules four axes and one home for them: *"including the navigation style but
 * move it to settings"*. Both header switchers are gone — the learner shell's and the admin
 * shell's, because "nowhere else" is not a learner-only rule; this component keeps its path
 * and its name and is mounted from `src/pages/Account.tsx` (Settings › Appearance) and from
 * nowhere else *(owner review: OR-O17)*.
 *
 * Every member, label, note and colour is the presentation package's, read through
 * `@foundation/appearance` from the generated `src/tokens/values.ts`. **No colour is written
 * in this component or in its stylesheet.** The identity previews are
 * `IDENTITY_ACCENTS[identity][scheme]` — the identity's own accent pair — and the accent dots
 * are `ACCENT_VALUES[identity][scheme][tint]`, the tint as this identity and scheme actually
 * paint it rather than a canonical chip. Both travel to CSS as custom properties / inline
 * backgrounds so the stylesheet needs no hex of its own.
 */

import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import {
  ACCENTS,
  ACCENT_DEFAULT_LABEL,
  ACCENT_VALUES,
  FOLLOW_SYSTEM_LABEL,
  IDENTITY_ACCENTS,
  NAV_BELOW_STANDARD,
  NAV_MODELS,
  PRODUCT_THEMES,
  SCHEMES,
  TYPEFACES,
  applyAppearance,
  readAppearance,
  type AccentKey,
  type ProductTheme,
  type SchemeKey,
  type SchemeMode
} from "@foundation/appearance";
import { performMetamorphicTransition } from "@foundation/metamorphic";
import "./appearance-switcher.css";

/** The tint as this identity and scheme actually paint it (`audit/P5_C7.md` §1). */
function accentSwatch(theme: ProductTheme, scheme: SchemeKey, tint: AccentKey): string {
  return ACCENT_VALUES[theme][scheme][tint].accentPrimary;
}

/**
 * The two stops of an identity's preview square: its OWN accent pair — untinted — in the
 * scheme currently applied — each identity previews its own accentPrimary → accentSecondary
 * pair for the applied scheme, exactly as the package states them (no hex is written here,
 * in the stylesheet, or in this comment: the values are read from IDENTITY_ACCENTS at render).
 *
 * Read, never typed: for the four package identities the pair is the palette's; for `atlas`
 * and `atelier` it is `identities.<key>.registeredAccent`, which records the pair their
 * family CSS states, with its source line, and is covered by that file's sha256. The two
 * families state the same untinted pair, so their two previews match — that is what the
 * prototype paints, and the swatch's name is what tells them apart.
 * *(owner review: OR-O24)*
 */
function identityPreviewStyle(theme: ProductTheme, scheme: SchemeKey): CSSProperties {
  const own = IDENTITY_ACCENTS[theme][scheme];
  return {
    "--look-swatch-from": own.accentPrimary,
    "--look-swatch-to": own.accentSecondary
  } as CSSProperties;
}

const SCHEME_LABEL: Record<SchemeKey, string> = { light: "Light", dark: "Dark" };

export function AppearanceSwitcher() {
  // The Settings › Appearance panel — the one place every appearance axis is chosen (pack O, O-A).
  // Both header mounts (learner shell and admin shell) left with the ruling.
  const [state, setState] = useState(() => readAppearance());

  useEffect(() => {
    const sync = () => setState(readAppearance());
    window.addEventListener("wp-appearance", sync);
    return () => window.removeEventListener("wp-appearance", sync);
  }, []);

  const handleThemeChange = (theme: ProductTheme, e: MouseEvent) => {
    setState(performMetamorphicTransition({ theme, originEvent: e }, (finalState) => setState(finalState)));
  };

  const handleSchemeMode = (mode: SchemeMode, e: MouseEvent) => {
    if (mode === "system") {
      setState(applyAppearance({ schemeMode: "system" }));
      return;
    }
    setState(performMetamorphicTransition({ scheme: mode, originEvent: e }, (finalState) => setState(finalState)));
  };

  return (
    <div className="look look--page">
      <section className="look__axis">
        <p className="micro look__legend">Theme</p>
        <div className="look__row" role="radiogroup" aria-label="Theme identity">
          {PRODUCT_THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={state.theme === t.key}
              className="look__swatch"
              data-active={state.theme === t.key || undefined}
              title={t.reading}
              style={identityPreviewStyle(t.key, state.scheme)}
              onClick={(e) => handleThemeChange(t.key, e)}
            >
              <span className="look__swatch-face" />
              <span className="look__swatch-name">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="look__segment" role="radiogroup" aria-label="Scheme">
          {SCHEMES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={state.schemeMode === s}
              data-active={state.schemeMode === s || undefined}
              onClick={(e) => handleSchemeMode(s, e)}
            >
              {SCHEME_LABEL[s]}
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={state.schemeMode === "system"}
            data-active={state.schemeMode === "system" || undefined}
            onClick={(e) => handleSchemeMode("system", e)}
          >
            {FOLLOW_SYSTEM_LABEL}
          </button>
        </div>
        <p className="look__note">
          {state.schemeMode === "system"
            ? `Following this device — currently ${SCHEME_LABEL[state.scheme].toLowerCase()}.`
            : "Six identities in light and dark. Follow system tracks the device instead of pinning one."}
        </p>
      </section>

      <section className="look__axis">
        <p className="micro look__legend">Navigation</p>
        <div className="look__navs" role="radiogroup" aria-label="Navigation model">
          {NAV_MODELS.map((m) => (
            <button
              key={m.key}
              type="button"
              role="radio"
              className="look__nav"
              aria-checked={state.nav === m.key}
              data-active={state.nav === m.key || undefined}
              onClick={() => setState(applyAppearance({ nav: m.key }))}
            >
              <strong>{m.label}</strong>
              <small>{m.note}</small>
            </button>
          ))}
        </div>
        <p className="look__note">
          Below the Standard band navigation moves into a {NAV_BELOW_STANDARD} whichever model is
          chosen. Destinations and their order never change.
        </p>
      </section>

      <section className="look__axis">
        <p className="micro look__legend">Accent</p>
        <div className="look__dots" role="radiogroup" aria-label="Accent">
          {/* "Theme default" is drawn as an explicit NO-TINT chip — a hatch on the inset
              surface — and is deliberately not painted with the accent currently applied:
              --c-accent-primary is whatever tint is active right now, so painting it would
              show the chosen tint as the default (owner review: OR-O21). */}
          <button
            type="button"
            role="radio"
            className="look__dot look__dot--default"
            aria-label={ACCENT_DEFAULT_LABEL}
            aria-checked={state.accent === null}
            data-active={state.accent === null || undefined}
            title={ACCENT_DEFAULT_LABEL}
            onClick={() => setState(applyAppearance({ accent: null }))}
          />
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              type="button"
              role="radio"
              className="look__dot"
              aria-label={a.label}
              aria-checked={state.accent === a.key}
              data-active={state.accent === a.key || undefined}
              title={a.label}
              style={{ background: accentSwatch(state.theme, state.scheme, a.key) }}
              onClick={() => setState(applyAppearance({ accent: a.key }))}
            />
          ))}
        </div>
        <p className="look__note">
          {state.accent === null
            ? `${ACCENT_DEFAULT_LABEL} — this identity's own accent, untinted.`
            : `${ACCENTS.find((a) => a.key === state.accent)?.label ?? ""} as this identity paints it in ${SCHEME_LABEL[state.scheme].toLowerCase()}.`}
        </p>
      </section>

      <section className="look__axis">
        <p className="micro look__legend">Typeface</p>
        <div className="look__types" role="radiogroup" aria-label="Typeface">
          {TYPEFACES.map((t) => (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={state.typeface === t.key}
              data-active={state.typeface === t.key || undefined}
              style={t.display ? { fontFamily: t.display } : undefined}
              onClick={() => setState(applyAppearance({ typeface: t.key }))}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {!state.remembered ? (
        <p className="look__warn">This choice applies for this visit only — it could not be saved to this device.</p>
      ) : null}
    </div>
  );
}
