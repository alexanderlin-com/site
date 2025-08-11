"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BOOT, INTRO_ENABLED } from "@/lib/config";

declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}

const SKIP_KEY = "al:intro:skip";
const SOUND_KEY = "al:intro:sound";

export default function BootOverlay({ onDone }: { onDone: () => void }) {
  // IMPORTANT: no early returns before hooks
  const disabled = !INTRO_ENABLED;

  const [visible, setVisible] = useState(() =>
    typeof window === "undefined" ? true : !localStorage.getItem(SKIP_KEY)
  );
  const [raw, setRaw] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [sound, setSound] = useState<boolean>(() => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SOUND_KEY) === "1";
});


  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userLockedRef = useRef(false);

  // If disabled, immediately notify parent that we're "done"
  useEffect(() => { if (disabled) onDone(); }, [disabled, onDone]);

  const reduced = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  // Load boot log
  useEffect(() => {
    if (disabled || !visible) return;
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
      } catch { setRaw(fallbackLines); }
    })();
    return () => { cancelled = true; };
  }, [disabled, visible]);

  // Downsample
  const display = useMemo(() => {
    const src = raw ?? fallbackLines;
    const n = Math.max(BOOT.minLines, Math.min(BOOT.maxLines, src.length));
    if (src.length <= n) return src;
    const step = (src.length - 1) / (n - 1);
    return Array.from({ length: n }, (_, i) => src[Math.round(i * step)]);
  }, [raw]);

  const STEP_MS = useMemo(
    () => Math.max(25, Math.min(80, Math.floor(BOOT.durationMs / Math.max(1, display.length)))),
    [display.length]
  );

  // Track whether user scrolled up
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

  // Advance lines
  useEffect(() => {
    if (disabled || !visible) return;
    if (reduced) return finish();

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip();
    window.addEventListener("keydown", onKey);

timerRef.current = window.setInterval(() => {
  setIdx((i) => {
    const next = i + 1;
    if (sound) {
      // ensure context exists/running even if user toggled mid-play
      ensureAudio();
      tick();
    }
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
  }, [disabled, visible, reduced, STEP_MS, sound, display.length]);

  // Auto-scroll newest line into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el || userLockedRef.current) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [idx]);

function ensureAudio() {
  const Ctor: typeof AudioContext | undefined =
    typeof window !== "undefined" ? window.AudioContext ?? window.webkitAudioContext : undefined;
  if (!Ctor) return;

  if (!audioCtxRef.current) {
    audioCtxRef.current = new Ctor();
  }
  // Make sure it’s actually running; resume within the click handler context
  if (audioCtxRef.current.state !== "running") {
    void audioCtxRef.current.resume();
  }
}

  async function tick() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square"; osc.frequency.value = 1400;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.04);
  }

  function skip() { localStorage.setItem(SKIP_KEY, "1"); finish(); }
  function finish() { setVisible(false); onDone(); }


  useEffect(() => {
  const onPrefs = () => {
    // update sound
    const s = localStorage.getItem(SOUND_KEY) === "1";
    setSound(s);
    // skip now if user disabled intro at startup
    if (localStorage.getItem(SKIP_KEY)) finish();
  };
  window.addEventListener("al:intro:prefs", onPrefs);
  return () => window.removeEventListener("al:intro:prefs", onPrefs);
}, []);

  // Return AFTER hooks so rules of hooks are satisfied
  if (disabled || !visible) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black text-cyan-200">
      <div ref={containerRef} className="absolute inset-0 overflow-y-auto p-4">
        <pre className="font-mono text-sm leading-5 whitespace-pre-wrap">
{display.slice(0, Math.max(1, Math.min(idx, display.length))).join("\n")}
        </pre>
      </div>

      <div className="absolute right-4 top-4 flex gap-2">
        <button
          onClick={() => {
              ensureAudio();
              setSound((s) => {
              const next = !s;
              localStorage.setItem(SOUND_KEY, next ? "1" : "0");
              window.dispatchEvent(new Event("al:intro:prefs"));
              return next;
              });
              }}       


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

