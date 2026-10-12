"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import backendApi from "@/lib/auth/backendFetch";
import type { BlogArticleSummary } from "@/types/blogs/common";
import ConsoleButton from "./consoleButton";

const formatDateTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "未公開";

export default function BlogsViewer() {
  const router = useRouter();
  const [articles, setArticles] = useState<BlogArticleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response = await backendApi("/blogs");
      if (response.status === 401 || response.status === 403) {
        response = await fetch("/api/blogs");
      }
      if (!response.ok)
        throw new Error(
          (await response.text()) || "記事一覧の取得に失敗しました",
        );
      const data = (await response.json()) as BlogArticleSummary[];
      setArticles(Array.isArray(data) ? data : []);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "記事一覧の取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshArticles();
  }, [refreshArticles]);

  return (
    <main className="relative w-full space-y-8 px-2.5 py-8 lg:px-16">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <Link
          className="bg-[#67c8e6] px-4 py-2 text-lg font-bold text-white transition hover:bg-[#65b9d2]"
          href="/console/blogs/new"
        >
          新規記事を作成
        </Link>
      </div>
      <h2 className="font-semibold text-[#7e11d1]">記事一覧</h2>
      {error ? <p className="text-sm text-[#e04787]">{error}</p> : null}
      <ul className="flex flex-col gap-4">
        {isLoading ? (
          <li className="px-4 py-8 text-center text-sm text-[#7e11d1]">
            読み込み中です
          </li>
        ) : null}
        {!isLoading && articles.length === 0 ? (
          <li className="border border-dashed border-[#c68ef0] bg-white px-4 py-8 text-center text-sm text-[#7e11d1]">
            記事はありません
          </li>
        ) : null}
        {articles.map((article) => (
          <li
            key={article.id}
            className="flex flex-col overflow-hidden rounded border border-[#c68ef0] bg-white shadow-[.2rem_.2rem_0_0_#c68ef0]"
          >
            <div className="flex flex-wrap items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {article.title}
                </p>
                <p className="truncate text-xs">/{article.slug}</p>
              </div>
              <span
                className={
                  article.status === "published"
                    ? "rounded bg-[#1e946d] px-2 py-0.5 text-xs font-bold text-white select-none"
                    : "rounded bg-[#7e11d1] px-2 py-0.5 text-xs font-bold text-white select-none"
                }
              >
                {article.status === "published" ? "公開" : "下書き"}
              </span>
              <ConsoleButton
                variant="text"
                onClick={() => router.push(`/console/blogs/${article.id}`)}
              >
                編集
              </ConsoleButton>
            </div>
            <div className="bg-[#f5f5f5] px-4 py-2 text-xs text-[#444]">
              公開日時: {formatDateTime(article.published_at)} / 更新日時:{" "}
              {formatDateTime(article.updated_at)}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
