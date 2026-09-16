/**
 * Expression presets. Each is data: which eye glyph on each side, which mouth,
 * optional extras (zz, sparkles), an optional badge at the shell corner, an
 * optional system glyph that replaces the face, and an optional tone that
 * tints the LEDs (neutral · informational · encouraging · warning · serious,
 * plus the sheet's success / error accents).
 *
 * CANON is the closed nine of AST-R13. SHEET is the reference's 16 emotional
 * cells, kept for fidelity to the artwork. STATES are the reference's system
 * cells minus the audio ones (listening, speaking) — excluded by AST-DR-02.
 */

export const EXPRESSIONS = {
  // ── Canon nine ───────────────────────────────────────────────────────
  neutral:       { eyes: ["arc", "arc"],         mouth: "none" },
  attentive:     { eyes: ["wide", "wide"],       mouth: "none",  lean: 1 },
  thinking:      { eyes: ["barDot", "barDot"],   mouth: "line",  tilt: -4 },
  informational: { eyes: ["arc", "arc"],         mouth: "none",  badge: "info" },
  encouraging:   { eyes: ["arc", "arc"],         mouth: "smile", tone: "encouraging" },
  success:       { eyes: ["upArc", "upArc"],     mouth: "smile", badge: "check", tone: "success" },
  celebration:   { eyes: ["star", "star"],       mouth: "grin",  extras: "sparkles", tone: "celebration" },
  warning:       { eyes: ["flat", "flat"],       mouth: "line",  badge: "triangle", tone: "warning" },
  serious:       { eyes: ["bar", "bar"],         mouth: "line",  tone: "serious", calm: true },

  // ── Reference sheet, §2 emotional expressions ────────────────────────
  happy:      { eyes: ["upArc", "upArc"],   mouth: "smile" },
  excited:    { eyes: ["caret", "caret"],   mouth: "none" },
  wink:       { eyes: ["wink", "circle"],   mouth: "none" },
  curious:    { eyes: ["browDot", "circle"], mouth: "none", tilt: 3 },
  confused:   { eyes: ["spiral", "spiral"], mouth: "none" },
  surprised:  { eyes: ["circle", "circle"], mouth: "o" },
  focused:    { eyes: ["bar", "bar"],       mouth: "none" },
  proud:      { eyes: ["upArc", "upArc"],   mouth: "grin" },
  sleepy:     { eyes: ["lidDown", "lidDown"], mouth: "line", extras: "zz", dim: true },
  sad:        { eyes: ["downArc", "downArc"], mouth: "frown" },
  love:       { eyes: ["heart", "heart"],   mouth: "smile" },
  playful:    { eyes: ["arc", "arc"],       mouth: "tongue" },
  reassure:   { eyes: ["arc", "arc"],       mouth: "smile" },
  determined: { eyes: ["angryL", "angryR"], mouth: "none" },

  // ── Reference sheet, §3 system states (audio rows excluded) ──────────
  loading:      { glyph: "loading" },
  typing:       { glyph: "typing" },
  analyzing:    { glyph: "analyzing" },
  "success ✓":  { glyph: "success",   tone: "success" },
  "warning ⚠":  { glyph: "warning",   tone: "warning" },
  error:        { glyph: "error",     tone: "error" },
  offline:      { glyph: "offline",   dim: true },
  charging:     { glyph: "charging" },
  "low energy": { glyph: "lowEnergy", tone: "error" },
  "code mode":  { glyph: "code" },
  "teach mode": { glyph: "teach" },
  "focus mode": { glyph: "focus" },
  "debug mode": { glyph: "debug" },
  notification: { glyph: "bell",      badge: "alert" }
};

export const CANON = ["neutral", "attentive", "thinking", "informational", "encouraging", "success", "celebration", "warning", "serious"];
export const SHEET = ["neutral", "happy", "excited", "wink", "curious", "thinking", "confused", "surprised", "focused", "proud", "sleepy", "sad", "love", "playful", "reassure", "determined"];
export const STATES = ["loading", "typing", "analyzing", "success ✓", "warning ⚠", "error", "offline", "charging", "low energy", "code mode", "teach mode", "focus mode", "debug mode", "notification"];
