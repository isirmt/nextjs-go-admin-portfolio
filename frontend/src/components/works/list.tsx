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

  const techsById = useMemo(
    () => new Map(techs.map((stack) => [stack.id, stack])),
    [techs],
  );
  const techsInfo = useMemo(
    () =>
      work.tech_stacks.flatMap((stack) => {
        const tech = techsById.get(stack.tech_stack_id);
        return tech ? [tech] : [];
      }),
    [techsById, work.tech_stacks],
  );
  const thumbnailAlt = useMemo(
    () => imageInfo?.file_name ?? `${work.title}のサムネイル`,
    [imageInfo, work.title],
  );

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="absolute -top-9 z-3 max-w-full rounded-xl bg-[#6354eb] px-3 py-1 text-white drop-shadow-sm drop-shadow-[#a39ed1] before:absolute before:top-0 before:left-[50%] before:-z-1 before:block before:translate-x-[-50%] before:translate-y-full before:border-[22px_10px_0px_10px] before:border-x-transparent before:border-t-[#6354eb] before:content-['']">
        {work.comment}
      </div>
      <button className="group relative flex cursor-pointer items-center justify-center drop-shadow-2xl transition-all duration-150">
        <div className="pointer-events-none absolute z-0 size-[95%] rotate-17 bg-[#94d5f3] transition-all duration-300 group-hover:rotate-107" />
        <div className="relative z-2 flex aspect-square size-72 items-center justify-center overflow-hidden rounded bg-white">
          <img
            src={`/api/images/${work.thumbnail_image_id}/raw`}
            className="size-72 object-cover"
            alt={thumbnailAlt}
          />
        </div>
      </button>
      <div className="flex w-full justify-start gap-2">
        {techsInfo.map((stack, techIdx) => (
          <button
            key={techIdx}
            className={`hover:translate-0.5"} relative flex scale-y-110 cursor-pointer items-center gap-3 overflow-hidden bg-[#2a7186] px-2 py-px tracking-[.1rem] shadow-[.125rem_.125rem_0_0_#67c8e6] transition-all duration-150 hover:shadow-[0rem_0rem_0_0_#67c8e6]`}
          >
            <span className="font-dot text-lg leading-none text-[#98e3fa]">
              {stack.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WorksList() {
  const { works } = useWorksContext();

  return (
    <div className="flex justify-center bg-[#cff7f7] px-20 py-20">
      <div className="flex w-fit flex-wrap justify-center gap-x-12 gap-y-16">
        {works.map((work, workIdx) => (
          <WorkCard key={workIdx} work={work} />
        ))}
      </div>
    </div>
  );
}
