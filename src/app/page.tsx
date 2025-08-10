"use client";
import BootOverlay from "@/components/BootOverlay";
import TerminalButton from "@/components/TerminalButton";

export default function Home() {
  return (
    <main className="relative min-h-dvh bg-black text-cyan-200">
      <BootOverlay onDone={() => { /* no-op for now */ }} />
      <section className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <div className="pointer-events-auto w-full max-w-xl rounded-2xl border border-cyan-400/40 p-6">
          <h1 className="font-mono text-3xl md:text-4xl">Alexander Lin</h1>
          <p className="mt-2 text-cyan-300/70">software • systems • projects</p>
        </div>
        <div className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-4">
          <TerminalButton href="/about" aria-label="About me">ABOUT_ME</TerminalButton>
          <TerminalButton href="https://github.com/alexanderlin-com" external aria-label="GitHub">GITHUB</TerminalButton>
          <TerminalButton href="https://www.linkedin.com/in/alexanderlin-com" external aria-label="LinkedIn">LINKEDIN</TerminalButton>
        </div>
      </section>
    </main>
  );
}
