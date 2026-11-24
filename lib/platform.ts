const HOSTS: [string, string, string][] = [
  ["github.com", "github", "GitHub"],
  ["kaggle.com", "kaggle", "Kaggle"],
];

function matchHost(url: string) {
  try {
    const host = new URL(url).hostname;
    for (const [needle, key, label] of HOSTS) {
      if (host === needle || host.endsWith(`.${needle}`)) return { key, label };
    }
  } catch {
    // Not a URL at all.
  }
  return null;
}

export function platformLabel(url: string): string {
  return matchHost(url)?.label ?? "Open project";
}

export function platformKey(url: string): string | null {
  return matchHost(url)?.key ?? null;
}

const RANKS: Record<string, number> = { github: 0, kaggle: 1 };

export function orderedLinks(links: (string | null)[]): string[] {
  const rank = (u: string) => RANKS[platformKey(u) ?? ""] ?? 2;
  return links
    .filter((u): u is string => Boolean(u))
    .sort((a, b) => rank(a) - rank(b));
}
