/**
 * CodeLab starters — one bracket-validator exercise per runtime. Each starter
 * names its entry file, the output its prints are known to produce (the
 * simulated sandbox cannot evaluate computed values), and how the brief's
 * function is spelled in that language so the visible checks can find it.
 */

import type { EditorFile, SupportedLanguage } from "@components/CodeEditor";

export interface CodelabTemplate {
  language: SupportedLanguage;
  label: string;
  entry: string;
  files: EditorFile[];
  knownOutput: Record<string, string[]>;
  functionName: string;
  functionPattern: RegExp;
  /** How the language prints booleans. */
  truthy: string;
  falsy: string;
  missingFunction: string;
}

export const CODELAB_CHECKS: { input: string; expected: boolean; label: string }[] = [
  { input: "([]){}", expected: true, label: "Balanced pairs" },
  { input: "([)]", expected: false, label: "Interleaved pairs" },
  { input: "forecast[day]{temp}", expected: true, label: "Text mixed with brackets" },
  { input: "([{}])", expected: true, label: "Deeply nested pairs" }
];

export const CODELAB_TEMPLATES: Record<string, CodelabTemplate> = {
  python: {
    language: "python",
    label: "Python 3",
    entry: "main.py",
    functionName: "is_balanced",
    functionPattern: /^[ \t]*def[ \t]+is_balanced[ \t]*\(/m,
    truthy: "True",
    falsy: "False",
    missingFunction: "NameError: name 'is_balanced' is not defined",
    knownOutput: {
      'print(f"{t}: {is_balanced(t)}")': ["([]){}: True", "([)]: False", "forecast[day]{temp(c)}: True"]
    },
    files: [
      {
        path: "main.py",
        content: `def is_balanced(s: str) -> bool:
    """
    Return True only when every () [] {} pair closes in order.
    Other characters may appear and should be ignored.
    """
    stack = []
    pair = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in pair:
            if not stack or stack.pop() != pair[ch]:
                return False
    return not stack


if __name__ == "__main__":
    test_cases = ["([]){}", "([)]", "forecast[day]{temp(c)}"]
    for t in test_cases:
        print(f"{t}: {is_balanced(t)}")
`
      },
      {
        path: "tests.py",
        content: `import unittest
from main import is_balanced


class TestBracketValidator(unittest.TestCase):
    def test_simple(self):
        self.assertTrue(is_balanced("()"))
        self.assertTrue(is_balanced("[]{}"))
        self.assertFalse(is_balanced("([)]"))

    def test_ignores_other_characters(self):
        self.assertTrue(is_balanced("forecast[day]{temp}"))


if __name__ == "__main__":
    unittest.main()
`
      }
    ]
  },
  javascript: {
    language: "javascript",
    label: "JavaScript (ES6)",
    entry: "index.js",
    functionName: "isBalanced",
    functionPattern: /\bfunction\s+isBalanced\s*\(|\bisBalanced\s*=\s*(?:\(|function|[A-Za-z_$][\w$]*\s*=>)/,
    truthy: "true",
    falsy: "false",
    missingFunction: "ReferenceError: isBalanced is not defined",
    knownOutput: {
      [`console.log("Balanced '([]){}':", isBalanced("([]){}"))`]: ["Balanced '([]){}': true"],
      [`console.log("Interleaved '([)]':", isBalanced("([)]"))`]: ["Interleaved '([)]': false"]
    },
    files: [
      {
        path: "index.js",
        content: `function isBalanced(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (pairs[ch]) {
      if (!stack.length || stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}

console.log("Balanced '([]){}':", isBalanced("([]){}"));
console.log("Interleaved '([)]':", isBalanced("([)]"));
`
      }
    ]
  },
  typescript: {
    language: "typescript",
    label: "TypeScript 5.5",
    entry: "validator.ts",
    functionName: "isBalanced",
    functionPattern: /\bfunction\s+isBalanced\s*\(|\bisBalanced\s*=\s*(?:\(|function|[A-Za-z_$][\w$]*\s*=>)/,
    truthy: "true",
    falsy: "false",
    missingFunction: "validator.ts: error TS2304: Cannot find name 'isBalanced'.",
    knownOutput: {},
    files: [
      {
        path: "validator.ts",
        content: `type BracketPair = { [key: string]: string };

export function isBalanced(s: string): boolean {
  const stack: string[] = [];
  const pairs: BracketPair = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (pairs[ch]) {
      if (!stack.length || stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}
`
      }
    ]
  },
  go: {
    language: "go",
    label: "Go 1.22",
    entry: "main.go",
    functionName: "isBalanced",
    functionPattern: /\bfunc\s+isBalanced\s*\(/,
    truthy: "true",
    falsy: "false",
    missingFunction: "./main.go: undefined: isBalanced",
    knownOutput: {
      'fmt.Println("Balanced:", isBalanced("([]){}"))': ["Balanced: true"]
    },
    files: [
      {
        path: "main.go",
        content: `package main

import "fmt"

func isBalanced(s string) bool {
	var stack []rune
	pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}
	for _, ch := range s {
		if ch == '(' || ch == '[' || ch == '{' {
			stack = append(stack, ch)
		} else if open, exists := pairs[ch]; exists {
			if len(stack) == 0 || stack[len(stack)-1] != open {
				return false
			}
			stack = stack[:len(stack)-1]
		}
	}
	return len(stack) == 0
}

func main() {
	fmt.Println("Balanced:", isBalanced("([]){}"))
}
`
      }
    ]
  }
};

export const CODELAB_LANGUAGES = Object.entries(CODELAB_TEMPLATES).map(([value, t]) => ({ value, label: t.label }));
