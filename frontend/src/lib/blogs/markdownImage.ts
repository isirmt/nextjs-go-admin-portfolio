import type { CommonImage } from "@/types/images/common";

const supportedClipboardImageTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
]);

export const isSupportedClipboardImage = (file: File) =>
  supportedClipboardImageTypes.has(file.type);

export const isImageFile = (file: File) => file.type.startsWith("image/");

export const createImageMarkdown = (images: CommonImage[]) =>
  images
    .map((image) => `![${image.file_name}](/api/images/${image.id}/raw)`)
    .join("\n");

export const createImageUploadPlaceholder = () =>
  `<!-- image-upload-${Date.now()}-${Math.random().toString(36).slice(2)} -->`;
