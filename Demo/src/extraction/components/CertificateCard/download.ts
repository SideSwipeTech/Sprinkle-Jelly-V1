/**
 * downloadJson — the proof-file download, extracted from Account.tsx:450-462.
 *
 * Was an inline data-URI + anchor dance inside the click handler. Now one
 * function: serialize, object-URL, click, revoke. Object URLs are freed a tick
 * later so the download is underway before the URL dies.
 */
export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
