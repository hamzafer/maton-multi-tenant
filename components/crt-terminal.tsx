"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { playCrtOpen, playCrtKey } from "@/lib/sounds";

interface Line {
  text: string;
  type: "input" | "output" | "system" | "error" | "ascii";
}

const MOTD = [
  "╔══════════════════════════════════════════╗",
  "║  MATON GATEWAY OS v3.17.0               ║",
  "║  Kernel: maton-core 2026-LTS            ║",
  "║  Uptime: since the beginning of time    ║",
  "║  Type 'help' for available commands      ║",
  "╚══════════════════════════════════════════╝",
];

const NEOFETCH = [
  "        ╭──────╮         maton@gateway",
  "       ╱ ◈    ◈ ╲        ─────────────",
  "      │  ╭────╮  │       OS: MatonOS 2026-LTS",
  "      │  │MTON│  │       Host: gateway.maton.ai",
  "      │  ╰────╯  │       Kernel: maton-core 3.17",
  "       ╲        ╱        Shell: msh 1.0",
  "        ╰──────╯         Terminal: crt-term",
  "       ╱│╲    ╱│╲        CPU: Quantum API Router",
  "      ╱ │ ╲  ╱ │ ╲       Memory: ∞ / ∞",
  "         ╰──╯            Connections: 5 supported",
  "                         Theme: phosphor-green",
];

const COMMANDS: Record<string, (args: string[]) => Line[]> = {
  help: () => [
    { text: "Available commands:", type: "system" },
    { text: "  help          Show this message", type: "output" },
    { text: "  ls            List connected services", type: "output" },
    { text: "  whoami        Current user info", type: "output" },
    { text: "  status        Gateway status", type: "output" },
    { text: "  ping <host>   Ping a service", type: "output" },
    { text: "  neofetch      System information", type: "output" },
    { text: "  hack          Initiate hack sequence", type: "output" },
    { text: "  sudo <cmd>    Run as root", type: "output" },
    { text: "  echo <msg>    Print message", type: "output" },
    { text: "  date          Current date/time", type: "output" },
    { text: "  uptime        System uptime", type: "output" },
    { text: "  cowsay <msg>  Moo", type: "output" },
    { text: "  clear         Clear terminal", type: "output" },
    { text: "  exit          Close terminal", type: "output" },
    { text: "", type: "output" },
    { text: "  Tip: Press ? outside the terminal to see all secrets", type: "system" },
  ],
  ls: () => [
    { text: "drwxr-xr-x  api/", type: "output" },
    { text: "  ├── google-sheets    [GATEWAY]", type: "output" },
    { text: "  ├── slack            [GATEWAY]", type: "output" },
    { text: "  ├── google-mail      [GATEWAY]", type: "output" },
    { text: "  ├── notion           [GATEWAY]", type: "output" },
    { text: "  └── github           [GATEWAY]", type: "output" },
    { text: "drwxr-xr-x  connections/", type: "output" },
    { text: "-rw-r--r--  maton.config", type: "output" },
    { text: "-rw-------  .api-key", type: "output" },
  ],
  whoami: () => [
    { text: "maton-admin (uid=0 gid=0 groups=gateway,oauth,root)", type: "output" },
  ],
  status: () => {
    const services = ["google-sheets", "slack", "google-mail", "notion", "github"];
    const lines: Line[] = [
      { text: "MATON GATEWAY STATUS", type: "system" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", type: "system" },
    ];
    services.forEach((s) => {
      const latency = Math.floor(Math.random() * 80 + 20);
      lines.push({
        text: `  ${s.padEnd(18)} [●] ONLINE  ${latency}ms`,
        type: "output",
      });
    });
    lines.push({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", type: "system" });
    lines.push({ text: `  Gateway uptime: 99.97%  |  Total routes: 5`, type: "output" });
    return lines;
  },
  ping: (args) => {
    const host = args[0] || "maton.ai";
    const lines: Line[] = [{ text: `PING ${host} (93.184.216.34): 56 data bytes`, type: "output" }];
    for (let i = 0; i < 4; i++) {
      const ms = (Math.random() * 30 + 10).toFixed(1);
      lines.push({
        text: `64 bytes from ${host}: seq=${i} ttl=56 time=${ms} ms`,
        type: "output",
      });
    }
    lines.push({ text: `--- ${host} ping statistics ---`, type: "system" });
    lines.push({ text: `4 packets transmitted, 4 received, 0% packet loss`, type: "output" });
    return lines;
  },
  neofetch: () => NEOFETCH.map((text) => ({ text, type: "ascii" as const })),
  hack: () => {
    const phases = [
      "Initializing exploit framework...",
      "Scanning ports 1-65535...",
      "Found open port: 443 (HTTPS)",
      "Deploying payload: definitely_not_malware.sh",
      "Bypassing firewall... ████████████ 100%",
      "Accessing mainframe...",
      "Downloading all the secrets...",
      "",
      "Just kidding. This is a demo app. 🙃",
      "But hey, nice try, hacker.",
    ];
    return phases.map((text) => ({ text, type: (text.startsWith("Just") || text.startsWith("But")) ? "error" as const : "system" as const }));
  },
  sudo: (args) => {
    if (args.join(" ") === "rm -rf /") {
      return [
        { text: "Nice try.", type: "error" },
        { text: "🚨 Security alert: user attempted self-destruction", type: "error" },
        { text: "Incident logged. Your mom has been notified.", type: "system" },
      ];
    }
    if (args.length === 0) {
      return [{ text: "usage: sudo <command>", type: "error" }];
    }
    return [
      { text: "[sudo] password for maton-admin: ********", type: "system" },
      { text: "Permission denied. This incident will be reported.", type: "error" },
    ];
  },
  echo: (args) => [{ text: args.join(" ") || "", type: "output" }],
  date: () => [{ text: new Date().toString(), type: "output" }],
  uptime: () => {
    const days = Math.floor(Math.random() * 365 + 100);
    return [{ text: ` ${new Date().toLocaleTimeString()} up ${days} days, load average: 0.01, 0.02, 0.00`, type: "output" }];
  },
  cowsay: (args) => {
    const msg = args.join(" ") || "moo";
    const border = "─".repeat(msg.length + 2);
    return [
      { text: ` ╭${border}╮`, type: "ascii" },
      { text: ` │ ${msg} │`, type: "ascii" },
      { text: ` ╰${border}╯`, type: "ascii" },
      { text: `   ╲   ^__^`, type: "ascii" },
      { text: `    ╲  (oo)\\_______`, type: "ascii" },
      { text: `       (__)\\       )\\/\\`, type: "ascii" },
      { text: `            ||----w |`, type: "ascii" },
      { text: `            ||     ||`, type: "ascii" },
    ];
  },
};

export default function CrtTerminal() {
  const [open, setOpen] = useState(false);
  const [booting, setBooting] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Toggle on backtick
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "`") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            // Boot sequence
            setBooting(true);
            setLines([]);
            playCrtOpen();
            return true;
          }
          return false;
        });
      }
      // Also close on Escape
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Boot sequence
  useEffect(() => {
    if (!booting) return;
    const bootLines = [
      "BIOS POST... OK",
      "Memory check... 2048MB OK",
      "Loading MATON kernel...",
      "Initializing OAuth subsystem...",
      "Mounting /api/gateway...",
      "Starting network daemon...",
      "All systems nominal.",
      "",
    ];
    let i = 0;
    const timer = setInterval(() => {
      if (i < bootLines.length) {
        setLines((prev) => [...prev, { text: bootLines[i], type: "system" }]);
        i++;
      } else {
        // Show MOTD
        setLines((prev) => [
          ...prev,
          ...MOTD.map((text) => ({ text, type: "ascii" as const })),
          { text: "", type: "output" },
        ]);
        setBooting(false);
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [booting]);

  // Focus input when opened
  useEffect(() => {
    if (open && !booting) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, booting]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const execute = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      setHistory((prev) => [...prev, trimmed]);
      setHistoryIdx(-1);

      const newLines: Line[] = [{ text: `maton@gateway:~$ ${trimmed}`, type: "input" }];

      if (trimmed === "clear") {
        setLines([]);
        return;
      }
      if (trimmed === "exit") {
        setOpen(false);
        return;
      }

      const [command, ...args] = trimmed.split(" ");
      const handler = COMMANDS[command.toLowerCase()];
      if (handler) {
        newLines.push(...handler(args));
      } else {
        newLines.push({
          text: `msh: command not found: ${command}`,
          type: "error",
        });
        newLines.push({
          text: `Type 'help' for available commands.`,
          type: "system",
        });
      }

      setLines((prev) => [...prev, ...newLines]);
    },
    []
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      playCrtKey();
      execute(input);
      setInput("");
    } else if (e.key.length === 1) {
      playCrtKey();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx >= 0) {
        const idx = historyIdx + 1;
        if (idx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(idx);
          setInput(history[idx]);
        }
      }
    }
  }

  if (!open) return null;

  return (
    <div className="crt-overlay" onClick={() => inputRef.current?.focus()}>
      <div className="crt-screen" onClick={(e) => e.stopPropagation()}>
        {/* Scan lines */}
        <div className="crt-scanlines" />
        {/* Phosphor flicker */}
        <div className="crt-flicker" />

        {/* Header bar */}
        <div className="crt-header">
          <span className="crt-header-dot crt-dot-red" />
          <span className="crt-header-dot crt-dot-yellow" />
          <span className="crt-header-dot crt-dot-green" />
          <span className="crt-header-title">maton@gateway:~</span>
          <button
            className="crt-close"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        {/* Terminal body */}
        <div className="crt-body" ref={scrollRef}>
          {lines.map((line, i) => (
            <div
              key={i}
              className={`crt-line ${
                line.type === "input"
                  ? "crt-line-input"
                  : line.type === "error"
                  ? "crt-line-error"
                  : line.type === "system"
                  ? "crt-line-system"
                  : line.type === "ascii"
                  ? "crt-line-ascii"
                  : "crt-line-output"
              }`}
            >
              {line.text || "\u00A0"}
            </div>
          ))}

          {/* Input line */}
          {!booting && (
            <div className="crt-input-line">
              <span className="crt-prompt">maton@gateway:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="crt-input"
                spellCheck={false}
                autoComplete="off"
              />
              <span className="crt-cursor" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
