/**
 * KitchenSink — the extraction showcase. One page renders every extracted
 * component in every declared state, under the real shell, with live
 * identity/scheme/accent/typeface/nav switchers.
 *
 * Components self-register: `import.meta.glob` picks up every
 * `extraction/components/<Name>/states.tsx`; a component added to the
 * library appears here without touching this file. Order and "Used on"
 * lines come from `./manifest.ts`.
 *
 * A state not rendered here does not exist for the port.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Page } from "@components/Page";
import {
  readAppearance,
  applyAppearance,
  type AccentKey,
  type AppearanceState
} from "@foundation/appearance";
import { performMetamorphicTransition } from "@foundation/metamorphic";
import {
  VALUES,
  ACCENT_VALUES,
  IDENTITY_ACCENTS
} from "../../tokens/values";
import { FAMILIES, USED_ON } from "./manifest";
import "./sink.css";

/* Every component's stylesheet — siblings reference each other by x-* class,
   so the sink loads the whole library's CSS. */
import.meta.glob("../../extraction/components/*/*.css", { eager: true });

interface StateDef {
  key: string;
  label: string;
  render: () => ReactNode;
}

const stateModules = import.meta.glob("../../extraction/components/*/states.tsx", {
  eager: true
}) as Record<string, { states: StateDef[] }>;

/** folder name → its states module. */
const REGISTRY: Record<string, StateDef[]> = {};
for (const [path, mod] of Object.entries(stateModules)) {
  const name = path.split("/").slice(-2, -1)[0];
  if (name) REGISTRY[name] = mod.states;
}

const IDENTITIES = VALUES.identities;
const ACCENTS: readonly { key: string; label: string }[] = VALUES.accents;
const TYPEFACES: readonly { key: string; label: string }[] = VALUES.typefaces;
const NAV_MODELS: readonly { key: string; label: string }[] = VALUES.navModels;

/* Package identities can be element-scoped via data-subtheme — the compare
   strip previews them side by side. Family identities (atlas, atelier) are
   html-scoped; switch to them live. */
const PACKAGE_IDENTITIES = IDENTITIES.filter((i) => i.kind === "package");

function useAppearanceState(): AppearanceState {
  const [appearance, setAppearance] = useState(readAppearance);
  useEffect(() => {
    const sync = () => setAppearance(readAppearance());
    window.addEventListener("wp-appearance", sync);
    return () => window.removeEventListener("wp-appearance", sync);
  }, []);
  return appearance;
}

function ComponentSection({ name }: { name: string }) {
  const states = REGISTRY[name];
  if (!states?.length) return null;
  const usedOn = USED_ON[name];
  return (
    <section className="ks__component" id={`c-${name.toLowerCase()}`}>
      <header className="ks__component-head">
        <span className="ks__component-name">{name}</span>
        {usedOn ? (
          <span className="ks__usedon">
            Used on: {usedOn.map((u, i) => (
              <code key={i}>{u}{i < usedOn.length - 1 ? " · " : ""}</code>
            ))}
          </span>
        ) : null}
      </header>
      <div className="ks__states">
        {states.map((s) => (
          <div className="ks__state" key={s.key}>
            <span className="ks__state-label">{s.label}</span>
            <div className="ks__state-body">{s.render()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompareStrip() {
  /* A mini composition — button + chip + badge — under each package
     identity's scoped tokens, in the currently-selected scheme. */
  const scheme = readAppearance().scheme;
  return (
    <div className="ks__compare">
      {PACKAGE_IDENTITIES.map((identity) => (
        <div
          key={identity.key}
          className="ks__compare-cell"
          data-subtheme={identity.key}
          data-theme={scheme}
        >
          <span className="ks__compare-name">{identity.label}</span>
          <button type="button" className="x-btn x-btn--primary">Continue</button>
          <span>
            <span className="x-chip x-chip--quiet" data-on>in progress</span>{" "}
            <span className="x-chip">4 left</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function KitchenSink() {
  const appearance = useAppearanceState();

  const grouped = useMemo(() => {
    const seen = new Set(FAMILIES.flatMap((f) => f.components));
    const rest = Object.keys(REGISTRY).filter((n) => !seen.has(n)).sort();
    return [...FAMILIES, ...(rest.length ? [{
      key: "other",
      title: "Ungrouped",
      blurb: "Components without a manifest entry — add them to manifest.ts.",
      components: rest
    }] : [])];
  }, []);

  /* Rendered once — the sections never re-render on appearance changes
     (theme flows through CSS tokens, not props). Without this, the
     wp-appearance re-render re-fires open overlays' focus effects and the
     page scrolls to whatever got focused (the drawer demo at the bottom). */
  const sections = useMemo(
    () =>
      grouped.map((family) => (
        <section className="ks__family" key={family.key}>
          <header className="ks__family-head">
            <h2 className="ks__family-title">{family.title}</h2>
            <p className="ks__family-blurb">{family.blurb}</p>
          </header>
          {family.components.map((name) => (
            <ComponentSection key={name} name={name} />
          ))}
        </section>
      )),
    [grouped]
  );

  const identitySwatch = (key: string, scheme: "light" | "dark") =>
    IDENTITY_ACCENTS[key as keyof typeof IDENTITY_ACCENTS]?.[scheme] ??
    { accentPrimary: "", accentSecondary: "" };

  return (
    <Page
      kind="sink"
      kicker="extraction reference"
      title="Kitchen sink"
      lead="Every extracted element, every state, every theme. What is not here does not exist."
    >
      <div className="ks__toolbar">
        <div className="ks__group" role="group" aria-label="Identity">
          <span className="ks__group-label">Identity</span>
          {IDENTITIES.map((identity) => (
            <button
              key={identity.key}
              type="button"
              className="ks__swatch"
              data-on={appearance.theme === identity.key || undefined}
              title={identity.label}
              aria-label={identity.label}
              style={{
                ["--swatch-from" as string]: identitySwatch(identity.key, "light").accentPrimary,
                ["--swatch-to" as string]: identitySwatch(identity.key, "dark").accentPrimary
              }}
              onClick={(e) =>
                performMetamorphicTransition(
                  { theme: identity.key, originEvent: e }
                )
              }
            />
          ))}
        </div>

        <div className="ks__group" role="group" aria-label="Scheme">
          <span className="ks__group-label">Scheme</span>
          {(["light", "dark", "system"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className="x-chip"
              data-on={appearance.schemeMode === mode || undefined}
              aria-pressed={appearance.schemeMode === mode}
              onClick={() => applyAppearance({ schemeMode: mode })}
            >
              {mode === "system" ? "Follow system" : mode}
            </button>
          ))}
        </div>

        <div className="ks__group" role="group" aria-label="Accent">
          <span className="ks__group-label">Accent</span>
          <button
            type="button"
            className="x-chip x-chip--sm"
            data-on={appearance.accent === null || undefined}
            aria-pressed={appearance.accent === null}
            onClick={() => applyAppearance({ accent: null })}
          >
            default
          </button>
          {ACCENTS.map((accent) => {
            const v = ACCENT_VALUES[appearance.theme]?.[appearance.scheme]?.[accent.key as AccentKey];
            return (
              <button
                key={accent.key}
                type="button"
                className="ks__dot"
                data-on={appearance.accent === accent.key || undefined}
                title={accent.label ?? accent.key}
                aria-label={accent.label ?? accent.key}
                style={{ ["--dot" as string]: v?.accentPrimary ?? "var(--c-accent-primary)" }}
                onClick={() => applyAppearance({ accent: accent.key as AccentKey })}
              />
            );
          })}
        </div>

        <div className="ks__group" role="group" aria-label="Typeface">
          <span className="ks__group-label">Type</span>
          <span className="x-select x-select--sm">
            <select
              className="x-select__input"
              value={appearance.typeface}
              onChange={(e) => applyAppearance({ typeface: e.target.value as AppearanceState["typeface"] })}
              aria-label="Typeface"
            >
              {TYPEFACES.map((t) => (
                <option key={t.key} value={t.key}>{t.label ?? t.key}</option>
              ))}
            </select>
          </span>
        </div>

        <div className="ks__group" role="group" aria-label="Navigation model">
          <span className="ks__group-label">Nav</span>
          <span className="x-select x-select--sm">
            <select
              className="x-select__input"
              value={appearance.nav}
              onChange={(e) => applyAppearance({ nav: e.target.value as AppearanceState["nav"] })}
              aria-label="Navigation model"
            >
              {NAV_MODELS.map((n) => (
                <option key={n.key} value={n.key}>{n.label ?? n.key}</option>
              ))}
            </select>
          </span>
        </div>
      </div>

      <div className="ks">
        <nav className="ks__index" aria-label="Component index">
          {grouped.map((family) => (
            <div key={family.key}>
              <div className="ks__index-family">{family.title}</div>
              {family.components.map((name) => (
                <a
                  key={name}
                  className="ks__index-link"
                  href={`#c-${name.toLowerCase()}`}
                >
                  {name}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div>
          <section className="ks__family">
            <header className="ks__family-head">
              <h2 className="ks__family-title">Identity compare</h2>
              <p className="ks__family-blurb">
                The same trio under each package identity's scoped tokens, in the
                current scheme. Atlas and atelier are root-scoped — switch the
                identity above to see them.
              </p>
            </header>
            <CompareStrip />
          </section>

          {sections}
        </div>
      </div>
    </Page>
  );
}
