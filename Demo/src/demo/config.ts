/**
 * Demo runtime configuration. This file is the single source of truth for demo
 * behavior so the rest of the application can stay as close to production as
 * possible.
 */

export const DEMO_MODE = true;

export const DEMO_USER = {
  name: "Yash Mehta",
  displayName: "Yash",
  role: "learner" as const,
  membershipEnd: "12 Mar 2031"
};

export const DEMO_ADMIN_ENABLED = import.meta.env.VITE_DEMO_ADMIN === "1" || false;

export const DEMO_SIGNUP_URL = "https://wizly.ai/signup";
export const DEMO_UPGRADE_URL = "https://wizly.ai/pricing";

export const DEMO_STORAGE_KEY = "wp.demo.acknowledged";

export function demoFeatureEnabled(name: "admin" | "scratchpad"): boolean {
  if (name === "admin") return DEMO_ADMIN_ENABLED;
  return true;
}
