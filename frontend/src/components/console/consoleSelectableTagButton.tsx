import type { ReactNode } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/shadcn/ui/context-menu";

type ConsoleSelectableTagButtonProps = {
  children: ReactNode;
  isSelected: boolean;
  onToggled: () => void;
  onDeleteRequested?: () => void;
};

export default function ConsoleSelectableTagButton({
  children,
  isSelected,
  onToggled,
  onDeleteRequested,
}: ConsoleSelectableTagButtonProps) {
  const button = (
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

  if (!onDeleteRequested) return button;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{button}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem variant="destructive" onSelect={onDeleteRequested}>
          <Trash2Icon />
          削除
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
