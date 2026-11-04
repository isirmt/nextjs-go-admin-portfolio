"use client";

import { useCallback, useMemo, useState } from "react";
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useWorksContext } from "@/contexts/worksContext";
import backendApi from "@/lib/auth/backendFetch";
import { formatJapaneseDateTime } from "@/lib/date";
import type { Work } from "@/types/works/common";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import WorkRegisterForm from "./workRegisterForm";
import ConsoleConfirmDialog from "./consoleConfirmDialog";
import ConsoleFormFeedback from "./consoleFormFeedback";
import ConsoleModal from "./consoleModal";
import { Button } from "@/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";

const initializeWorkValues = (work: Work) => {
  const sortedImages = [...(work.images ?? [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map((image) => image.image_id);
  const sortedUrls = [...(work.urls ?? [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map((url) => ({
      id: url.id,
      label: url.label,
      url: url.url,
    }));
  const techIds = (work.tech_stacks ?? []).map((stack) => stack.id);

  return {
    title: work.title,
    comment: work.comment,
    publishedDate: work.created_at ? work.created_at.slice(0, 10) : "",
    accentColor: work.accent_color,
    thumbnailImageId: work.thumbnail_image_id ?? "",
    workImageIds: sortedImages,
    techStackIds: techIds,
    description: work.description ?? "",
    urls: sortedUrls,
  };
};

export default function WorksViewer() {
  const { works, isLoading, error, refreshWorks } = useWorksContext();
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [deletingWork, setDeletingWork] = useState<Work | null>(null);
  const {
    isPending: isDeleting,
    error: deleteError,
    run: runDelete,
  } = useConsoleMutation();

  const workInitialValues = useMemo(
    () =>
      new Map<string, ReturnType<typeof initializeWorkValues>>(
        works.map((work) => [work.id, initializeWorkValues(work)]),
      ),
    [works],
  );

  const handleDelete = useCallback(async () => {
    if (!deletingWork) return;

    const result = await runDelete(async () => {
      const response = await backendApi(`/works/${deletingWork.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error((await response.text()) || "削除に失敗しました");
      }
      await refreshWorks();
    }, "削除に失敗しました");

    if (result.ok) {
      if (editingWorkId === deletingWork.id) setEditingWorkId(null);
      setDeletingWork(null);
    }
  }, [deletingWork, editingWorkId, refreshWorks, runDelete]);

  const editingWork = editingWorkId
    ? works.find((work) => work.id === editingWorkId)
    : undefined;
  const editingInitialValues = editingWorkId
    ? workInitialValues.get(editingWorkId)
    : undefined;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">制作物一覧</h2>
      {error ? <p className="text-sm text-[#e04787]">{error}</p> : null}
      <ConsoleFormFeedback error={deleteError} />
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead className="hidden w-36 md:table-cell">
              作成日時
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-muted-foreground h-28 text-center"
              >
                読み込み中です
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading && works.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-muted-foreground h-28 text-center"
              >
                制作物はありません
              </TableCell>
            </TableRow>
          ) : null}
          {works.map((work) => (
            <TableRow key={work.id}>
              <TableCell className="min-w-0">
                <p className="truncate font-medium">{work.title}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {work.comment}
                </p>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatJapaneseDateTime(work.created_at)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm">
                      <EllipsisIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => setEditingWorkId(work.id)}
                    >
                      <PencilIcon />
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDeletingWork(work)}
                    >
                      <Trash2Icon />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingWork && editingInitialValues ? (
        <ConsoleModal
          open
          onOpenChange={(open) => {
            if (!open) setEditingWorkId(null);
          }}
          title="制作物編集"
          description={editingWork.title}
        >
          <WorkRegisterForm
            mode="put"
            workId={editingWork.id}
            initialValues={editingInitialValues}
            onSubmitted={() => setEditingWorkId(null)}
          />
        </ConsoleModal>
      ) : null}
      <ConsoleConfirmDialog
        open={deletingWork !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingWork(null);
        }}
        title="制作物を削除"
        description={`「${deletingWork?.title ?? ""}」を削除します。元に戻すことはできません。`}
        confirmLabel="削除"
        confirmingLabel="削除中"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </section>
  );
}
