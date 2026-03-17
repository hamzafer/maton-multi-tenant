"use client";

import { useMemo, useState, useCallback } from "react";
import { playSuccess } from "@/lib/sounds";

interface JsonViewerProps {
  json: string;
  maxHeight?: string;
}

type TokenType = "key" | "string" | "number" | "boolean" | "null" | "brace" | "bracket" | "colon" | "comma" | "whitespace";

interface Token {
  type: TokenType;
  value: string;
}

/** Simple JSON tokenizer that preserves whitespace for pretty-printed JSON */
function tokenize(json: string): Token[][] {
  const lines = json.split("\n");
  return lines.map((line) => {
    const tokens: Token[] = [];
    let i = 0;

    while (i < line.length) {
      // Leading whitespace
      if (line[i] === " " || line[i] === "\t") {
        let ws = "";
        while (i < line.length && (line[i] === " " || line[i] === "\t")) {
          ws += line[i];
          i++;
        }
        tokens.push({ type: "whitespace", value: ws });
        continue;
      }

      // String (key or value)
      if (line[i] === '"') {
        let str = '"';
        i++;
        while (i < line.length && line[i] !== '"') {
          if (line[i] === "\\") {
            str += line[i];
            i++;
          }
          if (i < line.length) {
            str += line[i];
            i++;
          }
        }
        if (i < line.length) {
          str += '"';
          i++;
        }

        // Check if this is a key (followed by colon)
        let rest = line.slice(i).trimStart();
        if (rest.startsWith(":")) {
          tokens.push({ type: "key", value: str });
        } else {
          tokens.push({ type: "string", value: str });
        }
        continue;
      }

      // Number
      if (line[i] === "-" || (line[i] >= "0" && line[i] <= "9")) {
        let num = "";
        while (i < line.length && /[\d.eE+\-]/.test(line[i])) {
          num += line[i];
          i++;
        }
        tokens.push({ type: "number", value: num });
        continue;
      }

      // Boolean or null
      if (line.slice(i, i + 4) === "true") {
        tokens.push({ type: "boolean", value: "true" });
        i += 4;
        continue;
      }
      if (line.slice(i, i + 5) === "false") {
        tokens.push({ type: "boolean", value: "false" });
        i += 5;
        continue;
      }
      if (line.slice(i, i + 4) === "null") {
        tokens.push({ type: "null", value: "null" });
        i += 4;
        continue;
      }

      // Braces / brackets
      if (line[i] === "{" || line[i] === "}") {
        tokens.push({ type: "brace", value: line[i] });
        i++;
        continue;
      }
      if (line[i] === "[" || line[i] === "]") {
        tokens.push({ type: "bracket", value: line[i] });
        i++;
        continue;
      }

      // Colon
      if (line[i] === ":") {
        tokens.push({ type: "colon", value: ":" });
        i++;
        // Space after colon
        if (i < line.length && line[i] === " ") {
          tokens.push({ type: "whitespace", value: " " });
          i++;
        }
        continue;
      }

      // Comma
      if (line[i] === ",") {
        tokens.push({ type: "comma", value: "," });
        i++;
        continue;
      }

      // Fallback
      tokens.push({ type: "whitespace", value: line[i] });
      i++;
    }

    return tokens;
  });
}

const TOKEN_CLASSES: Record<TokenType, string> = {
  key: "json-key",
  string: "json-string",
  number: "json-number",
  boolean: "json-boolean",
  null: "json-null",
  brace: "json-brace",
  bracket: "json-bracket",
  colon: "json-punct",
  comma: "json-punct",
  whitespace: "",
};

export default function JsonViewer({ json, maxHeight = "70vh" }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [hoveredLine, setHoveredLine] = useState(-1);

  const tokenizedLines = useMemo(() => tokenize(json), [json]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      playSuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [json]);

  const lineCount = tokenizedLines.length;
  const gutterWidth = Math.max(String(lineCount).length * 8 + 16, 40);

  return (
    <div className="json-viewer-root">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`json-copy-btn ${copied ? "json-copy-success" : ""}`}
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>Copied</span>
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Code area */}
      <div className="json-viewer-scroll" style={{ maxHeight }}>
        <div className="json-viewer-code">
          {tokenizedLines.map((tokens, lineIdx) => (
            <div
              key={lineIdx}
              className={`json-line ${hoveredLine === lineIdx ? "json-line-hover" : ""}`}
              onMouseEnter={() => setHoveredLine(lineIdx)}
              onMouseLeave={() => setHoveredLine(-1)}
            >
              {/* Line number */}
              <span className="json-gutter" style={{ minWidth: gutterWidth }}>
                {lineIdx + 1}
              </span>
              {/* Tokens */}
              <span className="json-content">
                {tokens.map((token, tIdx) => (
                  <span key={tIdx} className={TOKEN_CLASSES[token.type]}>
                    {token.value}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="json-viewer-footer">
        <span>{lineCount} lines</span>
        <span>{json.length.toLocaleString()} chars</span>
      </div>
    </div>
  );
}
