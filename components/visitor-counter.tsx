"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "maton-visitor-count";
const BASE_COUNT = 12403; // fake base to make it look established

function getAndIncrement(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current = raw ? parseInt(raw, 10) : 0;
    const next = current + 1;
    localStorage.setItem(STORAGE_KEY, String(next));
    return BASE_COUNT + next;
  } catch {
    return BASE_COUNT + 1;
  }
}

function LcdDigit({ char }: { char: string }) {
  return <span className="lcd-digit">{char}</span>;
}

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(getAndIncrement());
  }, []);

  if (count === null) return null;

  const formatted = count.toLocaleString();

  return (
    <div className="visitor-counter">
      <span className="visitor-label">VISITOR</span>
      <div className="visitor-display">
        {formatted.split("").map((char, i) => (
          <LcdDigit key={i} char={char} />
        ))}
      </div>
    </div>
  );
}
