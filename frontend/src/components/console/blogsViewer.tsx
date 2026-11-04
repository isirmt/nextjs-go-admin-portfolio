"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useBlogArticlesContext } from "@/contexts/blogArticlesContext";
import backendApi from "@/lib/auth/backendFetch";
import { formatJapaneseDateTime } from "@/lib/date";
import type { BlogArticleSummary } from "@/types/blogs/common";
import useConsoleMutation from "@/hooks/useConsoleMutation";
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

export default function BlogsViewer() {
  const { articles, error, isLoading, refreshBlogArticles } =
    useBlogArticlesContext();
  const [deletingArticle, setDeletingArticle] =
    useState<BlogArticleSummary | null>(null);
  const {
    isPending: isDeleting,
    error: deleteError,
    run: runDelete,
  } = useConsoleMutation();

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

  return (
    <main className="relative w-full space-y-8 px-2.5 py-8 lg:px-16">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <Button asChild>
          <Link href="/console/blogs/new">新規記事を作成</Link>
        </Button>
      </div>
      <h2 className="font-semibold text-[#7e11d1]">記事一覧</h2>
      {error ? <p className="text-sm text-[#e04787]">{error}</p> : null}
      <ConsoleFormFeedback error={deleteError} />
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead className="w-20">状態</TableHead>
            <TableHead className="hidden w-36 md:table-cell">
              公開日時
            </TableHead>
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
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell className="min-w-0">
                <p className="truncate font-medium">{article.title}</p>
                <p className="text-muted-foreground truncate text-xs">
                  /{article.slug}
                </p>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    article.status === "published" ? "secondary" : "default"
                  }
                >
                  {article.status === "published" ? "公開" : "下書き"}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatJapaneseDateTime(article.published_at, "未公開")}
              </TableCell>
              <TableCell className="hidden md:table-cell">
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
