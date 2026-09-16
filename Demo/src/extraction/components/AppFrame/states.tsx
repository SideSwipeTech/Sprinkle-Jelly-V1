/**
 * AppFrame states — the sink renders each as a full frame (nav slot filled by a
 * placeholder so the grid areas read). Variants rather than interaction states:
 * the frame's states ARE the model x band matrix.
 */

import type { ReactNode } from "react";
import { Icon } from "../../../icons/Icon";
import { AppFrame, ShellHeader, HeaderPill } from "./AppFrame";

const demoPill = <HeaderPill icon="zap">Lvl 4</HeaderPill>;

const demoActions = (
  <>
    {/* Sibling classes — x-icon-btn / x-badge-dot / x-avatar are owned by the
        states/ family (IconButton, BadgeDot, Avatar). */}
    <button type="button" className="x-icon-btn" aria-label="Notifications">
      <Icon name="notifications" size={18} />
      <span className="x-badge-dot">2</span>
    </button>
    <button type="button" className="x-icon-btn" aria-label="Quick Notes">
      <Icon name="sticky-note" size={18} />
    </button>
    <span className="x-avatar" aria-label="Profile">
      A
    </span>
  </>
);

const navPlaceholder = (
  <div
    style={{
      gridArea: "nav",
      borderRight: "var(--border-width) solid var(--c-border)",
      padding: "var(--space-4)",
      color: "var(--c-text-faint)",
      fontSize: "var(--text-xs)"
    }}
  >
    nav slot — NavModel mounts here
  </div>
);

/* The frame root claims the viewport (min-height:100dvh); each frame demo mounts
   inside x-appframe-stage, a bounded host that gives the grid real proportions at
   a fixed height (see AppFrame.css). */
export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "rail-standard",
    label: "Rail model · standard band",
    render: () => (
<div className="x-appframe-stage">
  <AppFrame
    model="rail"
    band="standard"
    nav={navPlaceholder}
    header={<ShellHeader search={{ onClick: () => {} }} pill={demoPill} actions={demoActions} />}
  >
    <p>Main surface.</p>
  </AppFrame>
</div>
    )
  },
  {
    key: "drawer-compact",
    label: "Drawer collapse · compact band (menu button)",
    render: () => (
<div className="x-appframe-stage">
  <AppFrame
    model="drawer"
    band="compact"
    header={
      <ShellHeader menu onMenuOpen={() => {}} search={{ onClick: () => {} }} pill={demoPill} actions={demoActions} />
    }
  >
    <p>Below Standard, every model is the drawer — the header keeps a menu button.</p>
  </AppFrame>
</div>
    )
  },
  {
    key: "command-standard",
    label: "Command model · no persistent nav",
    render: () => (
<div className="x-appframe-stage">
  <AppFrame
    model="command"
    band="standard"
    header={<ShellHeader menu onMenuOpen={() => {}} search={{ onClick: () => {} }} pill={demoPill} actions={demoActions} />}
  >
    <p>Command/dock keep the drawer as their menu — the menu button stays.</p>
  </AppFrame>
</div>
    )
  },
  {
    key: "header-pieces",
    label: "Header anatomy — menu · brand · search+kbd · pill · actions",
    render: () => (
<ShellHeader
  menu
  menuOpen={false}
  onMenuOpen={() => {}}
  search={{ onClick: () => {} }}
  pill={demoPill}
  actions={demoActions}
/>
    )
  }
];
