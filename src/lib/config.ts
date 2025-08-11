// Central knobs for the intro + theme.
// Change these values; no component edits needed.

export const INTRO_ENABLED =
  process.env.NEXT_PUBLIC_INTRO_ENABLED !== "false"; // set to false in .env.local to disable

export const BOOT = {
  durationMs: 700, // total animation time
  minLines: 28,     // min lines to show (downsampled from the file)
  maxLines: 80,     // max lines to show
  maxChars: 120,    // clamp very long lines for perf
};
