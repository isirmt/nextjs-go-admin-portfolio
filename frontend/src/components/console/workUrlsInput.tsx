"use client";

import { useCallback } from "react";
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

  const handleAddItem = useCallback(() => {
    onChange([...items, createEmptyWorkUrlItem()]);
  }, [items, onChange]);

  const handleRemove = useCallback(
    (id: string) => {
      onChange(items.filter((item) => item.id !== id));
    },
    [items, onChange],
  );

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <button
          onClick={handleAddItem}
          className="flex size-8 cursor-pointer items-center justify-center border border-[#7e11d1] text-xl leading-none font-bold text-[#7e11d1] transition hover:bg-[#7e11d1] hover:text-white"
        >
          +
        </button>
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
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              className="cursor-pointer text-xs text-[#e04787] underline underline-offset-2 hover:text-[#b03062]"
            >
              削除
            </button>
          </div>
          <label>
            <LabelText required>ラベル</LabelText>
            <input
              className="w-full border-b-2 border-[#c68ef0] px-4 py-1 outline-none focus:border-[#7e11d1]"
              value={item.label}
              onChange={(e) =>
                handleFieldChange(item.id, "label", e.target.value)
              }
              placeholder="Example"
            />
          </label>
          <label>
            <LabelText required>URL</LabelText>
            <input
              type="url"
              className="w-full border-b-2 border-[#c68ef0] px-4 py-1 outline-none focus:border-[#7e11d1]"
              value={item.url}
              onChange={(e) =>
                handleFieldChange(item.id, "url", e.target.value)
              }
              placeholder="https://example.com"
            />
          </label>
        </div>
      ))}
      <button
        onClick={handleAddItem}
        className="flex size-8 cursor-pointer items-center justify-center border border-[#7e11d1] text-xl leading-none font-bold text-[#7e11d1] transition hover:bg-[#7e11d1] hover:text-white"
      >
        +
      </button>
    </div>
  );
}
