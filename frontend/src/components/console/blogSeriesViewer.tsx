"use client";

import {
  DragDropProvider,
  PointerSensor,
  type DragEndEvent,
} from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useCallback, useState } from "react";
import { useBlogSeriesContext } from "@/contexts/blogSeriesContext";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import backendApi from "@/lib/auth/backendFetch";
import { formatJapaneseDateTime } from "@/lib/date";
import type { BlogArticleSummary, BlogSeries } from "@/types/blogs/common";
import ConsoleButton from "./consoleButton";
import BlogSeriesEditor from "./blogSeriesEditor";
import ConsoleConfirmDialog from "./consoleConfirmDialog";
import ConsoleFormFeedback from "./consoleFormFeedback";
import ConsoleModal from "./consoleModal";

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
        <BlogSeriesEditor
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
