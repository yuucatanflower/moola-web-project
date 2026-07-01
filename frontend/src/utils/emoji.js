import twemoji from "@twemoji/api";

// Native emoji rendering varies wildly across OSes (Segoe UI Emoji on Windows,
// Noto on most Linux/Android, Apple's own set only on macOS/iOS/Safari), which
// looks inconsistent in screenshots. Twemoji renders every emoji as the same
// flat, colorful SVG regardless of platform.
export const applyTwemoji = (node) => {
  if (!node) return;

  twemoji.parse(node, {
    className: "twemoji",
    folder: "svg",
    ext: ".svg",
  });
};
