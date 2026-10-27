const HOST_LABELS: [string, string][] = [
  ["github.com", "GitHub"],
  ["kaggle.com", "Kaggle"],
];

export function platformLabel(url: string): string {
  try {
    const host = new URL(url).hostname;
    for (const [needle, label] of HOST_LABELS) {
      if (host === needle || host.endsWith(`.${needle}`)) return label;
    }
  } catch {
    // Fall through to the generic label.
  }
  return "Buka proyek";
}
