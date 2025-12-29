/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */
"use client";
import { useImagesContext } from "@/contexts/imagesContext";
import type { CSSProperties } from "react";
import { useMemo } from "react";

export default function VerticalViewer() {
  const { images } = useImagesContext();
  const shuffledImages = useMemo(
    () => [...images].sort(() => Math.random() - 0.5),
    [images],
  );
  const loopImages = useMemo(
    () => [...shuffledImages, ...shuffledImages],
    [shuffledImages],
  );
  const scrollDuration = shuffledImages.length * 10;
  const marqueeStyle = {
    "--scroll-duration": `${scrollDuration}s`,
  } as CSSProperties;

  return (
    <div className="absolute top-0 hidden h-[50dvh] w-full overflow-hidden border-b border-[#ccc] px-4 opacity-100 lg:left-20 lg:block lg:max-w-[28vw]">
      <div className="animate-vertical-loop flex flex-col" style={marqueeStyle}>
        {loopImages.map((image, imageIdx) => (
          <img
            alt={`${image.file_name}`}
            className="pointer-events-none my-2.5 w-full lg:my-5"
            key={`${image.id}-${imageIdx}`}
            src={`/api/images/${image.id}/raw`}
          />
        ))}
      </div>
    </div>
  );
}
