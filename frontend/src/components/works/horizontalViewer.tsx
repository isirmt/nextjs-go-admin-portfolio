/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */
"use client";
import { useImagesContext } from "@/contexts/imagesContext";
import type { CSSProperties } from "react";
import { useMemo } from "react";

export default function HorizontalViewer() {
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
    <div className="absolute top-0 left-0 size-full overflow-hidden px-20 opacity-50">
      <div className="animate-vertical-loop flex flex-col" style={marqueeStyle}>
        {loopImages.map((image, imageIdx) => (
          <img
            alt={`${image.file_name}`}
            className="pointer-events-none my-2.5 w-[32vw] max-w-96 lg:my-5"
            key={`${image.id}-${imageIdx}`}
            src={`/api/images/${image.id}/raw`}
          />
        ))}
      </div>
    </div>
  );
}
