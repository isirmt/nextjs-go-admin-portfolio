"use client";

import backendApi from "@/lib/auth/backendFetch";
import React, { useCallback, useState } from "react";
import ImageSelectingBox from "./imageSelectingBox";
import StackSelectingBox from "./stackSelectingBox";
import { LabelBox, LabelText } from "./labelBlock";
import WorkUrlsInput, {
  WorkUrlItem,
  createEmptyWorkUrlItem,
} from "./workUrlsInput";
import { useWorksContext } from "@/contexts/worksContext";

export default function WorkRegisterForm() {
  const [inputSlug, setInputSlug] = useState<string>("");
  const [inputTitle, setInputTitle] = useState<string>("");
  const [inputComment, setInputComment] = useState<string>("");
  const [inputPublishedDate, setInputPublishedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [inputAccentColor, setInputAccentColor] = useState<string>("#000000");
  const [inputThumbnailImage, setInputThumbnailImage] = useState<string>("");
  const [inputWorkImages, setInputWorkImages] = useState<string[]>([]);
  const [inputTechStacks, setInputTechStacks] = useState<string[]>([]);
  const [inputDescription, setInputDescription] = useState<string>("");
  const [inputUrls, setInputUrls] = useState<WorkUrlItem[]>([
    createEmptyWorkUrlItem(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const { refreshWorks } = useWorksContext();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitError(null);
      setSubmitSuccess(null);

      if (!inputThumbnailImage) {
        setSubmitError("サムネイル画像を選択してください");
        return;
      }

      if (!inputTechStacks.length) {
        setSubmitError("技術スタックを1つ以上選択してください");
        return;
      }

      setIsSubmitting(true);

      try {
        const payload = {
          slug: inputSlug.trim(),
          title: inputTitle.trim(),
          comment: inputComment.trim(),
          published_date: inputPublishedDate || undefined,
          accent_color: inputAccentColor,
          description: inputDescription.trim(),
          thumbnail_image_id: inputThumbnailImage,
          work_image_ids: inputWorkImages,
          tech_stack_ids: inputTechStacks,
          urls: inputUrls
            .map((item) => ({
              label: item.label.trim(),
              url: item.url.trim(),
            }))
            .filter((item) => item.label || item.url),
        };

        const response = await backendApi("/works", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "登録に失敗しました");
        }

        setSubmitSuccess("登録が完了しました");
        await refreshWorks();
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "登録に失敗しました",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      inputAccentColor,
      inputComment,
      inputDescription,
      inputPublishedDate,
      inputSlug,
      inputTechStacks,
      inputThumbnailImage,
      inputTitle,
      inputUrls,
      inputWorkImages,
      refreshWorks,
    ],
  );

  const handleThumbnailSelected = useCallback((id: string[]) => {
    setInputThumbnailImage(id[0] ?? "");
  }, []);

  const handleWorkImagesSelected = useCallback((ids: string[]) => {
    setInputWorkImages(ids);
  }, []);

  const handleTechStacksSelected = useCallback((ids: string[]) => {
    setInputTechStacks(ids);
  }, []);

  return (
    <section className="relative flex w-full flex-col space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LabelBox>
            <LabelText required>識別パス</LabelText>
            <input
              name="slug"
              value={inputSlug}
              onChange={(e) => setInputSlug(e.target.value)}
              required
              placeholder="work_name"
              className="w-full border-b-2 border-[#c68ef0] px-4 py-2 outline-none focus:border-[#7e11d1]"
            />
          </LabelBox>
          <LabelBox>
            <LabelText required>制作物名</LabelText>
            <input
              name="title"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              required
              placeholder="アプリケーション名"
              className="w-full border-b-2 border-[#c68ef0] px-4 py-2 outline-none focus:border-[#7e11d1]"
            />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>コメント</LabelText>
            <input
              name="comment"
              value={inputComment}
              onChange={(e) => setInputComment(e.target.value)}
              required
              placeholder="ここに一言コメント！"
              className="w-full border-b-2 border-[#c68ef0] px-4 py-2 outline-none focus:border-[#7e11d1]"
            />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>技術構成</LabelText>
            <StackSelectingBox onChange={handleTechStacksSelected} />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>関連リンク</LabelText>
            <WorkUrlsInput items={inputUrls} onChange={setInputUrls} />
          </LabelBox>
          <LabelBox>
            <LabelText required>作成日</LabelText>
            <input
              name="published_date"
              value={inputPublishedDate}
              onChange={(e) => setInputPublishedDate(e.target.value)}
              type="date"
              required
              className="w-full border-b-2 border-[#c68ef0] px-4 py-2 outline-none focus:border-[#7e11d1]"
            />
          </LabelBox>
          <LabelBox>
            <LabelText required>アクセントカラー</LabelText>
            <input
              name="accent_color"
              value={inputAccentColor}
              onChange={(e) => setInputAccentColor(e.target.value || "#000000")}
              type="color"
              required
              className="w-full"
            />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>サムネイル</LabelText>
            <ImageSelectingBox onChange={handleThumbnailSelected} />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>参考画像</LabelText>
            <ImageSelectingBox multiple onChange={handleWorkImagesSelected} />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>説明</LabelText>
            <textarea
              name="description"
              value={inputDescription}
              onChange={(e) => setInputDescription(e.target.value)}
              rows={5}
              className="w-full border-y border-[#c68ef0] px-4 py-3 outline-none focus:border-[#7e11d1]"
            />
          </LabelBox>
          <LabelBox isLong>
            {submitError && (
              <p className="text-sm text-[#e04787]">{submitError}</p>
            )}
            {submitSuccess && (
              <p className="text-sm text-[#0c8d62]">{submitSuccess}</p>
            )}
            <input
              type="submit"
              disabled={isSubmitting}
              value={isSubmitting ? "送信中" : "登録"}
              className="relative top-0 block w-full cursor-pointer bg-[#67c8e6] px-4 py-2 text-center text-xl font-bold text-white transition-all select-none hover:top-[.1rem] hover:bg-[#48a3be] disabled:cursor-not-allowed disabled:bg-gray-300"
            />
          </LabelBox>
        </div>
      </form>
    </section>
  );
}
