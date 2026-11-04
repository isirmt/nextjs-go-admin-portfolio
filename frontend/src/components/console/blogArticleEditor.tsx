"use client";

import Link from "next/link";
import { Maximize2Icon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImagesProvider } from "@/contexts/imagesContext";
import { useBlogArticlesContext } from "@/contexts/blogArticlesContext";
import { BlogTagsProvider } from "@/contexts/blogTagsContext";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import backendApi from "@/lib/auth/backendFetch";
import type { BlogArticle } from "@/types/blogs/common";
import ConsoleDateTimePicker from "./consoleDateTimePicker";
import ConsoleFormFeedback from "./consoleFormFeedback";
import ConsoleSegmentedControl from "./consoleSegmentedControl";
import useConsoleTextField from "@/hooks/useConsoleTextField";
import BlogMarkdownPreview from "@/components/blogs/blogMarkdownPreview";
import BlogTagSelectingBox from "./blogTagSelectingBox";
import BlogMarkdownEditor from "./blogMarkdownEditor";
import ConsoleImagePicker from "./consoleImagePicker";
import { Button } from "@/components/shadcn/ui/button";
import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/shadcn/ui/field";
import { Input } from "@/components/shadcn/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/ui/tabs";

type BlogArticleEditorProps = { articleId?: string };

function BlogArticleEditorForm({ articleId }: BlogArticleEditorProps) {
  const router = useRouter();
  const { refreshBlogArticles } = useBlogArticlesContext();
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const title = useConsoleTextField();
  const slug = useConsoleTextField();
  const publishedAt = useConsoleTextField();
  const [thumbnailImageIds, setThumbnailImageIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const bodyMarkdown = useConsoleTextField();
  const { reset: resetTitle } = title;
  const { reset: resetSlug } = slug;
  const { reset: resetPublishedAt } = publishedAt;
  const { reset: resetBodyMarkdown } = bodyMarkdown;
  const [bodyView, setBodyView] = useState<"edit" | "preview">("edit");
  const [isBodyEditorExpanded, setIsBodyEditorExpanded] = useState(false);
  const {
    isPending: isSubmitting,
    error: submitError,
    run: runSubmit,
  } = useConsoleMutation();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

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
        setTagIds(article.tags.map((tag) => tag.id));
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
          setLoadError(
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

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadError(null);
    setSubmitSuccess(null);
    const result = await runSubmit(async () => {
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
            tag_ids: tagIds,
            published_at: publishedAt.value
              ? new Date(publishedAt.value).toISOString()
              : null,
          }),
        },
      );
      if (!response.ok)
        throw new Error((await response.text()) || "記事の保存に失敗しました");
      const saved = (await response.json()) as BlogArticle;
      await refreshBlogArticles();
      return saved;
    }, "記事の保存に失敗しました");

    if (result.ok) {
      setSubmitSuccess(articleId ? "更新しました" : "作成しました");
      if (!articleId) router.replace(`/console/blogs/${result.data.id}`);
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
          <FieldSet className="gap-3">
            <FieldLegend variant="label">
              状態 <span className="text-destructive">*</span>
            </FieldLegend>
            <ConsoleSegmentedControl
              name="status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "draft", label: "下書き" },
                { value: "published", label: "公開" },
              ]}
            />
          </FieldSet>
          <Field>
            <FieldLabel htmlFor="blog-published-at">公開日時</FieldLabel>
            <ConsoleDateTimePicker
              id="blog-published-at"
              value={publishedAt.value}
              onChange={publishedAt.setValue}
            />
          </Field>
          <Field className="lg:col-span-2">
            <FieldLabel htmlFor="blog-title">
              タイトル <span className="text-destructive">*</span>
            </FieldLabel>
            <Input id="blog-title" required {...title.inputProps} />
          </Field>
          <Field className="lg:col-span-2">
            <FieldLabel htmlFor="blog-slug">
              SLUG <span className="text-destructive">*</span>
            </FieldLabel>
            <Input id="blog-slug" required {...slug.inputProps} />
          </Field>
          <div className="lg:col-span-2">
            <BlogTagSelectingBox selectedIds={tagIds} onChange={setTagIds} />
          </div>
          <div className="lg:col-span-2">
            <ConsoleImagePicker
              label="サムネイル画像"
              selectedIds={thumbnailImageIds}
              selectionMode="single"
              onChange={setThumbnailImageIds}
            />
          </div>
          <Field className="lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <FieldTitle>
                本文（Markdown） <span className="text-destructive">*</span>
              </FieldTitle>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="hidden lg:inline-flex"
                onClick={() => setIsBodyEditorExpanded(true)}
              >
                <Maximize2Icon />
              </Button>
            </div>
            {!isBodyEditorExpanded ? (
              <Tabs
                value={bodyView}
                onValueChange={(nextValue) =>
                  setBodyView(nextValue as "edit" | "preview")
                }
                className="gap-3"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="edit">編集</TabsTrigger>
                  <TabsTrigger value="preview">プレビュー</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <BlogMarkdownEditor
                    value={bodyMarkdown.value}
                    onChange={bodyMarkdown.setValue}
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="min-h-64 border border-[#c68ef0] bg-white py-3 text-[#222]">
                    <div className="mx-auto w-full max-w-240 px-4">
                      {bodyMarkdown.value.trim() ? (
                        <BlogMarkdownPreview content={bodyMarkdown.value} />
                      ) : (
                        <p className="text-sm text-[#7e11d1]">
                          本文がありません
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : null}
          </Field>
        </div>
        {isBodyEditorExpanded ? (
          <div className="bg-background fixed inset-0 z-110 hidden p-6 lg:block">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute top-6 right-6 z-1"
              onClick={() => setIsBodyEditorExpanded(false)}
            >
              <XIcon />
            </Button>
            <div className="grid size-full grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 pr-14">
              <div className="border-border/50 min-h-0 overflow-hidden rounded-xl border">
                <BlogMarkdownEditor
                  height="100%"
                  value={bodyMarkdown.value}
                  onChange={bodyMarkdown.setValue}
                />
              </div>
              <div className="border-border/50 min-h-0 overflow-y-auto rounded-xl border py-3 text-[#222]">
                <div className="mx-auto w-full max-w-240 px-4">
                  {bodyMarkdown.value.trim() ? (
                    <BlogMarkdownPreview content={bodyMarkdown.value} />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      本文がありません
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div className="sticky bottom-0 mt-8 flex flex-col items-center gap-2 bg-white py-2.5">
          <ConsoleFormFeedback
            className="mb-2"
            error={loadError ?? submitError}
            success={submitSuccess}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full max-w-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "保存中" : "保存"}
          </Button>
        </div>
      </form>
    </main>
  );
}

export default function BlogArticleEditor(props: BlogArticleEditorProps) {
  return (
    <ImagesProvider access="admin">
      <BlogTagsProvider>
        <BlogArticleEditorForm {...props} />
      </BlogTagsProvider>
    </ImagesProvider>
  );
}
