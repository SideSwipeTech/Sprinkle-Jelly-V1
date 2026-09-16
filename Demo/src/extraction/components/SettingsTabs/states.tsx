/**
 * SettingsTabs state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { SettingsTabs } from "./SettingsTabs";

const SECTIONS = [
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "appearance", label: "Appearance", icon: "theme" },
  { id: "certificates", label: "Certificates", icon: "shield" },
  { id: "account", label: "Account", icon: "user" },
  { id: "privacy", label: "Data & privacy", icon: "lock" }
] as const;

function FiveTabDemo() {
  const [tab, setTab] = useState("appearance");
  return <SettingsTabs label="Settings sections" tabs={[...SECTIONS]} value={tab} onChange={setTab} />;
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "five", label: "Five icon tabs (the Settings strip)", render: () => <FiveTabDemo /> },
  {
    key: "first-selected",
    label: "First tab selected",
    render: () => (
      <SettingsTabs label="Settings sections" tabs={[...SECTIONS]} value="notifications" onChange={() => {}} />
    )
  },
  {
    key: "disabled-tab",
    label: "Tab disabled",
    render: () => (
      <SettingsTabs
        label="Settings sections"
        tabs={[...SECTIONS.map((t) => (t.id === "certificates" ? { ...t, disabled: true } : t))]}
        value="account"
        onChange={() => {}}
      />
    )
  }
];
