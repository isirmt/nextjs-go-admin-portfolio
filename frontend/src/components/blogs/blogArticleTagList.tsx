import type { BlogTag } from "@/types/blogs/common";

type BlogArticleTagListProps = {
  tags: BlogTag[];
  maxVisibleTags?: number;
  fullWidth?: boolean;
};

export default function BlogArticleTagList({
  tags,
  maxVisibleTags,
  fullWidth = false,
}: BlogArticleTagListProps) {
  const visibleTags =
    maxVisibleTags === undefined ? tags : tags.slice(0, maxVisibleTags);
  const remainingCount = tags.length - visibleTags.length;

  return (
    <div
      className={`flex flex-wrap justify-start gap-3 ${fullWidth ? "w-full" : "w-84"}`}
    >
      {visibleTags.map((tag) => (
        <div
          key={tag.id}
          className="relative flex scale-y-110 items-center gap-3 overflow-hidden rounded-sm bg-[#307f97] px-2 py-px tracking-[.1rem] shadow-[.125rem_.125rem_0_0_#67c8e6] transition-all duration-150"
        >
          <span className="font-zen text-sm leading-none font-bold text-[#98e3fa]">
            {tag.name}
          </span>
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="relative flex scale-y-110 items-center gap-3 overflow-hidden bg-[#307f97] px-2 py-px tracking-[.1rem] shadow-[.125rem_.125rem_0_0_#67c8e6]">
          <span className="font-zen text-sm leading-none font-bold text-[#98e3fa]">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}
