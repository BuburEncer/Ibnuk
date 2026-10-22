export function isValidLink(link: string): boolean {
  try {
    const u = new URL(link);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidProjectSource(value: string): boolean {
  return value === "github" || value === "kaggle";
}

export function isValidProjectCategory(value: string): boolean {
  return value === "ai" || value === "software";
}

export function isValidProjectImagePath(value: string): boolean {
  try {
    const decoded = decodeURIComponent(value);
    const segments = decoded.split("/");
    return (
      decoded.startsWith("/projects/") &&
      segments.every((segment) => segment !== "..") &&
      !/[?#\\]/.test(decoded)
    );
  } catch {
    return false;
  }
}
