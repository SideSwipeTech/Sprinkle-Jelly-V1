/**
 * SparkyEngine — one requestAnimationFrame drives everything.
 *
 *   springs  (continuous)  head · eyes · bolt lag · expression pose · pops · lifecycle
 *   drivers  (always on)   float + breath · blink · idle glance · pointer look-at · bolt breath · pod / status pulse
 *   tweens   (one-shot)    lid transitions, gestures, reactions, particles
 *   glyphs   (state)       spinner rotation, typing dots, scan line
 *
 * Each frame: rest pose → drivers set spring targets and add ambient motion →
 * springs integrate → tweens add → commit(). Nothing writes to the DOM except
 * commit(), so two systems can never fight over one attribute: they sum into
 * the same channel.
 *
 * Why springs: a continuous channel (where the head is looking, how far it
 * leans) can be retargeted at any moment — a glance interrupted by the pointer,
 * an expression changed mid-settle — and the motion stays continuous instead of
 * restarting. Eyes are stiff and lead; the head is softer and follows; the bolt
 * is under-damped and lags the head, which is what reads as mass.
 *
 * Reduced motion (OS signal or setReducedMotion(true)): drivers freeze at rest,
 * springs snap, transitions are instant, particles are skipped. Expressions,
 * tones and badges still change — motion is removed, communication is not
 * (AST-R13).
 */

import { EXPRESSIONS } from "./expressions.js";
import { arcPath } from "./shapes.js";
import { FACE, BADGE, VISOR } from "./geometry.js";

// ── Easing ────────────────────────────────────────────────────────────────
const E = {
  linear: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  inQuad: (t) => t * t,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  backSoft: (t) => { const c = 0.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  pulse2: (t) => Math.abs(Math.sin(t * Math.PI * 2)) * (1 - t * 0.4)  // two pulses, settling
};

/** A damped spring: x follows target; k = stiffness, c = damping. Integrated in ≤1/240 s substeps for stability. */
class Spring {
  constructor(k, c, x = 0) { this.k = k; this.c = c; this.x = x; this.v = 0; this.target = x; }
  update(dt) {
    let remaining = dt;
    while (remaining > 0) {
      const h = Math.min(remaining, 1 / 240);
      const a = this.k * (this.target - this.x) - this.c * this.v;
      this.v += a * h;
      this.x += this.v * h;
      remaining -= h;
    }
    return this.x;
  }
  snap(v = this.target) { this.x = v; this.v = 0; this.target = v; }
}

const ARC_K = { arc: 1, upArc: 1.15, flat: 0, downArc: -1 };   // shapes the arc morph covers
const NO_BLINK = new Set(["wink", "winkL", "lidDown", "angryL", "angryR", "bar", "none", "spiral", "heart", "star"]);

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

export class SparkyEngine {
  constructor(rig, { reducedMotion = null, pointerTracking = true } = {}) {
    this.rig = rig;
    this.n = rig.nodes;
    this.expression = "neutral";
    this.def = EXPRESSIONS.neutral;
    this.tweens = [];
    this.t = 0;
    this.last = 0;
    this.running = false;
    this.visible = true;
    this.suppressed = false;
    this.asleep = false;
    this.pointer = { x: 0, y: 0, active: false };
    this.pointerTracking = pointerTracking;
    this.mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.coarse = window.matchMedia("(pointer: coarse)").matches;
    this.forcedRM = reducedMotion;
    this.timeScale = 1;            // lab slow-motion; 1 = real time
    this.listeners = [];
    // Springs — stiff eyes lead, softer head follows, under-damped bolt lags.
    this.s = {
      eyeX: new Spring(260, 24), eyeY: new Spring(260, 24),
      head: new Spring(80, 12),            // degrees
      bolt: new Spring(150, 7),            // degrees of lag, driven by head angular velocity
      lean: new Spring(110, 15), tilt: new Spring(110, 15), scale: new Spring(140, 16, 1),
      mouth: new Spring(240, 14, 1), badge: new Spring(220, 12, 1), glyph: new Spring(180, 14, 1),
      life: new Spring(110, 11, 1), lifeOpacity: new Spring(160, 22, 1)
    };
    this.blink = { next: rand(1.5, 4), t: -1, dur: 0.16, double: false, dip: 0 };
    this.glance = { next: rand(4, 9), t: -1, dur: 1.6, x: 0, y: 0, tilt: 0 };
    this.arcK = [1, 1];
    this._lid = 1;
    this._prevFloatY = 0;
    this.log = () => {};
    this._bindPointer();
    this._bindVisibility();
  }

  // ── Public API ──────────────────────────────────────────────────────────
  get reducedMotion() { return this.forcedRM ?? this.mq.matches; }
  setReducedMotion(v) { this.forcedRM = v; if (this.reducedMotion) { this.tweens = []; for (const s of Object.values(this.s)) s.snap(); this._lid = 1; this._commit(this._restPose()); } }
  setPointerTracking(v) { this.pointerTracking = v; }

  start() { if (!this.running) { this.running = true; this.last = performance.now(); this._raf = requestAnimationFrame((now) => this._frame(now)); } return this; }
  stop() { this.running = false; cancelAnimationFrame(this._raf); return this; }
  destroy() { this.stop(); this.listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn)); this._io?.disconnect(); }

  /** Change the expression. Arc→arc changes morph; everything else blink-swaps. */
  setExpression(name, { instant = false } = {}) {
    const def = EXPRESSIONS[name];
    if (!def) return;
    const prev = this.def;
    this.expression = name;
    this.def = def;
    this.asleep = name === "sleepy" || name === "offline";
    if (instant || this.reducedMotion) { this._applyFace(def); this.arcK = (def.eyes || ["arc", "arc"]).map((e) => ARC_K[e] ?? 1); this._poseTo(def, true); this.log(`expression ${name} (instant)`); return; }

    const morphable = !def.glyph && !prev.glyph && def.eyes.every((e) => e in ARC_K) && prev.eyes.every((e) => e in ARC_K);
    if (morphable) {
      // Morph the arcs with a soft overshoot; mouth and badge pop.
      const from = [...this.arcK], to = def.eyes.map((e) => ARC_K[e]);
      this._tween("arcMorph", 0.36, E.backSoft, (p) => {
        this.arcK = [lerp(from[0], to[0], p), lerp(from[1], to[1], p)];
        this.n.eyeL._shape.setAttribute("d", arcPath(this.arcK[0]));
        this.n.eyeR._shape.setAttribute("d", arcPath(this.arcK[1]));
      });
      this._applyFace(def, { eyes: false });
      this.s.mouth.x = 0.5; this.s.mouth.v = 4;
    } else {
      // Blink-swap: lids close fast, the glyph swaps behind them, lids open with a small overshoot.
      this._tween("blinkSwap", 0.3, E.linear, (p) => {
        if (p < 0.38) this._lid = 1 - E.inQuad(p / 0.38) * 0.93;
        else if (p < 0.46) this._lid = 0.07;
        else this._lid = 0.07 + E.back((p - 0.46) / 0.54) * 0.93;
      }, {
        at: [[0.42, () => { this._applyFace(def); this.arcK = (def.eyes || ["arc", "arc"]).map((e) => ARC_K[e] ?? 1); }]],
        done: () => { this._lid = 1; }
      });
      if (def.glyph || prev.glyph) { this.s.glyph.x = 0.6; this.s.glyph.v = 5; }
    }
    this._poseTo(def);
    this.log(`expression ${name}`);
  }

  /** One-shot gestures on the gesture layer. */
  play(gesture) {
    if (this.reducedMotion) return;
    const g = GESTURES[gesture];
    if (!g) return;
    g(this);
    this.log(`gesture ${gesture}`);
  }

  /** Reactions: interrupt current gestures, set the matching expression, add a flourish. */
  react(kind) {
    const r = REACTIONS[kind];
    if (!r) return;
    this.tweens = this.tweens.filter((t) => t.layer !== "gesture" && t.layer !== "reaction");
    this._clearGesture();
    r(this);
    this.log(`reaction ${kind}`);
  }

  /** Lifecycle. */
  enter() {
    this.suppressed = false; this.rig.el.style.visibility = "";
    if (this.reducedMotion) { this.s.life.snap(1); this.s.lifeOpacity.snap(1); return; }
    this.s.life.x = 0.55; this.s.life.v = 0; this.s.life.target = 1;
    this.s.lifeOpacity.x = 0; this.s.lifeOpacity.target = 1;
    this._flashBolt(1.2);
  }
  leave(then) {
    const end = () => { this.rig.el.style.visibility = "hidden"; this.s.life.snap(1); this.s.lifeOpacity.snap(1); then?.(); };
    if (this.reducedMotion) return end();
    this.s.life.target = 0.6; this.s.lifeOpacity.target = 0;
    this._tween("leave", 0.34, E.linear, () => {}, { layer: "life", done: end });
  }
  suppress() { this.suppressed = true; this.leave(); }
  restore() { this.enter(); }
  sleep() { this.setExpression("sleepy"); }
  wake() { this.setExpression("neutral"); this.play("stretch"); }

  // ── Frame ───────────────────────────────────────────────────────────────
  _frame(now) {
    if (!this.running) return;
    const dt = clamp((now - this.last) / 1000, 0, 0.05) * this.timeScale;
    this.last = now;
    if (this.visible) {
      this.t += dt;
      const pose = this._restPose();
      if (!this.reducedMotion) { this._drivers(pose, dt); this._integrate(dt); }
      this._runTweens(dt);
      this._commit(pose);
    }
    this._raf = requestAnimationFrame((n) => this._frame(n));
  }

  _restPose() {
    return { x: 0, y: 0, rot: 0, sx: 1, sy: 1, lookX: 0, lookY: 0, lid: this._lid, squint: 1, boltGlow: 0.5, boltRot: 0, pods: 0.85, status: 0.8, mouth: 1, glyphRot: 0, scanY: VISOR.y, scanOpacity: 0 };
  }

  _drivers(pose, dt) {
    const t = this.t, s = this.s;
    const calm = !!this.def.calm;
    const slow = this.asleep ? 0.45 : 1;

    // Float: two incommensurate sines, a slow horizontal drift, and a lean that follows vertical velocity.
    const amp = calm ? 0.5 : 1;
    const fy = (Math.sin(t * 0.9 * slow) * 2.2 + Math.sin(t * 0.37 * slow + 1.3) * 0.9) * amp;
    const vy = dt > 0 ? (fy - this._prevFloatY) / dt : 0;
    this._prevFloatY = fy;
    pose.y += fy;
    pose.x += Math.sin(t * 0.23 + 0.8) * 0.7 * amp;
    pose.rot += Math.sin(t * 0.52 * slow + 0.6) * 0.6 * amp - vy * 0.12 * amp;   // lean into the rise
    // Breath: a barely-there scale.
    const breath = 1 + 0.006 * Math.sin(t * 1.1 * slow);
    pose.sx *= breath; pose.sy *= 2 - breath;

    // Bolt breathes; pods and status pulse on their own cycles.
    pose.boltGlow = 0.42 + 0.2 * smooth(0.5 + 0.5 * Math.sin(t * 1.3));
    pose.pods = 0.72 + 0.2 * smooth(0.5 + 0.5 * Math.sin(t * 0.77 + 2));
    const statusRate = this.def.glyph === "loading" || this.expression === "thinking" ? 5 : 1.6;
    pose.status = 0.55 + 0.45 * smooth(0.5 + 0.5 * Math.sin(t * statusRate));
    pose.mouth = 1 + 0.035 * Math.sin(t * 1.9);

    // Blink: fast close, brief hold, slower open with a touch of overshoot; a squint and a micro head-dip ride along.
    const b = this.blink;
    if (b.t < 0) { b.next -= dt; if (b.next <= 0 && this._canBlink()) { b.t = 0; b.double = Math.random() < 0.18; b.dur = b.double ? 0.34 : rand(0.13, 0.17); } }
    else {
      b.t += dt;
      const p = b.t / b.dur;
      if (p >= 1) { b.t = -1; b.next = this.asleep ? rand(6, 10) : rand(2.2, 5.5); }
      else {
        const single = (q) => (q < 0.38 ? 1 - E.inQuad(q / 0.38) : q < 0.48 ? 0 : E.backSoft((q - 0.48) / 0.52));
        const v = clamp(b.double ? (p < 0.5 ? single(p * 2) : single((p - 0.5) * 2)) : single(p), 0, 1.05);
        pose.lid *= 0.06 + 0.94 * v;
        pose.squint = 1 + 0.05 * (1 - Math.min(v, 1));
        pose.y += 0.6 * (1 - Math.min(v, 1));
      }
    }

    // Idle glance: set the eye and head targets, hold, release. The springs make the motion.
    const g = this.glance;
    let glanceX = 0, glanceY = 0, glanceTilt = 0;
    if (g.t < 0) { g.next -= dt; if (g.next <= 0 && !this.asleep && !this.pointer.active) { g.t = 0; g.x = rand(3.5, 6) * (Math.random() < 0.5 ? -1 : 1); g.y = rand(-1.5, 1.5); g.tilt = g.x * 0.4; g.dur = rand(1.3, 2.4); } }
    else {
      g.t += dt;
      const p = g.t / g.dur;
      if (p >= 1) { g.t = -1; g.next = rand(5, 12); }
      else if (p < 0.78) { glanceX = g.x; glanceY = g.y; glanceTilt = g.tilt; }
    }

    // Pointer look-at (never on touch-primary devices, while suppressed, or asleep). Eyes lead; the head follows.
    const want = this.pointerTracking && this.pointer.active && !this.coarse && !this.asleep && !this.suppressed ? this._lookTarget() : { x: 0, y: 0 };
    s.eyeX.target = want.x + glanceX;
    s.eyeY.target = want.y + glanceY;
    s.head.target = want.x * 0.45 + glanceTilt + s.tilt.x;
    // The bolt lags the head: its target is opposite to the head's angular velocity.
    s.bolt.target = clamp(-s.head.v * 0.06, -16, 16);

    // Glyph drivers.
    if (this.def.glyph === "loading") pose.glyphRot = (t * 160) % 360;
    if (this.def.glyph === "typing") this._typingDots(t);
    if (this.def.glyph === "analyzing" || this.def.glyph === "focus") pose.glyphRot = Math.sin(t * 1.4) * 8;
    const scanning = ["analyzing", "focus", "debug", "code"].includes(this.def.glyph);
    if (scanning) { const p = (t / 1.6) % 1; pose.scanY = VISOR.y + p * VISOR.h; pose.scanOpacity = 0.55 * Math.sin(p * Math.PI); }
  }

  _integrate(dt) { for (const sp of Object.values(this.s)) sp.update(dt); }

  _lookTarget() {
    const r = this.rig.el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.55;
    const dx = clamp((this.pointer.x - cx) / (r.width * 1.4), -1, 1);
    const dy = clamp((this.pointer.y - cy) / (r.height * 1.4), -1, 1);
    return { x: dx * 6, y: dy * 3.5 };
  }

  _canBlink() { return !this.def.glyph && !this.def.eyes.some((e) => NO_BLINK.has(e)); }

  _typingDots(t) {
    const dots = this.n.glyph.querySelectorAll(".sp-typing-dot");
    dots.forEach((d, i) => { const v = Math.max(0, Math.sin(t * 5 - i * 0.9)); d.setAttribute("transform", `translate(0 ${-v * 5})`); d.setAttribute("opacity", 0.45 + 0.55 * v); });
  }

  // ── Tweens (one-shot) ───────────────────────────────────────────────────
  _tween(name, dur, ease, fn, { layer = "pose", at = [], done = null } = {}) {
    this.tweens = this.tweens.filter((t) => t.name !== name);
    this.tweens.push({ name, dur, ease, fn, layer, at: at.map(([p, f]) => ({ p, f, fired: false })), done, t: 0 });
  }

  _runTweens(dt) {
    for (const tw of this.tweens) {
      tw.t += dt;
      const raw = clamp(tw.t / tw.dur, 0, 1);
      for (const a of tw.at) if (!a.fired && raw >= a.p) { a.fired = true; a.f(); }
      tw.fn(tw.ease(raw), raw);
    }
    const finished = this.tweens.filter((t) => t.t >= t.dur);
    this.tweens = this.tweens.filter((t) => t.t < t.dur);
    finished.forEach((t) => t.done?.());
  }

  _poseTo(def, instant = false) {
    const s = this.s;
    s.lean.target = def.lean ? -2.5 : 0;
    s.tilt.target = def.tilt || 0;
    s.scale.target = def.lean ? 1.035 : 1;
    if (instant) { s.lean.snap(); s.tilt.snap(); s.scale.snap(); }
  }

  _flashBolt(k = 1) { this._tween("boltFlash", 0.7 * k, E.out, (p) => { this._boltFlash = (1 - p) * 0.6; }, { layer: "fx", done: () => { this._boltFlash = 0; } }); }

  _applyFace(def, { eyes = true } = {}) {
    const hadBadge = !!this.def.badge;
    this.rig.setFace(eyes ? def : { ...def, eyes: this.def.eyes });
    if (def.badge && !this.reducedMotion && !(hadBadge && this.def.badge === def.badge)) { this.s.badge.x = 0; this.s.badge.v = 6; }
  }

  _clearGesture() { this._gx = this._gy = this._grot = 0; this._gsx = this._gsy = 1; this._gboltRot = 0; }

  // ── Commit ──────────────────────────────────────────────────────────────
  _commit(pose) {
    const n = this.n, s = this.s;
    const gx = this._gx || 0, gy = this._gy || 0, grot = this._grot || 0, gsx = this._gsx ?? 1, gsy = this._gsy ?? 1;
    const life = s.life.x;
    const y = pose.y + s.lean.x + gy;
    const rot = pose.rot + s.head.x + grot;
    n.root.setAttribute("transform", `translate(${(pose.x + gx).toFixed(2)} ${y.toFixed(2)})`);
    n.root.setAttribute("opacity", clamp(s.lifeOpacity.x, 0, 1).toFixed(3));
    n.body.style.transform = `rotate(${rot.toFixed(2)}deg) scale(${(pose.sx * s.scale.x * gsx * life).toFixed(4)}, ${(pose.sy * s.scale.x * gsy * life).toFixed(4)})`;
    // Ground shadow: shifts and shrinks as the head rises; the contact shadow fades faster than the soft one.
    const lift = clamp((-(y) + 4) / 22, 0, 1);
    n.shadowG.setAttribute("transform", `translate(${(-y * 0.25).toFixed(2)} ${(-y * 0.15).toFixed(2)})`);
    n.shadow.setAttribute("transform", `translate(${FACE.cx} 0) scale(${(1 - lift * 0.18).toFixed(3)} 1) translate(${-FACE.cx} 0)`);
    n.shadow.setAttribute("opacity", (1 - lift * 0.35).toFixed(3));
    n.shadowTight.setAttribute("transform", `translate(${FACE.cx} 0) scale(${(1 - lift * 0.45).toFixed(3)} ${(1 - lift * 0.3).toFixed(3)}) translate(${-FACE.cx} 0)`);
    n.shadowTight.setAttribute("opacity", (1 - lift * 0.8).toFixed(3));
    n.look.setAttribute("transform", `translate(${(pose.lookX + s.eyeX.x).toFixed(2)} ${(pose.lookY + s.eyeY.x).toFixed(2)})`);
    const lid = clamp(pose.lid, 0.06, 1.08), squint = pose.squint ?? 1;
    n.eyeL._scale.setAttribute("transform", `scale(${squint.toFixed(3)} ${lid.toFixed(3)})`);
    n.eyeR._scale.setAttribute("transform", `scale(${squint.toFixed(3)} ${lid.toFixed(3)})`);
    n.mouth.setAttribute("transform", `translate(${FACE.cx} ${FACE.cy + FACE.mouthDy}) scale(${(pose.mouth * s.mouth.x).toFixed(3)})`);
    n.glyph.setAttribute("transform", `translate(${FACE.cx} ${FACE.cy}) rotate(${pose.glyphRot.toFixed(2)}) scale(${s.glyph.x.toFixed(3)})`);
    n.badge.setAttribute("transform", `translate(${BADGE.cx} ${BADGE.cy}) scale(${clamp(s.badge.x, 0, 1.3).toFixed(3)})`);
    n.topper.style.transform = `rotate(${(pose.boltRot + s.bolt.x + (this._gboltRot || 0)).toFixed(2)}deg)`;
    const glow = n.topper.querySelector(".sp-bolt-glow");
    glow.setAttribute("opacity", clamp(pose.boltGlow + (this._boltFlash || 0), 0, 1).toFixed(3));
    for (const l of n.svg.querySelectorAll(".sp-pod-light")) l.setAttribute("opacity", clamp(pose.pods + (this._boltFlash || 0) * 0.5, 0, 1).toFixed(3));
    n.status.setAttribute("opacity", pose.status.toFixed(3));
    n.scan.setAttribute("y", pose.scanY.toFixed(2)); n.scan.setAttribute("opacity", pose.scanOpacity.toFixed(3));
  }

  // ── Events ──────────────────────────────────────────────────────────────
  _bindPointer() {
    const move = (e) => { this.pointer = { x: e.clientX, y: e.clientY, active: true }; };
    const leave = () => { this.pointer.active = false; };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    this.listeners.push([window, "pointermove", move], [document, "pointerleave", leave], [window, "blur", leave]);
  }
  _bindVisibility() {
    const vis = () => { this.visible = !document.hidden; if (this.visible) this.last = performance.now(); };
    document.addEventListener("visibilitychange", vis);
    this.listeners.push([document, "visibilitychange", vis]);
    if ("IntersectionObserver" in window) {
      this._io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting && !document.hidden; if (this.visible) this.last = performance.now(); });
      this._io.observe(this.rig.el);
    }
  }
}

// ── Gestures ───────────────────────────────────────────────────────────────
// Each writes into the gesture channels (_gx, _gy, _grot, _gsx, _gsy, _gboltRot) and clears on done.
const gestureTween = (eng, dur, fn) => eng._tween("gesture", dur, E.linear, fn, { layer: "gesture", done: () => eng._clearGesture() });
const damped = (t, hz, decay) => Math.sin(t * Math.PI * 2 * hz) * Math.exp(-decay * t);

export const GESTURES = {
  // Nod: a damped vertical oscillation with a matching pitch.
  nod: (e) => gestureTween(e, 0.9, (p) => { e._gy = damped(p, 1.4, 3) * 5; e._grot = damped(p, 1.4, 3) * 2; }),
  // Shake: a damped yaw, decaying fast, with a little sideways travel.
  shake: (e) => gestureTween(e, 0.8, (p) => { e._grot = damped(p, 2.6, 3.5) * 9; e._gx = damped(p, 2.6, 3.5) * 3; }),
  // Tilt: ease in, hold, ease out.
  tilt: (e) => gestureTween(e, 1.3, (p) => { const env = p < 0.22 ? E.out(p / 0.22) : p > 0.72 ? 1 - E.inOut((p - 0.72) / 0.28) : 1; e._grot = 9 * env; }),
  // Bounce: anticipation squash → launch with stretch → land with squash → settle.
  bounce: (e) => gestureTween(e, 0.95, (p) => {
    if (p < 0.14) { const q = E.out(p / 0.14); e._gsy = 1 - 0.07 * q; e._gsx = 1 + 0.05 * q; e._gy = 2 * q; }
    else if (p < 0.5) { const q = E.out((p - 0.14) / 0.36); e._gy = 2 - 18 * q; e._gsy = 1 - 0.07 + 0.15 * Math.sin(q * Math.PI); e._gsx = 1 + 0.05 - 0.1 * Math.sin(q * Math.PI); }
    else if (p < 0.68) { const q = E.in((p - 0.5) / 0.18); e._gy = -16 + 16 * q; e._gsy = 1 + 0.06 * (1 - q); e._gsx = 1 - 0.04 * (1 - q); }
    else if (p < 0.8) { const q = Math.sin(((p - 0.68) / 0.12) * Math.PI); e._gsy = 1 - 0.1 * q; e._gsx = 1 + 0.08 * q; e._gy = 1.5 * q; }
    else { const q = (p - 0.8) / 0.2; e._gsy = 1 + 0.03 * damped(q, 1.5, 2); e._gsx = 1 - 0.02 * damped(q, 1.5, 2); }
  }),
  // Stretch: a slow rise and elongation, then settle.
  stretch: (e) => gestureTween(e, 1.1, (p) => { const sv = Math.sin(p * Math.PI); const q = E.inOut(sv); e._gsy = 1 + 0.09 * q; e._gsx = 1 - 0.05 * q; e._gy = -3 * q; }),
  glanceLeft: (e) => { e.glance.t = 0; e.glance.x = -6; e.glance.y = 0; e.glance.tilt = -2.4; e.glance.dur = 1.6; },
  glanceRight: (e) => { e.glance.t = 0; e.glance.x = 6; e.glance.y = 0; e.glance.tilt = 2.4; e.glance.dur = 1.6; },
  // Present: lean in with a small swell and a bolt flash.
  present: (e) => { gestureTween(e, 1.0, (p) => { const q = Math.sin(p * Math.PI); e._gy = -4 * E.out(q); e._gsx = e._gsy = 1 + 0.05 * E.out(q); }); e._flashBolt(1.4); },
  // Wiggle: the topper alone, a damped wobble.
  wiggle: (e) => gestureTween(e, 0.9, (p) => { e._gboltRot = damped(p, 3, 3.2) * 16; }),
  blink: (e) => { e.blink.t = 0; e.blink.double = true; e.blink.dur = 0.34; }
};

// ── Reactions ──────────────────────────────────────────────────────────────
export const REACTIONS = {
  success: (e) => { e.setExpression("success"); e.play("bounce"); e._flashBolt(); },
  warning: (e) => { e.setExpression("warning"); e.play("tilt"); },
  error: (e) => { e.setExpression("error"); e.play("shake"); e._flashBolt(0.6); },
  celebrate: (e) => { e.setExpression("celebration"); e.play("bounce"); e._flashBolt(1.6); e._confetti(); },
  alert: (e) => { e.setExpression("notification"); e._tween("alertPulse", 1.1, E.linear, (p) => { e.s.badge.target = 1 + 0.35 * E.pulse2(p); }, { layer: "reaction", done: () => { e.s.badge.target = 1; } }); },
  hint: (e) => { e.setExpression("curious"); e.play("present"); },
  think: (e) => { e.setExpression("thinking"); e.play("tilt"); },
  attend: (e) => { e.setExpression("attentive"); e.play("nod"); }
};

// Confetti: a short burst of LED-coloured sparks around the head (skipped under reduced motion).
SparkyEngine.prototype._confetti = function () {
  if (this.reducedMotion) return;
  const NS = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "sp-confetti");
  this.n.root.appendChild(g);
  const parts = Array.from({ length: 18 }, (_, i) => {
    const p = document.createElementNS(NS, "rect");
    p.setAttribute("width", 4); p.setAttribute("height", 4); p.setAttribute("rx", 1);
    p.setAttribute("class", i % 3 === 0 ? "sp-confetti-a" : i % 3 === 1 ? "sp-confetti-b" : "sp-confetti-c");
    g.appendChild(p);
    const a = rand(-Math.PI, 0), v = rand(90, 160);
    return { el: p, x: 120, y: 100, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: rand(0, 360), vr: rand(-400, 400) };
  });
  this._tween("confetti", 1.3, E.linear, (p, raw) => {
    const t = raw * 1.3;
    for (const c of parts) {
      const x = c.x + c.vx * t, y = c.y + c.vy * t + 180 * t * t;
      c.el.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(c.rot + c.vr * t).toFixed(0)})`);
      c.el.setAttribute("opacity", (1 - E.in(raw)).toFixed(2));
    }
  }, { layer: "fx", done: () => g.remove() });
};
