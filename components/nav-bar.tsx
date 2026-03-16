"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

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

  // Preserve email param for dashboard link
  function linkHref(href: string) {
    if (href === "/dashboard" && email) return `/dashboard?email=${encodeURIComponent(email)}`;
    return href;
  }

  return (
    <nav className="border-b border-border-subtle bg-surface-raised/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
        <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 rounded-md bg-accent/15 border border-accent/25 flex items-center justify-center mr-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-text-primary tracking-tight">Maton</span>
        </Link>

        <div className="flex items-center gap-0.5">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={linkHref(link.href)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface-hover"
                } ${link.label === "{}" ? "font-mono" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default function NavBar() {
  return (
    <Suspense fallback={<nav className="border-b border-border-subtle h-12" />}>
      <NavBarInner />
    </Suspense>
  );
}
