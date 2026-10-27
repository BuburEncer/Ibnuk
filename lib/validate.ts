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

// ponytail: video as base64 in Postgres; Vercel request body caps uploads near 4.5MB, move to object storage (Cloudinary/S3) when videos must exceed that
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

export function hasAllowedVideoMagic(bytes: Uint8Array, type: string): boolean {
  if (type === "video/mp4") {
    return bytes.length >= 12 &&
      bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
  }
  if (type === "video/webm") {
    return bytes.length >= 4 &&
      bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }
  return false;
}

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
