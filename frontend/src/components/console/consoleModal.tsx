"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

type ConsoleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
};

export default function ConsoleModal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: ConsoleModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-70 bg-[#054a5c]/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-80 flex max-h-[calc(100dvh-2rem)] w-[min(64rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border-2 border-[#7e11d1] bg-white outline-none">
          <div className="flex items-start justify-between gap-4 bg-[#7e11d1] px-5 py-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-white">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-white">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="閉じる"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center text-xl leading-none font-bold text-white transition"
            >
              ×
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto px-5 py-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
