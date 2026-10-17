"use client";

import { useState } from "react";

type TagAndSortControlsProps<T extends string> = {
  tags: { id: string; name: string }[];
  selectedTagIds: Set<string>;
  onToggleTag: (id: string) => void;
  onClearTags: () => void;
  sort: T;
  sortOptions: readonly { value: T; label: string }[];
  onSortChange: (value: T) => void;
  sortName: string;
};

export default function TagAndSortControls<T extends string>({
  tags,
  selectedTagIds,
  onToggleTag,
  onClearTags,
  sort,
  sortOptions,
  onSortChange,
  sortName,
}: TagAndSortControlsProps<T>) {
  const [isOpeningFilter, setIsOpeningFilter] = useState(false);
  const selectedSortIndex = sortOptions.findIndex(
    (option) => option.value === sort,
  );

  return (
    <div className="relative mt-8 mb-28 flex w-full flex-col items-center justify-center sm:items-end">
      <div className="relative flex w-full flex-col-reverse items-center justify-center gap-8 md:flex-row md:gap-12">
        <div className="flex flex-col items-start gap-1.5 select-none">
          <button
            className={`pointer-events-auto scale-100 cursor-pointer rounded-full border border-[#6354EB] px-3 py-1 text-base font-bold transition-[background-color,color,scale] duration-[250ms,250ms,500ms] ease-[linear,linear,cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 ${isOpeningFilter ? "bg-[#6354EB] text-white" : "bg-white text-[#6354EB] hover:bg-[#e4e0ff]"}`}
            onClick={() => setIsOpeningFilter((current) => !current)}
          >
            AND Filter
          </button>
        </div>
        <fieldset
          className="relative grid w-64 rounded-full border border-[#6354EB] bg-white p-0.5"
          style={{
            gridTemplateColumns: `repeat(${sortOptions.length}, minmax(0, 1fr))`,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-full bg-[#6354EB] transition-transform duration-150 ease-out"
            style={{
              width: `calc((100% - 0.5rem) / ${sortOptions.length})`,
              transform: `translateX(${Math.max(selectedSortIndex, 0) * 100}%)`,
            }}
          />
          {sortOptions.map((option) => {
            const isSelected = sort === option.value;
            return (
              <label
                key={option.value}
                className={`group relative z-10 flex cursor-pointer items-center justify-center rounded-full px-3 py-1 text-sm transition-colors select-none ${isSelected ? "text-white" : "text-[#6354EB]"}`}
              >
                <span
                  className={`absolute h-[calc(100%-0.25rem)] w-9/10 rounded-full bg-transparent transition-all group-hover:bg-[#e4e0ff] ${isSelected ? "hidden" : "block"}`}
                />
                <input
                  className="sr-only"
                  type="radio"
                  name={sortName}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onSortChange(option.value)}
                />
                <span className="relative z-10">{option.label}</span>
              </label>
            );
          })}
        </fieldset>
      </div>
      {isOpeningFilter ? (
        <div className="relative flex w-full flex-col space-y-2">
          <button
            className={`w-fit scale-100 cursor-pointer rounded-full border border-[#eb6854] bg-white px-2 py-0.5 text-sm text-[#eb6854] transition-[background-color,opacity,scale] duration-[250ms,100ms,500ms] ease-[linear,linear,cubic-bezier(0.34,1.56,0.64,1)] select-none hover:scale-110 hover:bg-[#ffe4e0] ${selectedTagIds.size > 0 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
            onClick={onClearTags}
          >
            CLEAR
          </button>
          <ul className="flex flex-wrap justify-start gap-1.5">
            {tags.map((tag) => (
              <li key={tag.id}>
                <button
                  className={`pointer-events-auto scale-100 cursor-pointer rounded-full border border-[#6354EB] px-2 py-0.5 text-sm transition-[background-color,color,scale] duration-[250ms,250ms,500ms] ease-[linear,linear,cubic-bezier(0.34,1.56,0.64,1)] select-none hover:scale-110 ${selectedTagIds.has(tag.id) ? "bg-[#6354EB] text-white" : "bg-white text-[#6354EB] hover:bg-[#e4e0ff]"}`}
                  onClick={() => onToggleTag(tag.id)}
                >
                  #{tag.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
