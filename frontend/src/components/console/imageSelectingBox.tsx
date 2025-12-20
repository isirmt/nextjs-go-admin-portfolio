/* eslint-disable @next/next/no-img-element */
"use client";

import { CommonImage } from "@/types/images/common";
import { useEffect, useState } from "react";

type ImageSelectingBoxProps = {
  onChange: (ids: string[]) => void;
  multiple?: boolean;
};

export default function ImageSelectingBox({
  onChange,
  multiple,
}: ImageSelectingBoxProps) {
  const [images, setImages] = useState<CommonImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch("/api/images");
      const parsedImages = (await response.json()) as CommonImage[];
      setImages(parsedImages);
    };

    fetchImages();
  }, []);

  useEffect(() => {
    onChange(selectedIds);
  }, [onChange, selectedIds]);

  return (
    <div className="relative flex w-full flex-col gap-4 bg-[#f8f8f8] p-4">
      <p>{multiple ? "複数選択可能" : "一つを選択"}</p>
      <div className="flex w-full flex-wrap gap-4">
        {images.map((image, imageIdx) => (
          <button
            key={imageIdx}
            className={`relative aspect-square size-24 cursor-pointer overflow-hidden rounded border-2 bg-white shadow-[.25rem_.25rem_0_0_#67c8e6] ${selectedIds.includes(image.id) ? "border-[#65a6df]" : "border-[#67c8e6]"}`}
            onClick={(e) => {
              e.preventDefault();
              setSelectedIds((prev) => {
                if (multiple) {
                  const exists = prev.includes(image.id);
                  return exists
                    ? prev.filter((id) => id !== image.id)
                    : [...prev, image.id];
                }

                return [image.id];
              });
            }}
          >
            <div
              className={`absolute top-0 left-0 z-1 flex size-full items-center justify-center transition-all duration-200 ${selectedIds.includes(image.id) ? "bg-[#65a6df]/75" : "bg-transparent hover:bg-[#65a6df]/75"}`}
            >
              <div
                className={`font-dot flex size-16 items-center justify-center rounded-full border-4 border-white drop-shadow transition-all duration-200 ${selectedIds.includes(image.id) ? "opacity-100" : "opacity-0"}`}
              >
                {multiple && selectedIds.includes(image.id) && (
                  <div className="text-4xl leading-none font-semibold whitespace-nowrap text-white">
                    {selectedIds.findIndex((id) => image.id === id) + 1}
                  </div>
                )}
              </div>
            </div>
            <img
              className="pointer-events-none relative object-contain"
              src={`/api/images/${image.id}`}
              alt={image.file_name}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
