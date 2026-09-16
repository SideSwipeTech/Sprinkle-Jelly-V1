/**
 * tokenize.tsx — the lightweight highlighter behind the `custom` engine.
 *
 * A regex tokenizer, one `<span class="x-tok-*">` per run; every colour lives in
 * the stylesheet off `--c-*` tokens (the kit's `#767DA0`/`#7C84A3` comment literals
 * and its dead `[data-theme="light"]` override block are gone — the palette vars
 * already resolve per scheme).
 */

import type { ReactNode } from "react";
import type { SupportedLanguage } from "./CodeEditorChrome";

const KEYWORDS: Record<string, Set<string>> = {
  python: new Set(["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "import", "from", "as", "class", "try", "except", "finally", "with", "yield", "lambda", "pass", "break", "continue", "True", "False", "None", "async", "await", "self"]),
  javascript: new Set(["function", "return", "if", "else", "for", "while", "import", "export", "from", "as", "class", "const", "let", "var", "new", "this", "try", "catch", "finally", "async", "await", "yield", "typeof", "instanceof", "true", "false", "null", "undefined", "switch", "case", "break", "default"]),
  typescript: new Set(["function", "return", "if", "else", "for", "while", "import", "export", "from", "as", "class", "interface", "type", "enum", "const", "let", "var", "new", "this", "try", "catch", "finally", "async", "await", "yield", "typeof", "instanceof", "true", "false", "null", "undefined", "switch", "case", "break", "default", "public", "private", "protected", "readonly", "implements", "extends", "declare", "namespace"]),
  java: new Set(["public", "private", "protected", "class", "interface", "enum", "extends", "implements", "static", "final", "void", "return", "if", "else", "for", "while", "do", "new", "this", "super", "try", "catch", "finally", "throw", "throws", "import", "package", "true", "false", "null"]),
  cpp: new Set(["auto", "const", "constexpr", "class", "struct", "enum", "namespace", "using", "template", "typename", "public", "private", "protected", "virtual", "override", "void", "return", "if", "else", "for", "while", "do", "new", "delete", "this", "try", "catch", "throw", "include", "true", "false", "nullptr"]),
  go: new Set(["package", "import", "func", "return", "var", "const", "type", "struct", "interface", "if", "else", "for", "range", "switch", "case", "default", "break", "continue", "fallthrough", "go", "defer", "chan", "select", "make", "new", "len", "cap", "append", "nil", "true", "false"])
};

const TYPES: Record<string, Set<string>> = {
  python: new Set(["str", "int", "float", "bool", "list", "dict", "set", "tuple", "Any", "Optional", "Union", "List", "Dict", "Set", "Tuple"]),
  javascript: new Set(["Array", "Object", "String", "Number", "Boolean", "Promise", "Map", "Set", "Symbol", "Error"]),
  typescript: new Set(["string", "number", "boolean", "any", "void", "never", "unknown", "Array", "Record", "Partial", "Promise", "Map", "Set"]),
  java: new Set(["int", "long", "double", "float", "boolean", "char", "byte", "short", "String", "List", "Map", "Set", "ArrayList", "HashMap", "Integer", "Double", "Boolean"]),
  cpp: new Set(["int", "long", "double", "float", "bool", "char", "size_t", "string", "vector", "map", "unordered_map", "set", "pair", "unique_ptr", "shared_ptr"]),
  go: new Set(["int", "int64", "float64", "string", "bool", "byte", "rune", "error", "map", "slice"])
};

export function tokenizeCode(code: string, language: SupportedLanguage): ReactNode[] {
  const keywords = KEYWORDS[language] ?? KEYWORDS.python!;
  const types = TYPES[language] ?? TYPES.python!;

  return code.split("\n").map((line, lineIdx) => {
    const tokens: ReactNode[] = [];
    let remaining = line;
    let col = 0;
    const push = (cls: string | null, text: string, key: string) => {
      tokens.push(
        cls ? (
          <span key={`${key}-${lineIdx}-${col}`} className={cls}>
            {text}
          </span>
        ) : (
          <span key={`${key}-${lineIdx}-${col}`}>{text}</span>
        )
      );
    };

    while (remaining.length > 0) {
      // Comments — rest of line.
      if (
        (language === "python" && remaining.startsWith("#")) ||
        (["javascript", "typescript", "java", "cpp", "go"].includes(language) && remaining.startsWith("//"))
      ) {
        push("x-tok-comment", remaining, "c");
        break;
      }

      const stringMatch = remaining.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
      if (stringMatch) {
        push("x-tok-string", stringMatch[0], "s");
        remaining = remaining.slice(stringMatch[0].length);
        col += stringMatch[0].length;
        continue;
      }

      const numMatch = remaining.match(/^[0-9]+(\.[0-9]+)?\b/);
      if (numMatch) {
        push("x-tok-number", numMatch[0], "n");
        remaining = remaining.slice(numMatch[0].length);
        col += numMatch[0].length;
        continue;
      }

      const wordMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (wordMatch) {
        const word = wordMatch[0];
        if (keywords.has(word)) push("x-tok-keyword", word, "k");
        else if (types.has(word)) push("x-tok-type", word, "t");
        else if (remaining.slice(word.length).trim().startsWith("(")) push("x-tok-function", word, "f");
        else push("x-tok-ident", word, "i");
        remaining = remaining.slice(word.length);
        col += word.length;
        continue;
      }

      const opMatch = remaining.match(/^([=+\-*/%&|^!~<>?:;,.()[\]{}]+)/);
      if (opMatch) {
        push("x-tok-operator", opMatch[0], "o");
        remaining = remaining.slice(opMatch[0].length);
        col += opMatch[0].length;
        continue;
      }

      push(null, remaining[0]!, "w");
      remaining = remaining.slice(1);
      col++;
    }

    return (
      <div key={`line-${lineIdx}`} className="x-editor__line">
        {tokens.length === 0 ? "\u00A0" : tokens}
      </div>
    );
  });
}
