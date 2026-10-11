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
import ConsoleButton from "./consoleButton";
import { ConsoleTextArea, ConsoleTextField } from "./consoleField";
import { LabelBox, LabelText } from "./labelBlock";
import WorkUrlsInput, {
  WorkUrlItem,
  createEmptyWorkUrlItem,
} from "./workUrlsInput";
import { useWorksContext } from "@/contexts/worksContext";
import useConsoleTextField from "@/hooks/useConsoleTextField";

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
  const title = useConsoleTextField(initialValues?.title ?? "");
  const comment = useConsoleTextField(initialValues?.comment ?? "");
  const publishedDate = useConsoleTextField(
    initialValues?.publishedDate || new Date().toISOString().split("T")[0],
  );
  const accentColor = useConsoleTextField(
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
  const description = useConsoleTextField(initialValues?.description ?? "");
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
    title.reset(initialValues?.title ?? "");
    comment.reset(initialValues?.comment ?? "");
    publishedDate.reset(
      initialValues?.publishedDate || new Date().toISOString().split("T")[0],
    );
    accentColor.reset(initialValues?.accentColor ?? "#000000");
    setInputThumbnailImage(initialValues?.thumbnailImageId ?? "");
    setInputWorkImages(initialValues?.workImageIds ?? []);
    setInputTechStacks(initialValues?.techStackIds ?? []);
    description.reset(initialValues?.description ?? "");
    setInputUrls(initializeUrlItems(initialValues?.urls));
    setSubmitError(null);
    setSubmitSuccess(null);
  }, [
    initialKey,
    initialValues,
    accentColor,
    comment,
    description,
    publishedDate,
    title,
  ]);

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
          title: title.value.trim(),
          comment: comment.value.trim(),
          published_date: publishedDate.value || undefined,
          accent_color: accentColor.value,
          description: description.value.trim(),
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
      inputTechStacks,
      inputThumbnailImage,
      inputUrls,
      inputWorkImages,
      isEditingMode,
      onSubmitted,
      refreshWorks,
      accentColor.value,
      comment.value,
      description.value,
      publishedDate.value,
      title.value,
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
            <ConsoleTextField
              name="title"
              {...title.inputProps}
              required
              placeholder="アプリケーション名"
            />
          </LabelBox>
          <LabelBox>
            <LabelText required>コメント</LabelText>
            <ConsoleTextField
              name="comment"
              {...comment.inputProps}
              required
              placeholder="ここに一言コメント！"
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
            <ConsoleTextField
              name="published_date"
              {...publishedDate.inputProps}
              type="date"
              required
            />
          </LabelBox>
          <LabelBox>
            <LabelText required>アクセントカラー</LabelText>
            <input
              name="accent_color"
              {...accentColor.inputProps}
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
            <ConsoleTextArea
              name="description"
              {...description.inputProps}
              rows={5}
            />
          </LabelBox>
          <LabelBox isLong>
            {submitError && (
              <p className="text-sm text-[#e04787]">{submitError}</p>
            )}
            {submitSuccess && (
              <p className="text-sm text-[#0c8d62]">{submitSuccess}</p>
            )}
            <ConsoleButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "送信中" : "登録"}
            </ConsoleButton>
          </LabelBox>
        </div>
      </form>
    </section>
  );
}
