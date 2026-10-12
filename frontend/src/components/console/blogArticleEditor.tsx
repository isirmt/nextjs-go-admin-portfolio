/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ImagesProvider } from "@/contexts/imagesContext";
import backendApi from "@/lib/auth/backendFetch";
import type { BlogArticle } from "@/types/blogs/common";
import ConsoleButton from "./consoleButton";
import { ConsoleTextArea, ConsoleTextField } from "./consoleField";
import ImageSelectingDialog from "./imageSelectingDialog";
import { LabelBox, LabelText } from "./labelBlock";
import ConsoleSegmentedControl from "./consoleSegmentedControl";
import useConsoleTextField from "@/hooks/useConsoleTextField";
import BlogMarkdownPreview from "@/components/blogs/blogMarkdownPreview";

type BlogArticleEditorProps = { articleId?: string };

function SelectedImageTiles({ imageIds }: { imageIds: string[] }) {
  return imageIds.length ? (
    <div className="flex flex-wrap gap-3">
      {imageIds.map((id) => (
        <div
          key={id}
          className="size-20 overflow-hidden border-2 border-[#67c8e6] bg-white"
        >
          <img
            src={`/api/images/${id}/raw`}
            alt=""
            className="size-full object-contain"
          />
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-[#7e11d1]">画像未選択</p>
  );
}

function BlogArticleEditorForm({ articleId }: BlogArticleEditorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const title = useConsoleTextField();
  const slug = useConsoleTextField();
  const publishedAt = useConsoleTextField();
  const [thumbnailImageIds, setThumbnailImageIds] = useState<string[]>([]);
  const bodyMarkdown = useConsoleTextField();
  const { reset: resetTitle } = title;
  const { reset: resetSlug } = slug;
  const { reset: resetPublishedAt } = publishedAt;
  const { reset: resetBodyMarkdown } = bodyMarkdown;
  const [bodyView, setBodyView] = useState<"edit" | "preview">("edit");
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);
  const [isBodyImageDialogOpen, setIsBodyImageDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const bodySelectionRef = useRef({ start: 0, end: 0 });

  useEffect(() => {
    if (!articleId) return;
    let isCurrent = true;
    (async () => {
      try {
        const response = await backendApi(`/blogs/${articleId}`);
        if (!response.ok)
          throw new Error(
            (await response.text()) || "記事の取得に失敗しました",
          );
        const article = (await response.json()) as BlogArticle;
        if (!isCurrent) return;
        setStatus(article.status);
        resetTitle(article.title);
        resetSlug(article.slug);
        resetBodyMarkdown(article.body_markdown);
        setThumbnailImageIds(
          article.thumbnail_image_id ? [article.thumbnail_image_id] : [],
        );
        if (article.published_at) {
          const date = new Date(article.published_at);
          resetPublishedAt(
            new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
              .toISOString()
              .slice(0, 16),
          );
        } else {
          resetPublishedAt();
        }
      } catch (reason) {
        if (isCurrent)
          setSubmitError(
            reason instanceof Error
              ? reason.message
              : "記事の取得に失敗しました",
          );
      }
    })();
    return () => {
      isCurrent = false;
    };
  }, [articleId, resetBodyMarkdown, resetPublishedAt, resetSlug, resetTitle]);

  const openBodyImageDialog = () => {
    const textarea = bodyRef.current;
    bodySelectionRef.current = {
      start: textarea?.selectionStart ?? bodyMarkdown.value.length,
      end: textarea?.selectionEnd ?? bodyMarkdown.value.length,
    };
    setIsBodyImageDialogOpen(true);
  };

  const insertBodyImage = ([imageId]: string[]) => {
    if (!imageId) return;
    const { start, end } = bodySelectionRef.current;
    const markdown = `![画像](/api/images/${imageId}/raw)`;
    bodyMarkdown.setValue(
      (current) => `${current.slice(0, start)}${markdown}${current.slice(end)}`,
    );
    requestAnimationFrame(() => {
      const cursor = start + markdown.length;
      bodyRef.current?.focus();
      bodyRef.current?.setSelectionRange(cursor, cursor);
    });
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const response = await backendApi(
        articleId ? `/blogs/${articleId}` : "/blogs",
        {
          method: articleId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            title: title.value.trim(),
            slug: slug.value.trim(),
            body_markdown: bodyMarkdown.value.trim(),
            thumbnail_image_id: thumbnailImageIds[0] ?? null,
            published_at: publishedAt.value
              ? new Date(publishedAt.value).toISOString()
              : null,
          }),
        },
      );
      if (!response.ok)
        throw new Error((await response.text()) || "記事の保存に失敗しました");
      const saved = (await response.json()) as BlogArticle;
      setSubmitSuccess(articleId ? "更新しました" : "作成しました");
      if (!articleId) router.replace(`/console/blogs/${saved.id}`);
    } catch (reason) {
      setSubmitError(
        reason instanceof Error ? reason.message : "記事の保存に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!articleId || !window.confirm("この記事を削除しますか？")) return;
    setIsDeleting(true);
    setSubmitError(null);
    try {
      const response = await backendApi(`/blogs/${articleId}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error((await response.text()) || "記事の削除に失敗しました");
      router.replace("/console/blogs");
    } catch (reason) {
      setSubmitError(
        reason instanceof Error ? reason.message : "記事の削除に失敗しました",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="relative w-full space-y-8 px-2.5 py-8 lg:px-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#7e11d1]">
          {articleId ? "記事を編集" : "新規記事を作成"}
        </h1>
        <Link
          className="border-b text-sm font-bold text-[#7e11d1] transition hover:text-[#c68ef0]"
          href="/console/blogs"
        >
          記事一覧へ戻る
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LabelBox>
            <LabelText required>状態</LabelText>
            <ConsoleSegmentedControl
              name="status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "draft", label: "下書き" },
                { value: "published", label: "公開" },
              ]}
            />
          </LabelBox>
          <LabelBox>
            <LabelText>公開日時</LabelText>
            <ConsoleTextField
              type="datetime-local"
              {...publishedAt.inputProps}
            />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>タイトル</LabelText>
            <ConsoleTextField required {...title.inputProps} />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>SLUG</LabelText>
            <ConsoleTextField required {...slug.inputProps} />
          </LabelBox>
          <LabelBox>
            <LabelText>サムネイル画像</LabelText>
            <ConsoleButton
              type="button"
              onClick={() => setIsThumbnailDialogOpen(true)}
            >
              画像を選択
            </ConsoleButton>
            <SelectedImageTiles imageIds={thumbnailImageIds} />
          </LabelBox>
          <LabelBox>
            <LabelText>本文への画像挿入</LabelText>
            <ConsoleButton type="button" onClick={openBodyImageDialog}>
              画像を挿入
            </ConsoleButton>
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>本文（Markdown）</LabelText>
            <ConsoleSegmentedControl
              name="body-view"
              value={bodyView}
              onChange={setBodyView}
              options={[
                { value: "edit", label: "編集" },
                { value: "preview", label: "プレビュー" },
              ]}
            />
            {bodyView === "edit" ? (
              <ConsoleTextArea
                ref={bodyRef}
                required
                {...bodyMarkdown.inputProps}
              />
            ) : (
              <div className="min-h-64 border border-[#c68ef0] bg-white px-4 py-3 text-[#222]">
                {bodyMarkdown.value.trim() ? (
                  <BlogMarkdownPreview content={bodyMarkdown.value} />
                ) : (
                  <p className="text-sm text-[#7e11d1]">本文がありません</p>
                )}
              </div>
            )}
          </LabelBox>
        </div>
        <footer className="mt-8">
          {submitError ? (
            <p className="mb-2 text-sm text-[#e04787]">{submitError}</p>
          ) : null}
          {submitSuccess ? (
            <p className="mb-2 text-sm text-[#0c8d62]">{submitSuccess}</p>
          ) : null}
          <ConsoleButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中" : "保存"}
          </ConsoleButton>
          {articleId ? (
            <ConsoleButton
              className="mt-20"
              disabled={isSubmitting || isDeleting}
              onClick={handleDelete}
              variant="danger"
            >
              {isDeleting ? "削除中" : "削除"}
            </ConsoleButton>
          ) : null}
        </footer>
      </form>
      <ImageSelectingDialog
        open={isThumbnailDialogOpen}
        onOpenChange={setIsThumbnailDialogOpen}
        initialSelectedIds={thumbnailImageIds}
        onSelect={setThumbnailImageIds}
      />
      {isBodyImageDialogOpen ? (
        <ImageSelectingDialog
          open
          onOpenChange={setIsBodyImageDialogOpen}
          initialSelectedIds={[]}
          onSelect={insertBodyImage}
        />
      ) : null}
    </main>
  );
}

export default function BlogArticleEditor(props: BlogArticleEditorProps) {
  return (
    <ImagesProvider access="admin">
      <BlogArticleEditorForm {...props} />
    </ImagesProvider>
  );
}
