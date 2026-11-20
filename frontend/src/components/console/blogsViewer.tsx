"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronsUpDownIcon,
  EllipsisIcon,
  LinkIcon,
  PencilIcon,
  Trash2Icon,
  TriangleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useBlogArticlesContext } from "@/contexts/blogArticlesContext";
import backendApi from "@/lib/auth/backendFetch";
import { formatJapaneseDateTime } from "@/lib/date";
import type { BlogArticleSummary } from "@/types/blogs/common";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import useDateSort from "@/hooks/useDateSort";
import ConsoleConfirmDialog from "./consoleConfirmDialog";
import ConsoleFormFeedback from "./consoleFormFeedback";
import { Badge } from "@/components/shadcn/ui/badge";
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

type SortKey = "published_at" | "updated_at";

export default function BlogsViewer() {
  const router = useRouter();
  const { articles, error, isLoading, refreshBlogArticles } =
    useBlogArticlesContext();
  const [deletingArticle, setDeletingArticle] =
    useState<BlogArticleSummary | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const {
    sort,
    toggleSort,
    sortedItems: sortedArticles,
  } = useDateSort<BlogArticleSummary, SortKey>(
    articles,
    "published_at",
    "desc",
  );
  const {
    isPending: isDeleting,
    error: deleteError,
    run: runDelete,
  } = useConsoleMutation();

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now());
    updateCurrentTime();
    const interval = window.setInterval(updateCurrentTime, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingArticle) return;

    const result = await runDelete(async () => {
      const response = await backendApi(`/blogs/${deletingArticle.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error((await response.text()) || "記事の削除に失敗しました");
      }
      await refreshBlogArticles();
    }, "記事の削除に失敗しました");

    if (result.ok) setDeletingArticle(null);
  }, [deletingArticle, refreshBlogArticles, runDelete]);

  const copyPublicLink = async (slug: string) => {
    try {
      const url = new URL(
        `/blogs/${encodeURIComponent(slug)}`,
        window.location.origin,
      );
      await navigator.clipboard.writeText(url.toString());
      toast.success("公開リンクをコピーしました");
    } catch {
      toast.error("公開リンクのコピーに失敗しました");
    }
  };

  return (
    <main className="relative w-full space-y-8 px-2.5 py-8 lg:px-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#7e11d1]">記事一覧</h2>
        <Button asChild>
          <Link href="/console/blogs/new">新規記事を作成</Link>
        </Button>
      </div>
      {error ? <p className="text-sm text-[#e04787]">{error}</p> : null}
      <ConsoleFormFeedback error={deleteError} />
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead className="w-24">状態</TableHead>
            {(["published_at", "updated_at"] as const).map((key) => {
              const label = key === "published_at" ? "公開日時" : "更新日時";
              return (
                <TableHead key={key} className="hidden w-36 md:table-cell">
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="hover:text-foreground focus-visible:outline-ring -m-3 flex h-12 w-[calc(100%+1.5rem)] cursor-pointer items-center gap-1 rounded px-3 text-left focus-visible:outline-2"
                  >
                    {label}
                    {sort?.key === key ? (
                      <TriangleIcon
                        aria-hidden="true"
                        className={`fill-muted-foreground text-muted-foreground size-3 ${sort.direction === "desc" ? "rotate-180" : ""}`}
                      />
                    ) : (
                      <ChevronsUpDownIcon
                        aria-hidden="true"
                        className="text-muted-foreground size-3.5"
                      />
                    )}
                  </button>
                </TableHead>
              );
            })}
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground h-28 text-center"
              >
                読み込み中です
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading && articles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground h-28 text-center"
              >
                記事はありません
              </TableCell>
            </TableRow>
          ) : null}
          {sortedArticles.map((article) => (
            <TableRow key={article.id}>
              <TableCell
                className="min-w-0 cursor-pointer"
                onClick={(event) => {
                  if (!(event.target as HTMLElement).closest("a")) {
                    router.push(`/console/blogs/${article.id}`);
                  }
                }}
              >
                <Link
                  href={`/console/blogs/${article.id}`}
                  className="block min-w-0"
                >
                  <p className="truncate font-medium">{article.title}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    /{article.slug}
                  </p>
                </Link>
              </TableCell>
              <TableCell
                className="cursor-pointer"
                onClick={() => router.push(`/console/blogs/${article.id}`)}
              >
                <Badge
                  variant={
                    article.status === "published" ? "secondary" : "default"
                  }
                >
                  {article.status === "draft"
                    ? "下書き"
                    : article.published_at &&
                        currentTime !== null &&
                        new Date(article.published_at).getTime() > currentTime
                      ? "公開予定"
                      : "公開"}
                </Badge>
              </TableCell>
              <TableCell
                className="hidden cursor-pointer md:table-cell"
                onClick={() => router.push(`/console/blogs/${article.id}`)}
              >
                {formatJapaneseDateTime(article.published_at, "未公開")}
              </TableCell>
              <TableCell
                className="hidden cursor-pointer md:table-cell"
                onClick={() => router.push(`/console/blogs/${article.id}`)}
              >
                {formatJapaneseDateTime(article.updated_at)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm">
                      <EllipsisIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {article.status === "published" ? (
                      <DropdownMenuItem
                        onSelect={() => void copyPublicLink(article.slug)}
                      >
                        <LinkIcon />
                        公開リンクをコピー
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem asChild>
                      <Link href={`/console/blogs/${article.id}`}>
                        <PencilIcon />
                        編集
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDeletingArticle(article)}
                    >
                      <Trash2Icon />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConsoleConfirmDialog
        open={deletingArticle !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingArticle(null);
        }}
        title="記事を削除"
        description={`「${deletingArticle?.title ?? ""}」を削除しますか？`}
        confirmLabel="削除"
        confirmingLabel="削除中"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </main>
  );
}
