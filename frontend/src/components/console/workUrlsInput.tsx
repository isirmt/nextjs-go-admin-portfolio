"use client";

import {
  DragDropProvider,
  PointerSensor,
  type DragEndEvent,
} from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useCallback } from "react";
import ConsoleButton from "./consoleButton";
import { ConsoleTextField } from "./consoleField";
import { LabelText } from "./labelBlock";

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
      className={`flex w-full flex-col gap-3 border border-dotted border-[#c68ef0] bg-white/60 p-4 ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between text-sm font-semibold text-[#7e11d1] select-none">
        <span>LINK {index + 1}</span>
        <div className="flex items-center gap-3">
          <span
            ref={handleRef}
            className="cursor-grab touch-none text-lg leading-none active:cursor-grabbing"
          >
            ⠿
          </span>
          <ConsoleButton onClick={() => onRemove(item.id)} variant="danger">
            削除
          </ConsoleButton>
        </div>
      </div>
      <label>
        <LabelText required>ラベル</LabelText>
        <ConsoleTextField
          value={item.label}
          onChange={(e) => onFieldChange(item.id, "label", e.target.value)}
          placeholder="Example"
        />
      </label>
      <label>
        <LabelText required>URL</LabelText>
        <ConsoleTextField
          type="url"
          value={item.url}
          onChange={(e) => onFieldChange(item.id, "url", e.target.value)}
          placeholder="https://example.com"
        />
      </label>
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
      <div className="flex flex-col items-center justify-center gap-4">
        <ConsoleButton onClick={handleAddItem} variant="icon">
          +
        </ConsoleButton>
      </div>
    );
  }

  return (
    <DragDropProvider sensors={[PointerSensor]} onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center justify-center gap-4">
        {items.map((item, index) => (
          <SortableWorkUrlItem
            key={item.id}
            item={item}
            index={index}
            onFieldChange={handleFieldChange}
            onRemove={handleRemove}
          />
        ))}
        <ConsoleButton onClick={handleAddItem} variant="icon">
          +
        </ConsoleButton>
      </div>
    </DragDropProvider>
  );
}
