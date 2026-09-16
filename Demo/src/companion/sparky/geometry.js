/**
 * Sparky geometry — one place for every number that shapes the character.
 *
 * The viewBox is 240 × 200. The head is centred at x = 120; the visor's
 * vertical midline (y = 112) is the face baseline the eyes sit on. Every
 * proportion below was measured off the reference close-up
 * (docs/ref/closeup.png): shell 1015 × 615, visor 875 × 490 inset 70 / 85 / 40,
 * eyes on the visor midline at ±0.217 of the visor width, arc width 0.183 of
 * the visor width, stroke 0.032.
 */

export const VIEW = { w: 240, h: 200 };

export const SHELL = { x: 20, y: 46, w: 200, h: 122, r: 50 };

export const VISOR = { x: 34, y: 63, w: 172, h: 98, r: 30 };

export const FACE = {
  cx: 120,
  cy: VISOR.y + VISOR.h / 2, // 112
  eyeDx: 37,                 // eye centre offset from the face centre
  eyeR: 16.5,                // arc radius
  eyeStroke: 6,
  mouthDy: 22                // mouth baseline below the eye line
};

export const POD = {
  w: 26, h: 64, r: 12,
  y: FACE.cy - 32,
  leftX: 0,                  // left pod spans 0..26 (half tucked under the shell edge)
  rightX: 214,               // right pod spans 214..240
  lightW: 3.4, lightH: 30
};

export const TOPPER = {
  socket: { cx: 120, cy: 47, rx: 19, ry: 4.5 },
  // Lightning bolt, drawn point-down into the socket. Local coords, origin at socket centre.
  bolt: "M 7 -50 L -12 -20 L -2 -20 L -9 0 L 12 -31 L 2 -31 Z",
  // The facet is the bolt's right-hand face: from the tip down the right edge to the lower notch.
  boltFacet: "M 7 -50 L 2 -31 L 12 -31 L -9 0 L -1 -22 L 2 -31 L 4 -38 Z"
};

export const STATUS = { cx: VISOR.x + 18, cy: SHELL.y + SHELL.h - 3.6, r: 2.1 };

export const BADGE = { cx: SHELL.x + SHELL.w - 14, cy: SHELL.y + 14, r: 10 };

export const SHADOW = { cx: 120, cy: 182, rx: 78, ry: 7 };

/** Rounded-rectangle path (squircle-leaning: corner handles pulled past the circle constant). */
export function squircle(x, y, w, h, r, k = 0.58) {
  const c = r * (1 - k); // handle distance from the corner along each edge
  const right = x + w, bottom = y + h;
  return [
    `M ${x + r} ${y}`,
    `L ${right - r} ${y}`,
    `C ${right - c} ${y} ${right} ${y + c} ${right} ${y + r}`,
    `L ${right} ${bottom - r}`,
    `C ${right} ${bottom - c} ${right - c} ${bottom} ${right - r} ${bottom}`,
    `L ${x + r} ${bottom}`,
    `C ${x + c} ${bottom} ${x} ${bottom - c} ${x} ${bottom - r}`,
    `L ${x} ${y + r}`,
    `C ${x} ${y + c} ${x + c} ${y} ${x + r} ${y}`,
    "Z"
  ].join(" ");
}
