/**
 * NavModel states — the five presentations + the drawer collapse, all fed the same
 * SIDEBAR. States run inside the app's router — add a /kitchen-sink item to demo data to show an active item
 * (Practice section owns it). These are variants: the component's "states" are models.
 *
 * Each demo mounts the model inside the real frame grid (.x-app-frame gives the
 * grid areas); x-navmodel-stage bounds that grid to a fixed height — the frame's
 * own root claims the viewport (see NavModel.css). The drawer pins to the stage
 * the same way it pins to the viewport/cell.
 */

import type { ReactNode } from "react";
import { SIDEBAR } from "../../../nav/nav-data";
import { NavModel, CommandStrip } from "./NavModel";
import { DrawerNav } from "./DrawerNav";

const stripItems = [
  { icon: "zap" as const, label: "Lvl 4" },
  { icon: "target" as const, label: "23-day streak" },
  { icon: "challenges" as const, label: "31 solved" }
];

const stripHint = (
  <>
    Press <kbd className="x-kbd">Ctrl K</kbd> to go anywhere
  </>
);

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "rail",
    label: "Rail — data-active-style: tint-seam",
    render: () => (
<div className="x-navmodel-stage">
  <div className="x-app-frame" data-model="rail" data-band="standard">
    <NavModel
      model="rail"
      sections={SIDEBAR}
      lab={{ icon: "flask", title: "Ari's Lab", caption: "Workspace" }}
    />
  </div>
</div>
    )
  },
  {
    key: "spine",
    label: "Spine — icon rail + flyout (hover/focus a section)",
    render: () => (
<div className="x-navmodel-stage">
  <div className="x-app-frame" data-model="spine" data-band="standard">
    <NavModel model="spine" sections={SIDEBAR} />
  </div>
</div>
    )
  },
  {
    key: "command",
    label: "Command — status strip (figures are the caller's)",
    render: () => (
<div className="x-navmodel-stage">
  <div className="x-app-frame" data-model="command" data-band="standard">
    <CommandStrip items={stripItems} hint={stripHint} />
  </div>
</div>
    )
  },
  {
    key: "dock",
    label: "Dock — floating pill (click a section for its popover)",
    render: () => (
<div className="x-navmodel-stage">
  <div className="x-app-frame" data-model="dock" data-band="standard">
    <NavModel model="dock" sections={SIDEBAR} />
  </div>
</div>
    )
  },
  {
    key: "dual",
    label: "Dual — spine (solid dots) + owning section rail (accent-text)",
    render: () => (
<div className="x-navmodel-stage">
  <div className="x-app-frame" data-model="dual" data-band="standard">
    <NavModel model="dual" sections={SIDEBAR} />
  </div>
</div>
    )
  },
  {
    key: "drawer",
    label: "Drawer — the below-Standard collapse (dialog)",
    render: () => (
<div className="x-navmodel-stage">
  <DrawerNav sections={SIDEBAR} onClose={() => {}} />
</div>
    )
  }
];
