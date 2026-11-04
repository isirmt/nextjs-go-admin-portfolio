"use client";

import backendApi from "@/lib/auth/backendFetch";
import { PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";
import ConsoleFormFeedback from "./consoleFormFeedback";
import ConsoleSelectableTagButton from "./consoleSelectableTagButton";
import { useTechsContext } from "@/contexts/techsContext";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import useConsoleTextField from "@/hooks/useConsoleTextField";
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { Field, FieldLabel } from "@/components/shadcn/ui/field";
import { Input } from "@/components/shadcn/ui/input";

type StackSelectingBoxProps = {
  onChange: (ids: string[]) => void;
  selectedIds: string[];
};

export default function StackSelectingBox({
  onChange,
  selectedIds,
}: StackSelectingBoxProps) {
  const { techs, refreshTechs } = useTechsContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
      setIsCreateDialogOpen(false);
    }, "登録に失敗しました");
  }, [refreshTechs, run, setSubmitError, stackName]);

  const handleCreateDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open) setSubmitError(null);
      setIsCreateDialogOpen(open);
    },
    [setSubmitError],
  );

  return (
    <Card size="sm" className="w-full rounded-xl shadow-none ring-0">
      <CardHeader>
        <CardTitle>技術構成を選択</CardTitle>
        <CardAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleCreateDialogOpenChange(true)}
          >
            <PlusIcon />
            技術構成を追加
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
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
      </CardContent>
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
      >
        <DialogContent className="rounded-xl shadow-none">
          <DialogHeader>
            <DialogTitle>技術構成を追加</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="tech-stack-name">
                技術構成名 <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="tech-stack-name"
                required
                {...stackName.inputProps}
                placeholder="Next.js"
              />
            </Field>
            <ConsoleFormFeedback error={submitError} />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  キャンセル
                </Button>
              </DialogClose>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateTechStack}
              >
                {isSubmitting ? "追加中" : "追加"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
