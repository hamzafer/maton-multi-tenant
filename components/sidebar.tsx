"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: "/admin",
    label: "Admin",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    href: "/activity",
    label: "Activity",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    href: "/store",
    label: "Store",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
];

function SidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const isOpen = expanded || pinned;

  // Collapse on route change (mobile feel)
  useEffect(() => {
    if (!pinned) setExpanded(false);
  }, [pathname, pinned]);

  function linkHref(href: string) {
    if (href === "/dashboard" && email) return `/dashboard?email=${encodeURIComponent(email)}`;
    return href;
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        onMouseEnter={() => !pinned && setExpanded(true)}
        onMouseLeave={() => !pinned && setExpanded(false)}
        className="sidebar-shell fixed top-0 left-0 h-screen z-50 flex flex-col"
        style={{ width: isOpen ? 220 : 56 }}
      >
        {/* Glass background */}
        <div className="absolute inset-0 backdrop-blur-xl bg-[rgba(6,6,8,0.85)] border-r border-[rgba(255,255,255,0.05)]" />

        {/* Accent edge line */}
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-accent/15 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="h-14 flex items-center px-4 gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-3 group min-w-0">
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-accent/15 group-hover:border-accent/30 group-hover:shadow-[0_0_16px_rgba(52,211,153,0.2)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
                </svg>
              </div>
              <span className={`sidebar-label text-[13px] font-semibold text-text-primary tracking-tight ${isOpen ? "" : "sidebar-label-hidden"}`}>
                Maton
              </span>
            </Link>
          </div>

          {/* Divider */}
          <div className="mx-3 h-px bg-[rgba(255,255,255,0.05)]" />

          {/* Nav items */}
          <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={linkHref(item.href)}
                  prefetch={false}
                  className={`sidebar-item group relative flex items-center gap-3 h-9 rounded-lg px-2.5 transition-all duration-200 ${
                    isActive
                      ? "text-accent"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-accent shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                  )}

                  {/* Active background */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-accent/6" />
                  )}

                  <span className="relative shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className={`sidebar-label relative text-[13px] font-medium whitespace-nowrap ${isOpen ? "" : "sidebar-label-hidden"}`}>
                    {item.label}
                  </span>

                  {/* Tooltip when collapsed */}
                  {!isOpen && (
                    <div className="sidebar-tooltip absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[rgba(20,20,28,0.95)] border border-[rgba(255,255,255,0.08)] text-[11px] font-medium text-text-primary whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-2 pb-3 shrink-0">
            <div className="mx-1 mb-2 h-px bg-[rgba(255,255,255,0.05)]" />

            {/* Pin toggle */}
            <button
              onClick={() => setPinned((p) => !p)}
              className={`sidebar-item group flex items-center gap-3 h-9 w-full rounded-lg px-2.5 transition-all duration-200 ${
                pinned ? "text-accent" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <span className="relative shrink-0 transition-transform duration-200 group-hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={`transition-transform duration-300 ${pinned ? "rotate-0" : "-rotate-45"}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </span>
              <span className={`sidebar-label relative text-[13px] font-medium whitespace-nowrap ${isOpen ? "" : "sidebar-label-hidden"}`}>
                {pinned ? "Unpin" : "Pin sidebar"}
              </span>
            </button>

            {/* Email badge when expanded */}
            {isOpen && email && (
              <div className="mt-2 mx-0.5 px-2.5 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] animate-fade-in">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Signed in as</p>
                <p className="text-[11px] text-text-secondary font-mono truncate">{email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer to push content */}
      <div
        className="shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hidden lg:block"
        style={{ width: pinned ? 220 : 56 }}
      />

    </>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="w-14 shrink-0 hidden lg:block" />}>
      <SidebarInner />
    </Suspense>
  );
}
