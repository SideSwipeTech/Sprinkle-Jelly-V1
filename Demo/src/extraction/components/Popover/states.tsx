/**
 * Popover state matrix.
 */

import type { ReactNode } from "react";
import { Popover } from "./Popover";
import type { PopoverTriggerArgs } from "./Popover";

function triggerBtn({ toggle, triggerProps, triggerRef }: PopoverTriggerArgs) {
  return (
    <button
      type="button"
      className="x-menu__trigger"
      onClick={toggle}
      ref={triggerRef}
      {...triggerProps}
    >
      Toggle popover
    </button>
  );
}

const panelContent = (
  <>
    <div className="x-pop__head">
      <p className="x-pop__title">Details</p>
    </div>
    <div className="x-pop__list">
      <p>Panel content lives here — lists, cards, forms.</p>
    </div>
  </>
);

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "closed",
    label: "Closed (trigger only)",
    render: () => (
      <Popover trigger={triggerBtn} label="Example">
        {panelContent}
      </Popover>
    )
  },
  {
    key: "open",
    label: "Open — content panel, focus inside",
    render: () => (
      <Popover trigger={triggerBtn} label="Details" focusOnOpen defaultOpen>
        {panelContent}
      </Popover>
    )
  },
  {
    key: "open-start",
    label: "Open — start-aligned",
    render: () => (
      <Popover trigger={triggerBtn} label="Details" align="start" defaultOpen>
        {panelContent}
      </Popover>
    )
  }
];
