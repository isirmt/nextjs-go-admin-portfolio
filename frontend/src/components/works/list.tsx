/* eslint-disable @next/next/no-img-element */
"use client";

import { useImagesContext } from "@/contexts/imagesContext";
import { useTechsContext } from "@/contexts/techsContext";
import { useWorksContext } from "@/contexts/worksContext";
import { Work } from "@/types/works/common";
import { useMemo } from "react";

function WorkCard({ work }: { work: Work }) {
  const { images } = useImagesContext();
  const { techs } = useTechsContext();
  const imageInfo = useMemo(
    () =>
      work.thumbnail_image_id
        ? images.find((image) => image.id === work.thumbnail_image_id)
        : undefined,
    [images, work.thumbnail_image_id],
  );
  const thumbnailAlt = useMemo(
    () => imageInfo?.file_name ?? `${work.title}のサムネイル`,
    [imageInfo, work.title],
  );

  return (
    <div>
      <button className="cursor-pointer border">
        <div className="flex aspect-square size-72 items-center justify-center overflow-hidden rounded bg-white">
          <img
            src={`/api/images/${work.thumbnail_image_id}/raw`}
            className="size-full object-contain"
            alt={thumbnailAlt}
          />
        </div>
      </button>
    </div>
  );
}

export default function WorksList() {
  const { works } = useWorksContext();

  return (
    <div className="px-20 py-4">
      <div className="flex flex-wrap gap-10">
        {works.map((work, workIdx) => (
          <WorkCard key={workIdx} work={work} />
        ))}
      </div>
    </div>
  );
}
