"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import ImageSelectingBox from "./imageSelectingBox";
import ConsoleButton from "./consoleButton";

type ImageSelectingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedIds: string[];
  multiple?: boolean;
  onSelect: (ids: string[]) => void;
};

export default function ImageSelectingDialog({
  open,
  onOpenChange,
  initialSelectedIds,
  multiple,
  onSelect,
}: ImageSelectingDialogProps) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-70 bg-[#054a5c]/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-80 flex max-h-[calc(100dvh-2rem)] w-[min(64rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border-2 border-[#7e11d1] bg-white outline-none">
          <div className="flex items-start justify-between gap-4 bg-[#7e11d1] px-5 py-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-white">
                画像を選択
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-white">
                {multiple
                  ? "複数の画像を選択できます"
                  : "画像を1つ選択できます"}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="閉じる"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center text-xl leading-none font-bold text-white transition"
            >
              ×
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto p-5">
            <ImageSelectingBox
              key={`${open}-${initialSelectedIds.join("-")}`}
              initialSelectedIds={initialSelectedIds}
              multiple={multiple}
              onChange={setSelectedIds}
            />
          </div>
          <div className="bg-[#f0f0f0] p-5">
            <ConsoleButton
              onClick={() => {
                onSelect(selectedIds);
                onOpenChange(false);
              }}
            >
              選択を確定
            </ConsoleButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
