"use client";

import backendApi from "@/lib/auth/backendFetch";
import React, { useCallback, useState } from "react";
import StackSelectingBox from "./stackSelectingBox";
import ConsoleFormFeedback from "./consoleFormFeedback";
import WorkUrlsInput, {
  WorkUrlItem,
  createEmptyWorkUrlItem,
} from "./workUrlsInput";
import { useWorksContext } from "@/contexts/worksContext";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import useConsoleTextField from "@/hooks/useConsoleTextField";
import type { Work } from "@/types/works/common";
import ConsoleImagePicker from "./consoleImagePicker";
import { Button } from "@/components/shadcn/ui/button";
import { Field, FieldLabel, FieldTitle } from "@/components/shadcn/ui/field";
import { Input } from "@/components/shadcn/ui/input";
import { Textarea } from "@/components/shadcn/ui/textarea";

type WorkRegisterFormMode = "post" | "put";

type WorkRegisterFormUrlValue = {
  id?: string;
  label: string;
  url: string;
};

export type WorkRegisterFormInitialValues = {
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
  onSubmitted?: (workId?: string) => void;
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

const currentDateInputValue = () => new Date().toISOString().split("T")[0];

export const createWorkRegisterFormInitialValues = (
  work: Work,
): WorkRegisterFormInitialValues => ({
  title: work.title,
  comment: work.comment,
  publishedDate: work.created_at ? work.created_at.slice(0, 10) : "",
  accentColor: work.accent_color,
  thumbnailImageId: work.thumbnail_image_id ?? "",
  workImageIds: [...(work.images ?? [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map((image) => image.image_id),
  techStackIds: (work.tech_stacks ?? []).map((stack) => stack.id),
  description: work.description ?? "",
  urls: [...(work.urls ?? [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map((url) => ({ id: url.id, label: url.label, url: url.url })),
});

export default function WorkRegisterForm({
  mode = "post",
  workId,
  initialValues,
  onSubmitted,
}: WorkRegisterFormProps) {
  const title = useConsoleTextField(initialValues?.title ?? "");
  const comment = useConsoleTextField(initialValues?.comment ?? "");
  const publishedDate = useConsoleTextField(
    initialValues?.publishedDate || currentDateInputValue(),
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
  const {
    isPending: isSubmitting,
    error: submitError,
    setError: setSubmitError,
    run,
  } = useConsoleMutation();
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const { refreshWorks } = useWorksContext();
  const isEditingMode = mode === "put";
  const { reset: resetTitle } = title;
  const { reset: resetComment } = comment;
  const { reset: resetPublishedDate } = publishedDate;
  const { reset: resetAccentColor } = accentColor;
  const { reset: resetDescription } = description;

  const resetNewWorkForm = useCallback(() => {
    resetTitle();
    resetComment();
    resetPublishedDate(currentDateInputValue());
    resetAccentColor("#000000");
    setInputThumbnailImage("");
    setInputWorkImages([]);
    setInputTechStacks([]);
    resetDescription();
    setInputUrls([createEmptyWorkUrlItem()]);
  }, [
    resetAccentColor,
    resetComment,
    resetDescription,
    resetPublishedDate,
    resetTitle,
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

      await run(
        async () => {
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

          const createdWorkID = isEditingMode
            ? undefined
            : ((await response.json()) as { id?: string }).id;

          await refreshWorks();
          if (!isEditingMode) {
            resetNewWorkForm();
          }
          setSubmitSuccess(
            isEditingMode ? "更新が完了しました" : "登録が完了しました",
          );
          onSubmitted?.(createdWorkID);
        },
        isEditingMode ? "更新に失敗しました" : "登録に失敗しました",
      );
    },
    [
      inputTechStacks,
      inputThumbnailImage,
      inputUrls,
      inputWorkImages,
      isEditingMode,
      onSubmitted,
      refreshWorks,
      resetNewWorkForm,
      run,
      setSubmitError,
      accentColor.value,
      comment.value,
      description.value,
      publishedDate.value,
      title.value,
      workId,
    ],
  );

  const handleTechStacksSelected = useCallback((ids: string[]) => {
    setInputTechStacks(ids);
  }, []);

  return (
    <section className="relative flex w-full flex-col space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="work-title">
              制作物名 <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="work-title"
              required
              {...title.inputProps}
              placeholder="アプリケーション名"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="work-comment">
              コメント <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="work-comment"
              required
              {...comment.inputProps}
              placeholder="ここに一言コメント！"
            />
          </Field>
          <div className="lg:col-span-2">
            <StackSelectingBox
              onChange={handleTechStacksSelected}
              selectedIds={inputTechStacks}
            />
          </div>
          <Field className="lg:col-span-2">
            <FieldTitle>
              関連リンク <span className="text-destructive">*</span>
            </FieldTitle>
            <WorkUrlsInput items={inputUrls} onChange={setInputUrls} />
          </Field>
          <Field>
            <FieldLabel htmlFor="work-published-date">
              作成日 <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="work-published-date"
              required
              type="date"
              {...publishedDate.inputProps}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="work-accent-color">
              アクセントカラー <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="work-accent-color"
              required
              type="color"
              {...accentColor.inputProps}
              className="h-10 w-full p-1"
            />
          </Field>
          <div>
            <ConsoleImagePicker
              label="サムネイル"
              selectedIds={inputThumbnailImage ? [inputThumbnailImage] : []}
              selectionMode="single"
              onChange={(ids) => setInputThumbnailImage(ids[0] ?? "")}
            />
          </div>
          <div>
            <ConsoleImagePicker
              label="参考画像"
              selectedIds={inputWorkImages}
              selectionMode="multiple"
              onChange={setInputWorkImages}
            />
          </div>
          <Field className="lg:col-span-2">
            <FieldLabel htmlFor="work-description">
              説明 <span className="text-destructive">*</span>
            </FieldLabel>
            <Textarea
              id="work-description"
              required
              {...description.inputProps}
              rows={5}
              className="field-sizing-content min-h-32"
            />
          </Field>
          <div className="flex flex-col items-center gap-2 lg:col-span-2">
            <ConsoleFormFeedback error={submitError} success={submitSuccess} />
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "送信中" : "登録"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
