"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useWorksContext } from "@/contexts/worksContext";
import backendApi from "@/lib/auth/backendFetch";
import { formatJapaneseDateTime } from "@/lib/date";
import type { Work } from "@/types/works/common";
import useConsoleMutation from "@/hooks/useConsoleMutation";
import ConsoleConfirmDialog from "./consoleConfirmDialog";
import ConsoleFormFeedback from "./consoleFormFeedback";
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

export default function WorksViewer() {
  const { works, isLoading, error, refreshWorks } = useWorksContext();
  const [deletingWork, setDeletingWork] = useState<Work | null>(null);
  const {
    isPending: isDeleting,
    error: deleteError,
    run: runDelete,
  } = useConsoleMutation();

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

    if (result.ok) setDeletingWork(null);
  }, [deletingWork, refreshWorks, runDelete]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#7e11d1]">制作物一覧</h2>
        <Button asChild>
          <Link href="/console/works/new">新規制作物を作成</Link>
        </Button>
      </div>
      <ConsoleFormFeedback error={error ?? deleteError} />
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
                    <DropdownMenuItem asChild>
                      <Link href={`/console/works/${work.id}`}>
                        <PencilIcon />
                        編集
                      </Link>
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
