"use client";

import { useCallback, useState } from "react";
import { useBlogArticlesContext } from "@/contexts/blogArticlesContext";
import { useBlogSeriesContext } from "@/contexts/blogSeriesContext";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import useConsoleTextField from "@/hooks/useConsoleTextField";
import backendApi from "@/lib/auth/backendFetch";
import type { BlogSeries } from "@/types/blogs/common";
import ConsoleFormFeedback from "./consoleFormFeedback";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Field, FieldLabel } from "@/components/shadcn/ui/field";
import { Input } from "@/components/shadcn/ui/input";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { formatJapaneseDateTime } from "@/lib/date";

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
      <Field>
        <FieldLabel htmlFor="blog-series-title">
          シリーズ名 <span className="text-destructive">*</span>
        </FieldLabel>
        <Input id="blog-series-title" required {...title.inputProps} />
      </Field>
      <Field>
        <FieldLabel htmlFor="blog-series-slug">
          SLUG <span className="text-destructive">*</span>
        </FieldLabel>
        <Input id="blog-series-slug" required {...slug.inputProps} />
      </Field>
      <Field>
        <FieldLabel htmlFor="blog-series-description">説明</FieldLabel>
        <Textarea id="blog-series-description" {...description.inputProps} />
      </Field>
      <Card size="sm" className="rounded-xl shadow-none ring-0">
        <CardHeader>
          <CardTitle>記事を選択</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">選択</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead className="w-20">状態</TableHead>
                <TableHead className="hidden w-36 md:table-cell">
                  公開日時
                </TableHead>
                <TableHead className="w-14">順番</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => {
                const isSelected = articleIds.includes(article.id);
                return (
                  <TableRow
                    key={article.id}
                    data-state={isSelected ? "selected" : undefined}
                    onClick={() => handleToggleArticle(article.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="py-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleArticle(article.id)}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="min-w-0 py-4">
                      <p className="truncate font-medium">{article.title}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        /{article.slug}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant={
                          article.status === "published"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {article.status === "published" ? "公開" : "下書き"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden py-4 md:table-cell">
                      {formatJapaneseDateTime(article.published_at, "未公開")}
                    </TableCell>
                    <TableCell className="py-4 text-center font-medium">
                      {isSelected ? articleIds.indexOf(article.id) + 1 : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ConsoleFormFeedback error={error} />
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "保存中" : "保存"}
      </Button>
    </form>
  );
}
