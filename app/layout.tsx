import type { Metadata } from "next";
import Sidebar from "@/components/sidebar";
import ParticleConstellation from "@/components/particles";
import KonamiEasterEgg from "@/components/konami-easter-egg";
import CursorGlow from "@/components/cursor-glow";
import CommandPalette from "@/components/command-palette";
import { ToastProvider } from "@/components/toast";
import ConsoleArt from "@/components/console-art";
import MatrixRain from "@/components/matrix-rain";
import CrtTerminal from "@/components/crt-terminal";
import HeartbeatBar from "@/components/heartbeat-bar";
import ShootingStars from "@/components/shooting-stars";
import ShortcutSheet from "@/components/shortcut-sheet";
import BootSplash from "@/components/boot-splash";
import MagneticField from "@/components/magnetic-field";
import ContextMenu from "@/components/context-menu";
import DynamicFavicon from "@/components/dynamic-favicon";
import Screensaver from "@/components/screensaver";
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
        <ToastProvider>
          <BootSplash />
          <DynamicFavicon />
          <ConsoleArt />
          <ParticleConstellation />
          <ShootingStars />
          <CursorGlow />
          <MagneticField />
          <KonamiEasterEgg />
          <CommandPalette />
          <MatrixRain />
          <CrtTerminal />
          <ShortcutSheet />
          <ContextMenu />
          <Sidebar />
          <main className="flex-1 min-w-0 pb-14">
            {children}
          </main>
          <HeartbeatBar />
          <Screensaver />
        </ToastProvider>
      </body>
    </html>
  );
}
