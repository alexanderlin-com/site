import Link from "next/link";

export default function TerminalButton({
  href,
  children,
  external,
  "aria-label": ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  "aria-label"?: string;
}) {
  const base =
    "group inline-flex items-center justify-center rounded-lg border border-cyan-400/40 px-4 py-3 font-mono text-sm tracking-wide bg-black/60 hover:bg-cyan-400/10 focus:outline-none focus:ring focus:ring-cyan-400/40";
  const content = "$ sudo run " + children + " _";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base} aria-label={ariaLabel}>
        <span className="after:ml-1 after:inline-block after:w-2 after:animate-pulse after:content-['_']">
          {content}
        </span>
      </a>
    );
  }
  return (
    <Link href={href} className={base} aria-label={ariaLabel}>
      <span className="after:ml-1 after:inline-block after:w-2 after:animate-pulse after:content-['_']">
        {content}
      </span>
    </Link>
  );
}
