/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ImagesProvider } from "@/contexts/imagesContext";
import ConsoleButton from "./consoleButton";
import { ConsoleTextArea, ConsoleTextField } from "./consoleField";
import ImageSelectingDialog from "./imageSelectingDialog";
import { LabelBox, LabelText } from "./labelBlock";
import ConsoleSegmentedControl from "./consoleSegmentedControl";

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
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [thumbnailImageIds, setThumbnailImageIds] = useState<string[]>([]);
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [isThumbnailDialogOpen, setIsThumbnailDialogOpen] = useState(false);
  const [isBodyImageDialogOpen, setIsBodyImageDialogOpen] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const bodySelectionRef = useRef({ start: 0, end: 0 });

  const openBodyImageDialog = () => {
    const textarea = bodyRef.current;
    bodySelectionRef.current = {
      start: textarea?.selectionStart ?? bodyMarkdown.length,
      end: textarea?.selectionEnd ?? bodyMarkdown.length,
    };
    setIsBodyImageDialogOpen(true);
  };

  const insertBodyImage = ([imageId]: string[]) => {
    if (!imageId) return;
    const { start, end } = bodySelectionRef.current;
    const markdown = `![画像](/api/images/${imageId}/raw)`;
    setBodyMarkdown(
      (current) => `${current.slice(0, start)}${markdown}${current.slice(end)}`,
    );
    requestAnimationFrame(() => {
      const cursor = start + markdown.length;
      bodyRef.current?.focus();
      bodyRef.current?.setSelectionRange(cursor, cursor);
    });
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
      <form>
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
            <ConsoleTextField type="datetime-local" />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>タイトル</LabelText>
            <ConsoleTextField required />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>SLUG</LabelText>
            <ConsoleTextField required />
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
            <ConsoleTextArea
              ref={bodyRef}
              required
              value={bodyMarkdown}
              onChange={(event) => setBodyMarkdown(event.target.value)}
            />
          </LabelBox>
        </div>
        <footer className="mt-8">
          <ConsoleButton type="submit">保存</ConsoleButton>
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
    <ImagesProvider>
      <BlogArticleEditorForm {...props} />
    </ImagesProvider>
  );
}
