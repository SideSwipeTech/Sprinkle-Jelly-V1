/**
 * metamorphicEngine.ts — Ultra-Smooth GPU-Accelerated Metamorphic Transition Engine
 * 
 * Engineered for solid 60-120 FPS buttery-smooth performance:
 * - Batched single-pass canvas draws (Zero shadowBlur overhead in loop)
 * - Optimized particle counts with pre-computed trajectories
 * - Seamless Disintegration & Reverse Genesis signatures (480ms duration)
 * - Zero layout thrashing / paint storms on DOM elements
 */

import { type ProductTheme, type SchemeKey, type AppearanceState, applyAppearance } from "./appearance";

export interface MetamorphicTransitionOptions {
  theme?: ProductTheme;
  scheme?: SchemeKey;
  originEvent?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number };
}

interface Particle {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  angle: number;
  dist: number;
  size: number;
  color: string;
  char: string;
  speed: number;
  driftX: number;
  driftY: number;
}

const MATRIX_GLYPHS = ["0", "1", "0x", "AF", "3D", "FF", "MOV", "JMP", "OK", "λ", "Ω", "π"];

// Cached color palettes
const THEME_PALETTES: Record<ProductTheme, string[]> = {
  halo: ["#6366F1", "#8B5CF6", "#A855F7", "#14B8A6", "#EC4899"],
  forge: ["#F59E0B", "#D97706", "#06B6D4", "#3B82F6", "#F97316"],
  voyage: ["#7C3AED", "#C026D3", "#4338CA", "#38BDF8", "#F43F5E"],
  meridian: ["#10B981", "#059669", "#34D399", "#6EE7B7", "#047857"],
  atlas: ["#F59E0B", "#38BDF8", "#6366F1", "#0D9488", "#E11D48"],
  atelier: ["#D97706", "#92400E", "#78350F", "#B45309", "#FDE68A"]
};

// Smooth cubic bezier easing
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function startMetamorphicTransition(
  options: MetamorphicTransitionOptions,
  onComplete?: (state: AppearanceState) => void
): AppearanceState {
  const root = document.documentElement;

  // Reduced motion accessibility check
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    root.getAttribute("data-reduced-motion") === "true";

  if (prefersReduced) {
    const next = applyAppearance({
      theme: options.theme,
      scheme: options.scheme,
    });
    onComplete?.(next);
    return next;
  }

  // Remove any existing active transition canvas to prevent stacking
  const oldCanvas = document.querySelector(".metamorphic-stage-canvas");
  if (oldCanvas && oldCanvas.parentNode) {
    oldCanvas.parentNode.removeChild(oldCanvas);
  }

  let originX = window.innerWidth / 2;
  let originY = window.innerHeight / 2;
  if (options.originEvent) {
    originX = options.originEvent.clientX;
    originY = options.originEvent.clientY;
  }

  const targetTheme = options.theme || (root.getAttribute("data-theme") as ProductTheme) || "halo";

  // Create hardware-accelerated canvas
  const canvas = document.createElement("canvas");
  canvas.className = "metamorphic-stage-canvas";
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "999999";
  canvas.style.pointerEvents = "none";
  canvas.style.opacity = "1";
  canvas.style.willChange = "opacity";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    const next = applyAppearance({ theme: options.theme, scheme: options.scheme });
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    onComplete?.(next);
    return next;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.scale(dpr, dpr);

  root.setAttribute("data-morphing", "true");

  // Generate lightweight, balanced particles (140 total for high 60fps throughput)
  const particleCount = targetTheme === "meridian" ? 90 : 140;
  const particles: Particle[] = [];
  const palette = THEME_PALETTES[targetTheme] || THEME_PALETTES.halo;

  const cols = 14;
  const rows = Math.ceil(particleCount / cols);
  const colStep = width / cols;
  const rowStep = height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = c * colStep + (Math.random() - 0.5) * colStep * 0.7;
      const py = r * rowStep + (Math.random() - 0.5) * rowStep * 0.7;
      const dx = px - originX;
      const dy = py - originY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);

      particles.push({
        originX: px,
        originY: py,
        targetX: px,
        targetY: py,
        angle,
        dist,
        size: Math.random() * 2.5 + 2,
        color: palette[Math.floor(Math.random() * palette.length)] ?? palette[0]!,
        char: MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)] || "1",
        speed: 1.5 + Math.random() * 2.5,
        driftX: (Math.random() - 0.5) * 40,
        driftY: -Math.random() * 60 - 20
      });
    }
  }

  const totalDuration = 480; // ms (fast, snappy, responsive)
  const switchTime = 220; // ms (seamless atomic DOM switch)
  let domSwitched = false;
  let finalState: AppearanceState | null = null;
  let animId = 0;
  const startTime = performance.now();

  function frame(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / totalDuration, 1);

    ctx!.clearRect(0, 0, width, height);

    // Atomic DOM Theme Switch at midpoint
    if (elapsed >= switchTime && !domSwitched) {
      domSwitched = true;
      finalState = applyAppearance({
        theme: options.theme,
        scheme: options.scheme,
      });
    }

    const isPhase1 = progress < 0.46;
    const p1 = Math.min(progress / 0.46, 1);
    const p2 = Math.max((progress - 0.46) / 0.54, 0);

    // ══ SIGNATURE 1: HALO (Prismatic Dust Snap & Photon Coalescence) ══
    if (targetTheme === "halo") {
      if (isPhase1) {
        // Disintegration: upward prismatic drift
        const ease = easeOutCubic(p1);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const curX = p.originX + p.driftX * ease;
          const curY = p.originY + p.driftY * ease;
          const alpha = (1 - p1) * 0.85;

          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = alpha;
          ctx!.beginPath();
          ctx!.arc(curX, curY, p.size * (1 - p1 * 0.3), 0, Math.PI * 2);
          ctx!.fill();
        }
      } else {
        // Reverse Genesis: photons accelerate inward from edges to settle
        const ease = easeOutCubic(p2);
        const radiusFactor = (1 - ease) * (width * 0.5);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const curX = p.targetX + Math.cos(p.angle) * radiusFactor;
          const curY = p.targetY + Math.sin(p.angle) * radiusFactor;
          const alpha = Math.min(p2 * 1.8, 1) * (1 - p2 * 0.3);

          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = alpha;
          ctx!.beginPath();
          ctx!.arc(curX, curY, p.size * (1 + (1 - p2) * 1.5), 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    // ══ SIGNATURE 2: FORGE (Molten Voxel Deconstruction & Laser Sweep) ══
    else if (targetTheme === "forge") {
      if (isPhase1) {
        const ease = easeInOutQuad(p1);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const curY = p.originY + ease * 50;
          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = (1 - p1) * 0.9;
          ctx!.fillRect(p.originX, curY, p.size * 2.5, p.size * 2.5);
        }
      } else {
        // Supersonic laser scanlines
        const laserY1 = height * p2;
        const laserY2 = height * (1 - p2);

        ctx!.globalAlpha = (1 - p2) * 0.7;
        ctx!.fillStyle = "#06B6D4";
        ctx!.fillRect(0, laserY1 - 1, width, 3);
        ctx!.fillStyle = "#F59E0B";
        ctx!.fillRect(0, laserY2 - 1, width, 3);

        const ease = easeOutCubic(p2);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const curY = p.targetY + (1 - ease) * (p.originY < height / 2 ? -40 : 40);
          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = Math.min(p2 * 1.6, 1);
          ctx!.fillRect(p.targetX, curY, p.size * 2, p.size * 2);
        }
      }
    }

    // ══ SIGNATURE 3: VOYAGE (Singularity Warp & Supernova Shockwave) ══
    else if (targetTheme === "voyage") {
      if (isPhase1) {
        const ease = easeInOutQuad(p1);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const curX = p.originX + (originX - p.originX) * ease * 0.7;
          const curY = p.originY + (originY - p.originY) * ease * 0.7;
          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = (1 - p1) * 0.85;
          ctx!.beginPath();
          ctx!.arc(curX, curY, p.size, 0, Math.PI * 2);
          ctx!.fill();
        }
      } else {
        const shockRadius = Math.hypot(width, height) * p2 * 0.9;
        ctx!.globalAlpha = (1 - p2) * 0.5;
        ctx!.strokeStyle = "#C026D3";
        ctx!.lineWidth = 3;
        ctx!.beginPath();
        ctx!.arc(originX, originY, shockRadius, 0, Math.PI * 2);
        ctx!.stroke();

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          if (shockRadius >= p.dist) {
            ctx!.fillStyle = p.color;
            ctx!.globalAlpha = (1 - p2) * 0.8;
            ctx!.beginPath();
            ctx!.arc(p.targetX, p.targetY, p.size * 1.5, 0, Math.PI * 2);
            ctx!.fill();
          }
        }
      }
    }

    // ══ SIGNATURE 4: MERIDIAN (Hex Dump Decay & Quantum Compile) ══
    else if (targetTheme === "meridian") {
      ctx!.font = '10px "JetBrains Mono", monospace';
      if (isPhase1) {
        const ease = easeInOutQuad(p1);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const curY = p.originY + ease * 40;
          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = (1 - p1) * 0.85;
          ctx!.fillText(p.char, p.originX, curY);
        }
      } else {
        const beamY = height * (1 - p2);
        ctx!.globalAlpha = (1 - p2) * 0.6;
        ctx!.fillStyle = "#10B981";
        ctx!.fillRect(0, beamY, width, 2);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = Math.min(p2 * 1.5, 1);
          ctx!.fillText(p.char, p.targetX, p.targetY);
        }
      }
    }

    // ══ SIGNATURE 5: ATELIER / ATLAS (Ember Burn & Ink Surge) ══
    else {
      if (isPhase1) {
        const ease = easeOutCubic(p1);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const curX = p.originX + p.driftX * ease * 0.4;
          const curY = p.originY + p.driftY * ease * 0.5;
          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = (1 - p1) * 0.85;
          ctx!.beginPath();
          ctx!.arc(curX, curY, p.size, 0, Math.PI * 2);
          ctx!.fill();
        }
      } else {
        const ease = easeOutCubic(p2);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const curX = originX + (p.targetX - originX) * ease;
          const curY = originY + (p.targetY - originY) * ease;
          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = Math.min(p2 * 1.6, 1);
          ctx!.beginPath();
          ctx!.arc(curX, curY, p.size * (1 + (1 - p2)), 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    if (progress < 1) {
      animId = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(animId);
      root.removeAttribute("data-morphing");

      // Clean canvas removal
      canvas.style.transition = "opacity 100ms ease-out";
      canvas.style.opacity = "0";

      setTimeout(() => {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
        if (finalState) {
          onComplete?.(finalState);
        }
      }, 100);
    }
  }

  animId = requestAnimationFrame(frame);

  return finalState || applyAppearance({ theme: options.theme, scheme: options.scheme });
}
