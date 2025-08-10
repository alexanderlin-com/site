"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BOOT, INTRO_ENABLED } from "@/lib/config";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

const STORAGE_KEY = "al:intro:skip";

export default function BootOverlay({ onDone }: { onDone: () => void }) {
  // Skip entirely if disabled by config/env
  if (!INTRO_ENABLED) return null;

  const [visible, setVisible] = useState(() =>
    typeof window === "undefined" ? true : !localStorage.getItem(STORAGE_KEY)
  );
  const [raw, setRaw] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [sound, setSound] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // Scrolling container + lock if user scrolls up
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userLockedRef = useRef(false);

  // Respect reduced motion
  const reduced = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  // Load /public/boot.log.txt (fallback to short canned lines)
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/boot.log.txt", { cache: "force-cache" });
        const text = await res.text();
        if (cancelled) return;
        const lines = text
          .split("\n")
          .map((l) => l.trimEnd())
          .filter(Boolean)
          .map((l) => (l.length > BOOT.maxChars ? l.slice(0, BOOT.maxChars) + "…" : l));
        setRaw(lines.length ? lines : fallbackLines);
      } catch {
        setRaw(fallbackLines);
      }
    })();
    return () => { cancelled = true; };
  }, [visible]);

  // Downsample to BOOT.minLines..BOOT.maxLines
  const display = useMemo(() => {
    const src = raw ?? fallbackLines;
    const n = Math.max(BOOT.minLines, Math.min(BOOT.maxLines, src.length));
    if (src.length <= n) return src;
    const step = (src.length - 1) / (n - 1);
    return Array.from({ length: n }, (_, i) => src[Math.round(i * step)]);
  }, [raw]);

  // Per-line interval based on total duration
  const STEP_MS = useMemo(
    () => Math.max(25, Math.min(80, Math.floor(BOOT.durationMs / Math.max(1, display.length)))),
    [display.length]
  );

  // Detect user scroll; pause auto-scroll if not at bottom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
      userLockedRef.current = !atBottom;
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Advance lines; Esc to skip; respect reduced motion
  useEffect(() => {
    if (!visible) return;
    if (reduced) return finish();

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip();
    window.addEventListener("keydown", onKey);

    timerRef.current = window.setInterval(() => {
      setIdx((i) => {
        const next = i + 1;
        if (sound) tick();
        if (next >= display.length) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          window.setTimeout(finish, 220);
          return display.length;
        }
        return next;
      });
    }, STEP_MS);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reduced, STEP_MS, sound, display.length]);

  // Auto-scroll to bottom after each paint unless user scrolled up
  useEffect(() => {
    const el = containerRef.current;
    if (!el || userLockedRef.current) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [idx]);

  function ensureAudio() {
    if (audioCtxRef.current) return;
    const Ctor: typeof AudioContext | undefined =
      typeof window !== "undefined"
        ? window.AudioContext ?? window.webkitAudioContext
        : undefined;
    if (!Ctor) return;
    audioCtxRef.current = new Ctor();
  }

  async function tick() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 1400;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  function skip() { localStorage.setItem(STORAGE_KEY, "1"); finish(); }
  function finish() { setVisible(false); onDone(); }

  if (!visible) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black text-cyan-200">
      <div ref={containerRef} className="absolute inset-0 overflow-y-auto p-4">
        <pre className="font-mono text-sm leading-5 whitespace-pre-wrap">
{display.slice(0, Math.max(1, Math.min(idx, display.length))).join("\n")}
        </pre>
      </div>

      <div className="absolute right-4 top-4 flex gap-2">
        <button
          onClick={() => { ensureAudio(); setSound((s) => !s); }}
          className="rounded border border-cyan-400/40 px-3 py-1 text-xs font-mono tracking-wide hover:bg-cyan-400/10 focus:outline-none focus:ring focus:ring-cyan-400/40"
          aria-pressed={sound}
        >
          {sound ? "Sound: on" : "Sound: off"}
        </button>
        <button
          onClick={skip}
          className="rounded border border-cyan-400/40 px-3 py-1 text-xs font-mono tracking-wide hover:bg-cyan-400/10 focus:outline-none focus:ring focus:ring-cyan-400/40"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

const fallbackLines = [
  "[  OK  ] Mounted /boot.",
  "[  OK  ] Started Network Manager.",
  "[  OK  ] Reached target Basic System.",
  "[  OK  ] Started Hostname Service.",
  "[  OK  ] Started Getty on tty1.",
  "[  OK  ] Started Daily Cleanup Tasks.",
];
