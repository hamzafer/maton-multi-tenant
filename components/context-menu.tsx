"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { playClick } from "@/lib/sounds";

interface MenuItem {
  label: string;
  icon: string; // SVG path d
  shortcut?: string;
  action: () => void;
  danger?: boolean;
}

interface MenuDivider {
  type: "divider";
}

type MenuEntry = MenuItem | MenuDivider;

function isDivider(entry: MenuEntry): entry is MenuDivider {
  return "type" in entry && entry.type === "divider";
}

export default function ContextMenu() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const close = useCallback(() => setOpen(false), []);

  // Intercept right-click
  useEffect(() => {
    function handleContext(e: MouseEvent) {
      // Don't intercept on inputs/textareas or if user holds Shift (escape hatch)
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        e.shiftKey
      ) {
        return;
      }

      e.preventDefault();
      playClick();

      // Position menu, accounting for viewport edges
      const x = Math.min(e.clientX, window.innerWidth - 220);
      const y = Math.min(e.clientY, window.innerHeight - 340);
      setPos({ x, y });
      setOpen(true);
    }

    function handleClick() {
      setOpen(false);
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("contextmenu", handleContext);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("contextmenu", handleContext);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const navigate = useCallback(
    (path: string) => {
      close();
      router.push(path);
    },
    [close, router]
  );

  const dispatch = useCallback(
    (key: string) => {
      close();
      // Small delay so menu closes before the event fires
      setTimeout(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      }, 50);
    },
    [close]
  );

  const items: MenuEntry[] = [
    {
      label: "Dashboard",
      icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z",
      action: () => navigate("/dashboard"),
    },
    {
      label: "Admin",
      icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z",
      action: () => navigate("/admin"),
    },
    {
      label: "Activity",
      icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z",
      action: () => navigate("/activity"),
    },
    {
      label: "Store",
      icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
      action: () => navigate("/store"),
    },
    { type: "divider" },
    {
      label: "Command Palette",
      icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
      shortcut: "⌘K",
      action: () => dispatch("k"),
    },
    {
      label: "Terminal",
      icon: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
      shortcut: "`",
      action: () => dispatch("`"),
    },
    {
      label: "Shortcuts",
      icon: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
      shortcut: "?",
      action: () => dispatch("?"),
    },
    { type: "divider" },
    {
      label: "Back to Home",
      icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
      action: () => navigate("/"),
    },
  ];

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="ctx-menu"
      style={{ left: pos.x, top: pos.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((entry, i) => {
        if (isDivider(entry)) {
          return <div key={i} className="ctx-divider" />;
        }

        return (
          <button
            key={i}
            className={`ctx-item ${entry.danger ? "ctx-item-danger" : ""}`}
            onClick={() => {
              playClick();
              entry.action();
            }}
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="ctx-icon"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={entry.icon} />
            </svg>
            <span className="ctx-label">{entry.label}</span>
            {entry.shortcut && <span className="ctx-shortcut">{entry.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}
