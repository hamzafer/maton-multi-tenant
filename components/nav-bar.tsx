"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
  { href: "/activity", label: "Activity" },
  { href: "/store", label: "{}" },
];

function NavBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const navRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [showIndicator, setShowIndicator] = useState(false);

  function linkHref(href: string) {
    if (href === "/dashboard" && email) return `/dashboard?email=${encodeURIComponent(email)}`;
    return href;
  }

  // Calculate indicator position based on active link
  useEffect(() => {
    if (!navRef.current) return;
    const activeLink = navRef.current.querySelector("[data-active='true']") as HTMLElement;
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setIndicator({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
      });
      // Delay showing to avoid flash on initial render
      setTimeout(() => setShowIndicator(true), 50);
    } else {
      setShowIndicator(false);
    }
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50">
      <div className="backdrop-blur-xl bg-[rgba(6,6,8,0.75)] border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center transition-all duration-300 group-hover:bg-accent/15 group-hover:border-accent/30 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.15)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-text-primary tracking-tight">Maton</span>
          </Link>

          <div ref={navRef} className="relative flex items-center gap-0.5">
            {/* Sliding indicator */}
            {showIndicator && (
              <div
                className="absolute top-0.5 h-[calc(100%-4px)] rounded-lg bg-accent/8 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  boxShadow: "0 0 12px rgba(52,211,153,0.1), inset 0 0 12px rgba(52,211,153,0.04)",
                }}
              />
            )}

            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={linkHref(link.href)}
                  prefetch={false}
                  data-active={isActive}
                  className={`relative px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-accent"
                      : "text-text-muted hover:text-text-secondary"
                  } ${link.label === "{}" ? "font-mono" : ""}`}
                >
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {/* Accent glow line */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </nav>
  );
}

export default function NavBar() {
  return (
    <Suspense fallback={<nav className="h-[49px]" />}>
      <NavBarInner />
    </Suspense>
  );
}
