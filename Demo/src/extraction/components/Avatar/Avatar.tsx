/**
 * Avatar — the person disc. Merges three hand-rolled variants that all did
 * the same thing at different sizes:
 *
 *   shell.css:629        `.avatar`     32px, flat accent disc (NavLink host)
 *   admin-shell.css:86   `.admin-user` 28px, flat accent disc (span host)
 *   Account.tsx:316      inline        56px, gradient accent disc (hero)
 *
 * One component, `size` prop: sm (28) / md (32) / lg (56). The lg size keeps
 * the hero's two-stop accent gradient — it is the only place the demo spent
 * the extra stop, so it stays a size treatment rather than a new default.
 *
 * The disc shows an initial, which is decorative — "V" announces nothing.
 * `role="img"` + `aria-label={name}` gives the disc the person's name; the
 * letter itself is aria-hidden.
 *
 * Presentational only: wrap it in Link/NavLink when it navigates (the shell
 * did `NavLink className="avatar"` — the extracted disc is a `<span>` so the
 * host owns the interaction and the focus ring).
 */

import "./Avatar.css";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  /** The person's name — drives the initial AND the accessible label. */
  name: string;
  size?: AvatarSize;
  /** Initial override for handles/aliases; defaults to name[0]. */
  initial?: string;
  className?: string;
}

export function Avatar({ name, size = "md", initial, className = "" }: AvatarProps) {
  const glyph = (initial ?? name.trim().charAt(0) ?? "?").toUpperCase();
  return (
    <span
      className={`x-avatar ${size !== "md" ? `x-avatar--${size}` : ""} ${className}`.trim()}
      role="img"
      aria-label={name}
    >
      <span className="x-avatar__initial" aria-hidden="true">
        {glyph}
      </span>
    </span>
  );
}
