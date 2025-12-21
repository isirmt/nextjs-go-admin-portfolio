/* eslint-disable @next/next/no-img-element */
"use client";

import { useImagesContext } from "@/contexts/ImagesContext";
import { useDragAndDropUploader } from "@/hooks/useDragAndDropUploader";
import { useEffect, useState } from "react";

type ImageSelectingBoxProps = {
  onChange: (ids: string[]) => void;
  multiple?: boolean;
};

export default function ImageSelectingBox({
  onChange,
  multiple,
}: ImageSelectingBoxProps) {
  const { images, refreshImages } = useImagesContext();
  const { isDragging, dragProps, fileInputProps, openFileDialog } =
    useDragAndDropUploader({ onUploadSuccess: refreshImages });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    onChange(selectedIds);
  }, [onChange, selectedIds]);

  return (
    <div
      {...dragProps}
      className={`relative flex w-full flex-col gap-4 bg-[#f8f8f8] p-4`}
    >
      <div
        className={`pointer-events-none absolute top-0 left-0 z-10 flex size-full items-center justify-center border-2 border-dotted border-[#7e11d1] bg-[#dcbff3]/80 transition-all duration-200 ${isDragging ? "opacity-100" : "opacity-0"}`}
      >
        <p className="text-4xl font-black text-[#7e11d1]">
          ドロップしてアップロード
        </p>
      </div>
      <div className="flex justify-between">
        <div className="rounded bg-[#054a5c] px-2 py-0.5 font-bold text-[#c6f4ff]">
          {multiple ? "複数選択可能" : "一つを選択"}
        </div>
        <div className="flex items-center gap-2 text-sm leading-none select-none">
          <div>ドラッグ&ドロップでアップロード</div>
          <div>または</div>
          <button
            onClick={(e) => {
              e.preventDefault();
              openFileDialog();
            }}
            className="cursor-pointer border-b hover:border-[#7e11d1] hover:text-[#7e11d1]"
          >
            ファイルを選択
          </button>
          <input type="file" className="hidden" {...fileInputProps} />
        </div>
      </div>
      <div className="flex w-full flex-wrap gap-4">
        {images.map((image, imageIdx) => {
          const isSelected = selectedIds.includes(image.id);
          return (
            <button
              key={imageIdx}
              className={`relative aspect-square size-24 cursor-pointer overflow-hidden rounded border-2 bg-white shadow-[.25rem_.25rem_0_0_#67c8e6] ${isSelected ? "border-[#65a6df]" : "border-[#67c8e6]"}`}
              onClick={(e) => {
                e.preventDefault();
                setSelectedIds((prev) => {
                  const exists = prev.includes(image.id);
                  if (multiple) {
                    return exists
                      ? prev.filter((id) => id !== image.id)
                      : [...prev, image.id];
                  } else {
                    return exists ? [] : [image.id];
                  }
                });
              }}
            >
              <div
                className={`absolute top-0 left-0 z-1 flex size-full items-center justify-center transition-all duration-200 ${isSelected ? "bg-[#65a6df]/75" : "bg-transparent hover:bg-[#65a6df]/75"}`}
              >
                <div
                  className={`font-dot flex size-16 items-center justify-center rounded-full border-4 border-white drop-shadow transition-all duration-200 ${isSelected ? "opacity-100" : "opacity-0"}`}
                >
                  {multiple && isSelected && (
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
          );
        })}
      </div>
    </div>
  );
}
