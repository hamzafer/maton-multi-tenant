"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// Generates an ambient generative drone using Web Audio API
// Warm pad with slow-evolving harmonics — think Brian Eno meets UI

export default function AmbientToggle({ expanded }: { expanded: boolean }) {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ oscs: OscillatorNode[]; gains: GainNode[]; master: GainNode } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const startAmbient = useCallback(() => {
    if (ctxRef.current) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 2);
    master.connect(ctx.destination);

    // Reverb-like effect using delay + feedback
    const delay = ctx.createDelay(1);
    delay.delayTime.setValueAtTime(0.4, ctx.currentTime);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.3, ctx.currentTime);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    master.connect(delay);
    delay.connect(feedback);
    feedback.connect(filter);
    filter.connect(delay);
    filter.connect(ctx.destination);

    // Create drone voices — pentatonic intervals
    const baseFreq = 110; // A2
    const ratios = [1, 1.5, 2, 2.5, 3, 4]; // Octave + fifth harmonics
    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    ratios.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i < 2 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(baseFreq * ratio, ctx.currentTime);
      gain.gain.setValueAtTime(0.01 / (i + 1), ctx.currentTime);
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      oscs.push(osc);
      gains.push(gain);
    });

    nodesRef.current = { oscs, gains, master };

    // Evolve: slowly shift frequencies and volumes
    intervalRef.current = setInterval(() => {
      if (!ctxRef.current) return;
      const t = ctxRef.current.currentTime;
      oscs.forEach((osc, i) => {
        const drift = (Math.sin(t * 0.1 + i * 1.7) * 2);
        osc.frequency.linearRampToValueAtTime(
          baseFreq * ratios[i] + drift,
          t + 3
        );
      });
      gains.forEach((gain, i) => {
        const vol = (0.008 + Math.sin(t * 0.07 + i * 2.3) * 0.004) / (i + 1);
        gain.gain.linearRampToValueAtTime(Math.max(vol, 0.001), t + 3);
      });
    }, 3000);
  }, []);

  const stopAmbient = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (nodesRef.current && ctxRef.current) {
      const t = ctxRef.current.currentTime;
      nodesRef.current.master.gain.linearRampToValueAtTime(0, t + 1.5);
      const nodes = nodesRef.current;
      const ctx = ctxRef.current;
      setTimeout(() => {
        nodes.oscs.forEach((o) => { try { o.stop(); } catch {} });
        ctx.close();
      }, 2000);
    }
    ctxRef.current = null;
    nodesRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, [stopAmbient]);

  function toggle() {
    if (playing) {
      stopAmbient();
    } else {
      startAmbient();
    }
    setPlaying(!playing);
  }

  return (
    <button
      onClick={toggle}
      className={`sidebar-item group flex items-center gap-3 h-9 w-full rounded-lg px-2.5 transition-all duration-200 ${
        playing ? "text-accent" : "text-text-muted hover:text-text-secondary"
      }`}
      title={playing ? "Stop ambient" : "Play ambient"}
    >
      <span className="relative shrink-0 transition-transform duration-200 group-hover:scale-110">
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-3.14A.75.75 0 0112.75 5.7v12.6a.75.75 0 01-1.28.53L6.75 15.75H4.5A1.5 1.5 0 013 14.25v-4.5A1.5 1.5 0 014.5 8.25h2.25z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-3.14A.75.75 0 0112.75 5.7v12.6a.75.75 0 01-1.28.53L6.75 15.75H4.5A1.5 1.5 0 013 14.25v-4.5A1.5 1.5 0 014.5 8.25h2.25z" />
          </svg>
        )}
      </span>
      <span className={`sidebar-label relative text-[13px] font-medium whitespace-nowrap ${expanded ? "" : "sidebar-label-hidden"}`}>
        {playing ? "Ambient On" : "Ambient"}
      </span>

      {/* Sound wave visualization when playing */}
      {playing && expanded && (
        <span className="ml-auto flex items-center gap-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[2px] bg-accent rounded-full"
              style={{
                animation: `soundWave 1.2s ease-in-out ${i * 0.15}s infinite alternate`,
                height: 8 + Math.random() * 6,
              }}
            />
          ))}
        </span>
      )}
    </button>
  );
}
