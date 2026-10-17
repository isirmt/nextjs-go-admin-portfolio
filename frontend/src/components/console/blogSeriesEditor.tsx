/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useState } from "react";
import { useBlogArticlesContext } from "@/contexts/blogArticlesContext";
import { useBlogSeriesContext } from "@/contexts/blogSeriesContext";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import useConsoleTextField from "@/hooks/useConsoleTextField";
import backendApi from "@/lib/auth/backendFetch";
import type { BlogSeries } from "@/types/blogs/common";
import ConsoleButton from "./consoleButton";
import { ConsoleTextArea, ConsoleTextField } from "./consoleField";
import ConsoleFormFeedback from "./consoleFormFeedback";
import { LabelText } from "./labelBlock";

type BlogSeriesEditorProps = {
  series: BlogSeries | null;
  onSaved: () => void;
};

export default function BlogSeriesEditor({
  series,
  onSaved,
}: BlogSeriesEditorProps) {
  const { articles } = useBlogArticlesContext();
  const { refreshBlogSeries } = useBlogSeriesContext();
  const title = useConsoleTextField(series?.title ?? "");
  const slug = useConsoleTextField(series?.slug ?? "");
  const description = useConsoleTextField(series?.description ?? "");
  const [articleIds, setArticleIds] = useState(
    series?.articles.map((article) => article.id) ?? [],
  );
  const { isPending, error, run } = useConsoleMutation();

  const handleToggleArticle = useCallback((articleId: string) => {
    setArticleIds((current) =>
      current.includes(articleId)
        ? current.filter((id) => id !== articleId)
        : [...current, articleId],
    );
  }, []);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await run(async () => {
      const response = await backendApi(
        series ? `/blog-series/${series.id}` : "/blog-series",
        {
          method: series ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.value.trim(),
            slug: slug.value.trim(),
            description: description.value.trim() || null,
            article_ids: articleIds,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          (await response.text()) || "シリーズの保存に失敗しました",
        );
      }
      await refreshBlogSeries();
    }, "シリーズの保存に失敗しました");

    if (result.ok) onSaved();
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <label>
        <LabelText required>シリーズ名</LabelText>
        <ConsoleTextField required {...title.inputProps} />
      </label>
      <label>
        <LabelText required>SLUG</LabelText>
        <ConsoleTextField required {...slug.inputProps} />
      </label>
      <label>
        <LabelText>説明</LabelText>
        <ConsoleTextArea {...description.inputProps} />
      </label>
      <section className="flex flex-col gap-3 py-4">
        <LabelText>記事を選択</LabelText>
        <div className="flex flex-wrap gap-4">
          {articles.map((article) => {
            const isSelected = articleIds.includes(article.id);
            return (
              <button
                key={article.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleToggleArticle(article.id)}
                className={`relative w-28 cursor-pointer overflow-hidden rounded border-2 bg-white text-left shadow-[.25rem_.25rem_0_0_#67c8e6] ${isSelected ? "border-[#65a6df]" : "border-[#67c8e6]"}`}
              >
                <div
                  className={`absolute top-0 left-0 z-1 flex size-full items-center justify-center bg-[#65a6df]/75 transition-all duration-200 ${isSelected ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
                >
                  <span className="font-dot flex size-12 items-center justify-center rounded-full border-4 border-white text-2xl font-semibold text-white drop-shadow">
                    {articleIds.findIndex((id) => id === article.id) + 1}
                  </span>
                </div>
                <img
                  src={
                    article.thumbnail_image_id
                      ? `/api/images/${article.thumbnail_image_id}/raw`
                      : `/console/blogs/${article.id}/og-image`
                  }
                  alt=""
                  className="aspect-square w-full object-contain"
                />
                <p className="truncate px-2 py-1.5 text-xs font-semibold">
                  {article.title}
                </p>
              </button>
            );
          })}
        </div>
      </section>
      <ConsoleFormFeedback error={error} />
      <ConsoleButton type="submit" disabled={isPending}>
        {isPending ? "保存中" : "保存"}
      </ConsoleButton>
    </form>
  );
}
