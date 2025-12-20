"use client";

import backendApi from "@/lib/auth/backendFetch";
import React, { useCallback, useRef, useState } from "react";

export type FileUploadingState = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
};

export type UseDragAndDropUploaderOptions = {
  multiple?: boolean;
  onUploadSuccess?: () => void | Promise<void>;
};

export function useDragAndDropUploader({
  multiple = true,
  onUploadSuccess,
}: UseDragAndDropUploaderOptions = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileUploadingStates, setFileUploadingStates] = useState<
    FileUploadingState[]
  >([]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const uploadFile = useCallback(
    async (id: string, file: File) => {
      setFileUploadingStates((prev) =>
        prev.map((state) =>
          state.id === id ? { ...state, status: "uploading" } : state,
        ),
      );

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await backendApi("/images", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("アップロードに失敗");
        }

        setFileUploadingStates((prev) =>
          prev.map((state) =>
            state.id === id ? { ...state, status: "success" } : state,
          ),
        );
        await onUploadSuccess?.();
      } catch (error) {
        setFileUploadingStates((prev) =>
          prev.map((state) =>
            state.id === id
              ? {
                  ...state,
                  status: "error",
                  errorMessage:
                    error instanceof Error
                      ? error.message
                      : "アップロードに失敗",
                }
              : state,
          ),
        );
      }
    },
    [onUploadSuccess],
  );

  const enqueueUploads = useCallback(
    (files: FileList | File[]) => {
      const nextStates: FileUploadingState[] = Array.from(files).map(
        (file, index) => ({
          id: `${Date.now()}-${index}-${file.name}`,
          file,
          status: "pending",
        }),
      );

      setFileUploadingStates((prev) => [...prev, ...nextStates]);
      nextStates.forEach(({ id, file }) => {
        uploadFile(id, file);
      });
    },
    [uploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        enqueueUploads(e.dataTransfer.files);
      }
    },
    [enqueueUploads],
  );

  const handleSelectingFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        enqueueUploads(e.target.files);
        e.target.value = "";
      }
    },
    [enqueueUploads],
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    isDragging,
    fileUploadingStates,
    dragProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
    fileInputProps: {
      ref: fileInputRef,
      multiple,
      accept: "image/*",
      onChange: handleSelectingFiles,
    },
    openFileDialog,
  } as const;
}
