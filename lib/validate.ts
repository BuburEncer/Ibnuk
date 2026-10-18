export function isValidLink(link: string): boolean {
  try {
    const u = new URL(link);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
