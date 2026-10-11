"use client";

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
    <div className="flex flex-col items-center justify-center gap-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex w-full flex-col gap-3 border border-dotted border-[#c68ef0] bg-white/60 p-4"
        >
          <div className="flex items-center justify-between text-sm font-semibold text-[#7e11d1] select-none">
            <span>LINK {index + 1}</span>
            <ConsoleButton
              onClick={() => handleRemove(item.id)}
              variant="danger"
            >
              削除
            </ConsoleButton>
          </div>
          <label>
            <LabelText required>ラベル</LabelText>
            <ConsoleTextField
              value={item.label}
              onChange={(e) =>
                handleFieldChange(item.id, "label", e.target.value)
              }
              placeholder="Example"
            />
          </label>
          <label>
            <LabelText required>URL</LabelText>
            <ConsoleTextField
              type="url"
              value={item.url}
              onChange={(e) =>
                handleFieldChange(item.id, "url", e.target.value)
              }
              placeholder="https://example.com"
            />
          </label>
        </div>
      ))}
      <ConsoleButton onClick={handleAddItem} variant="icon">
        +
      </ConsoleButton>
    </div>
  );
}
