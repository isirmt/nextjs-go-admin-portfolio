"use client";

import { useCallback, useMemo, useState } from "react";
import type { BlogArticleSummary, BlogTag } from "@/types/blogs/common";
import TagAndSortControls from "@/components/public/tagAndSortControls";
import BlogArticleCard from "./blogArticleCard";
import BlogArticleTagList from "./blogArticleTagList";

type BlogSort = "newest" | "oldest";

const BLOG_SORT_OPTIONS = [
  { value: "newest", label: "新しい順" },
  { value: "oldest", label: "古い順" },
] as const;

function articlePublishedTime(article: BlogArticleSummary) {
  return Date.parse(article.published_at ?? article.created_at) || 0;
}

export default function BlogArticlesList({
  articles,
}: {
  articles: BlogArticleSummary[];
}) {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<BlogSort>("newest");

  const tags = useMemo(() => {
    const tagsByID = new Map<string, BlogTag>();
    for (const article of articles) {
      for (const tag of article.tags) {
        tagsByID.set(tag.id, tag);
      }
    }
    return [...tagsByID.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "ja"),
    );
  }, [articles]);

  const visibleArticles = useMemo(() => {
    const filtered = articles.filter((article) => {
      if (selectedTagIds.size === 0) return true;
      const articleTagIDs = new Set(article.tags.map((tag) => tag.id));
      return [...selectedTagIds].every((tagID) => articleTagIDs.has(tagID));
    });

    return [...filtered].sort((a, b) => {
      const difference = articlePublishedTime(a) - articlePublishedTime(b);
      if (difference === 0) return a.id.localeCompare(b.id);
      return sort === "oldest" ? difference : -difference;
    });
  }, [articles, selectedTagIds, sort]);

  const handleToggleTag = useCallback((tagID: string) => {
    setSelectedTagIds((current) => {
      const next = new Set(current);
      if (next.has(tagID)) {
        next.delete(tagID);
      } else {
        next.add(tagID);
      }
      return next;
    });
  }, []);

  const clearTags = useCallback(() => {
    setSelectedTagIds(new Set());
  }, []);

  return (
    <>
      <TagAndSortControls
        tags={tags}
        selectedTagIds={selectedTagIds}
        onToggleTag={handleToggleTag}
        onClearTags={clearTags}
        sort={sort}
        sortOptions={BLOG_SORT_OPTIONS}
        onSortChange={setSort}
        sortName="blog-sort"
      />
      {visibleArticles.length ? (
        <div className="mx-auto flex w-full flex-wrap justify-center gap-8 px-4 select-none">
          {visibleArticles.map((article) => (
            <div className="flex shrink-0 flex-col gap-2.5" key={article.id}>
              <BlogArticleCard article={article} />
              <BlogArticleTagList tags={article.tags} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-xl font-semibold text-[#555]">
          お探しの条件では見つかりませんでした(T_T)
        </p>
      )}
    </>
  );
}
