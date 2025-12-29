/* eslint-disable @next/next/no-img-element */
"use client";

import { useImagesContext } from "@/contexts/imagesContext";
import backendApi from "@/lib/auth/backendFetch";
import Link from "next/link";
import { useCallback, useState } from "react";

export default function ImagesViewer() {
  const { images, error, refreshImages } = useImagesContext();
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (imageId: string) => {
      const shouldDelete = window.confirm("削除しますか？");
      if (!shouldDelete) {
        return;
      }

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
              <button
                disabled={isDeleting}
                onClick={() => handleDelete(image.id)}
                className="mr-1 cursor-pointer border-b text-sm leading-none font-bold text-[#e04787] transition-all duration-200 hover:text-[#b03062]"
              >
                {isDeleting ? "削除中" : "削除"}
              </button>
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
    </section>
  );
}
