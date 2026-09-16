import { useEffect, useState } from "react";
import { VALUES, type SubthemeKey } from "@tokens/values";

const KEYS = VALUES.subthemes.map((s) => s.key);

function current(): SubthemeKey {
  const theme = document.documentElement.getAttribute("data-theme");
  const sub = document.documentElement.getAttribute("data-subtheme");
  if (sub && KEYS.includes(sub as SubthemeKey)) return sub as SubthemeKey;
  if (theme && KEYS.includes(theme as SubthemeKey)) return theme as SubthemeKey;
  return "halo";
}

export function useSubtheme(): SubthemeKey {
  const [key, setKey] = useState<SubthemeKey>(current);

  useEffect(() => {
    const observer = new MutationObserver(() => setKey(current()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-subtheme", "data-theme"]
    });
    return () => observer.disconnect();
  }, []);

  return key;
}

export function useChargeStops(): readonly [string, string, string] {
  const key = useSubtheme();
  const stops = VALUES.subthemes.find((s) => s.key === key)?.chargeStops;
  return (stops ?? ["0%", "50%", "100%"]) as unknown as readonly [string, string, string];
}
