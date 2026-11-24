import * as icons from "simple-icons";
import type { SimpleIcon } from "simple-icons";

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

// Skills whose name differs from the simple-icons title.
const ALIASES: Record<string, string> = { reactnative: "react" };

const bySlug = new Map<string, SimpleIcon>();
for (const icon of Object.values(icons) as SimpleIcon[]) {
  bySlug.set(icon.slug, icon);
  bySlug.set(normalize(icon.title), icon);
}

export function skillIcon(skill: string): SimpleIcon | undefined {
  const key = normalize(skill);
  return bySlug.get(ALIASES[key] ?? key);
}
