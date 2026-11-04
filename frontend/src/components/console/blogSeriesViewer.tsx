"use client";

import {
  DragDropProvider,
  PointerSensor,
  type DragEndEvent,
} from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import {
  EllipsisIcon,
  ListOrderedIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { Fragment, useCallback, useState } from "react";
import { useBlogSeriesContext } from "@/contexts/blogSeriesContext";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import backendApi from "@/lib/auth/backendFetch";
import { formatJapaneseDateTime } from "@/lib/date";
import type { BlogArticleSummary, BlogSeries } from "@/types/blogs/common";
import BlogSeriesEditor from "./blogSeriesEditor";
import ConsoleConfirmDialog from "./consoleConfirmDialog";
import ConsoleFormFeedback from "./consoleFormFeedback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";

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
      <Button
        type="button"
        className="mt-3"
        disabled={isPending}
        onClick={handleSaveOrder}
      >
        {isPending ? "保存中" : "並び順を保存"}
      </Button>
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
        <Button type="button" onClick={openCreate}>
          新規シリーズを作成
        </Button>
      </div>
      <h2 className="font-semibold text-[#7e11d1]">シリーズ一覧</h2>
      <ConsoleFormFeedback error={error} />
      <ConsoleFormFeedback error={deleteError} />
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>シリーズ名</TableHead>
            <TableHead className="w-20">記事数</TableHead>
            <TableHead className="hidden w-36 md:table-cell">
              更新日時
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground h-28 text-center"
              >
                読み込み中です
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading && series.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground h-28 text-center"
              >
                シリーズはありません
              </TableCell>
            </TableRow>
          ) : null}
          {series.map((item) => {
            const isExpanded = expandedSeriesID === item.id;

            return (
              <Fragment key={item.id}>
                <TableRow>
                  <TableCell className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      /{item.slug}
                    </p>
                  </TableCell>
                  <TableCell>{item.articles.length}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatJapaneseDateTime(item.updated_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm">
                          <EllipsisIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            setExpandedSeriesID(isExpanded ? null : item.id)
                          }
                        >
                          <ListOrderedIcon />
                          {isExpanded ? "並び替えを閉じる" : "記事を並び替え"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => openEdit(item)}>
                          <PencilIcon />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => setDeletingSeries(item)}
                        >
                          <Trash2Icon />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {isExpanded ? (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0">
                      <SeriesArticleOrder series={item} />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl shadow-none sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingSeries ? "シリーズを編集" : "新規シリーズを作成"}
            </DialogTitle>
          </DialogHeader>
          <BlogSeriesEditor
            key={editingSeries?.id ?? "new"}
            series={editingSeries}
            onSaved={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <ConsoleConfirmDialog
        open={deletingSeries !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingSeries(null);
        }}
        title="シリーズを削除"
        description="シリーズを削除しますか？"
        confirmLabel="削除する"
        confirmingLabel="削除中"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </main>
  );
}
