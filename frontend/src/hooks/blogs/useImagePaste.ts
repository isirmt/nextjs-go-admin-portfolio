"use client";

import { useCallback } from "react";
import type { editor } from "monaco-editor";
import { toast } from "sonner";
import {
  createImageMarkdown,
  createImageUploadPlaceholder,
  isImageFile,
  isSupportedClipboardImage,
} from "@/lib/blogs/markdownImage";
import { uploadImage } from "@/lib/images/upload";

type UseImagePasteOptions = {
  refreshImages: () => Promise<void>;
};

function getClipboardFiles(clipboardData: DataTransfer) {
  const files = Array.from(clipboardData.files);
  if (files.length > 0) return files;

  return Array.from(clipboardData.items).flatMap((item) => {
    if (item.kind !== "file") return [];

    const file = item.getAsFile();
    return file ? [file] : [];
  });
}

function getRangeAtOffsets(
  model: editor.ITextModel,
  startOffset: number,
  endOffset: number,
) {
  const start = model.getPositionAt(startOffset);
  const end = model.getPositionAt(endOffset);

  return {
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  };
}

export default function useImagePaste({ refreshImages }: UseImagePasteOptions) {
  return useCallback(
    (bodyEditor: editor.IStandaloneCodeEditor, event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      const clipboardFiles = getClipboardFiles(clipboardData);
      const imageFiles = clipboardFiles.filter(isSupportedClipboardImage);
      const hasUnsupportedImage = clipboardFiles.some(
        (file) => isImageFile(file) && !isSupportedClipboardImage(file),
      );
      if (!imageFiles.length) {
        if (hasUnsupportedImage) {
          event.preventDefault();
          toast.error("PNG・JPEG・GIF・WebP・AVIF 形式の画像のみ対応");
        }
        return;
      }

      event.preventDefault();

      const model = bodyEditor.getModel();
      const selection = bodyEditor.getSelection();
      if (!model || !selection) return;

      const placeholder = createImageUploadPlaceholder();
      bodyEditor.executeEdits("clipboard-image-placeholder", [
        {
          range: selection,
          text: placeholder,
          forceMoveMarkers: true,
        },
      ]);

      void (async () => {
        try {
          const uploadedImages = await Promise.all(
            imageFiles.map((file) => uploadImage(file, "clipboard.png")),
          );
          await refreshImages();

          const currentModel = bodyEditor.getModel();
          const placeholderOffset =
            currentModel?.getValue().indexOf(placeholder) ?? -1;
          if (!currentModel || placeholderOffset < 0) return;

          bodyEditor.executeEdits("clipboard-image-insert", [
            {
              range: getRangeAtOffsets(
                currentModel,
                placeholderOffset,
                placeholderOffset + placeholder.length,
              ),
              text: createImageMarkdown(uploadedImages),
              forceMoveMarkers: true,
            },
          ]);
          toast.success("画像アップロード完了");
        } catch (error) {
          const currentModel = bodyEditor.getModel();
          const placeholderOffset =
            currentModel?.getValue().indexOf(placeholder) ?? -1;
          if (currentModel && placeholderOffset >= 0) {
            bodyEditor.executeEdits("clipboard-image-remove-placeholder", [
              {
                range: getRangeAtOffsets(
                  currentModel,
                  placeholderOffset,
                  placeholderOffset + placeholder.length,
                ),
                text: "",
                forceMoveMarkers: true,
              },
            ]);
          }
          toast.error(
            error instanceof Error
              ? error.message
              : "アップロードに失敗しました",
          );
        }
      })();
    },
    [refreshImages],
  );
}
