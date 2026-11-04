import type { ReactNode } from "react";
import { Button } from "@/components/shadcn/ui/button";

type ConsoleSelectableTagButtonProps = {
  children: ReactNode;
  isSelected: boolean;
  onToggled: () => void;
};

export default function ConsoleSelectableTagButton({
  children,
  isSelected,
  onToggled,
}: ConsoleSelectableTagButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={isSelected}
      onClick={onToggled}
      className={isSelected ? "border-primary text-primary" : undefined}
    >
      {children}
    </Button>
  );
}
