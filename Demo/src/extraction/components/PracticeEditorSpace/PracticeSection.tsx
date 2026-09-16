/**
 * PracticeSection — the section frame inside PracticeEditorSpace: a headed
 * panel with an optional trailing aside (counts, actions, the readiness
 * line). Shared by the space's own sections and its split-out helpers.
 */

import type { ReactNode } from "react";

export function PracticeSection({
  title,
  aside,
  children
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="x-practice-space__section">
      <header className="x-practice-space__section-head">
        <h3 className="x-practice-space__section-title">{title}</h3>
        {aside}
      </header>
      {children}
    </section>
  );
}
