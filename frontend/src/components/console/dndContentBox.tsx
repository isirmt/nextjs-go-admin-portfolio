"use client";

import { useEffect } from "react";
import { useDragAndDropUploader } from "@/hooks/useDragAndDropUploader";
import { useImagesContext } from "@/contexts/imagesContext";

export default function DndContentBox() {
  const { refreshImages } = useImagesContext();
  const {
    isDragging,
    dragProps,
    fileInputProps,
    openFileDialog,
    fileUploadingStates,
  } = useDragAndDropUploader({ onUploadSuccess: refreshImages });

  useEffect(() => {
    console.log(fileUploadingStates);
  }, [fileUploadingStates]);

  return (
    <section className="relative flex w-full flex-col space-y-4">
      <div
        {...dragProps}
        className={`flex w-full flex-col items-center justify-center gap-3 border-2 border-dotted px-6 py-3 font-semibold text-[#7e11d1] transition-all duration-200 select-none ${isDragging ? "bg-[#dcbff3]" : "bg-[#f6eaff]"}`}
      >
        <div className="text-3xl">画像登録</div>
        <div className="flex items-center justify-center gap-3">
          <div className="flex size-30 items-center justify-center border-2 border-dotted text-center text-2xl leading-none">
            ドラッグ
            <br />&<br />
            ドロップ
          </div>
          <div>または</div>
          <button
            onClick={openFileDialog}
            className="flex size-30 cursor-pointer items-center justify-center border-2 border-dotted text-center text-2xl leading-none transition-all duration-200 hover:bg-[#dcbff3]"
          >
            ファイルを
            <br />
            選択
          </button>
          <input type="file" className="hidden" {...fileInputProps} />
        </div>
      </div>
    </section>
  );
}
