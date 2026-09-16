/**
 * appearance.ts — the learner's four appearance axes.
 *
 * Pack O (`OWNER_RULINGS_2026-08-23B.md`, O-A) rules that every appearance axis is chosen in
 * **Settings › Appearance and nowhere else**: theme (identity x scheme, with *follow system*
 * as a selection mode), navigation model, accent and typeface. The header switcher leaves.
 *
 * Every member name, label, note and value below is read from the generated
 * `src/tokens/values.ts` — the presentation package 0.3.0 is the authority and this file
 * restates none of it (P5 brief C8.4; the package's own contract is `audit/P5_C7.md` §1).
 *
 * A custom accent hex is not a launch option (OR-O3): the control, the state and the
 * `wp.accentHex` key are gone, and a value left on a device from before is cleared on load.
 */

import {
  VALUES,
  ACCENTS,
  ACCENT_VALUES,
  IDENTITY_ACCENTS,
  TYPEFACES,
  NAV_MODELS,
  type AccentKey,
  type TypefaceKey,
  type NavModelKey
} from "@tokens/values";

/** The package's own name lists. Re-exported so a panel imports one module, not two. */
export { ACCENTS, ACCENT_VALUES, IDENTITY_ACCENTS, TYPEFACES, NAV_MODELS };
export type { AccentKey, TypefaceKey, NavModelKey };

/** The six identities, with their labels and readings, straight from the package. */
export const PRODUCT_THEMES = VALUES.identities;
export type ProductTheme = (typeof PRODUCT_THEMES)[number]["key"];

/** The two schemes. `follow system` is a selection mode, never a third scheme (PRF-R6). */
export const SCHEMES = VALUES.themes;
export type SchemeKey = (typeof SCHEMES)[number];

/** How the scheme is chosen: pinned light, pinned dark, or tracking the device. */
export const SCHEME_MODES = ["light", "dark", "system"] as const;
export type SchemeMode = (typeof SCHEME_MODES)[number];
export const FOLLOW_SYSTEM_LABEL = "Follow system";

/** `null` is the identity's own accent — no tint (`VALUES.accentDefault`). */
export type AccentChoice = AccentKey | null;
export const ACCENT_DEFAULT_LABEL = VALUES.accentDefaultLabel;
export const TYPEFACE_DEFAULT = VALUES.typefaceDefault;
export const NAV_DEFAULT = VALUES.navDefault;
/** Below Standard every model gives way to the drawer (OR-O2; `SHR-R31`). */
export const NAV_BELOW_STANDARD = VALUES.navBelowStandard;

export type IconStyle = "rounded" | "keyline";

/** The identities the package paints from `subthemes.css`; the other two are family files. */
const SUBTHEME_IDENTITIES: readonly string[] = PRODUCT_THEMES.filter(
  (identity) => identity.kind === "package"
).map((identity) => identity.key);

const KEYS = {
  theme: "wp.theme",
  scheme: "wp.scheme",
  schemeMode: "wp.schemeMode",
  accent: "wp.accent",
  typeface: "wp.typeface",
  nav: "wp.nav"
} as const;

/**
 * Keys pack O retires.
 *
 * - `wp.accentHex` — the custom accent (OR-O3).
 * - `wp.presets` / `wp.activePreset` — the header switcher's "saved looks". They retire WITH
 *   the switcher rather than moving into Settings: a preset store is a feature, and only an
 *   owner ruling adds one. Settings › Appearance carries the four ruled axes and nothing
 *   else *(owner review: OR-O18)*.
 * - `wp.navPinned` — bound the navigation model to the identity, so changing identity reset
 *   the model. Under O-A the model is an independent preference layered on an
 *   identity–scheme pair (OR-O1), so an identity change never moves it and the key and the
 *   per-identity default are both gone *(owner review: OR-O19)*.
 */
const RETIRED_KEYS = ["wp.accentHex", "wp.presets", "wp.activePreset", "wp.navPinned"] as const;

export interface AppearanceState {
  theme: ProductTheme;
  /** How the scheme is chosen. */
  schemeMode: SchemeMode;
  /** The scheme actually painted — the resolved value when the mode is `system`. */
  scheme: SchemeKey;
  accent: AccentChoice;
  typeface: TypefaceKey;
  nav: NavModelKey;
  iconStyle: IconStyle;
  remembered: boolean;
}

function isTheme(v: unknown): v is ProductTheme {
  return PRODUCT_THEMES.some((t) => t.key === v);
}
function isScheme(v: unknown): v is SchemeKey {
  return (SCHEMES as readonly string[]).includes(v as string);
}
function isSchemeMode(v: unknown): v is SchemeMode {
  return (SCHEME_MODES as readonly string[]).includes(v as string);
}
function isAccent(v: unknown): v is AccentKey {
  return ACCENTS.some((a) => a.key === v);
}
function isTypeface(v: unknown): v is TypefaceKey {
  return TYPEFACES.some((t) => t.key === v);
}
function isNav(v: unknown): v is NavModelKey {
  return NAV_MODELS.some((m) => m.key === v);
}

export function iconStyleFor(theme: ProductTheme): IconStyle {
  // The package owes an icon block (DEFECT_REGISTER P3), so this stays stated here until it lands.
  if (theme === "halo" || theme === "atlas" || theme === "atelier") return "rounded";
  return "keyline";
}

function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    throw new Error("appearance: this device refused to remember the choice");
  }
}

/**
 * The device's own scheme. Unknown resolves to `dark`, which is the prototype's own
 * starting scheme (`index.html`), so an unsupported browser does not jump.
 */
export function systemScheme(): SchemeKey {
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function resolveScheme(mode: SchemeMode): SchemeKey {
  return mode === "system" ? systemScheme() : mode;
}

export function readAppearance(): AppearanceState {
  const root = document.documentElement;
  const storedTheme = readLocal(KEYS.theme);
  const themeAttr = root.getAttribute("data-theme");
  const theme: ProductTheme = isTheme(storedTheme) ? storedTheme : isTheme(themeAttr) ? themeAttr : "halo";

  const storedScheme = readLocal(KEYS.scheme);
  const schemeAttr = root.getAttribute("data-scheme");
  const pinned: SchemeKey = isScheme(storedScheme) ? storedScheme : isScheme(schemeAttr) ? schemeAttr : "dark";
  const storedMode = readLocal(KEYS.schemeMode);
  const schemeMode: SchemeMode = isSchemeMode(storedMode) ? storedMode : pinned;
  const scheme = resolveScheme(schemeMode);

  const storedAccent = readLocal(KEYS.accent);
  const accent: AccentChoice = isAccent(storedAccent) ? storedAccent : null;

  const storedTypeface = readLocal(KEYS.typeface);
  const typeAttr = root.getAttribute("data-type");
  const typeface: TypefaceKey = isTypeface(storedTypeface)
    ? storedTypeface
    : isTypeface(typeAttr)
      ? typeAttr
      : TYPEFACE_DEFAULT;

  const storedNav = readLocal(KEYS.nav);
  const navAttr = root.getAttribute("data-nav");
  const nav: NavModelKey = isNav(storedNav) ? storedNav : isNav(navAttr) ? navAttr : NAV_DEFAULT;

  return {
    theme,
    schemeMode,
    scheme,
    accent,
    typeface,
    nav,
    iconStyle: iconStyleFor(theme),
    remembered: root.getAttribute("data-appearance-unremembered") !== "true"
  };
}

type AppearancePatch = Partial<
  Pick<AppearanceState, "theme" | "scheme" | "schemeMode" | "accent" | "typeface" | "nav">
>;

function emitAppearance() {
  window.dispatchEvent(new Event("wp-appearance"));
}

/**
 * Writes the state onto `<html>`. Every axis is one attribute the package selects on:
 * `data-theme` / `data-scheme` / `data-accent` / `data-type` (see `audit/P5_C7.md` §1).
 * Theme default removes `data-accent` so no accent rule matches and the identity's own
 * accent stands; `identity` removes `data-type` for the same reason.
 */
function applyToDocument(state: Omit<AppearanceState, "iconStyle" | "remembered">): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", state.theme);
  root.setAttribute("data-scheme", state.scheme);
  if (SUBTHEME_IDENTITIES.includes(state.theme)) root.setAttribute("data-subtheme", state.theme);
  else root.removeAttribute("data-subtheme");
  if (state.accent) root.setAttribute("data-accent", state.accent);
  else root.removeAttribute("data-accent");
  root.setAttribute("data-icon-style", iconStyleFor(state.theme));
  root.setAttribute("data-nav", state.nav);
  if (state.typeface === TYPEFACE_DEFAULT) root.removeAttribute("data-type");
  else root.setAttribute("data-type", state.typeface);
}

/** Clears anything pack O retired, on this device, once. */
function clearRetired(): void {
  const root = document.documentElement;
  for (const key of RETIRED_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* a device that cannot forget is a device that could not have remembered */
    }
  }
  for (const property of ["--wp-custom", "--wp-custom-2", "--wp-custom-3", "--wp-custom-rgb"]) {
    root.style.removeProperty(property);
  }
}

function persistAll(state: Omit<AppearanceState, "iconStyle" | "remembered">): boolean {
  applyToDocument(state);
  const root = document.documentElement;
  try {
    writeLocal(KEYS.theme, state.theme);
    // The resolved scheme is stored as well as the mode, so the pre-paint script in
    // index.html paints the right one before this module is even parsed.
    writeLocal(KEYS.scheme, state.scheme);
    writeLocal(KEYS.schemeMode, state.schemeMode);
    writeLocal(KEYS.accent, state.accent);
    writeLocal(KEYS.typeface, state.typeface);
    writeLocal(KEYS.nav, state.nav);
    root.toggleAttribute("data-appearance-unremembered", false);
    emitAppearance();
    return true;
  } catch {
    root.toggleAttribute("data-appearance-unremembered", true);
    emitAppearance();
    return false;
  }
}

export function applyAppearance(next: AppearancePatch): AppearanceState {
  const current = readAppearance();
  const theme = next.theme ?? current.theme;
  // An explicit light/dark choice pins the mode; `schemeMode` sets it directly.
  const schemeMode: SchemeMode = next.schemeMode ?? next.scheme ?? current.schemeMode;
  const scheme = resolveScheme(schemeMode);
  const accent: AccentChoice = next.accent !== undefined ? next.accent : current.accent;
  const typeface = next.typeface ?? current.typeface;
  const nav = next.nav ?? current.nav;
  const root = document.documentElement;

  const identityChanged =
    theme !== current.theme || scheme !== current.scheme || typeface !== current.typeface;
  if (identityChanged) root.setAttribute("data-switching", "true");

  const nextState: AppearanceState = {
    theme,
    schemeMode,
    scheme,
    accent,
    typeface,
    nav,
    iconStyle: iconStyleFor(theme),
    remembered: true
  };
  nextState.remembered = persistAll(nextState);

  if (identityChanged) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.removeAttribute("data-switching"));
    });
  }

  return nextState;
}

/**
 * Run at import time — before React's first paint — as DEFENCE, not repair.
 *
 * `index.html`'s pre-paint script now expresses pack O itself: "theme default" is the
 * absence of `data-accent`, *follow system* is resolved there, and no accent is written from
 * the retired `wp.accentHex` key, which it does not read *(owner review: OR-O20 — the
 * pre-paint script expresses theme default and resolves follow system; a load-time
 * normalization also clears the retired keys)*. What is left for this pass is what a
 * pre-paint script cannot do:
 *
 *  - **Stale keys.** A device that used this prototype before pack O still carries
 *    `wp.accentHex`, `wp.presets`, `wp.activePreset` and `wp.navPinned`, and the retired
 *    custom-hex properties may still sit on the root element. `clearRetired` forgets them
 *    once, so nothing reads a value pack O retired.
 *  - **Parity.** Re-reading the stored preferences and re-applying them here re-runs the
 *    SAME resolution the script ran, from the module that owns it. If the two ever
 *    disagree — a hand-edited key, a script that drifts from this file — the document ends
 *    up in the state this module rules rather than in the one the inline script guessed.
 */
function normalizeOnLoad(): void {
  clearRetired();
  const state = readAppearance();
  applyToDocument(state);
  // Keep the pre-paint script's inputs honest for the next visit; never create them.
  if (readLocal(KEYS.schemeMode) !== null) {
    try {
      window.localStorage.setItem(KEYS.scheme, state.scheme);
    } catch {
      /* unremembered — the attribute above is still correct for this visit */
    }
  }
}

function watchSystemScheme(): void {
  let media: MediaQueryList;
  try {
    media = window.matchMedia("(prefers-color-scheme: light)");
  } catch {
    return;
  }
  const onChange = () => {
    const current = readAppearance();
    if (current.schemeMode !== "system") return;
    applyAppearance({ schemeMode: "system" });
  };
  if (typeof media.addEventListener === "function") media.addEventListener("change", onChange);
  else if (typeof media.addListener === "function") media.addListener(onChange);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  normalizeOnLoad();
  watchSystemScheme();
}
