/* eslint-disable @next/next/no-img-element */
"use client";

import { useImagesContext } from "@/contexts/imagesContext";
import backendApi from "@/lib/auth/backendFetch";
import Link from "next/link";
import { useCallback, useState } from "react";
import ConsoleButton from "./consoleButton";
import ConsoleConfirmDialog from "./consoleConfirmDialog";

export default function ImagesViewer() {
  const { images, error, refreshImages } = useImagesContext();
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [deleteTargetImageId, setDeleteTargetImageId] = useState<string | null>(
    null,
  );

  const handleDelete = useCallback(
    async (imageId: string) => {
      setDeletingImageId(imageId);
      try {
        const response = await backendApi(`/images/${imageId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "削除に失敗しました");
        }

        await refreshImages();
        setDeleteTargetImageId(null);
      } finally {
        setDeletingImageId(null);
      }
    },
    [refreshImages],
  );

  return (
    <section className="bg-[#f8f8f8] px-4 py-4">
      <div className="mb-4 flex items-center gap-4">
        <p className="font-semibold text-[#7e11d1]">登録済み画像</p>
        {error && <span className="text-sm text-[#e04787]">{error}</span>}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {images.map((image, imageIdx) => {
          const isDeleting = deletingImageId === image.id;
          return (
            <div
              className="relative flex flex-col items-end gap-1"
              key={imageIdx}
            >
              <ConsoleButton
                disabled={isDeleting}
                onClick={() => setDeleteTargetImageId(image.id)}
                variant="danger"
              >
                {isDeleting ? "削除中" : "削除"}
              </ConsoleButton>
              <Link
                className="relative block size-48 bg-white"
                href={`/api/images/${image.id}/raw`}
                target="_blank"
                rel="noopener"
              >
                <img
                  src={`/api/images/${image.id}/raw`}
                  alt={image.file_name}
                  className="size-full object-contain"
                />
              </Link>
            </div>
          );
        })}
      </div>
      <ConsoleConfirmDialog
        open={deleteTargetImageId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetImageId(null);
        }}
        title="画像を削除"
        description="この画像を削除します。元に戻すことはできません。"
        confirmLabel="削除する"
        confirmingLabel="削除中"
        isConfirming={deletingImageId !== null}
        onConfirm={() => {
          if (deleteTargetImageId) return handleDelete(deleteTargetImageId);
        }}
      />
    </section>
  );
}
