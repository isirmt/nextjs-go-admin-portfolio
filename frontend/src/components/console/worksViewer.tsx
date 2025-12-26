"use client";

import { useWorksContext } from "@/contexts/worksContext";
import backendApi from "@/lib/auth/backendFetch";
import { useCallback, useMemo, useState } from "react";
import WorkRegisterForm from "./workRegisterForm";
import { Work } from "@/types/works/common";

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
  const techIds = (work.tech_stacks ?? []).map((stack) => stack.tech_stack_id);

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

  const handleToggleEdit = useCallback((workId: string) => {
    setEditingWorkId((prev) => (prev === workId ? null : workId));
  }, []);

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

  return (
    <div className="space-y-4">
      <ul className="flex flex-col gap-4">
        {works.map((work) => {
          const isEditing = editingWorkId === work.id;
          const isDeleting = deletingWorkId === work.id;
          const initialValues = workInitialValues.get(work.id);

          return (
            <li
              key={work.id}
              className={`flex flex-col overflow-hidden rounded border border-[#c68ef0] bg-white shadow-[.2rem_.2rem_0_0_#c68ef0] transition-all`}
            >
              <div className="flex flex-wrap items-center gap-4 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{work.title}</p>
                  <p className="text-xs">{work.comment}</p>
                </div>
                <button
                  onClick={() => handleToggleEdit(work.id)}
                  className="cursor-pointer border-b text-sm leading-none font-bold text-[#7e11d1] transition-all duration-200 hover:text-[#c68ef0]"
                >
                  {isEditing ? "閉じる" : "編集"}
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => handleDelete(work.id)}
                  className="cursor-pointer border-b text-sm leading-none font-bold text-[#e04787] transition-all duration-200 hover:text-[#b03062]"
                >
                  {isDeleting ? "削除中" : "削除"}
                </button>
              </div>
              <div
                className={`overflow-hidden ${isEditing ? "max-h-[5000px]" : "max-h-0"}`}
              >
                {isEditing && initialValues && (
                  <div className="border-t border-dashed border-[#c68ef0] bg-white px-4 py-6">
                    <WorkRegisterForm
                      mode="put"
                      workId={work.id}
                      initialValues={initialValues}
                      onSubmitted={() => setEditingWorkId(null)}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
