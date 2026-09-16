/**
 * HeaderThemePicker — the identity/scheme/accent switcher in the shell header.
 * Compact popover form of the Settings › Appearance panel: same axes, same
 * presentation-package values, same transitions. Nothing here writes a colour —
 * swatches read `IDENTITY_ACCENTS`, dots read `ACCENT_VALUES`, exactly as the
 * full panel does.
 */

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Icon } from "@icons/Icon";
import {
  ACCENTS,
  ACCENT_DEFAULT_LABEL,
  ACCENT_VALUES,
  FOLLOW_SYSTEM_LABEL,
  IDENTITY_ACCENTS,
  PRODUCT_THEMES,
  SCHEMES,
  applyAppearance,
  readAppearance,
  type AccentKey,
  type ProductTheme,
  type SchemeKey,
  type SchemeMode
} from "@foundation/appearance";
import { performMetamorphicTransition } from "@foundation/metamorphic";
import "../components/appearance-switcher.css";
import "./theme-picker.css";

const SCHEME_LABEL: Record<SchemeKey, string> = { light: "Light", dark: "Dark" };

export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(() => readAppearance());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setState(readAppearance());
    window.addEventListener("wp-appearance", sync);
    return () => window.removeEventListener("wp-appearance", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | PointerEvent | globalThis.MouseEvent) => {
      if (rootRef.current && e.target instanceof Node && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDoc as EventListener);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc as EventListener);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pickTheme = (theme: ProductTheme, e: MouseEvent) => {
    setState(performMetamorphicTransition({ theme, originEvent: e }, (f) => setState(f)));
  };
  const pickScheme = (mode: SchemeMode, e: MouseEvent) => {
    if (mode === "system") { setState(applyAppearance({ schemeMode: "system" })); return; }
    setState(performMetamorphicTransition({ scheme: mode, originEvent: e }, (f) => setState(f)));
  };
  const pickAccent = (accent: AccentKey | null) => setState(applyAppearance({ accent }));

  return (
    <div className="header-menu theme-picker" ref={rootRef}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Theme and accent"
        aria-expanded={open}
        title="Theme and accent"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="theme" size={18} />
      </button>

      {open ? (
        <div className="header-pop theme-picker__panel" role="dialog" aria-label="Theme and accent">
          <section className="theme-picker__group">
            <p className="theme-picker__legend">Theme</p>
            <div className="theme-picker__swatches" role="radiogroup" aria-label="Theme identity">
              {PRODUCT_THEMES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="radio"
                  aria-checked={state.theme === t.key}
                  className="look__swatch"
                  data-active={state.theme === t.key || undefined}
                  title={t.label}
                  style={{
                    "--look-swatch-from": IDENTITY_ACCENTS[t.key][state.scheme].accentPrimary,
                    "--look-swatch-to": IDENTITY_ACCENTS[t.key][state.scheme].accentSecondary
                  } as CSSProperties}
                  onClick={(e) => pickTheme(t.key, e)}
                >
                  <span className="look__swatch-face" />
                  <span className="look__swatch-name">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="look__segment theme-picker__scheme" role="radiogroup" aria-label="Scheme">
              {SCHEMES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={state.schemeMode === s}
                  data-active={state.schemeMode === s || undefined}
                  onClick={(e) => pickScheme(s, e)}
                >
                  {SCHEME_LABEL[s]}
                </button>
              ))}
              <button
                type="button"
                role="radio"
                aria-checked={state.schemeMode === "system"}
                data-active={state.schemeMode === "system" || undefined}
                onClick={(e) => pickScheme("system", e)}
              >
                {FOLLOW_SYSTEM_LABEL}
              </button>
            </div>
          </section>

          <section className="theme-picker__group">
            <p className="theme-picker__legend">Accent</p>
            <div className="theme-picker__dots" role="radiogroup" aria-label="Accent">
              <button
                type="button"
                role="radio"
                className="look__dot look__dot--default"
                aria-label={ACCENT_DEFAULT_LABEL}
                aria-checked={state.accent === null}
                data-active={state.accent === null || undefined}
                title={ACCENT_DEFAULT_LABEL}
                onClick={() => pickAccent(null)}
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
                  style={{ background: ACCENT_VALUES[state.theme][state.scheme][a.key].accentPrimary }}
                  onClick={() => pickAccent(a.key)}
                />
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
