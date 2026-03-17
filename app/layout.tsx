import type { Metadata } from "next";
import Sidebar from "@/components/sidebar";
import ParticleConstellation from "@/components/particles";
import KonamiEasterEgg from "@/components/konami-easter-egg";
import CursorGlow from "@/components/cursor-glow";
import CommandPalette from "@/components/command-palette";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Maton",
    template: "%s | Maton",
  },
  description: "Multi-user, multi-app connection demo via Maton API gateway",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="noise-overlay flex min-h-screen">
        <ParticleConstellation />
        <CursorGlow />
        <KonamiEasterEgg />
        <CommandPalette />
        <Sidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </body>
    </html>
  );
}
