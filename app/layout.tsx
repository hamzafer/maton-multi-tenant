import type { Metadata } from "next";
import NavBar from "@/components/nav-bar";
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
      <body className="noise-overlay">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
