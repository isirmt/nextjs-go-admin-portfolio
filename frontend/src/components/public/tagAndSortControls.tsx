"use client";

import { useState } from "react";
import SegmentedControl from "./segmentedControl";

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
        <SegmentedControl
          value={sort}
          options={sortOptions}
          onChange={onSortChange}
          name={sortName}
        />
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
