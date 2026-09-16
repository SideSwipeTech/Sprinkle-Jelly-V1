import type { IconName } from "@icons/keyline";

export type SupportedLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "java"
  | "cpp"
  | "go"
  | "json"
  | "markdown"
  | "html"
  | "css";

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

const LANGUAGE_TO_EXT: Record<SupportedLanguage, string> = {
  python: "py",
  javascript: "js",
  typescript: "ts",
  java: "java",
  cpp: "cpp",
  go: "go",
  json: "json",
  markdown: "md",
  html: "html",
  css: "css"
};

/** The conventional file extension for a language. */
export function extensionFor(language: SupportedLanguage): string {
  return LANGUAGE_TO_EXT[language];
}

const LANGUAGE_LABEL: Record<SupportedLanguage, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  cpp: "C++",
  go: "Go",
  json: "JSON",
  markdown: "Markdown",
  html: "HTML",
  css: "CSS"
};

export function languageName(language: SupportedLanguage): string {
  return LANGUAGE_LABEL[language];
}

/** Indentation each language's own style guide asks for. */
export function indentationFor(language: SupportedLanguage): { tabSize: number; insertSpaces: boolean } {
  switch (language) {
    case "go":
      return { tabSize: 4, insertSpaces: false };
    case "python":
    case "java":
    case "cpp":
      return { tabSize: 4, insertSpaces: true };
    default:
      return { tabSize: 2, insertSpaces: true };
  }
}

/** Languages whose formatter ships inside the editor itself. */
const FORMATTABLE = new Set<SupportedLanguage>(["javascript", "typescript", "json", "html", "css"]);

export function canFormat(language: SupportedLanguage): boolean {
  return FORMATTABLE.has(language);
}

/** Languages the simulated sandbox will run. */
const RUNNABLE = new Set<SupportedLanguage>(["python", "javascript", "typescript", "java", "cpp", "go"]);

export function isRunnable(language: SupportedLanguage | undefined): language is SupportedLanguage {
  return language !== undefined && RUNNABLE.has(language);
}

const EXT_TO_ICON: Record<string, IconName> = {
  py: "codelab",
  js: "zap",
  jsx: "zap",
  ts: "zap",
  tsx: "zap",
  json: "settings",
  md: "file",
  c: "code",
  cc: "code",
  cpp: "code",
  java: "courses",
  go: "flame"
};

/** The keyline icon for a file, read from its extension. */
export function fileIcon(path: string): IconName {
  const ext = path.split(".").pop()?.toLowerCase();
  return (ext && EXT_TO_ICON[ext]) || "file";
}
