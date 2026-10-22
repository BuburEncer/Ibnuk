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

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function isImageDataUrl(value: string): boolean {
  return /^data:image\/(?:png|jpeg|webp|gif);base64,/.test(value);
}

function hasPrefix(bytes: Uint8Array, prefix: number[], offset = 0): boolean {
  return prefix.every((byte, i) => bytes[i + offset] === byte);
}

export function hasAllowedImageMagic(bytes: Uint8Array, type: string): boolean {
  if (type === "image/png") return hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47]);
  if (type === "image/jpeg") return hasPrefix(bytes, [0xff, 0xd8, 0xff]);
  if (type === "image/gif") return hasPrefix(bytes, [0x47, 0x49, 0x46, 0x38]);
  if (type === "image/webp") {
    return (
      hasPrefix(bytes, [0x52, 0x49, 0x46, 0x46]) &&
      hasPrefix(bytes, [0x57, 0x45, 0x42, 0x50], 8)
    );
  }
  return false;
}
