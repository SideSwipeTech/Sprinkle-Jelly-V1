/**
 * Sparky — the SVG character. Builds the rig once; the engine drives the
 * named nodes and `setFace()` swaps the building-block glyphs.
 *
 * Phase 1 (skeleton): flat construction, correct proportions, neutral face.
 */

import { VIEW, SHELL, VISOR, FACE, POD, TOPPER, STATUS, BADGE, SHADOW, squircle } from "./geometry.js";
import { EYES, MOUTHS, EXTRAS, GLYPHS } from "./shapes.js";

const NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) node.setAttribute(k, String(v));
  if (parent) parent.appendChild(node);
  return node;
}

export function createSparky({ size = 96 } = {}) {
  const svg = el("svg", {
    viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
    width: size, height: size * (VIEW.h / VIEW.w),
    class: "sparky", role: "img", "aria-hidden": "true", focusable: "false"
  });

  const uid = Math.random().toString(36).slice(2, 8);
  const id = (n) => `sp-${n}-${uid}`;
  const ref = (n) => `url(#${id(n)})`;
  const defs = el("defs", {}, svg);
  buildDefs(defs, id);

  const shellD = squircle(SHELL.x, SHELL.y, SHELL.w, SHELL.h, SHELL.r);
  const visorD = squircle(VISOR.x, VISOR.y, VISOR.w, VISOR.h, VISOR.r);

  // ── Rig ────────────────────────────────────────────────────────────────
  const root = el("g", { class: "sp-root" }, svg);
  // Ground shadow: a wide soft spread plus a tighter contact shadow. The engine scales both with float height.
  const shadowG = el("g", { class: "sp-shadow-g" }, root);
  const shadow = el("ellipse", { class: "sp-shadow sp-shadow--soft", cx: SHADOW.cx, cy: SHADOW.cy, rx: SHADOW.rx, ry: SHADOW.ry, filter: ref("blur6") }, shadowG);
  const shadowTight = el("ellipse", { class: "sp-shadow sp-shadow--contact", cx: SHADOW.cx, cy: SHADOW.cy - 1, rx: SHADOW.rx * 0.62, ry: SHADOW.ry * 0.55, filter: ref("blur3") }, shadowG);
  const body = el("g", { class: "sp-body", style: `transform-origin: ${SHELL.x + SHELL.w / 2}px ${SHELL.y + SHELL.h / 2}px` }, root);

  // Pods sit behind the shell.
  const podL = pod(body, POD.leftX, "l", ref);
  const podR = pod(body, POD.rightX, "r", ref);

  // Topper: socket + bolt, behind the shell's top edge.
  const topper = el("g", { class: "sp-topper", style: `transform-origin: ${TOPPER.socket.cx}px ${TOPPER.socket.cy}px` }, body);
  el("ellipse", { class: "sp-socket", cx: TOPPER.socket.cx, cy: TOPPER.socket.cy + 1, rx: TOPPER.socket.rx, ry: TOPPER.socket.ry, fill: ref("socketGrad") }, topper);
  el("ellipse", { class: "sp-socket-rim", cx: TOPPER.socket.cx, cy: TOPPER.socket.cy - 0.5, rx: TOPPER.socket.rx - 1, ry: TOPPER.socket.ry - 1.2 }, topper);
  const boltG = el("g", { class: "sp-bolt-g", transform: `translate(${TOPPER.socket.cx} ${TOPPER.socket.cy})` }, topper);
  el("path", { class: "sp-bolt-glow", d: TOPPER.bolt, filter: ref("glowWide") }, boltG);
  const bolt = el("path", { class: "sp-bolt", d: TOPPER.bolt, fill: ref("boltGrad") }, boltG);
  // Facet: the right-hand half of the bolt turns away from the light.
  el("path", { class: "sp-bolt-facet", d: TOPPER.boltFacet, fill: ref("boltFacet") }, boltG);
  el("path", { class: "sp-bolt-hi", d: TOPPER.bolt, fill: ref("boltHi"), transform: "translate(-1.4 0) scale(0.72 0.88)" }, boltG);
  el("path", { class: "sp-bolt-rim", d: TOPPER.bolt, stroke: ref("boltRim") }, boltG);

  // Shell: base gradient, inner bevel (light top-left, shadow bottom-right), ambient occlusion, rim.
  const shellClip = el("clipPath", { id: id("shellClip") }, defs); el("path", { d: shellD }, shellClip);
  el("path", { class: "sp-shell", d: shellD, fill: ref("shellGrad") }, body);
  el("path", { class: "sp-shell-sheen", d: shellD, fill: ref("shellSheen") }, body);
  const shellInner = el("g", { class: "sp-shell-inner", "clip-path": ref("shellClip") }, body);
  // Inner shadow: a thick dark stroke on the shell outline, blurred, weighted to the bottom/right by its gradient.
  el("path", { class: "sp-shell-inshadow", d: shellD, stroke: ref("inShadowGrad"), filter: ref("blur4") }, shellInner);
  // Inner light: a thinner bright stroke, top-left only.
  el("path", { class: "sp-shell-inlight", d: squircle(SHELL.x + 1.6, SHELL.y + 1.6, SHELL.w - 3.2, SHELL.h - 3.2, SHELL.r - 1.6), stroke: ref("inLightGrad"), filter: ref("blur2") }, shellInner);
  // Cast shadow of the topper onto the shell top.
  el("ellipse", { class: "sp-topper-shadow", cx: TOPPER.socket.cx + 3, cy: SHELL.y + 3, rx: TOPPER.socket.rx + 4, ry: 3.2, filter: ref("blur3") }, shellInner);
  // Contact shadows where the pods meet the shell.
  el("ellipse", { class: "sp-pod-contact", cx: SHELL.x + 2, cy: FACE.cy, rx: 5, ry: POD.h * 0.42, filter: ref("blur3") }, shellInner);
  el("ellipse", { class: "sp-pod-contact", cx: SHELL.x + SHELL.w - 2, cy: FACE.cy, rx: 5, ry: POD.h * 0.42, filter: ref("blur3") }, shellInner);
  el("path", { class: "sp-shell-ao", d: squircle(VISOR.x - 3, VISOR.y - 3, VISOR.w + 6, VISOR.h + 6, VISOR.r + 3), filter: ref("blur3") }, shellInner);
  // Specular: a soft elongated highlight on the top-left of the shell.
  el("ellipse", { class: "sp-shell-spec", cx: SHELL.x + 44, cy: SHELL.y + 8, rx: 26, ry: 3.5, filter: ref("blur3") }, shellInner);
  el("path", { class: "sp-shell-rim", d: shellD, stroke: ref("rimGrad") }, body);

  // Visor: bevel ring, glass, concave vignette, rim-overhang shadow, glass-thickness light at the bottom.
  const visor = el("g", { class: "sp-visor" }, body);
  el("path", { class: "sp-visor-bevel", d: squircle(VISOR.x - 2.2, VISOR.y - 2.2, VISOR.w + 4.4, VISOR.h + 4.4, VISOR.r + 2.2), fill: ref("bevelGrad") }, visor);
  el("path", { class: "sp-visor-glass", d: visorD, fill: ref("glassGrad") }, visor);
  const clip = el("clipPath", { id: id("clip") }, defs);
  el("path", { d: visorD }, clip);
  const glassInner = el("g", { class: "sp-glass-inner", "clip-path": ref("clip") }, visor);
  el("path", { class: "sp-visor-vignette", d: visorD, fill: ref("vignette") }, glassInner);
  el("rect", { class: "sp-visor-overhang", x: VISOR.x - 4, y: VISOR.y - 6, width: VISOR.w + 8, height: 9, filter: ref("blur3") }, glassInner);
  el("path", { class: "sp-visor-floor", d: `M ${VISOR.x + VISOR.r * 0.5} ${VISOR.y + VISOR.h - 1.4} L ${VISOR.x + VISOR.w - VISOR.r * 0.5} ${VISOR.y + VISOR.h - 1.4}`, stroke: ref("floorGrad") }, glassInner);

  // Face (clipped to the visor).
  const face = el("g", { class: "sp-face", "clip-path": ref("clip") }, body);
  const halo = el("g", { class: "sp-halo", filter: ref("haloWide") }, face);     // the LEDs' wide bleed onto the glass
  const led = el("g", { class: "sp-led", filter: ref("glow") }, face);           // everything that glows
  const look = el("g", { class: "sp-look" }, led);                               // pointer look-at offset
  const eyeL = eye(look, FACE.cx - FACE.eyeDx, FACE.cy, "l");
  const eyeR = eye(look, FACE.cx + FACE.eyeDx, FACE.cy, "r");
  const mouth = el("g", { class: "sp-mouth", transform: `translate(${FACE.cx} ${FACE.cy + FACE.mouthDy})` }, look);
  const mouthPath = el("path", { class: "sp-stroke sp-mouth-path", d: "" }, mouth);
  const extras = el("g", { class: "sp-extras", transform: `translate(${FACE.cx} ${FACE.cy})` }, look);
  const glyph = el("g", { class: "sp-glyph", transform: `translate(${FACE.cx} ${FACE.cy})` }, led);
  // Scan line — swept by the engine in the analysing / focus / debug / code modes.
  const scan = el("rect", { class: "sp-scan", x: VISOR.x, y: VISOR.y, width: VISOR.w, height: 2.4, rx: 1.2, opacity: 0 }, led);
  // The halo is a <use> of the LED group so it never drifts from the face.
  const ledId = id("ledGroup"); led.setAttribute("id", ledId);
  el("use", { href: `#${ledId}`, class: "sp-halo-use" }, halo);

  // Glass reflections — drawn after the face so they sit on top of the LEDs.
  const glossG = el("g", { class: "sp-gloss", "clip-path": ref("clip") }, body);
  el("path", { class: "sp-visor-gloss", d: glossPath(), fill: ref("glossGrad") }, glossG);
  el("path", { class: "sp-visor-gloss-soft", d: glossPath(), fill: ref("glossGrad"), filter: ref("blur3") }, glossG);
  el("path", { class: "sp-visor-gloss2", d: glossPath2(), fill: ref("glossGrad2") }, glossG);
  el("path", { class: "sp-visor-edge", d: edgeLightPath(), stroke: ref("edgeGrad") }, glossG);
  el("ellipse", { class: "sp-visor-spec", cx: VISOR.x + 34, cy: VISOR.y + 9, rx: 16, ry: 3, filter: ref("blur3") }, glossG);

  // Status light and badge.
  const status = el("circle", { class: "sp-status", cx: STATUS.cx, cy: STATUS.cy, r: STATUS.r, filter: ref("glow") }, body);
  const badge = el("g", { class: "sp-badge", transform: `translate(${BADGE.cx} ${BADGE.cy})`, opacity: 0 }, body);

  const nodes = { svg, root, shadow, shadowTight, shadowG, body, podL, podR, topper, boltG, bolt, visor, face, halo, look, eyeL, eyeR, mouth, mouthPath, extras, glyph, scan, status, badge };

  const api = {
    el: svg,
    nodes,
    setSize(px) { svg.setAttribute("width", px); svg.setAttribute("height", px * (VIEW.h / VIEW.w)); },
    /** Swap the face glyphs. shape names come from shapes.js. */
    setFace(def = {}) {
      const { eyes = ["arc", "arc"], mouth = "none", extras: ex = null, badge: bd = null, glyph: gl = null, tone = "neutral", dim = false } = def;
      const showFace = !gl;
      look.setAttribute("opacity", showFace ? 1 : 0);
      if (showFace) {
        setEyeShape(eyeL, EYES[eyes[0]] || EYES.arc);
        setEyeShape(eyeR, EYES[eyes[1]] || EYES.arc);
        const m = MOUTHS[mouth] || MOUTHS.none;
        mouthPath.setAttribute("d", m.d);
        mouthPath.classList.toggle("sp-fill", !!m.fill);
        mouthPath.classList.toggle("sp-stroke", !m.fill);
      }
      renderExtras(extras, ex);
      renderGlyph(glyph, gl);
      renderBadge(badge, bd);
      svg.dataset.tone = tone;
      svg.classList.toggle("is-dim", !!dim);
    }
  };
  api.setFace();
  return api;
}

function pod(parent, x, side, ref) {
  const g = el("g", { class: `sp-pod sp-pod--${side}` }, parent);
  // Dark cylinder body (the ring), shaded top→bottom like a turned part.
  el("path", { class: "sp-pod-ring", d: squircle(x, POD.y, POD.w, POD.h, POD.r), fill: ref("podGrad") }, g);
  el("path", { class: "sp-pod-ring-hi", d: squircle(x + 1.5, POD.y + 1.5, POD.w - 3, POD.h - 3, POD.r - 1.5), stroke: ref("podRimGrad") }, g);
  // Outer cap — the half of the pod that faces away from the head, in shell material.
  const capW = POD.w * 0.52;
  const capX = side === "l" ? x - 1 : x + POD.w - capW + 1;
  el("path", { class: "sp-pod-cap", d: squircle(capX, POD.y + 4, capW, POD.h - 8, POD.r - 3), fill: ref("shellGrad") }, g);
  el("path", { class: "sp-pod-cap-rim", d: squircle(capX, POD.y + 4, capW, POD.h - 8, POD.r - 3), stroke: ref("rimGrad") }, g);
  // Light strip on the cap.
  const lx = side === "l" ? capX + 3 : capX + capW - 3 - POD.lightW;
  el("rect", { class: "sp-pod-light", x: lx, y: POD.y + (POD.h - POD.lightH) / 2, width: POD.lightW, height: POD.lightH, rx: 1.5, filter: ref("glow") }, g);
  return g;
}

function buildDefs(defs, id) {
  const grad = (name, attrs, stops) => {
    const g = el(attrs.r !== undefined ? "radialGradient" : "linearGradient", { id: id(name), ...attrs }, defs);
    for (const [offset, cls, opacity] of stops) el("stop", { offset, class: cls, ...(opacity !== undefined ? { "stop-opacity": opacity } : {}) }, g);
    return g;
  };
  // Shell: bright top, cool grey bottom.
  grad("shellGrad", { x1: 0, y1: 0, x2: 0.15, y2: 1 }, [["0%", "sp-st-shell-top"], ["55%", "sp-st-shell-mid"], ["100%", "sp-st-shell-bot"]]);
  // A soft sheen that lifts the top-left of the shell.
  grad("shellSheen", { cx: 0.3, cy: 0.1, r: 0.9 }, [["0%", "sp-st-white", 0.55], ["45%", "sp-st-white", 0.08], ["100%", "sp-st-white", 0]]);
  grad("rimGrad", { x1: 0, y1: 0, x2: 0, y2: 1 }, [["0%", "sp-st-white", 0.9], ["40%", "sp-st-rim-mid", 0.35], ["100%", "sp-st-rim-bot", 0.9]]);
  // Inner bevel: shadow weighted to the bottom-right, light weighted to the top-left.
  grad("inShadowGrad", { x1: 0, y1: 0, x2: 0.35, y2: 1 }, [["0%", "sp-st-ink", 0], ["45%", "sp-st-ink", 0.08], ["100%", "sp-st-ink", 0.42]]);
  grad("inLightGrad", { x1: 0, y1: 0, x2: 0.4, y2: 1 }, [["0%", "sp-st-white", 0.95], ["40%", "sp-st-white", 0.25], ["100%", "sp-st-white", 0]]);
  // Visor bevel ring (dark, lit from above) and glass.
  grad("bevelGrad", { x1: 0, y1: 0, x2: 0, y2: 1 }, [["0%", "sp-st-bevel-top"], ["100%", "sp-st-bevel-bot"]]);
  grad("glassGrad", { x1: 0, y1: 0, x2: 1, y2: 1 }, [["0%", "sp-st-glass-a"], ["45%", "sp-st-glass-b"], ["100%", "sp-st-glass-c"]]);
  grad("glossGrad", { x1: 0, y1: 0, x2: 0.9, y2: 1 }, [["0%", "sp-st-white", 0.13], ["55%", "sp-st-white", 0.07], ["100%", "sp-st-white", 0.02]]);
  grad("glossGrad2", { x1: 0, y1: 0, x2: 1, y2: 1 }, [["0%", "sp-st-white", 0.05], ["100%", "sp-st-white", 0]]);
  // Concave glass: darker toward the edges, a touch lighter at the centre.
  grad("vignette", { cx: 0.5, cy: 0.5, r: 0.72 }, [["0%", "sp-st-white", 0.03], ["60%", "sp-st-ink", 0], ["100%", "sp-st-ink", 0.5]]);
  grad("floorGrad", { x1: 0, y1: 0, x2: 1, y2: 0 }, [["0%", "sp-st-white", 0], ["50%", "sp-st-white", 0.16], ["100%", "sp-st-white", 0]]);
  grad("edgeGrad", { x1: 0, y1: 0, x2: 1, y2: 0 }, [["0%", "sp-st-white", 0], ["25%", "sp-st-white", 0.45], ["60%", "sp-st-white", 0.2], ["100%", "sp-st-white", 0]]);
  // LEDs: a lighter core with the identity colour at the edges.
  grad("ledGrad", { x1: 0, y1: 0, x2: 0, y2: 1 }, [["0%", "sp-st-led-soft"], ["100%", "sp-st-led"]]);
  // Bolt: glossy blue, lit top-left.
  grad("boltGrad", { x1: 0, y1: 0, x2: 0.6, y2: 1 }, [["0%", "sp-st-bolt-top"], ["55%", "sp-st-bolt-mid"], ["100%", "sp-st-bolt-bot"]]);
  grad("boltHi", { x1: 0, y1: 0, x2: 0, y2: 1 }, [["0%", "sp-st-white", 0.85], ["50%", "sp-st-white", 0.15], ["100%", "sp-st-white", 0]]);
  grad("boltFacet", { x1: 0, y1: 0, x2: 0, y2: 1 }, [["0%", "sp-st-ink", 0.08], ["100%", "sp-st-ink", 0.34]]);
  grad("boltRim", { x1: 0, y1: 0, x2: 1, y2: 1 }, [["0%", "sp-st-white", 0.7], ["60%", "sp-st-white", 0.1], ["100%", "sp-st-white", 0]]);
  grad("socketGrad", { cx: 0.5, cy: 0.2, r: 0.8 }, [["0%", "sp-st-socket-hi"], ["100%", "sp-st-socket"]]);
  // Pods.
  grad("podGrad", { x1: 0, y1: 0, x2: 0, y2: 1 }, [["0%", "sp-st-pod-top"], ["50%", "sp-st-pod-mid"], ["100%", "sp-st-pod-bot"]]);
  grad("podRimGrad", { x1: 0, y1: 0, x2: 0, y2: 1 }, [["0%", "sp-st-white", 0.35], ["100%", "sp-st-white", 0]]);
  grad("capShade", { x1: 0, y1: 0, x2: 0, y2: 1 }, [["0%", "sp-st-white", 0.5], ["35%", "sp-st-white", 0], ["70%", "sp-st-ink", 0], ["100%", "sp-st-ink", 0.35]]);

  const blur = (name, sd) => { const f = el("filter", { id: id(name), x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs); el("feGaussianBlur", { stdDeviation: sd }, f); };
  blur("blur2", 1.6); blur("blur3", 2.4); blur("blur4", 3.2); blur("blur6", 5);

  const glow = (name, sd, strength) => {
    const f = el("filter", { id: id(name), x: "-50%", y: "-50%", width: "200%", height: "200%", "color-interpolation-filters": "sRGB" }, defs);
    el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: sd, result: "b" }, f);
    const m = el("feMerge", {}, f);
    for (let i = 0; i < strength; i++) el("feMergeNode", { in: "b" }, m);
    el("feMergeNode", { in: "SourceGraphic" }, m);
  };
  glow("glow", 2.2, 2);
  glow("glowWide", 4, 2);
}

/** A second, thinner reflection streak parallel to the main one, lower-left. */
function glossPath2() {
  const { x, y, w, h } = VISOR;
  return `M ${x + w * 0.74} ${y - 4} L ${x + w * 0.82} ${y - 4} L ${x + w * 0.48} ${y + h + 4} L ${x + w * 0.40} ${y + h + 4} Z`;
}

/** A bright hairline along the inner top edge of the glass. */
function edgeLightPath() {
  const { x, y, w, r } = VISOR;
  return `M ${x + r * 0.55} ${y + 1.6} L ${x + w - r * 0.55} ${y + 1.6}`;
}

function eye(parent, cx, cy, side) {
  const g = el("g", { class: `sp-eye sp-eye--${side}`, transform: `translate(${cx} ${cy})` }, parent);
  const scale = el("g", { class: "sp-eye-scale" }, g);   // blink squashes this
  const shape = el("path", { class: "sp-stroke sp-eye-shape", d: "" }, scale);
  const dot = el("circle", { class: "sp-fill sp-eye-dot", r: 3, opacity: 0 }, scale);
  g._shape = shape; g._dot = dot; g._scale = scale;
  return g;
}

function setEyeShape(eyeG, def) {
  const { _shape: shape, _dot: dot } = eyeG;
  shape.setAttribute("d", def.d || "");
  shape.classList.toggle("sp-fill", !!def.fill);
  shape.classList.toggle("sp-stroke", !def.fill);
  shape.style.strokeWidth = def.width ? `${def.width}px` : "";
  if (def.dotAt) { dot.setAttribute("cx", def.dotAt[0]); dot.setAttribute("cy", def.dotAt[1]); dot.setAttribute("opacity", 1); }
  else dot.setAttribute("opacity", 0);
}

function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }

function renderExtras(g, kind) {
  clear(g);
  if (kind === "zz") {
    for (const z of EXTRAS.zz) el("path", { class: "sp-stroke sp-zz", d: z.d, transform: `translate(${z.x} ${z.y}) scale(${z.s})`, style: "stroke-width:2.6px" }, g);
  } else if (kind === "sparkles") {
    const pts = [[-64, -30, 1], [62, -34, 0.8], [-58, 26, 0.7], [66, 22, 1.1], [0, -40, 0.6]];
    for (const [x, y, s] of pts) el("path", { class: "sp-fill sp-sparkle", d: "M 0 -6 Q 1 -1 6 0 Q 1 1 0 6 Q -1 1 -6 0 Q -1 -1 0 -6 Z", transform: `translate(${x} ${y}) scale(${s})` }, g);
  }
}

function renderGlyph(g, name) {
  clear(g);
  if (!name) return;
  const def = GLYPHS[name];
  if (!def) return;
  if (def.kind === "spinner") {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      el("circle", { class: "sp-fill sp-spin-dot", cx: Math.cos(a) * 16, cy: Math.sin(a) * 16, r: 3.2, opacity: 0.25 + 0.75 * (i / 7) }, g);
    }
    return;
  }
  if (def.kind === "dots") {
    for (let i = -1; i <= 1; i++) el("circle", { class: "sp-fill sp-typing-dot", cx: i * 13, cy: 0, r: 4.2 }, g);
    return;
  }
  el("path", { class: "sp-stroke sp-glyph-path", d: def.d, style: "stroke-width:4px", "data-tone": def.tone || "" }, g);
  if (def.dotAt) el("circle", { class: "sp-fill", cx: def.dotAt[0], cy: def.dotAt[1], r: 3 }, g);
}

function renderBadge(g, kind) {
  clear(g);
  if (!kind) { g.setAttribute("opacity", 0); return; }
  g.setAttribute("opacity", 1);
  el("circle", { class: `sp-badge-bg sp-badge-bg--${kind}`, r: 9.5 }, g);
  const marks = {
    info: "M 0 -1 L 0 4.5 M 0 -4.5 L 0 -4",
    check: "M -4.5 0 L -1.5 3 L 4.5 -3",
    triangle: "M 0 -5.5 L 5.5 4 L -5.5 4 Z M 0 -1.5 L 0 1 M 0 2.6 L 0 2.9",
    alert: "M 0 -4 L 0 1.5 M 0 3.8 L 0 4.2"
  };
  el("path", { class: "sp-badge-mark", d: marks[kind] || marks.info }, g);
}

/** A soft diagonal reflection band across the glass: wide at the top-left, tapering down-right. */
function glossPath() {
  const { x, y, w, h } = VISOR;
  return `M ${x - 4} ${y - 4} L ${x + w * 0.66} ${y - 4} L ${x + w * 0.33} ${y + h + 4} L ${x - 4} ${y + h + 4} Z`;
}
