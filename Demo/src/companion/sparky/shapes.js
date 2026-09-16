/**
 * Face building blocks — the eye and mouth vocabulary from the reference sheet
 * (§4 "UI building blocks"). Every shape is drawn in a local box centred on
 * (0, 0); eyes are ~31 wide, mouths ~28 wide. Stroked shapes use the face
 * stroke; filled shapes are flagged `fill: true`.
 *
 * `arc` is parametric: curvature k ∈ [-1, 1] bends the same path from a full
 * up-arc (k = 1, the resting "n") through flat (k = 0) to a down-arc (k = -1),
 * which lets the engine tween between those three with one number instead of
 * swapping assets.
 */

const R = 16.5;

/** Archimedean spiral, ~2.5 turns, radius growing to 12. */
function spiralPath() {
  const pts = [];
  const turns = 2.5, steps = 60, rMax = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, a = t * turns * Math.PI * 2, r = 1.2 + (rMax - 1.2) * t;
    pts.push(`${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`);
  }
  return "M " + pts.join(" L ");
}

/** Arc eye: k = 1 up-arc (resting), 0 flat, -1 down-arc. Returns a path d. */
export function arcPath(k = 1, r = R) {
  const x = r, lift = 10 * k;        // endpoint y; the arc's crown sits at -lift above the ends
  // Two cubic halves so the curve stays smooth through the tween.
  const h = r * 0.72;                // handle length
  const topY = -r * 0.95 * k;
  return `M ${-x} ${lift * 0.3} C ${-x} ${topY * 0.55 + lift * 0.3} ${-h} ${topY} 0 ${topY} C ${h} ${topY} ${x} ${topY * 0.55 + lift * 0.3} ${x} ${lift * 0.3}`;
}

export const EYES = {
  arc:      { d: arcPath(1) },                                    // resting "n"
  upArc:    { d: arcPath(1.15) },                                 // taller, happier
  downArc:  { d: arcPath(-1) },                                   // "u", sad / sleepy lid
  flat:     { d: arcPath(0) },
  bar:      { d: "M -13 0 L 13 0", width: 8 },                     // focused — thick bar
  caret:    { d: "M -13 7 L 0 -8 L 13 7" },                       // excited "^"
  circle:   { d: "M 0 -10 A 10 10 0 1 1 0 10 A 10 10 0 1 1 0 -10" },
  wide:     { d: "M 0 -12.5 A 12.5 12.5 0 1 1 0 12.5 A 12.5 12.5 0 1 1 0 -12.5" },
  dot:      { d: "M 0 -5 A 5 5 0 1 1 0 5 A 5 5 0 1 1 0 -5", fill: true },
  wink:     { d: "M -12 -7 L 10 0 L -12 7" },                     // ">" closed eye
  winkL:    { d: "M 12 -7 L -10 0 L 12 7" },                      // "<" mirror
  halfLid:  { d: "M -14 -2 L 14 -2 M -12 4 C -6 10 6 10 12 4" }, // lid line over a small smile-arc
  squint:   { d: "M -12 0 C -6 -5 6 -5 12 0" },
  // Spiral: 2.5 turns drawn as an Archimedean polyline (thin stroke so it stays open at 48px).
  spiral:   { d: spiralPath(), width: 3.6 },
  heart:    { d: "M 0 9 C -8 3 -14 -2 -14 -8 C -14 -13 -10 -16 -6 -16 C -3 -16 -1 -14 0 -12 C 1 -14 3 -16 6 -16 C 10 -16 14 -13 14 -8 C 14 -2 8 3 0 9 Z", fill: true },
  star:     { d: "M 0 -13 L 3.6 -4.2 L 13 -4 L 5.6 2 L 8 11.2 L 0 6 L -8 11.2 L -5.6 2 L -13 -4 L -3.6 -4.2 Z", fill: true },
  // Determined — angled lids: a wedge that thins toward the centre. Drawn filled.
  angryL:   { d: "M -14 -8 L 13 1 L 13 8 L -14 -1 Z", fill: true },
  angryR:   { d: "M 14 -8 L -13 1 L -13 8 L 14 -1 Z", fill: true },
  // Curious — a small raised arc with a dot under it (left eye of the reference cell 05).
  browDot:  { d: "M -8 -6 C -4 -11 4 -11 8 -6 M 0 4 A 3 3 0 1 1 0.01 4", fill: false, dotAt: [0, 4] },
  // Thinking — flat bar with a dot beneath (reference cell 06).
  barDot:   { d: "M -11 -5 L 11 -5", dotAt: [0, 5] },
  lidDown:  { d: "M -13 0 C -8 5 8 5 13 0" },                     // sleepy closed lid
  none:     { d: "" }
};

export const MOUTHS = {
  none:   { d: "" },
  smile:  { d: "M -10 -3 C -6 4 6 4 10 -3" },
  grin:   { d: "M -11 -4 C -8 6 8 6 11 -4 Z", fill: true },
  open:   { d: "M -5 -4 L 5 -4 L 5 4 L -5 4 Z", fill: true, rx: 3 },
  o:      { d: "M 0 -5 A 5 5 0 1 1 0 5 A 5 5 0 1 1 0 -5" },
  line:   { d: "M -7 0 L 7 0" },
  smirk:  { d: "M -9 1 C -3 4 5 2 10 -4" },
  tongue: { d: "M -8 -5 L 8 -5 C 8 3 -8 3 -8 -5 Z M -3 -1 C -3 6 3 6 3 -1", fill: true },
  wave:   { d: "M -12 0 L -9 -4 L -6 4 L -3 -4 L 0 4 L 3 -4 L 6 4 L 9 -4 L 12 0" },
  frown:  { d: "M -10 3 C -6 -4 6 -4 10 3" },
  pulse:  { d: "M -12 0 L -6 0 L -3 -5 L 1 5 L 4 0 L 12 0" }
};

/** Extras drawn in the face group at given offsets (zz, sparkles, hearts). */
export const EXTRAS = {
  zz: [
    { d: "M 0 0 L 6 0 L 0 6 L 6 6", x: 46, y: -22, s: 1.4 },
    { d: "M 0 0 L 6 0 L 0 6 L 6 6", x: 58, y: -38, s: 2 }
  ]
};

/** System-state glyphs that replace the face (reference §3). Drawn centred, ~44 wide. */
export const GLYPHS = {
  loading:   { kind: "spinner" },
  typing:    { kind: "dots" },
  analyzing: { d: "M 0 -16 A 16 16 0 1 1 -0.01 -16 M 0 -9 A 9 9 0 1 1 -0.01 -9 M 0 -22 L 0 -13 M 0 13 L 0 22 M -22 0 L -13 0 M 13 0 L 22 0", dotAt: [0, 0] },
  success:   { d: "M 0 -17 A 17 17 0 1 1 -0.01 -17 M -8 0 L -2.5 5.5 L 8 -6", tone: "success" },
  warning:   { d: "M 0 -17 L 18 14 L -18 14 Z M 0 -4 L 0 4 M 0 9 L 0 9.5", tone: "warning" },
  error:     { d: "M 0 -17 A 17 17 0 1 1 -0.01 -17 M -7 -7 L 7 7 M 7 -7 L -7 7", tone: "error" },
  offline:   { d: "M 0 -17 A 17 17 0 1 1 -0.01 -17 M -12 -12 L 12 12", tone: "neutral" },
  charging:  { d: "M -20 -10 L 16 -10 L 16 10 L -20 10 Z M 16 -4 L 20 -4 L 20 4 L 16 4 M 2 -7 L -5 1 L -1 1 L -3 7 L 5 -1 L 1 -1 Z" },
  lowEnergy: { d: "M -20 -10 L 16 -10 L 16 10 L -20 10 Z M 16 -4 L 20 -4 L 20 4 L 16 4 M -16 -6 L -10 -6 L -10 6 L -16 6 Z", tone: "error" },
  code:      { d: "M -10 -10 L -20 0 L -10 10 M 10 -10 L 20 0 L 10 10 M 4 -14 L -4 14" },
  teach:     { d: "M 0 -12 L -22 -3 L 0 6 L 22 -3 Z M -12 1 L -12 9 C -12 14 12 14 12 9 L 12 1 M 22 -3 L 22 8" },
  focus:     { d: "M 0 -18 A 18 18 0 1 1 -0.01 -18 M 0 -24 L 0 -12 M 0 12 L 0 24 M -24 0 L -12 0 M 12 0 L 24 0", dotAt: [0, 0] },
  debug:     { d: "M 0 -8 A 9 9 0 0 1 9 1 L 9 6 A 9 9 0 0 1 -9 6 L -9 1 A 9 9 0 0 1 0 -8 Z M -4 -12 L -2 -8 M 4 -12 L 2 -8 M -9 1 L -16 -3 M 9 1 L 16 -3 M -9 6 L -16 10 M 9 6 L 16 10 M 0 -8 L 0 15" },
  bell:      { d: "M -9 8 L 9 8 L 9 4 C 9 -2 8 -10 0 -12 C -8 -10 -9 -2 -9 4 Z M -3 11 C -3 14 3 14 3 11 M 0 -16 L 0 -12", badge: true }
};
