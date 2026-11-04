"use client";

import { useCallback, useState } from "react";
import { PlusIcon } from "lucide-react";
import { useBlogTagsContext } from "@/contexts/blogTagsContext";
import backendApi from "@/lib/auth/backendFetch";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import useConsoleTextField from "@/hooks/useConsoleTextField";
import type { BlogTag } from "@/types/blogs/common";
import ConsoleConfirmDialog from "./consoleConfirmDialog";
import ConsoleFormFeedback from "./consoleFormFeedback";
import ConsoleSelectableTagButton from "./consoleSelectableTagButton";
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

type BlogTagSelectingBoxProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export default function BlogTagSelectingBox({
  selectedIds,
  onChange,
}: BlogTagSelectingBoxProps) {
  const { blogTags, refreshBlogTags } = useBlogTagsContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState<BlogTag | null>(null);
  const name = useConsoleTextField();
  const slug = useConsoleTextField();
  const {
    isPending: isSubmitting,
    error: submitError,
    setError: setSubmitError,
    run,
  } = useConsoleMutation();
  const {
    isPending: isDeleting,
    error: deleteError,
    run: runDelete,
  } = useConsoleMutation();

  const handleToggle = useCallback(
    (id: string) => {
      const nextSelectedIds = selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id];
      onChange(nextSelectedIds);
    },
    [onChange, selectedIds],
  );

  const handleCreateBlogTag = useCallback(async () => {
    const trimmedName = name.value.trim();
    const trimmedSlug = slug.value.trim();
    if (!trimmedName || !trimmedSlug) {
      setSubmitError("タグ名と SLUG を入力してください");
      return;
    }

    await run(async () => {
      const response = await backendApi("/blog-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, slug: trimmedSlug }),
      });
      if (!response.ok) {
        throw new Error((await response.text()) || "タグの登録に失敗しました");
      }
      await refreshBlogTags();
      name.reset();
      slug.reset();
      setIsCreateDialogOpen(false);
    }, "タグの登録に失敗しました");
  }, [name, refreshBlogTags, run, setSubmitError, slug]);

  const handleDeleteBlogTag = useCallback(async () => {
    if (!deletingTag) return;

    const result = await runDelete(async () => {
      const response = await backendApi(`/blog-tags/${deletingTag.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error((await response.text()) || "タグの削除に失敗しました");
      }
      await refreshBlogTags();
    }, "タグの削除に失敗しました");

    if (result.ok) {
      onChange(selectedIds.filter((id) => id !== deletingTag.id));
      setDeletingTag(null);
    }
  }, [deletingTag, onChange, refreshBlogTags, runDelete, selectedIds]);

  return (
    <Card size="sm" className="w-full rounded-xl shadow-none ring-0">
      <CardHeader>
        <CardTitle>タグを選択</CardTitle>
        <CardAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusIcon />
            タグを追加
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {blogTags.map((tag) => (
            <ConsoleSelectableTagButton
              key={tag.id}
              isSelected={selectedIds.includes(tag.id)}
              onToggled={() => handleToggle(tag.id)}
              onDeleteRequested={() => setDeletingTag(tag)}
            >
              {tag.name}
            </ConsoleSelectableTagButton>
          ))}
        </div>
        <ConsoleFormFeedback className="mt-4" error={deleteError} />
      </CardContent>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="rounded-xl shadow-none">
          <DialogHeader>
            <DialogTitle>タグを追加</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="blog-tag-name">
                タグ名 <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="blog-tag-name"
                required
                {...name.inputProps}
                placeholder="Next.js"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="blog-tag-slug">
                SLUG <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="blog-tag-slug"
                required
                {...slug.inputProps}
                placeholder="nextjs"
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
                onClick={handleCreateBlogTag}
              >
                {isSubmitting ? "追加中" : "追加"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <ConsoleConfirmDialog
        open={deletingTag !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTag(null);
        }}
        title={`「${deletingTag?.name ?? ""}」を削除`}
        description={`削除しますか？`}
        confirmLabel="削除"
        confirmingLabel="削除中"
        isConfirming={isDeleting}
        onConfirm={handleDeleteBlogTag}
      />
    </Card>
  );
}
