/**
 * runner — the demo's simulated execution. Nothing here runs code: there is no
 * backend. It reads a program the way a compiler's front end would — strings,
 * comments, bracket nesting, Python's block colons — so a broken program fails
 * like a broken program, and a sound one answers with plausible, deterministic
 * output built from what it visibly prints.
 */

import type { SupportedLanguage } from "./language";

/* ── Syntax checking ───────────────────────────────────────────────────────── */

type IssueKind =
  | "string"
  | "triple"
  | "template"
  | "raw"
  | "comment"
  | "regex"
  | "closer"
  | "mismatch"
  | "unclosed"
  | "colon";

export interface SyntaxIssue {
  line: number;
  column: number;
  kind: IssueKind;
  message: string;
}

const CHECKED = new Set<SupportedLanguage>(["python", "javascript", "typescript", "java", "cpp", "go", "json", "css"]);
const SLASH_COMMENTS = new Set<SupportedLanguage>(["javascript", "typescript", "java", "cpp", "go"]);
const BLOCK_COMMENTS = new Set<SupportedLanguage>(["javascript", "typescript", "java", "cpp", "go", "css"]);
const OPENERS: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
const CLOSERS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
const PY_BLOCK = /^(?:async\s+)?(?:def|class|if|elif|else|for|while|try|except|finally|with)\b/;
/* A `/` after one of these starts a regular expression literal, not a division. */
const REGEX_PREFIX = /^(?:[(,=:[!&|?{};+\-*%<>~^]|return|typeof|case)?$/;

function describe(language: SupportedLanguage, kind: IssueKind, ch = "", open = "", detectedAt = 0): string {
  const close = OPENERS[open] ?? ch;
  switch (language) {
    case "python":
      switch (kind) {
        case "string": return `unterminated string literal (detected at line ${detectedAt})`;
        case "triple": return `unterminated triple-quoted string literal (detected at line ${detectedAt})`;
        case "closer": return `unmatched '${ch}'`;
        case "mismatch": return `closing parenthesis '${ch}' does not match opening parenthesis '${open}'`;
        case "unclosed": return `'${open}' was never closed`;
        case "colon": return "expected ':'";
        default: return "invalid syntax";
      }
    case "javascript":
      switch (kind) {
        case "template": return "Unterminated template literal";
        case "regex": return "Invalid regular expression: missing /";
        case "closer":
        case "mismatch": return `Unexpected token '${ch}'`;
        case "unclosed": return "Unexpected end of input";
        default: return "Invalid or unexpected token";
      }
    case "typescript":
      switch (kind) {
        case "string": return "TS1002: Unterminated string literal.";
        case "template": return "TS1160: Unterminated template literal.";
        case "regex": return "TS1161: Unterminated regular expression literal.";
        case "comment": return "TS1010: '*/' expected.";
        case "closer": return "TS1128: Declaration or statement expected.";
        default: return `TS1005: '${close}' expected.`;
      }
    case "java":
      switch (kind) {
        case "string": return ch === "'" ? "unclosed character literal" : "unclosed string literal";
        case "comment": return "unclosed comment";
        case "closer": return "illegal start of expression";
        case "mismatch": return `'${close}' expected`;
        default: return "reached end of file while parsing";
      }
    case "cpp":
      switch (kind) {
        case "string": return `missing terminating ${ch} character`;
        case "comment": return "unterminated comment";
        case "closer": return `expected primary-expression before '${ch}' token`;
        case "mismatch": return `expected '${close}' before '${ch}' token`;
        default: return `expected '${close}' at end of input`;
      }
    case "go":
      switch (kind) {
        case "string": return ch === "'" ? "rune literal not terminated" : "string literal not terminated";
        case "raw": return "raw string literal not terminated";
        case "comment": return "comment not terminated";
        case "closer": return `syntax error: unexpected ${ch}`;
        case "mismatch": return `syntax error: unexpected ${ch}, expected ${close}`;
        default: return `syntax error: unexpected EOF, expected ${close}`;
      }
    case "json":
      switch (kind) {
        case "string": return "Unterminated string in JSON";
        case "unclosed": return "Unexpected end of JSON input";
        default: return `Unexpected token '${ch}' in JSON`;
      }
    default:
      switch (kind) {
        case "string": return "Unclosed string";
        case "comment": return "Unclosed comment";
        case "unclosed": return "Unclosed block";
        default: return `Unexpected ${ch}`;
      }
  }
}

/**
 * The first syntax problem in `source`, or null when the program reads as
 * well-formed. Deliberately a front end, not a parser: it answers the mistakes
 * a learner actually makes (an unclosed bracket, a runaway string, a missing
 * colon) and stays silent on anything it cannot judge.
 */
export function findSyntaxIssue(source: string, language: SupportedLanguage): SyntaxIssue | null {
  if (!CHECKED.has(language)) return null;
  const src = source;
  const n = src.length;
  const isPython = language === "python";
  const isScript = language === "javascript" || language === "typescript";
  const stack: { open: string; line: number; column: number }[] = [];

  let i = 0;
  let line = 1;
  let col = 1;
  let prevCode = "";
  let logicalStart = 0;
  let lastCodeEnd = 0;
  let topLevelColon = false;

  const step = () => {
    if (src[i] === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
    i++;
  };
  const issue = (kind: IssueKind, at: { line: number; column: number }, ch = "", open = ""): SyntaxIssue => ({
    line: at.line,
    column: at.column,
    kind,
    message: describe(language, kind, ch, open, line)
  });

  /* Python: a block header whose logical line never reached a top-level colon. */
  const endLogicalLine = (): SyntaxIssue | null => {
    if (!isPython || stack.length > 0) return null;
    const text = src.slice(logicalStart, lastCodeEnd).trim();
    if (text.endsWith("\\")) return null;
    if (text && PY_BLOCK.test(text) && !topLevelColon) {
      const before = src.slice(0, lastCodeEnd);
      const headerLine = before.split("\n").length;
      const column = lastCodeEnd - before.lastIndexOf("\n");
      return issue("colon", { line: headerLine, column });
    }
    logicalStart = i + 1;
    lastCodeEnd = i + 1;
    topLevelColon = false;
    return null;
  };

  const scanTemplate = (start: { line: number; column: number }): SyntaxIssue | null => {
    while (i < n) {
      const c = src[i];
      if (c === "\\") {
        step();
        if (i < n) step();
        continue;
      }
      if (c === "`") {
        step();
        return null;
      }
      if (c === "$" && src[i + 1] === "{") {
        stack.push({ open: "${", line, column: col });
        step();
        step();
        return null;
      }
      step();
    }
    return issue("template", start);
  };

  while (i < n) {
    const ch = src[i]!;
    const next = src[i + 1];

    if (ch === "\n") {
      const colon = endLogicalLine();
      if (colon) return colon;
      step();
      continue;
    }
    if (ch === " " || ch === "\t" || ch === "\r") {
      step();
      continue;
    }
    if (isPython && ch === "#") {
      while (i < n && src[i] !== "\n") step();
      continue;
    }
    if (SLASH_COMMENTS.has(language) && ch === "/" && next === "/") {
      while (i < n && src[i] !== "\n") step();
      continue;
    }
    if (BLOCK_COMMENTS.has(language) && ch === "/" && next === "*") {
      const start = { line, column: col };
      step();
      step();
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) step();
      if (i >= n) return issue("comment", start);
      step();
      step();
      continue;
    }
    if (isScript && ch === "/" && REGEX_PREFIX.test(prevCode)) {
      const start = { line, column: col };
      step();
      let inClass = false;
      while (i < n && src[i] !== "\n") {
        const c = src[i];
        if (c === "\\") {
          step();
          if (i < n && src[i] !== "\n") step();
          continue;
        }
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) break;
        step();
      }
      if (i >= n || src[i] !== "/") return issue("regex", start);
      step();
      prevCode = "/";
      lastCodeEnd = i;
      continue;
    }
    if (isPython && (src.startsWith('"""', i) || src.startsWith("'''", i))) {
      const delim = src.slice(i, i + 3);
      const start = { line, column: col };
      step();
      step();
      step();
      while (i < n && !src.startsWith(delim, i)) {
        if (src[i] === "\\") step();
        if (i < n) step();
      }
      if (i >= n) return issue("triple", start);
      step();
      step();
      step();
      prevCode = "s";
      lastCodeEnd = i;
      continue;
    }
    if (ch === "`" && language === "go") {
      const start = { line, column: col };
      step();
      while (i < n && src[i] !== "`") step();
      if (i >= n) return issue("raw", start);
      step();
      prevCode = "s";
      lastCodeEnd = i;
      continue;
    }
    if (ch === "`" && isScript) {
      const start = { line, column: col };
      step();
      const problem = scanTemplate(start);
      if (problem) return problem;
      prevCode = "s";
      lastCodeEnd = i;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const start = { line, column: col };
      step();
      let closed = false;
      while (i < n) {
        const c = src[i];
        if (c === "\\") {
          step();
          if (i < n) step();
          continue;
        }
        if (c === ch) {
          step();
          closed = true;
          break;
        }
        if (c === "\n") break;
        step();
      }
      if (!closed) return issue("string", start, ch);
      prevCode = "s";
      lastCodeEnd = i;
      continue;
    }
    if (OPENERS[ch]) {
      stack.push({ open: ch, line, column: col });
      step();
      prevCode = ch;
      lastCodeEnd = i;
      continue;
    }
    if (CLOSERS[ch]) {
      const top = stack[stack.length - 1];
      if (top?.open === "${" && ch === "}") {
        const start = { line, column: col };
        stack.pop();
        step();
        const problem = scanTemplate(start);
        if (problem) return problem;
        prevCode = "s";
        lastCodeEnd = i;
        continue;
      }
      if (!top) return issue("closer", { line, column: col }, ch);
      if (top.open !== CLOSERS[ch]) return issue("mismatch", { line, column: col }, ch, top.open);
      stack.pop();
      step();
      prevCode = ")";
      lastCodeEnd = i;
      continue;
    }

    if (ch === ":" && stack.length === 0) topLevelColon = true;
    /* Track the previous significant token for the regex-literal decision. */
    if (/[A-Za-z0-9_$]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_$]/.test(src[j]!)) j++;
      prevCode = src.slice(i, j);
      while (i < j) step();
    } else {
      prevCode = ch;
      step();
    }
    lastCodeEnd = i;
  }

  const trailing = endLogicalLine();
  if (trailing) return trailing;

  const open = stack[stack.length - 1];
  if (open) {
    if (open.open === "${") return issue("template", open);
    const body = src.trimEnd();
    const eof = { line: body.split("\n").length, column: body.length - body.lastIndexOf("\n") };
    return issue("unclosed", isPython || language === "css" ? open : eof, "", open.open);
  }
  return null;
}

/** What the failure is called in this language's own words. */
export function syntaxFailureLabel(language: SupportedLanguage): string {
  switch (language) {
    case "python":
    case "javascript":
      return "SyntaxError";
    case "json":
      return "Invalid JSON";
    default:
      return "Compilation failed";
  }
}

/** The report the interpreter or compiler would print for `issue`. */
export function formatSyntaxReport(
  issue: SyntaxIssue,
  source: string,
  path: string,
  language: SupportedLanguage
): string {
  const raw = (source.split("\n")[issue.line - 1] ?? "").replace(/\t/g, "    ").replace(/\r$/, "");
  const caretAt = Math.max(0, issue.column - 1);
  switch (language) {
    case "python": {
      const lead = raw.length - raw.trimStart().length;
      const caret = " ".repeat(Math.max(0, caretAt - lead));
      return `  File "${path}", line ${issue.line}\n    ${raw.trim()}\n    ${caret}^\nSyntaxError: ${issue.message}`;
    }
    case "javascript":
      return `${path}:${issue.line}\n${raw}\n${" ".repeat(caretAt)}^\n\nSyntaxError: ${issue.message}\n\nNode.js v22.11.0`;
    case "typescript":
      return `${path}(${issue.line},${issue.column}): error ${issue.message}\n\nFound 1 error in ${path}:${issue.line}`;
    case "java":
      return `${path}:${issue.line}: error: ${issue.message}\n${raw}\n${" ".repeat(caretAt)}^\n1 error\nerror: compilation failed`;
    case "cpp": {
      const gutter = String(issue.line).padStart(5);
      return `${path}:${issue.line}:${issue.column}: error: ${issue.message}\n${gutter} | ${raw}\n${" ".repeat(gutter.length)} | ${" ".repeat(caretAt)}^`;
    }
    case "go":
      return `# command-line-arguments\n./${path}:${issue.line}:${issue.column}: ${issue.message}`;
    default:
      return `${path}:${issue.line}:${issue.column}: ${issue.message}`;
  }
}

/* ── Reading a program ─────────────────────────────────────────────────────── */

/** Blanks comments and string contents to spaces, preserving every index. */
function maskNonCode(source: string, language: SupportedLanguage): string {
  const blank = (s: string) => s.replace(/[^\n]/g, " ");
  const keepQuotes = (s: string, q: number) => s.slice(0, q) + blank(s.slice(q, s.length - q)) + s.slice(s.length - q);
  const pattern =
    language === "python"
      ? /("""[\s\S]*?"""|'''[\s\S]*?''')|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(#[^\n]*)/g
      : /(\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\/\/[^\n]*)/g;
  return source.replace(pattern, (match: string, first: string | undefined, str: string | undefined) => {
    if (language === "python" && first) return keepQuotes(match, 3);
    if (str) return keepQuotes(match, 1);
    return blank(match);
  });
}

function matchParen(masked: string, openIndex: number): number {
  let depth = 0;
  for (let k = openIndex; k < masked.length; k++) {
    const c = masked[k];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      depth--;
      if (depth === 0) return k;
    }
  }
  return -1;
}

/** Splits `text` at top-level occurrences of `separator` (positions read off `mask`). */
function splitTopLevel(text: string, mask: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let from = 0;
  for (let k = 0; k < mask.length; k++) {
    const c = mask[k];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") depth--;
    else if (depth === 0 && mask.startsWith(separator, k)) {
      parts.push(text.slice(from, k));
      from = k + separator.length;
      k += separator.length - 1;
    }
  }
  parts.push(text.slice(from));
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}

function unescape(body: string): string {
  return body.replace(/\\(n|t|r|\\|"|'|`|0)/g, (_: string, c: string) =>
    c === "n" ? "\n" : c === "t" ? "\t" : c === "r" ? "" : c === "0" ? "\0" : c
  );
}

/** The printed text of a literal expression, or null when it is computed. */
function literalValue(expr: string, language: SupportedLanguage): string | null {
  const e = expr.trim();
  if (/^-?\d+(?:\.\d+)?$/.test(e)) return e;
  const words: Record<string, string> =
    language === "python"
      ? { True: "True", False: "False", None: "None" }
      : language === "go"
        ? { true: "true", false: "false", nil: "<nil>" }
        : { true: "true", false: "false", null: "null", undefined: "undefined" };
  if (Object.prototype.hasOwnProperty.call(words, e)) return words[e]!;

  const py = language === "python" ? e.match(/^([rRbBuUfF]{0,2})("""|'''|"|')([\s\S]*)\2$/) : null;
  if (py) {
    const prefix = py[1]!.toLowerCase();
    const body = py[3]!;
    if (prefix.includes("f") && /\{(?!\{)/.test(body)) return null;
    const text = prefix.includes("r") ? body : unescape(body);
    return prefix.includes("f") ? text.replace(/\{\{/g, "{").replace(/\}\}/g, "}") : text;
  }
  const quoted = e.match(/^(["'`])([\s\S]*)\1$/);
  if (quoted) {
    if (quoted[1] === "`" && /\$\{/.test(quoted[2]!)) return null;
    return unescape(quoted[2]!);
  }
  return null;
}

const normalizeCall = (s: string) => s.replace(/\s+/g, " ").trim();

interface PrintedLine {
  text: string | null;
  call: string;
  stream: "out" | "err";
}

const CALL_PATTERNS: Partial<Record<SupportedLanguage, RegExp>> = {
  python: /\bprint\s*\(/g,
  javascript: /\bconsole\.(log|info|warn|error)\s*\(/g,
  typescript: /\bconsole\.(log|info|warn|error)\s*\(/g,
  java: /\bSystem\.(out|err)\.(println|print|printf)\s*\(/g,
  go: /\bfmt\.(Println|Print|Printf)\s*\(/g
};

/** Every visible print in source order, with its literal text when knowable. */
function readPrints(source: string, language: SupportedLanguage): PrintedLine[] {
  const masked = maskNonCode(source, language);
  const found: { index: number; line: PrintedLine }[] = [];

  const pattern = CALL_PATTERNS[language];
  if (pattern) {
    for (const m of masked.matchAll(new RegExp(pattern.source, "g"))) {
      const at = m.index ?? 0;
      const open = at + m[0].length - 1;
      const close = matchParen(masked, open);
      if (close < 0) continue;
      const call = source.slice(at, close + 1);
      const args = splitTopLevel(source.slice(open + 1, close), masked.slice(open + 1, close), ",");
      const kind = m[1] ?? "";
      const method = m[2] ?? kind;
      const stream: "out" | "err" = kind === "error" || kind === "warn" || kind === "err" ? "err" : "out";
      found.push({ index: at, line: { call, stream, text: printText(args, language, method) } });
    }
  }

  if (language === "cpp") {
    for (const m of masked.matchAll(/\b(?:std::)?(cout|cerr)\s*<</g)) {
      const at = m.index ?? 0;
      const start = at + m[0].length;
      const end = masked.indexOf(";", start);
      if (end < 0) continue;
      const segments = splitTopLevel(source.slice(start, end), masked.slice(start, end), "<<");
      let text: string | null = "";
      for (const seg of segments) {
        if (/^(?:std::)?endl$/.test(seg) || seg === "'\\n'") {
          text += "\n";
          continue;
        }
        const value = literalValue(seg, language);
        if (value === null) {
          text = null;
          break;
        }
        text += value;
      }
      found.push({
        index: at,
        line: {
          call: source.slice(at, end + 1),
          stream: m[1] === "cerr" ? "err" : "out",
          text: text === null ? null : text.replace(/\n$/, "")
        }
      });
    }
  }

  return found.sort((a, b) => a.index - b.index).map((f) => f.line);
}

function printText(args: string[], language: SupportedLanguage, method: string): string | null {
  if (language === "python") {
    let sep = " ";
    let end = "\n";
    const values: string[] = [];
    for (const arg of args) {
      const kw = arg.match(/^(sep|end|file|flush)\s*=\s*([\s\S]+)$/);
      if (kw) {
        const value = literalValue(kw[2]!, language);
        if (kw[1] === "sep" && value !== null) sep = value;
        if (kw[1] === "end" && value !== null) end = value;
        continue;
      }
      const value = literalValue(arg, language);
      if (value === null) return null;
      values.push(value);
    }
    return (values.join(sep) + end).replace(/\n$/, "");
  }
  if (method === "printf" || method === "Printf") {
    const [format, ...rest] = args;
    const value = format ? literalValue(format, language) : null;
    if (value === null || rest.length > 0 || /%[^%n]/.test(value)) return null;
    return value.replace(/%n/g, "\n").replace(/%%/g, "%").replace(/\n$/, "");
  }
  const values = args.map((a) => literalValue(a, language));
  if (values.some((v) => v === null)) return null;
  const joiner = method === "Print" || method === "print" ? "" : " ";
  return (values as string[]).join(joiner);
}

/* ── Simulated runs ────────────────────────────────────────────────────────── */

export type RunOutcome = "success" | "compile-error" | "runtime-error" | "timeout";

export interface RunResult {
  outcome: RunOutcome;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  memoryMb: number;
  /** A plain note about what the simulation could not stand in for. */
  hint: string | null;
}

export interface ProgramRun {
  source: string;
  path: string;
  language: SupportedLanguage;
  stdin?: string;
  /** Output an authored starter is known to print, keyed by its print call. */
  knownOutput?: Record<string, string[]>;
}

const PROFILE: Partial<Record<SupportedLanguage, { ms: number; spread: number; mb: number }>> = {
  python: { ms: 24, spread: 28, mb: 9.2 },
  javascript: { ms: 36, spread: 22, mb: 41.6 },
  typescript: { ms: 44, spread: 24, mb: 44.3 },
  java: { ms: 86, spread: 40, mb: 38.1 },
  cpp: { ms: 3, spread: 6, mb: 3.4 },
  go: { ms: 2, spread: 5, mb: 2.2 }
};

const TIME_LIMIT_MS = 2000;

let runSequence = 0;

function fingerprint(text: string): number {
  let h = 2166136261;
  for (let k = 0; k < text.length; k++) {
    h ^= text.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Plausible, slightly varying resource figures for one run of `source`. */
export function measureRun(
  source: string,
  language: SupportedLanguage,
  workload = 1
): { durationMs: number; memoryMb: number } {
  const profile = PROFILE[language] ?? { ms: 20, spread: 20, mb: 8 };
  const seed = fingerprint(`${source}#${runSequence++}`);
  const jitter = (seed % 1000) / 1000;
  const size = Math.min(1, source.length / 4000);
  return {
    durationMs: Math.round((profile.ms + profile.spread * jitter) * (1 + 0.35 * (workload - 1)) + size * 12),
    memoryMb: Math.round((profile.mb + ((seed >>> 10) % 100) / 60 + size * 2) * 10) / 10
  };
}

const LOOPS_FOREVER: Partial<Record<SupportedLanguage, RegExp>> = {
  python: /^[ \t]*while[ \t]+(?:True|1)[ \t]*:/m,
  javascript: /\bwhile\s*\(\s*(?:true|1)\s*\)|\bfor\s*\(\s*;\s*;\s*\)/,
  typescript: /\bwhile\s*\(\s*(?:true|1)\s*\)|\bfor\s*\(\s*;\s*;\s*\)/,
  java: /\bwhile\s*\(\s*true\s*\)|\bfor\s*\(\s*;\s*;\s*\)/,
  cpp: /\bwhile\s*\(\s*(?:true|1)\s*\)|\bfor\s*\(\s*;\s*;\s*\)/,
  go: /\bfor\s*\{/
};
const LOOP_EXITS = /\b(?:break|return|exit|raise|throw|panic)\b|sys\.exit|os\.Exit|process\.exit/;

const READS_INPUT: Partial<Record<SupportedLanguage, RegExp>> = {
  python: /\binput\s*\(|\bsys\.stdin\b/,
  javascript: /\breadline\b|\bprocess\.stdin\b/,
  typescript: /\breadline\b|\bprocess\.stdin\b/,
  java: /\bSystem\.in\b/,
  cpp: /\bcin\s*>>|\bgetline\s*\(|\bscanf\s*\(/,
  go: /\bfmt\.Scan|\bos\.Stdin\b/
};

/** Runs `program` in the simulated sandbox. Deterministic apart from timings. */
export function simulateProgram(program: ProgramRun): RunResult {
  const { source, path, language, stdin = "", knownOutput = {} } = program;
  const issue = findSyntaxIssue(source, language);
  if (issue) {
    return {
      outcome: "compile-error",
      stdout: "",
      stderr: formatSyntaxReport(issue, source, path, language),
      exitCode: language === "typescript" ? 2 : 1,
      durationMs: 0,
      memoryMb: 0,
      hint: null
    };
  }

  const masked = maskNonCode(source, language);
  const stats = measureRun(source, language);

  const forever = LOOPS_FOREVER[language];
  if (forever?.test(masked) && !LOOP_EXITS.test(masked)) {
    return {
      outcome: "timeout",
      stdout: "",
      stderr: `Time limit exceeded — ${path} ran past ${(TIME_LIMIT_MS / 1000).toFixed(1)} s and was stopped.`,
      exitCode: 124,
      durationMs: TIME_LIMIT_MS,
      memoryMb: stats.memoryMb,
      hint: "A loop with no way out never finishes. Add a break or a return."
    };
  }

  const readsInput = READS_INPUT[language]?.test(masked) ?? false;
  const inputLines = stdin.length > 0 ? stdin.replace(/\n$/, "").split("\n").length : 0;
  if (readsInput && inputLines === 0 && language === "python") {
    const index = masked.search(/\binput\s*\(|\bsys\.stdin\b/);
    const lineNo = source.slice(0, index).split("\n").length;
    const text = (source.split("\n")[lineNo - 1] ?? "").trim();
    return {
      outcome: "runtime-error",
      stdout: "",
      stderr: `Traceback (most recent call last):\n  File "${path}", line ${lineNo}, in <module>\n    ${text}\nEOFError: EOF when reading a line`,
      exitCode: 1,
      durationMs: stats.durationMs,
      memoryMb: stats.memoryMb,
      hint: "This program reads standard input. Add some in the Input tab, then run again."
    };
  }

  if (language === "python" && /\bunittest\.main\s*\(/.test(masked)) {
    const tests = (masked.match(/^\s*def\s+test_\w+/gm) ?? []).length;
    const seconds = (stats.durationMs / 1000).toFixed(3);
    return {
      outcome: "success",
      stdout: `${".".repeat(tests)}\n${"-".repeat(70)}\nRan ${tests} test${tests === 1 ? "" : "s"} in ${seconds}s\n\n${tests > 0 ? "OK" : "NO TESTS RAN"}`,
      stderr: "",
      exitCode: tests > 0 ? 0 : 5,
      durationMs: stats.durationMs,
      memoryMb: stats.memoryMb,
      hint: null
    };
  }

  const known = new Map(Object.entries(knownOutput).map(([call, lines]) => [normalizeCall(call), lines]));
  const out: string[] = [];
  const err: string[] = [];
  let computed = 0;
  for (const print of readPrints(source, language)) {
    const lines = print.text !== null ? [print.text] : known.get(normalizeCall(print.call));
    if (!lines) {
      computed++;
      continue;
    }
    (print.stream === "err" ? err : out).push(...lines);
  }

  const notes: string[] = [];
  if (computed > 0) {
    notes.push(
      `${computed} print${computed === 1 ? "" : "s"} with a computed value ${computed === 1 ? "isn't" : "aren't"} evaluated in the demo sandbox.`
    );
  }
  if (readsInput) {
    notes.push(
      inputLines > 0
        ? `Read ${inputLines} line${inputLines === 1 ? "" : "s"} of standard input.`
        : "This program reads standard input, and the Input tab is empty."
    );
  }
  if (out.length === 0 && err.length === 0 && computed === 0 && !readsInput) {
    notes.push(`${path} finished without printing anything.`);
  }

  return {
    outcome: "success",
    stdout: out.join("\n"),
    stderr: err.join("\n"),
    exitCode: 0,
    durationMs: stats.durationMs,
    memoryMb: stats.memoryMb,
    hint: notes.length > 0 ? notes.join(" ") : null
  };
}

/** The one-line verdict a console shows under a run. */
export function describeRun(
  result: RunResult,
  language: SupportedLanguage
): { tone: "pass" | "fail" | "warn"; text: string } {
  const figures = `${result.durationMs} ms · ${result.memoryMb.toFixed(1)} MB`;
  switch (result.outcome) {
    case "success":
      return { tone: "pass", text: `Exited with code 0 · ${figures} · simulated` };
    case "compile-error":
      return { tone: "fail", text: `${syntaxFailureLabel(language)} · exited with code ${result.exitCode}` };
    case "timeout":
      return { tone: "warn", text: `Time limit exceeded · stopped at ${(result.durationMs / 1000).toFixed(1)} s` };
    default:
      return { tone: "fail", text: `Exited with code ${result.exitCode} · ${figures}` };
  }
}

/* ── Practice judging ──────────────────────────────────────────────────────── */

export type SourceAssessment =
  | { kind: "untouched" }
  | { kind: "syntax"; issue: SyntaxIssue; report: string; label: string }
  | { kind: "changed" };

/**
 * How a practice submission stands before any case runs: still the authored
 * starter, unable to compile, or a changed program the cases can judge.
 */
export function assessSource(
  source: string,
  starter: string,
  language: SupportedLanguage,
  path: string
): SourceAssessment {
  if (source.trim().length === 0 || source.trim() === starter.trim()) return { kind: "untouched" };
  const issue = findSyntaxIssue(source, language);
  if (issue) {
    return {
      kind: "syntax",
      issue,
      report: formatSyntaxReport(issue, source, path, language),
      label: syntaxFailureLabel(language)
    };
  }
  return { kind: "changed" };
}
