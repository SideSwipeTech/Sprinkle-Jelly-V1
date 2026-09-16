import { trackDemoEvent } from "./analytics";

/**
 * Called by the UI before/after an action that would normally hit a backend.
 * Shows a realistic success state without a real network call and records an
 * analytics stub.
 */
export function simulateSideEffect<T>(action: () => T, label: string): T {
  trackDemoEvent("demo_simulated_action", { action: label });
  return action();
}

export function demoMessage(label: string): string {
  const messages: Record<string, string> = {
    invite: "Invite sent. In the real product this would email the user and provision a seat.",
    email: "Email queued for delivery. No message left this demo device.",
    delete: "Item removed from the demo workspace. Refreshing the page will restore it from the seed.",
    connect: "Integration connected. This is a simulated connected state.",
    upgrade: "Upgrade flow opened. Accounts, billing and subscriptions are handled on the live site.",
    publish: "Published to the demo workspace. No real learners will see it.",
    broadcast: "Broadcast delivered to simulated recipients. No real messages were sent."
  };
  return messages[label] ?? `${label} completed in demo mode — no external side effects.`;
}
