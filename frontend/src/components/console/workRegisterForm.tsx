"use client";

import backendApi from "@/lib/auth/backendFetch";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ImageSelectingBox from "./imageSelectingBox";
import StackSelectingBox from "./stackSelectingBox";
import { LabelBox, LabelText } from "./labelBlock";
import WorkUrlsInput, {
  WorkUrlItem,
  createEmptyWorkUrlItem,
} from "./workUrlsInput";
import { useWorksContext } from "@/contexts/worksContext";

type WorkRegisterFormMode = "post" | "put";

type WorkRegisterFormUrlValue = {
  id?: string;
  label: string;
  url: string;
};

type WorkRegisterFormInitialValues = {
  title?: string;
  comment?: string;
  publishedDate?: string;
  accentColor?: string;
  thumbnailImageId?: string;
  workImageIds?: string[];
  techStackIds?: string[];
  description?: string;
  urls?: WorkRegisterFormUrlValue[];
};

type WorkRegisterFormProps = {
  mode?: WorkRegisterFormMode;
  workId?: string;
  initialValues?: WorkRegisterFormInitialValues;
  onSubmitted?: () => void;
};

const initializeUrlItems = (
  urls?: WorkRegisterFormUrlValue[],
): WorkUrlItem[] => {
  if (!urls || urls.length == 0) {
    return [createEmptyWorkUrlItem()];
  }
  return urls.map((entry) => ({
    id: entry.id ?? createEmptyWorkUrlItem().id,
    label: entry.label ?? "",
    url: entry.url ?? "",
  }));
};

export default function WorkRegisterForm({
  mode = "post",
  workId,
  initialValues,
  onSubmitted,
}: WorkRegisterFormProps) {
  const [inputTitle, setInputTitle] = useState<string>(
    initialValues?.title ?? "",
  );
  const [inputComment, setInputComment] = useState<string>(
    initialValues?.comment ?? "",
  );
  const [inputPublishedDate, setInputPublishedDate] = useState<string>(
    initialValues?.publishedDate || new Date().toISOString().split("T")[0],
  );
  const [inputAccentColor, setInputAccentColor] = useState<string>(
    initialValues?.accentColor ?? "#000000",
  );
  const [inputThumbnailImage, setInputThumbnailImage] = useState<string>(
    initialValues?.thumbnailImageId ?? "",
  );
  const [inputWorkImages, setInputWorkImages] = useState<string[]>(
    initialValues?.workImageIds ?? [],
  );
  const [inputTechStacks, setInputTechStacks] = useState<string[]>(
    initialValues?.techStackIds ?? [],
  );
  const [inputDescription, setInputDescription] = useState<string>(
    initialValues?.description ?? "",
  );
  const [inputUrls, setInputUrls] = useState<WorkUrlItem[]>(
    initializeUrlItems(initialValues?.urls),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const { refreshWorks } = useWorksContext();
  const initialKey = useMemo(
    () => JSON.stringify(initialValues ?? {}) ?? "",
    [initialValues],
  );
  const lastInitialKeyRef = useRef<string | null>(null);
  const isEditingMode = mode === "put";

  useEffect(() => {
    if (lastInitialKeyRef.current === initialKey) {
      return;
    }
    lastInitialKeyRef.current = initialKey;
    setInputTitle(initialValues?.title ?? "");
    setInputComment(initialValues?.comment ?? "");
    setInputPublishedDate(
      initialValues?.publishedDate || new Date().toISOString().split("T")[0],
    );
    setInputAccentColor(initialValues?.accentColor ?? "#000000");
    setInputThumbnailImage(initialValues?.thumbnailImageId ?? "");
    setInputWorkImages(initialValues?.workImageIds ?? []);
    setInputTechStacks(initialValues?.techStackIds ?? []);
    setInputDescription(initialValues?.description ?? "");
    setInputUrls(initializeUrlItems(initialValues?.urls));
    setSubmitError(null);
    setSubmitSuccess(null);
  }, [initialKey, initialValues]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitError(null);
      setSubmitSuccess(null);

      if (isEditingMode && !workId) {
        setSubmitError("更新対象のIDが見つかりません");
        return;
      }

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

        const response = await backendApi(
          isEditingMode ? `/works/${workId}` : "/works",
          {
            method: isEditingMode ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(
            message ||
              (isEditingMode ? "更新に失敗しました" : "登録に失敗しました"),
          );
        }

        setSubmitSuccess(
          isEditingMode ? "更新が完了しました" : "登録が完了しました",
        );
        await refreshWorks();
        onSubmitted?.();
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : isEditingMode
              ? "更新に失敗しました"
              : "登録に失敗しました",
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
      inputTechStacks,
      inputThumbnailImage,
      inputTitle,
      inputUrls,
      inputWorkImages,
      isEditingMode,
      onSubmitted,
      refreshWorks,
      workId,
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
          <LabelBox>
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
            <StackSelectingBox
              onChange={handleTechStacksSelected}
              initialSelectedIds={inputTechStacks}
            />
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
            <ImageSelectingBox
              onChange={handleThumbnailSelected}
              initialSelectedIds={
                inputThumbnailImage ? [inputThumbnailImage] : []
              }
            />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>参考画像</LabelText>
            <ImageSelectingBox
              multiple
              onChange={handleWorkImagesSelected}
              initialSelectedIds={inputWorkImages}
            />
          </LabelBox>
          <LabelBox isLong>
            <LabelText required>説明</LabelText>
            <textarea
              name="description"
              value={inputDescription}
              onChange={(e) => setInputDescription(e.target.value)}
              rows={5}
              className="field-sizing-content min-h-[5lh] w-full border-y border-[#c68ef0] px-4 py-3 outline-none focus:border-[#7e11d1]"
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
