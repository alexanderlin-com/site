// src/app/about/page.tsx
import Link from "next/link";

type Project = {
  name: string;
  href: string;     // external URL or internal route
  blurb?: string;
  tag?: string;     // e.g., "Streamlit"
};

const projects: Project[] = [
  {
    name: "Cashflow Depot RAG",
    href: "https://cashflow.alexanderlin.com", 
    blurb: "Ask docs about finances. Fast, simple, useful.",
    tag: "Self Hosted",
  },
  {
    name: "About Me RAG",
    href: "https://alexanderlin-rag.streamlit.app/", 
    blurb: "Ask your questions about Alexander Lin.",
    tag: "Streamlit",
  },
  {
  name: "LaTeX Recipe Book",
  href: "/documents/recipes.pdf",
  blurb: "A collection of my cooking experiments, typeset in LaTeX.",
  tag: "PDF",
  },

];

export const metadata = {
  title: "About / Projects — Alexander Lin",
  description: "Links to things I actually built.",
};

export default function AboutProjects() {
  return (
    <main className="min-h-dvh bg-black text-cyan-200">
      <section className="mx-auto max-w-5xl p-6">
        {/* Header bar */}
        <div className="rounded-2xl border border-cyan-400/40 bg-black/60 p-5 shadow-xl">
          <h1 className="font-mono text-2xl md:text-3xl">/about → Project Library</h1>
          <p className="mt-1 text-cyan-300/70">
            Minimal links for now. The fancy tiling comes later.
          </p>
        </div>

        {/* Grid of project “windows” */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <article
              key={p.name}
              className="group relative overflow-hidden rounded-xl border border-cyan-400/30 bg-zinc-950/60 shadow-2xl ring-1 ring-inset ring-cyan-400/10 transition hover:border-cyan-400/60 hover:bg-zinc-950/80"
            >
              {/* Fake titlebar to give Hyprland vibe */}
              <div className="flex items-center gap-2 border-b border-cyan-400/20 bg-black/50 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-red-500/70" />
                <div className="h-2 w-2 rounded-full bg-yellow-500/70" />
                <div className="h-2 w-2 rounded-full bg-green-500/70" />
                <span className="ml-2 truncate font-mono text-xs text-cyan-300/70">
                  {p.tag ? `[${p.tag}]` : "[app]"} ~ {p.name}
                </span>
              </div>

              <div className="space-y-2 px-4 py-4">
                <h3 className="font-mono text-base text-cyan-200">{p.name}</h3>
                {p.blurb && (
                  <p className="text-sm text-cyan-300/70">{p.blurb}</p>
                )}

                <div className="pt-2">
                  <Link
                    href={p.href}
                    target={p.href.startsWith("http") ? "_blank" : undefined}
                    rel={p.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/40 px-3 py-2 font-mono text-xs text-cyan-200 hover:bg-cyan-400/10 focus:outline-none focus:ring focus:ring-cyan-400/40"
                  >
                    <span className="inline-flex items-baseline">
                      <span>{`$ open ${p.name} `}</span>
                      <span aria-hidden className="blink-cursor inline-block w-2">_</span>
                    </span>
                  </Link>
                </div>
              </div>

              {/* Subtle glow on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-cyan-500/5 blur-2xl" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
