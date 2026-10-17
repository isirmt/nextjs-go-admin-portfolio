"use client";

import backendApi from "@/lib/auth/backendFetch";
import { useCallback } from "react";
import ConsoleButton from "./consoleButton";
import ConsoleFormFeedback from "./consoleFormFeedback";
import ConsoleSelectableTagButton from "./consoleSelectableTagButton";
import { ConsoleTextField } from "./consoleField";
import { LabelText } from "./labelBlock";
import { useTechsContext } from "@/contexts/techsContext";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import useConsoleTextField from "@/hooks/useConsoleTextField";

type StackSelectingBoxProps = {
  onChange: (ids: string[]) => void;
  selectedIds: string[];
};

export default function StackSelectingBox({
  onChange,
  selectedIds,
}: StackSelectingBoxProps) {
  const { techs, refreshTechs } = useTechsContext();
  const stackName = useConsoleTextField();
  const {
    isPending: isSubmitting,
    error: submitError,
    setError: setSubmitError,
    run,
  } = useConsoleMutation();

  const handleToggleSelect = useCallback(
    (id: string) => {
      const exists = selectedIds.includes(id);
      const nextSelectedIds = exists
        ? selectedIds.filter((stackId) => stackId !== id)
        : [...selectedIds, id];
      onChange(nextSelectedIds);
    },
    [onChange, selectedIds],
  );

  const handleCreateTechStack = useCallback(async () => {
    const trimmedName = stackName.value.trim();
    if (!trimmedName) {
      setSubmitError("スタック名を入力してください");
      return;
    }

    await run(async () => {
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

      await refreshTechs();
      stackName.reset();
    }, "登録に失敗しました");
  }, [refreshTechs, run, setSubmitError, stackName]);

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
        <ConsoleFormFeedback error={submitError} />
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
