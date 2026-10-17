/* eslint-disable @next/next/no-img-element */
"use client";

import {
  DragDropProvider,
  PointerSensor,
  type DragEndEvent,
} from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useCallback, useState } from "react";
import { useBlogArticlesContext } from "@/contexts/blogArticlesContext";
import { useBlogSeriesContext } from "@/contexts/blogSeriesContext";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import useConsoleTextField from "@/hooks/useConsoleTextField";
import backendApi from "@/lib/auth/backendFetch";
import { formatJapaneseDateTime } from "@/lib/date";
import type { BlogArticleSummary, BlogSeries } from "@/types/blogs/common";
import ConsoleButton from "./consoleButton";
import ConsoleConfirmDialog from "./consoleConfirmDialog";
import { ConsoleTextArea, ConsoleTextField } from "./consoleField";
import ConsoleFormFeedback from "./consoleFormFeedback";
import ConsoleModal from "./consoleModal";
import { LabelText } from "./labelBlock";

type SeriesEditorProps = {
  series: BlogSeries | null;
  onSaved: () => void;
};

function SeriesEditor({ series, onSaved }: SeriesEditorProps) {
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
        <div>
          <LabelText>記事を選択</LabelText>
        </div>
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
                {article.thumbnail_image_id ? (
                  <img
                    src={`/api/images/${article.thumbnail_image_id}/raw`}
                    alt=""
                    className="aspect-square w-full object-contain"
                  />
                ) : (
                  <img
                    src={`/console/blogs/${article.id}/og-image`}
                    alt=""
                    className="aspect-square w-full object-contain"
                  />
                )}
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

function SortableSeriesArticle({
  article,
  index,
}: {
  article: BlogArticleSummary;
  index: number;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: article.id,
    index,
  });

  return (
    <li
      ref={ref}
      className={`flex items-center gap-3 border border-dashed border-[#c68ef0] bg-white px-3 py-2 ${isDragging ? "opacity-50" : ""}`}
    >
      <span
        ref={handleRef}
        className="cursor-grab touch-none text-lg leading-none active:cursor-grabbing"
        aria-label={`${article.title}を並び替え`}
      >
        ⠿
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
        {index + 1}. {article.title}
      </span>
      <span className="text-xs text-[#555]">/{article.slug}</span>
    </li>
  );
}

function SeriesArticleOrder({ series }: { series: BlogSeries }) {
  const { refreshBlogSeries } = useBlogSeriesContext();
  const [articles, setArticles] = useState(series.articles);
  const { isPending, error, run } = useConsoleMutation();

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (event.canceled) return;
    const { source } = event.operation;
    if (!isSortable(source) || source.initialIndex === source.index) return;

    setArticles((current) => {
      const next = [...current];
      const [moved] = next.splice(source.initialIndex, 1);
      next.splice(source.index, 0, moved);
      return next;
    });
  }, []);

  const handleSaveOrder = async () => {
    await run(async () => {
      const response = await backendApi(`/blog-series/${series.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: series.title,
          slug: series.slug,
          description: series.description,
          article_ids: articles.map((article) => article.id),
        }),
      });
      if (!response.ok) {
        throw new Error(
          (await response.text()) || "並び順の保存に失敗しました",
        );
      }
      await refreshBlogSeries();
    }, "並び順の保存に失敗しました");
  };

  return (
    <div className="border-t border-[#c68ef0] bg-[#f5f5f5] px-4 py-4">
      {articles.length ? (
        <DragDropProvider sensors={[PointerSensor]} onDragEnd={handleDragEnd}>
          <ul className="flex flex-col gap-2">
            {articles.map((article, index) => (
              <SortableSeriesArticle
                key={article.id}
                article={article}
                index={index}
              />
            ))}
          </ul>
        </DragDropProvider>
      ) : (
        <p className="text-sm text-[#7e11d1]">選択されている記事はありません</p>
      )}
      <ConsoleFormFeedback className="mt-3" error={error} />
      <ConsoleButton
        className="mt-3"
        disabled={isPending}
        onClick={handleSaveOrder}
      >
        {isPending ? "保存中" : "並び順を保存"}
      </ConsoleButton>
    </div>
  );
}

export default function BlogSeriesViewer() {
  const { series, isLoading, error, refreshBlogSeries } =
    useBlogSeriesContext();
  const [editingSeries, setEditingSeries] = useState<BlogSeries | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [expandedSeriesID, setExpandedSeriesID] = useState<string | null>(null);
  const [deletingSeries, setDeletingSeries] = useState<BlogSeries | null>(null);
  const {
    isPending: isDeleting,
    error: deleteError,
    run: runDelete,
  } = useConsoleMutation();

  const openCreate = () => {
    setEditingSeries(null);
    setIsEditorOpen(true);
  };

  const openEdit = (item: BlogSeries) => {
    setEditingSeries(item);
    setIsEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingSeries) return;
    const result = await runDelete(async () => {
      const response = await backendApi(`/blog-series/${deletingSeries.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          (await response.text()) || "シリーズの削除に失敗しました",
        );
      }
      await refreshBlogSeries();
    }, "シリーズの削除に失敗しました");
    if (result.ok) setDeletingSeries(null);
  };

  return (
    <main className="relative w-full space-y-8 px-2.5 py-8 lg:px-16">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <ConsoleButton className="w-auto" onClick={openCreate}>
          新規シリーズを作成
        </ConsoleButton>
      </div>
      <h2 className="font-semibold text-[#7e11d1]">シリーズ一覧</h2>
      {error ? <p className="text-sm text-[#e04787]">{error}</p> : null}
      {deleteError ? (
        <p className="text-sm text-[#e04787]">{deleteError}</p>
      ) : null}
      <ul className="flex flex-col gap-4">
        {isLoading ? (
          <li className="px-4 py-8 text-center text-sm text-[#7e11d1]">
            読み込み中です
          </li>
        ) : null}
        {!isLoading && series.length === 0 ? (
          <li className="border border-dashed border-[#c68ef0] bg-white px-4 py-8 text-center text-sm text-[#7e11d1]">
            シリーズはありません
          </li>
        ) : null}
        {series.map((item) => {
          const isExpanded = expandedSeriesID === item.id;
          return (
            <li
              key={item.id}
              className="overflow-hidden rounded border border-[#c68ef0] bg-white shadow-[.2rem_.2rem_0_0_#c68ef0]"
            >
              <div className="flex flex-wrap items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="truncate text-xs">/{item.slug}</p>
                </div>
                <span className="text-xs text-[#444]">
                  {item.articles.length} 記事
                </span>
                <ConsoleButton
                  variant="text"
                  onClick={() =>
                    setExpandedSeriesID(isExpanded ? null : item.id)
                  }
                >
                  {isExpanded ? "閉じる" : "記事を並び替え"}
                </ConsoleButton>
                <ConsoleButton variant="text" onClick={() => openEdit(item)}>
                  編集
                </ConsoleButton>
                <ConsoleButton
                  variant="danger"
                  onClick={() => setDeletingSeries(item)}
                >
                  削除
                </ConsoleButton>
              </div>
              <div className="bg-[#f5f5f5] px-4 py-2 text-xs text-[#444]">
                更新日時: {formatJapaneseDateTime(item.updated_at)}
              </div>
              {isExpanded ? <SeriesArticleOrder series={item} /> : null}
            </li>
          );
        })}
      </ul>
      <ConsoleModal
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        title={editingSeries ? "シリーズを編集" : "新規シリーズを作成"}
        description="シリーズの情報と所属記事を設定します。"
      >
        <SeriesEditor
          key={editingSeries?.id ?? "new"}
          series={editingSeries}
          onSaved={() => setIsEditorOpen(false)}
        />
      </ConsoleModal>
      <ConsoleConfirmDialog
        open={deletingSeries !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingSeries(null);
        }}
        title="シリーズを削除"
        description="シリーズを削除します。記事自体は削除されません。"
        confirmLabel="削除する"
        confirmingLabel="削除中"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </main>
  );
}
