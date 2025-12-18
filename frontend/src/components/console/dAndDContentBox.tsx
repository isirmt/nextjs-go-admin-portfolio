"use client";

import React, { useCallback, useRef, useState } from "react";

export default function DAndDContentBox() {
  const inputtingFileButtonRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, [])

  const handleFiles = useCallback((files: FileList | File[]) => {
    console.log(files);
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles])

  return (
    <section className="w-full relative flex-col flex px-16 space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full select-none flex flex-col gap-3 justify-center items-center text-[#7e11d1] font-semibold px-6 py-3 transition-all duration-200 ${isDragging ? "bg-[#dcbff3]" : "bg-[#f6eaff]"}`}
      >
        <div className="text-3xl">画像登録</div>
        <div className="items-center flex justify-center gap-3">
          <div className="border-2 text-center leading-none border-dotted size-30 text-2xl flex items-center justify-center">
            ドラッグ<br />&<br />ドロップ
          </div>
          <div>
            または
          </div>
          <button
            onClick={() => inputtingFileButtonRef.current?.click()}
            className="border-2 text-center leading-none border-dotted size-30 text-2xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-[#dcbff3]">
            ファイルを<br />選択
          </button>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            ref={inputtingFileButtonRef}
          />
        </div>
      </div>
    </section>
  );
}
