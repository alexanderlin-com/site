"use client";
import { useEffect, useState } from "react";

const SKIP_KEY = "al:intro:skip";   // presence = skip intro
const SOUND_KEY = "al:intro:sound"; // "1" | "0"

export default function CornerControls() {
  const [sound, setSound] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SOUND_KEY) === "1";
  });
  const [startup, setStartup] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return !localStorage.getItem(SKIP_KEY);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SOUND_KEY, sound ? "1" : "0");
    window.dispatchEvent(new Event("al:intro:prefs"));
  }, [sound]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (startup) localStorage.removeItem(SKIP_KEY);
    else localStorage.setItem(SKIP_KEY, "1");
    window.dispatchEvent(new Event("al:intro:prefs"));
  }, [startup]);

  return (
    <div className="fixed top-3 right-3 z-50 rounded-xl border border-cyan-400/40 bg-black/60 px-3 py-2 text-cyan-200 backdrop-blur shadow">
      <Toggle label="Sound" checked={sound} onChange={setSound} />
      <Toggle label="Intro at startup" checked={startup} onChange={setStartup} />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 py-1 text-xs font-mono">
      <span>{label}</span>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring focus:ring-cyan-400/40 ${checked ? "bg-cyan-500/60" : "bg-cyan-400/20"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`}
        />
      </button>
    </label>
  );
}
