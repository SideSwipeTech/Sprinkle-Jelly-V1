import type { SupportedLanguage } from "./CodeEditor";
import type { IconName } from "@icons/keyline";

const EXT_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  py: "python",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  java: "java",
  c: "cpp",
  cc: "cpp",
  cpp: "cpp",
  cxx: "cpp",
  h: "cpp",
  hpp: "cpp",
  go: "go",
  json: "json",
  md: "markdown",
  html: "html",
  htm: "html",
  css: "css"
};

/** Language of a file, read from its extension. Undefined when unknown. */
export function detectLanguage(path: string): SupportedLanguage | undefined {
  const ext = path.split(".").pop()?.toLowerCase();
  return ext ? EXT_TO_LANGUAGE[ext] : undefined;
}

const EXT_TO_ICON: Record<string, IconName> = {
  py: "codelab",
  js: "zap",
  jsx: "zap",
  ts: "zap",
  tsx: "zap",
  json: "settings",
  md: "file",
  c: "gear",
  cc: "gear",
  cpp: "gear",
  java: "courses",
  go: "flame"
};

/** The keyline icon for a file, read from its extension. */
export function fileIcon(path: string): IconName {
  const ext = path.split(".").pop()?.toLowerCase();
  return (ext && EXT_TO_ICON[ext]) || "file";
}
