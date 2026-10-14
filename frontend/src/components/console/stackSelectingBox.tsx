"use client";

import backendApi from "@/lib/auth/backendFetch";
import { useCallback, useState } from "react";
import ConsoleButton from "./consoleButton";
import ConsoleSelectableTagButton from "./consoleSelectableTagButton";
import { ConsoleTextField } from "./consoleField";
import { LabelText } from "./labelBlock";
import { useTechsContext } from "@/contexts/techsContext";
import useConsoleTextField from "@/hooks/useConsoleTextField";

type StackSelectingBoxProps = {
  onChange: (ids: string[]) => void;
  initialSelectedIds?: string[];
};

export default function StackSelectingBox({
  onChange,
  initialSelectedIds,
}: StackSelectingBoxProps) {
  const { techs, refreshTechs } = useTechsContext();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedIds ?? [],
  );
  const stackName = useConsoleTextField();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleToggleSelect = useCallback(
    (id: string) => {
      const exists = selectedIds.includes(id);
      const nextSelectedIds = exists
        ? selectedIds.filter((stackId) => stackId !== id)
        : [...selectedIds, id];
      onChange(nextSelectedIds);
      setSelectedIds(nextSelectedIds);
    },
    [onChange, selectedIds],
  );

  const handleCreateTechStack = useCallback(async () => {
    const trimmedName = stackName.value.trim();
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
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "登録に失敗しました");
      }

      refreshTechs();
      stackName.reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "登録に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshTechs, stackName]);

  return (
    <div className="relative flex w-full flex-col gap-4 bg-[#f8f8f8] p-4">
      <div className="flex flex-wrap gap-3">
        {techs.map((stack) => {
          const isSelected = selectedIds.includes(stack.id);
          return (
            <ConsoleSelectableTagButton
              key={stack.id}
              isSelected={isSelected}
              onToggled={() => handleToggleSelect(stack.id)}
            >
              {stack.name}
            </ConsoleSelectableTagButton>
          );
        })}
      </div>
      <div className="flex flex-col gap-4 border-y border-dashed border-[#c6a5ec] bg-white p-4">
        <label className="text-xs font-semibold text-gray-600">
          <LabelText required>スタック名</LabelText>
          <ConsoleTextField {...stackName.inputProps} placeholder="Next.js" />
        </label>
        {submitError && <p className="text-sm text-[#e04787]">{submitError}</p>}
        <ConsoleButton
          onClick={() => handleCreateTechStack()}
          disabled={isSubmitting}
        >
          追加
        </ConsoleButton>
      </div>
    </div>
  );
}
