"use strict";

// Enforces spaces around ':' inside string literals and provides auto-fix.

module.exports = {
  meta: {
    name: "meow",
    version: "1.0.0",
  },
  rules: {
    colon: {
      meta: {
        type: "problem",
        docs: { description: "Require spaces around ':' in strings" },
        fixable: "code",
        messages: {
          spaced:
            'Use spaces around \':\' inside strings (e.g. "hi : " not "hi:").',
        },
      },
      create(context) {
        const sourceCode =
          context.sourceCode ||
          (typeof context.getSourceCode === "function"
            ? context.getSourceCode()
            : null);

        const isImportSourceLiteral = (node) => {
          const p = node && node.parent;
          if (!p) return false;
          if (p.type === "ImportDeclaration" && p.source === node) return true;
          if (p.type === "ExportNamedDeclaration" && p.source === node)
            return true;
          if (p.type === "ExportAllDeclaration" && p.source === node)
            return true;
          return false;
        };

        const shouldIgnoreStringValue = (s) => {
          if (!s || typeof s !== "string") return true;
          // URLs / URL-like
          if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(s)) return true;
          // Ignore token-like strings (no whitespace): node:fs, bun:test, fs:read, etc.
          if (!s.includes(" ") && /^[\w.+-]+:[\w./+-]+$/.test(s)) return true;
          return false;
        };

        const needsFix = (s) => {
          for (let i = 0; i < s.length; i++) {
            if (s[i] !== ":") continue;
            const prev = i > 0 ? s[i - 1] : "";
            const next = i + 1 < s.length ? s[i + 1] : "";
            if (prev === ":" || next === ":") continue; // ignore ::
            if (next === "/") continue; // ignore http:// or paths
            if (!/\s/.test(prev) || !/\s/.test(next)) return true;
          }
          return false;
        };

        const fixString = (s) => {
          // Enforce: <ws> : <ws> around ':' (except '::' and ':/').
          // Two passes to avoid interfering with '::' and protocol segments.
          let out = "";
          for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if (ch !== ":") {
              out += ch;
              continue;
            }
            const prev = i > 0 ? s[i - 1] : "";
            const next = i + 1 < s.length ? s[i + 1] : "";
            if (prev === ":" || next === ":" || next === "/") {
              out += ch;
              continue;
            }

            // Ensure single space before ':' unless at start.
            if (out.length > 0 && !/\s/.test(out[out.length - 1])) out += " ";
            out += ":";

            // Skip any whitespace after ':' in original and add single space if not end.
            let j = i + 1;
            while (j < s.length && /\s/.test(s[j])) j++;
            if (j < s.length && s[j] !== "") {
              out += " ";
            } else {
              // If ':' is at the end of this string, still add a trailing space.
              out += " ";
            }
            i = j - 1;
          }
          return out;
        };

        const reportLiteral = (node, fixedInner) => {
          const raw =
            sourceCode && typeof sourceCode.getText === "function"
              ? sourceCode.getText(node)
              : null;
          context.report({
            node,
            messageId: "spaced",
            fix(fixer) {
              if (!raw || typeof raw !== "string") return null;
              const quote = raw[0];
              if (quote !== '"' && quote !== "'") return null;
              return fixer.replaceText(node, quote + fixedInner + quote);
            },
          });
        };

        const reportTemplate = (node, fixedText) => {
          context.report({
            node,
            messageId: "spaced",
            fix(fixer) {
              return fixer.replaceText(node, fixedText);
            },
          });
        };

        const reportComment = (node, fixedRaw) => {
          context.report({
            node,
            messageId: "spaced",
            fix(fixer) {
              if (!Array.isArray(node.range) || node.range.length !== 2)
                return null;
              return fixer.replaceTextRange(
                [node.range[0], node.range[1]],
                fixedRaw,
              );
            },
          });
        };

        const checkLiteral = (node) => {
          const raw =
            sourceCode && typeof sourceCode.getText === "function"
              ? sourceCode.getText(node)
              : null;
          if (typeof raw !== "string") return;
          const quote = raw[0];
          if (quote !== '"' && quote !== "'") return;

          // Only ignore node:* / bun:* etc when used as import sources.
          if (isImportSourceLiteral(node)) {
            const inner = raw.slice(1, -1);
            if (shouldIgnoreStringValue(inner)) return;
          }

          const inner = raw.slice(1, -1);
          if (shouldIgnoreStringValue(inner)) return;
          if (!needsFix(inner)) return;
          const fixedInner = fixString(inner);
          if (fixedInner === inner) return;
          reportLiteral(node, fixedInner);
        };

        const checkTemplateLiteral = (node) => {
          if (!sourceCode || typeof sourceCode.getText !== "function") return;
          const quasis = node.quasis || [];
          const exprs = node.expressions || [];

          let changed = false;
          const fixedQuasis = quasis.map((q) =>
            q && q.value ? q.value.raw : "",
          );

          // Build fixed quasis with boundary awareness.
          for (let i = 0; i < quasis.length; i++) {
            const q = quasis[i];
            const raw = q && q.value && q.value.raw;
            if (typeof raw !== "string") continue;
            if (shouldIgnoreStringValue(raw)) continue;

            const prevIsExpr = i > 0; // there is an expression before this quasi except the first
            const nextIsExpr = i < exprs.length; // there is an expression after this quasi except the last

            let fixed = fixString(raw);
            // If this quasi starts with ':' and it follows an expression, ensure a space before ':'
            if (prevIsExpr && fixed[0] === ":") fixed = " " + fixed;
            // If this quasi ends with ':' and it precedes an expression, ensure a space after ':'
            if (nextIsExpr && fixed.endsWith(":")) fixed = fixed + " ";

            if (fixed !== raw) changed = true;
            fixedQuasis[i] = fixed;
          }

          if (!changed) return;

          // Reconstruct the template literal preserving expression source text.
          let rebuilt = "`";
          for (let i = 0; i < fixedQuasis.length; i++) {
            rebuilt += fixedQuasis[i] || "";
            if (i < exprs.length) {
              rebuilt += "${" + sourceCode.getText(exprs[i]) + "}";
            }
          }
          rebuilt += "`";

          reportTemplate(node, rebuilt);
        };

        const checkComments = () => {
          if (!sourceCode || typeof sourceCode.getAllComments !== "function")
            return;

          for (const c of sourceCode.getAllComments()) {
            const raw =
              typeof sourceCode.getText === "function"
                ? sourceCode.getText(c)
                : null;
            if (typeof raw !== "string") continue;

            // Extract comment body (without delimiters) and preserve leading space after // if present.
            if (c.type === "Line") {
              // raw is like "// ..."
              const m = raw.match(/^(\/\/)(\s?)([\s\S]*)$/);
              if (!m) continue;
              const head = m[1];
              const ws = m[2];
              const body = m[3];
              if (shouldIgnoreStringValue(body)) continue;
              if (!needsFix(body)) continue;
              const fixedBody = fixString(body);
              if (fixedBody === body) continue;
              reportComment(c, head + ws + fixedBody);
              continue;
            }

            if (c.type === "Block") {
              // raw is like "/* ... */"
              const m = raw.match(/^(\/\*)([\s\S]*?)(\*\/)$/);
              if (!m) continue;
              const head = m[1];
              const body = m[2];
              const tail = m[3];
              if (shouldIgnoreStringValue(body)) continue;
              if (!needsFix(body)) continue;
              const fixedBody = fixString(body);
              if (fixedBody === body) continue;
              reportComment(c, head + fixedBody + tail);
            }
          }
        };

        return {
          Program() {
            checkComments();
          },
          Literal(node) {
            if (typeof node.value !== "string") return;
            if (!sourceCode || typeof sourceCode.getText !== "function") return;
            checkLiteral(node);
          },
          TemplateLiteral(node) {
            if (!sourceCode) return;
            checkTemplateLiteral(node);
          },
        };
      },
    },
  },
};
