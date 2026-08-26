export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function validateDescription(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return "Describe what happened before continuing.";
  if (value.trim().length > 5000) return "Keep the description under 5,000 characters.";
  return null;
}

export function validateImage(file: unknown): string | null {
  if (!(file instanceof File)) return "Choose an evidence image before continuing.";
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Upload a JPG, PNG, WEBP, HEIC, or HEIF image.";
  if (file.size > MAX_FILE_SIZE) return "The image must be 5 MB or smaller.";
  if (file.size === 0) return "The selected image is empty.";
  return null;
}
