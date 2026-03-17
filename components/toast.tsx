"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    // Dispatch screen effect event
    if (type === "error" || type === "success") {
      window.dispatchEvent(new CustomEvent("screen-effect", { detail: { type } }));
    }

    // Start exit animation
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    }, 3500);

    // Remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const colors: Record<ToastType, { bg: string; border: string; text: string; icon: ReactNode }> = {
    success: {
      bg: "rgba(52,211,153,0.08)",
      border: "rgba(52,211,153,0.2)",
      text: "text-accent",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-accent">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ),
    },
    error: {
      bg: "rgba(248,113,113,0.08)",
      border: "rgba(248,113,113,0.2)",
      text: "text-danger",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-danger">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    info: {
      bg: "rgba(129,140,248,0.08)",
      border: "rgba(129,140,248,0.2)",
      text: "text-[#818cf8]",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-[#818cf8]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ),
    },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9996] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((t) => {
          const style = colors[t.type];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] max-w-sm"
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                animation: t.exiting
                  ? "toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                  : "toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              <span className="shrink-0">{style.icon}</span>
              <p className={`text-[13px] font-medium ${style.text} flex-1`}>{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-text-muted hover:text-text-secondary transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
