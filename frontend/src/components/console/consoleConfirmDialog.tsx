"use client";

import { Button } from "@/components/shadcn/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/ui/alert-dialog";

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
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isConfirming) onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent className="rounded-xl shadow-none">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isConfirming}
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isConfirming}
            onClick={onConfirm}
          >
            {isConfirming ? confirmingLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
