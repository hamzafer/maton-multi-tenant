"use client";

import { useState } from "react";

export default function SlackSender({ email }: { email: string }) {
  const [channel, setChannel] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/maton/gateway/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, channel, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult("Message sent!");
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Channel ID</label>
        <input
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="C0123456789"
          className="w-full px-3 py-2 bg-surface border border-border-default rounded-lg text-[13px] font-mono text-text-primary placeholder-text-muted"
        />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Message</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hello from Maton!"
          rows={2}
          className="w-full px-3 py-2 bg-surface border border-border-default rounded-lg text-[13px] text-text-primary placeholder-text-muted resize-none"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!channel || !text || loading}
        className="inline-flex items-center gap-2 bg-accent text-surface font-semibold text-[12px] py-2 px-4 rounded-lg hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-40"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
      {result && <p className="text-accent text-[13px]">{result}</p>}
      {error && <p className="text-danger text-[13px]">{error}</p>}
    </div>
  );
}
