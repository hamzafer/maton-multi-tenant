"use client";

import { useEffect } from "react";

const ASCII_ART = `
%c
 ███╗   ███╗ █████╗ ████████╗ ██████╗ ███╗   ██╗
 ████╗ ████║██╔══██╗╚══██╔══╝██╔═══██╗████╗  ██║
 ██╔████╔██║███████║   ██║   ██║   ██║██╔██╗ ██║
 ██║╚██╔╝██║██╔══██║   ██║   ██║   ██║██║╚██╗██║
 ██║ ╚═╝ ██║██║  ██║   ██║   ╚██████╔╝██║ ╚████║
 ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝

  One key. Every API. ✦

`;

const STYLE = "color: #34d399; font-size: 10px; font-family: monospace; line-height: 1.2;";

export default function ConsoleArt() {
  useEffect(() => {
    console.log(ASCII_ART, STYLE);
    console.log(
      "%c🔗 Maton API Gateway — https://maton.ai\n%c   Built with Next.js 16 • React 19 • Tailwind v4\n%c   Try the Konami code for a surprise ↑↑↓↓←→←→BA\n%c   Press Cmd+K to open the command palette",
      "color: #34d399; font-weight: bold; font-size: 12px;",
      "color: #9494a8; font-size: 11px;",
      "color: #fbbf24; font-size: 11px;",
      "color: #818cf8; font-size: 11px;"
    );
    console.log(
      "%c⚡ Hiring? Curious? Open the console to find this message.\n   That means you care about craft. We should talk.",
      "color: #55556a; font-size: 10px; font-style: italic;"
    );
  }, []);

  return null;
}
