/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Monaco, OnMount } from "@monaco-editor/react";
import type { editor, IPosition, languages } from "monaco-editor";
import { ImagesProvider, useImagesContext } from "@/contexts/imagesContext";
import { useBlogArticlesContext } from "@/contexts/blogArticlesContext";
import { BlogTagsProvider } from "@/contexts/blogTagsContext";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import backendApi from "@/lib/auth/backendFetch";
import type { BlogArticle } from "@/types/blogs/common";
import ConsoleButton from "./consoleButton";
import ConsoleConfirmDialog from "./consoleConfirmDialog";
import ConsoleFormFeedback from "./consoleFormFeedback";
import { ConsoleTextField } from "./consoleField";
import ImageSelectingDialog from "./imageSelectingDialog";
import { LabelBox, LabelText } from "./labelBlock";
import ConsoleSegmentedControl from "./consoleSegmentedControl";
import useConsoleTextField from "@/hooks/useConsoleTextField";
import BlogMarkdownPreview from "@/components/blogs/blogMarkdownPreview";
import BlogTagSelectingBox from "./blogTagSelectingBox";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

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
  const { images, isLoading: areImagesLoading } = useImagesContext();
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
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);
  const [isBodyImageDialogOpen, setIsBodyImageDialogOpen] = useState(false);
  const {
    isPending: isSubmitting,
    error: submitError,
    run: runSubmit,
  } = useConsoleMutation();
  const {
    isPending: isDeleting,
    error: deleteError,
    run: runDelete,
  } = useConsoleMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const bodyEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const bodySelectionRef = useRef({ start: 0, end: 0 });
  const [monaco, setMonaco] = useState<Monaco | null>(null);

  const showImageSuggestions = useCallback(
    (
      bodyEditor: editor.IStandaloneCodeEditor,
      monacoInstance: Monaco,
      triggerCharacter?: string,
    ) => {
      bodyEditor.trigger(
        "blog-image-completion",
        "editor.action.triggerSuggest",
        {
          ...(triggerCharacter
            ? {
                triggerKind:
                  monacoInstance.languages.CompletionTriggerKind
                    .TriggerCharacter,
                triggerCharacter,
              }
            : {}),
        },
      );
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const isDetailsVisible = bodyEditor
            .getDomNode()
            ?.querySelector(".suggest-widget")
            ?.classList.contains("shows-details");
          if (isDetailsVisible) return;
          bodyEditor.trigger(
            "blog-image-completion",
            "toggleSuggestionDetails",
            undefined,
          );
        });
      });
    },
    [],
  );

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

  const openBodyImageDialog = () => {
    const editor = bodyEditorRef.current;
    const model = editor?.getModel();
    const selection = editor?.getSelection();
    bodySelectionRef.current = {
      start:
        model && selection
          ? model.getOffsetAt(selection.getStartPosition())
          : bodyMarkdown.value.length,
      end:
        model && selection
          ? model.getOffsetAt(selection.getEndPosition())
          : bodyMarkdown.value.length,
    };
    setIsBodyImageDialogOpen(true);
  };

  const handleBodyEditorMount: OnMount = (editor, mountedMonaco) => {
    bodyEditorRef.current = editor;
    setMonaco(mountedMonaco);
    editor.onDidChangeModelContent((event) => {
      if (!event.changes.some((change) => change.text.endsWith("!"))) return;
      requestAnimationFrame(() => {
        showImageSuggestions(editor, mountedMonaco, "!");
      });
    });
  };

  useEffect(() => {
    if (!monaco) return;

    const completionProvider = monaco.languages.registerCompletionItemProvider(
      "markdown",
      {
        triggerCharacters: ["!"],
        provideCompletionItems(
          model: editor.ITextModel,
          position: IPosition,
          context: languages.CompletionContext,
        ) {
          const lineBeforeCursor = model
            .getLineContent(position.lineNumber)
            .slice(0, position.column - 1);
          const trigger =
            lineBeforeCursor.match(/![^\s!]*$/)?.[0] ??
            (context.triggerCharacter === "!" ? "!" : undefined);
          if (!trigger) return { suggestions: [] };

          const range = new monaco.Range(
            position.lineNumber,
            position.column - trigger.length,
            position.lineNumber,
            position.column,
          );
          return {
            suggestions: images.map((image, index) => {
              const imageURL = `/api/images/${image.id}/raw`;
              const documentationImageURL = new URL(
                imageURL,
                window.location.origin,
              ).toString();
              return {
                label: image.file_name,
                kind: monaco.languages.CompletionItemKind.File,
                detail: `画像: ${image.file_name}`,
                documentation: {
                  value: `![画像](${documentationImageURL})\n\n\`![画像](${imageURL})\``,
                },
                filterText: `!${image.file_name} ${image.id}`,
                insertText: `![画像](${imageURL})`,
                range,
                sortText: String(index).padStart(6, "0"),
              };
            }),
          };
        },
      },
    );

    return () => completionProvider.dispose();
  }, [images, monaco]);

  useEffect(() => {
    if (areImagesLoading || images.length === 0) return;

    const editor = bodyEditorRef.current;
    const model = editor?.getModel();
    const position = editor?.getPosition();
    if (!editor || !model || !position) return;

    const lineBeforeCursor = model
      .getLineContent(position.lineNumber)
      .slice(0, position.column - 1);
    if (!/![^\s!]*$/.test(lineBeforeCursor)) return;

    showImageSuggestions(editor, monaco);
  }, [areImagesLoading, images, monaco, showImageSuggestions]);

  const insertBodyImage = ([imageId]: string[]) => {
    if (!imageId) return;
    const { start, end } = bodySelectionRef.current;
    const markdown = `![画像](/api/images/${imageId}/raw)`;
    bodyMarkdown.setValue(
      (current) => `${current.slice(0, start)}${markdown}${current.slice(end)}`,
    );
    requestAnimationFrame(() => {
      const cursor = start + markdown.length;
      const editor = bodyEditorRef.current;
      const model = editor?.getModel();
      if (!editor || !model) return;
      editor.focus();
      editor.setPosition(model.getPositionAt(cursor));
    });
  };

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

  const handleDelete = async () => {
    if (!articleId) return;
    setLoadError(null);
    await runDelete(async () => {
      const response = await backendApi(`/blogs/${articleId}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error((await response.text()) || "記事の削除に失敗しました");
      await refreshBlogArticles();
      router.replace("/console/blogs");
    }, "記事の削除に失敗しました");
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
          <LabelBox isLong>
            <LabelText>タグ</LabelText>
            <BlogTagSelectingBox selectedIds={tagIds} onChange={setTagIds} />
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
              <MonacoEditor
                height="36rem"
                language="markdown"
                value={bodyMarkdown.value}
                onChange={(value) => bodyMarkdown.setValue(value ?? "")}
                onMount={handleBodyEditorMount}
                options={{
                  automaticLayout: true,
                  fontSize: 16,
                  minimap: { enabled: false },
                  padding: { top: 12, bottom: 12 },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
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
          <ConsoleFormFeedback
            className="mb-2"
            error={loadError ?? submitError ?? deleteError}
            success={submitSuccess}
          />
          <ConsoleButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中" : "保存"}
          </ConsoleButton>
          {articleId ? (
            <ConsoleButton
              className="mt-20"
              disabled={isSubmitting || isDeleting}
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="danger"
            >
              {isDeleting ? "削除中" : "削除"}
            </ConsoleButton>
          ) : null}
        </footer>
      </form>
      <ConsoleConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="記事を削除"
        description="この記事を削除します。元に戻すことはできません。"
        confirmLabel="削除する"
        confirmingLabel="削除中"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
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
      <BlogTagsProvider>
        <BlogArticleEditorForm {...props} />
      </BlogTagsProvider>
    </ImagesProvider>
  );
}
