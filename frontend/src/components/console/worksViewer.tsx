"use client";

import { useWorksContext } from "@/contexts/worksContext";
import backendApi from "@/lib/auth/backendFetch";
import { useCallback, useMemo, useState } from "react";
import WorkRegisterForm from "./workRegisterForm";
import { Work } from "@/types/works/common";
import ConsoleButton from "./consoleButton";
import ConsoleModal from "./consoleModal";

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
  const { works, refreshWorks } = useWorksContext();
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [deletingWorkId, setDeletingWorkId] = useState<string | null>(null);

  const workInitialValues = useMemo(
    () =>
      new Map<string, ReturnType<typeof initializeWorkValues>>(
        works.map((work) => [work.id, initializeWorkValues(work)]),
      ),
    [works],
  );

  const handleDelete = useCallback(
    async (workId: string) => {
      const shouldDelete = window.confirm("削除しますか？");
      if (!shouldDelete) {
        return;
      }

      setDeletingWorkId(workId);
      try {
        const response = await backendApi(`/works/${workId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "削除に失敗しました");
        }

        if (editingWorkId === workId) {
          setEditingWorkId(null);
        }
        await refreshWorks();
      } finally {
        setDeletingWorkId(null);
      }
    },
    [editingWorkId, refreshWorks],
  );

  const editingWork = editingWorkId
    ? works.find((work) => work.id === editingWorkId)
    : undefined;
  const editingInitialValues = editingWorkId
    ? workInitialValues.get(editingWorkId)
    : undefined;

  return (
    <div className="space-y-4">
      <ul className="flex flex-col gap-4">
        {works.map((work) => {
          const isDeleting = deletingWorkId === work.id;

          return (
            <li
              key={work.id}
              className="flex flex-col overflow-hidden rounded border border-[#c68ef0] bg-white shadow-[.2rem_.2rem_0_0_#c68ef0]"
            >
              <div className="flex flex-wrap items-center gap-4 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{work.title}</p>
                  <p className="text-xs">{work.comment}</p>
                </div>
                <ConsoleButton
                  onClick={() => setEditingWorkId(work.id)}
                  variant="text"
                >
                  編集
                </ConsoleButton>
                <ConsoleButton
                  disabled={isDeleting}
                  onClick={() => handleDelete(work.id)}
                  variant="danger"
                >
                  {isDeleting ? "削除中" : "削除"}
                </ConsoleButton>
              </div>
            </li>
          );
        })}
      </ul>
      {editingWork && editingInitialValues ? (
        <ConsoleModal
          open
          onOpenChange={(open) => {
            if (!open) {
              setEditingWorkId(null);
            }
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
    </div>
  );
}
