/* eslint-disable @next/next/no-img-element */
"use client";

import { useImagesContext } from "@/contexts/imagesContext";

export default function ImagesViewer() {
  const { images, error } = useImagesContext();

  return (
    <section className="bg-[#f8f8f8] px-4 py-4">
      <div className="mb-4 flex items-center gap-4">
        <p className="font-semibold text-[#7e11d1]">登録済み画像</p>
        {error && <span className="text-sm text-[#e04787]">{error}</span>}
      </div>
      <div className="flex flex-wrap gap-4">
        {images.map((image) => (
          <button className="relative size-48 bg-white" key={image.id}>
            <img
              src={`/api/images/${image.id}`}
              alt={image.file_name}
              className="size-full object-contain"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
