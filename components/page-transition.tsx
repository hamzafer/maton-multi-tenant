"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PageTransition() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [animating, setAnimating] = useState(false);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    // Trigger enter wipe
    setPhase("enter");
    setAnimating(true);

    // After enter completes, trigger exit
    const exitTimer = setTimeout(() => {
      setPhase("exit");
    }, 200);

    // After exit completes, clean up
    const doneTimer = setTimeout(() => {
      setAnimating(false);
    }, 500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [pathname]);

  if (!animating) return null;

  return (
    <div className={`page-wipe ${phase === "enter" ? "page-wipe-enter" : "page-wipe-exit"}`} />
  );
}
