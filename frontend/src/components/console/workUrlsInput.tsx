"use client";

import {
  DragDropProvider,
  PointerSensor,
  type DragEndEvent,
} from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Field, FieldLabel } from "@/components/shadcn/ui/field";
import { Input } from "@/components/shadcn/ui/input";

export type WorkUrlItem = {
  id: string;
  label: string;
  url: string;
};

export const createEmptyWorkUrlItem = (): WorkUrlItem => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `work-url-${Date.now()}-${Math.random()}`,
  label: "",
  url: "",
});

type WorkUrlsInputProps = {
  items: WorkUrlItem[];
  onChange: (items: WorkUrlItem[]) => void;
};

type SortableWorkUrlItemProps = {
  item: WorkUrlItem;
  index: number;
  onFieldChange: (id: string, field: "label" | "url", value: string) => void;
  onRemove: (id: string) => void;
};

function SortableWorkUrlItem({
  item,
  index,
  onFieldChange,
  onRemove,
}: SortableWorkUrlItemProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: item.id,
    index,
  });

  return (
    <div
      ref={ref}
      className={`border-border/50 bg-muted/30 flex w-full flex-col gap-4 rounded-xl border p-4 ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between text-sm font-medium select-none">
        <span>LINK {index + 1}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            ref={handleRef}
            className="text-muted-foreground cursor-grab touch-none active:cursor-grabbing"
          >
            <GripVerticalIcon />
          </button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onRemove(item.id)}
          >
            <Trash2Icon />
            削除
          </Button>
        </div>
      </div>
      <Field>
        <FieldLabel htmlFor={`work-url-label-${item.id}`}>
          ラベル <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id={`work-url-label-${item.id}`}
          value={item.label}
          onChange={(e) => onFieldChange(item.id, "label", e.target.value)}
          placeholder="Example"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`work-url-value-${item.id}`}>
          URL <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id={`work-url-value-${item.id}`}
          type="url"
          value={item.url}
          onChange={(e) => onFieldChange(item.id, "url", e.target.value)}
          placeholder="https://example.com"
        />
      </Field>
    </div>
  );
}

export default function WorkUrlsInput({ items, onChange }: WorkUrlsInputProps) {
  const handleFieldChange = useCallback(
    (id: string, field: "label" | "url", value: string) => {
      onChange(
        items.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      );
    },
    [items, onChange],
  );

  const handleAddItem = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onChange([...items, createEmptyWorkUrlItem()]);
    },
    [items, onChange],
  );

  const handleRemove = useCallback(
    (id: string) => {
      onChange(items.filter((item) => item.id !== id));
    },
    [items, onChange],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return;

      const { source } = event.operation;
      if (!isSortable(source) || source.initialIndex === source.index) return;

      const nextItems = [...items];
      const [movedItem] = nextItems.splice(source.initialIndex, 1);
      nextItems.splice(source.index, 0, movedItem);
      onChange(nextItems);
    },
    [items, onChange],
  );

  if (!items.length) {
    return (
      <div>
        <Button type="button" variant="outline" onClick={handleAddItem}>
          <PlusIcon />
          リンクを追加
        </Button>
      </div>
    );
  }

  return (
    <DragDropProvider sensors={[PointerSensor]} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <SortableWorkUrlItem
            key={item.id}
            item={item}
            index={index}
            onFieldChange={handleFieldChange}
            onRemove={handleRemove}
          />
        ))}
        <Button type="button" variant="outline" onClick={handleAddItem}>
          <PlusIcon />
          リンクを追加
        </Button>
      </div>
    </DragDropProvider>
  );
}
