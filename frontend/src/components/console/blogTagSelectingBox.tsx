"use client";

import { useCallback, useState } from "react";
import { useBlogTagsContext } from "@/contexts/blogTagsContext";
import backendApi from "@/lib/auth/backendFetch";
import useConsoleTextField from "@/hooks/useConsoleTextField";
import ConsoleButton from "./consoleButton";
import ConsoleSelectableTagButton from "./consoleSelectableTagButton";
import { ConsoleTextField } from "./consoleField";
import { LabelText } from "./labelBlock";

type BlogTagSelectingBoxProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export default function BlogTagSelectingBox({
  selectedIds,
  onChange,
}: BlogTagSelectingBoxProps) {
  const { blogTags, refreshBlogTags } = useBlogTagsContext();
  const name = useConsoleTextField();
  const slug = useConsoleTextField();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleToggle = useCallback(
    (id: string) => {
      const nextSelectedIds = selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id];
      onChange(nextSelectedIds);
    },
    [onChange, selectedIds],
  );

  const handleCreateBlogTag = useCallback(async () => {
    const trimmedName = name.value.trim();
    const trimmedSlug = slug.value.trim();
    if (!trimmedName || !trimmedSlug) {
      setSubmitError("タグ名と SLUG を入力してください");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await backendApi("/blog-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, slug: trimmedSlug }),
      });
      if (!response.ok) {
        throw new Error((await response.text()) || "タグの登録に失敗しました");
      }
      await refreshBlogTags();
      name.reset();
      slug.reset();
    } catch (reason) {
      setSubmitError(
        reason instanceof Error ? reason.message : "タグの登録に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [name, refreshBlogTags, slug]);

  return (
    <div className="relative flex w-full flex-col gap-4 bg-[#f8f8f8] p-4">
      <div className="flex flex-wrap gap-3">
        {blogTags.map((tag) => (
          <ConsoleSelectableTagButton
            key={tag.id}
            isSelected={selectedIds.includes(tag.id)}
            onToggled={() => handleToggle(tag.id)}
          >
            {tag.name}
          </ConsoleSelectableTagButton>
        ))}
      </div>
      <div className="flex flex-col gap-4 border-y border-dashed border-[#c6a5ec] bg-white p-4">
        <label className="text-xs font-semibold text-gray-600">
          <LabelText required>タグ名</LabelText>
          <ConsoleTextField {...name.inputProps} placeholder="Next.js" />
        </label>
        <label className="text-xs font-semibold text-gray-600">
          <LabelText required>SLUG</LabelText>
          <ConsoleTextField {...slug.inputProps} placeholder="nextjs" />
        </label>
        {submitError ? (
          <p className="text-sm text-[#e04787]">{submitError}</p>
        ) : null}
        <ConsoleButton
          type="button"
          onClick={handleCreateBlogTag}
          disabled={isSubmitting}
        >
          追加
        </ConsoleButton>
      </div>
    </div>
  );
}
