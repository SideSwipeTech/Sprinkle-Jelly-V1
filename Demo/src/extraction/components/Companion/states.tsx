/**
 * Companion states — the corner's presentations, moment tones, panel kinds and the
 * door's three answer states. The character host mounts a stub rig here (the real
 * adapter is the opaque sparky seam — see README).
 */

import type { ReactNode } from "react";
import {
  CompanionCorner,
  CompanionTrigger,
  CompanionMoment,
  CompanionPanel,
  DoorResult,
  type CompanionRigAdapter
} from "./Companion";

/** A stub adapter: mounts a placeholder dot so the trigger's geometry shows in the sink. */
const stubRig: CompanionRigAdapter = {
  mount(host) {
    const el = document.createElement("span");
    el.setAttribute("data-stub-rig", "");
    el.style.cssText =
      "display:block;width:72px;height:72px;border-radius:50%;background:color-mix(in srgb, var(--c-accent-primary) 25%, var(--c-surface-elevated));border:var(--border-width) solid var(--c-border-strong)";
    host.appendChild(el);
  },
  destroy() {},
  setSize() {},
  setReducedMotion() {},
  setExpression() {},
  react() {},
  play() {}
};

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "plain-corner",
    label: "Plain presentation — pill trigger",
    render: () => (
<CompanionCorner name="WizBit" presentation="plain">
  <CompanionTrigger presentation="plain" name="WizBit" open={false} onToggle={() => {}} />
</CompanionCorner>
    )
  },
  {
    key: "character-corner",
    label: "Companion presentation — character trigger (stub rig)",
    render: () => (
<CompanionCorner name="WizBit" presentation="companion">
  <CompanionTrigger presentation="companion" name="WizBit" open={false} onToggle={() => {}} rig={stubRig} />
</CompanionCorner>
    )
  },
  {
    key: "moment-encouraging",
    label: "Moment — encouraging tone, flourish, queue count",
    render: () => (
<CompanionCorner name="WizBit" presentation="companion">
  <CompanionMoment
    tone="encouraging"
    cls="success"
    fact="Two Sum: accepted. Every visible test passed."
    flourish="That is a solved one."
    waiting={2}
    onDismiss={() => {}}
  />
</CompanionCorner>
    )
  },
  {
    key: "moment-serious-sticky",
    label: "Moment — serious tone, sticky (role=alert), dismiss gated",
    render: () => (
<CompanionCorner name="WizBit" presentation="plain">
  <CompanionMoment
    tone="serious"
    cls="ack"
    fact="Progress was reset on this device."
    sticks
    dismissable={false}
    onDismiss={() => {}}
  />
</CompanionCorner>
    )
  },
  {
    key: "panel-guide",
    label: "Panel — greeting + hint item, chips, ask input",
    render: () => (
<CompanionCorner name="WizBit" presentation="companion">
  <CompanionPanel
    name="WizBit"
    item={{ kind: "hint", text: "Hints live on this page, in the ladder beside the brief. Revealing one costs nothing." }}
    index={2}
    total={4}
    onNext={() => {}}
    chips={["How do hints work?", "What does accepted mean?"]}
    onAsk={() => {}}
    onClose={() => {}}
  />
</CompanionCorner>
    )
  },
  {
    key: "door-guidance",
    label: "DoorResult — guidance answer with onward link",
    render: () => (
<DoorResult
  result={{ kind: "guidance", text: "Continue is waiting: Two Pointers · Foundations of Python.", to: "/courses/1", toLabel: "Open it" }}
/>
    )
  },
  {
    key: "door-answer",
    label: "DoorResult — knowledge answer",
    render: () => (
<DoorResult
  result={{ kind: "answer", title: "Hints", body: "Revealing a hint costs nothing and never changes your record." }}
/>
    )
  },
  {
    key: "door-no-match",
    label: "DoorResult — no match (StateBlock empty + topics + request)",
    render: () => (
<DoorResult
  result={{ kind: "no-match", topics: ["Coverage", "Hints", "Accepted"], requestTo: "/requests" }}
/>
    )
  },
  {
    key: "door-unavailable",
    label: "DoorResult — unavailable (StateBlock unavailable + retry)",
    render: () => (
<DoorResult result={{ kind: "unavailable" }} onRetry={() => {}} />
    )
  }
];
