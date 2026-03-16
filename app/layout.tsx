import type { Metadata } from "next";
import NavBar from "@/components/nav-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maton Demo",
  description: "Multi-user, multi-app connection demo via Maton API gateway",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
