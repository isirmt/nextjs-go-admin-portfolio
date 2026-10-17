"use client";

import ConsoleButton from "./consoleButton";
import ConsoleModal from "./consoleModal";

type ConsoleConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmingLabel: string;
  isConfirming?: boolean;
  onConfirm: () => void | Promise<void>;
};

export default function ConsoleConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmingLabel,
  isConfirming = false,
  onConfirm,
}: ConsoleConfirmDialogProps) {
  return (
    <ConsoleModal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isConfirming) onOpenChange(nextOpen);
      }}
      title={title}
      description={description}
    >
      <div className="flex flex-wrap justify-end gap-3">
        <ConsoleButton
          variant="text"
          disabled={isConfirming}
          onClick={() => onOpenChange(false)}
        >
          キャンセル
        </ConsoleButton>
        <ConsoleButton
          disabled={isConfirming}
          className="w-auto bg-[#e04787] text-base hover:bg-[#b03062]"
          onClick={onConfirm}
        >
          {isConfirming ? confirmingLabel : confirmLabel}
        </ConsoleButton>
      </div>
    </ConsoleModal>
  );
}
