/* eslint-disable @next/next/no-img-element */
"use client";

import backendApi from "@/lib/auth/backendFetch";
import ImageSelectingBox from "./imageSelectingBox";
import { CommonTechStack } from "@/types/techStacks/common";
import { useCallback, useEffect, useState } from "react";
import { LabelText } from "./labelBlock";

type StackSelectingBoxProps = {
  onChange: (ids: string[]) => void;
};

const sortByName = (stacks: CommonTechStack[]) =>
  [...stacks].sort((a, b) => a.name.localeCompare(b.name, "ja"));

export default function StackSelectingBox({
  onChange,
}: StackSelectingBoxProps) {
  const [techStacks, setTechStacks] = useState<CommonTechStack[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newStackName, setNewStackName] = useState("");
  const [logoImageId, setLogoImageId] = useState("");
  const [logoPickerKey, setLogoPickerKey] = useState(0); // 登録時の画像選択リセットに利用
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchTechStacks = useCallback(async () => {
    try {
      const response = await fetch("/api/tech-stacks");
      if (!response.ok) {
        throw new Error("取得に失敗しました");
      }
      const parsedStacks = (await response.json()) as CommonTechStack[];
      setTechStacks(sortByName(parsedStacks));
    } catch (error) {
      throw new Error(`取得に失敗しました: ${error}`);
    }
  }, []);

  useEffect(() => {
    fetchTechStacks();
  }, [fetchTechStacks]);

  useEffect(() => {
    onChange(selectedIds);
  }, [onChange, selectedIds]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((stackId) => stackId !== id)
        : [...prev, id],
    );
  }, []);

  const handleLogoSelected = useCallback((ids: string[]) => {
    setLogoImageId(ids[0] ?? "");
  }, []);

  const handleCreateTechStack = useCallback(async () => {
    const trimmedName = newStackName.trim();
    if (!trimmedName) {
      setSubmitError("スタック名を入力してください");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await backendApi("/tech-stacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          logo_image_id: logoImageId || undefined,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "登録に失敗しました");
      }

      const createdStack = (await response.json()) as CommonTechStack;
      setTechStacks((prev) => sortByName([...prev, createdStack]));
      setNewStackName("");
      setLogoImageId("");
      setLogoPickerKey((prev) => prev + 1);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "登録に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [logoImageId, newStackName]);

  return (
    <div className="relative flex w-full flex-col gap-4 bg-[#f8f8f8] p-4">
      <div className="flex flex-wrap gap-3">
        {techStacks.map((stack) => {
          const isSelected = selectedIds.includes(stack.id);
          return (
            <button
              type="button"
              key={stack.id}
              onClick={() => handleToggleSelect(stack.id)}
              className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded border-2 bg-white px-3 py-2 shadow-[.25rem_.25rem_0_0_#67c8e6] ${isSelected ? "border-[#65a6df]" : "border-[#67c8e6]"}`}
            >
              <div
                className={`absolute top-0 left-0 z-1 flex size-full items-center justify-center transition-all duration-200 ${isSelected ? "bg-[#65a6df]/75" : "bg-transparent hover:bg-[#65a6df]/75"}`}
              />
              {stack.logo_image_id ? (
                <img
                  src={`/api/images/${stack.logo_image_id}`}
                  alt={stack.name}
                  className="size-10 rounded object-contain"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded bg-[#ece6f7] text-xs leading-none font-bold text-[#7e11d1]">
                  No Logo
                </div>
              )}
              <span className="text-sm font-semibold text-[#3a3a3a]">
                {stack.name}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-4 border-y border-dashed border-[#c6a5ec] bg-white p-4">
        <label className="text-xs font-semibold text-gray-600">
          <LabelText required>スタック名</LabelText>
          <input
            className="mt-1 w-full border-b-2 border-[#c68ef0] px-2 py-1 outline-none focus:border-[#7e11d1]"
            value={newStackName}
            onChange={(e) => setNewStackName(e.target.value)}
            placeholder="Next.js"
          />
        </label>
        <div className="space-y-2">
          <LabelText>ロゴ画像</LabelText>
          <ImageSelectingBox
            key={logoPickerKey}
            onChange={handleLogoSelected}
            multiple={false}
          />
        </div>
        {submitError && <p className="text-sm text-[#e04787]">{submitError}</p>}
        <button
          type="button"
          onClick={() => handleCreateTechStack()}
          disabled={isSubmitting}
          className="relative top-0 block w-full cursor-pointer bg-[#67c8e6] px-4 py-1 text-center font-bold text-white [box-shadow:0_.15rem_0_0_#67c8e6] transition-all select-none hover:top-[.1rem] hover:bg-[#48a3be] hover:[box-shadow:0_.05rem_0_0_#48a3be]"
        >
          追加
        </button>
      </div>
    </div>
  );
}
