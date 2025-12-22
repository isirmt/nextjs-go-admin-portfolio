/* eslint-disable @next/next/no-img-element */
"use client";

import { useImagesContext } from "@/contexts/imagesContext";
import { useTechsContext } from "@/contexts/techsContext";
import { useWorksContext } from "@/contexts/worksContext";
import { Work } from "@/types/works/common";
import { useMemo, type CSSProperties } from "react";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";

const lineStyle = (index: number) =>
  ({ "--work-line-index": index }) as CSSProperties;

const totalLineStyle = (count: number, staggerSeconds = 0.12) =>
  ({
    "--work-line-total": count,
    "--work-line-stagger": `${staggerSeconds}s`,
  }) as CSSProperties;

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
  const { ref: lineAnimationRef, isActive: isLineActive } =
    useInViewAnimation<HTMLDivElement>({
      delayMs: 150,
    });

  return (
    <div className="flex flex-col items-center justify-center bg-[#cff7f7] px-20 pt-20 pb-40">
      <div
        ref={lineAnimationRef}
        className="relative mt-10 mb-30 drop-shadow-2xl drop-shadow-[#a9e4e4]"
      >
        <svg
          className={`animate-line w-96 ${isLineActive ? "is-active" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 852.65 170.1"
          style={totalLineStyle(12, 0.05)}
        >
          <g>
            <g>
              <g>
                <line
                  className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="9.92"
                  y1="9.92"
                  x2="66.01"
                  y2="160.18"
                  style={lineStyle(0)}
                />
                <line
                  className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="66.01"
                  y1="160.18"
                  x2="117.35"
                  y2="9.92"
                  style={lineStyle(1)}
                />
                <line
                  className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="117.35"
                  y1="9.92"
                  x2="167.94"
                  y2="160.18"
                  style={lineStyle(2)}
                />
                <line
                  className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="167.94"
                  y1="160.18"
                  x2="226.19"
                  y2="9.92"
                  style={lineStyle(3)}
                />
              </g>
              <path
                className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                d="M330.77,10.16c-41.08,0-74.89,33.8-74.89,74.89,0,41.08,33.81,74.89,74.89,74.89s74.89-33.81,74.89-74.89S371.85,10.16,330.77,10.16Z"
                style={lineStyle(4)}
              />
              <g>
                <line
                  className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="453.72"
                  y1="11.19"
                  x2="453.72"
                  y2="159.74"
                  style={lineStyle(5)}
                />
                <path
                  className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  d="M453.72,11.19s100.12-8.33,100.12,47.5-100.12,44.88-100.12,44.88"
                  style={lineStyle(6)}
                />
                <line
                  className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="520.2"
                  y1="99.04"
                  x2="549.11"
                  y2="159.74"
                  style={lineStyle(7)}
                />
              </g>
              <g>
                <line
                  className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="601.9"
                  y1="11"
                  x2="601.9"
                  y2="159.1"
                  style={lineStyle(8)}
                />
                <line
                  className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="704.37"
                  y1="11"
                  x2="601.9"
                  y2="118.83"
                  style={lineStyle(9)}
                />
                <line
                  className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="656.43"
                  y1="61.46"
                  x2="713"
                  y2="159.1"
                  style={lineStyle(10)}
                />
              </g>
              <path
                className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                d="M832.95,32.29c-1.55-2.18-14.96-20.42-38.44-21.17-3.91-.12-23.54-.75-35.45,14.6-7.63,9.84-10.81,24.57-4.85,35.52,4.95,9.1,16.17,13.06,38.42,20.6,24.33,8.25,32,7.01,40.32,15.75,1.11,1.17,10.75,11.57,9.71,25.7-1.12,15.23-14.24,29.01-32.9,34.33-3.24.93-21.22,5.76-39.07-4.14-13.14-7.28-18.76-18.4-20.55-22.41"
                style={lineStyle(11)}
              />
            </g>
          </g>
        </svg>
        <svg
          className={`animate-line absolute top-0 left-0 w-96 ${isLineActive ? "is-active" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 852.65 170.1"
          style={totalLineStyle(12, 0.1)}
        >
          <g>
            <g>
              <g>
                <line
                  className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="9.92"
                  y1="9.92"
                  x2="66.01"
                  y2="160.18"
                  style={lineStyle(0)}
                />
                <line
                  className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="66.01"
                  y1="160.18"
                  x2="117.35"
                  y2="9.92"
                  style={lineStyle(1)}
                />
                <line
                  className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="117.35"
                  y1="9.92"
                  x2="167.94"
                  y2="160.18"
                  style={lineStyle(2)}
                />
                <line
                  className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="167.94"
                  y1="160.18"
                  x2="226.19"
                  y2="9.92"
                  style={lineStyle(3)}
                />
              </g>
              <path
                className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                d="M330.77,10.16c-41.08,0-74.89,33.8-74.89,74.89,0,41.08,33.81,74.89,74.89,74.89s74.89-33.81,74.89-74.89S371.85,10.16,330.77,10.16Z"
                style={lineStyle(4)}
              />
              <g>
                <line
                  className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="453.72"
                  y1="11.19"
                  x2="453.72"
                  y2="159.74"
                  style={lineStyle(5)}
                />
                <path
                  className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  d="M453.72,11.19s100.12-8.33,100.12,47.5-100.12,44.88-100.12,44.88"
                  style={lineStyle(6)}
                />
                <line
                  className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="520.2"
                  y1="99.04"
                  x2="549.11"
                  y2="159.74"
                  style={lineStyle(7)}
                />
              </g>
              <g>
                <line
                  className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="601.9"
                  y1="11"
                  x2="601.9"
                  y2="159.1"
                  style={lineStyle(8)}
                />
                <line
                  className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="704.37"
                  y1="11"
                  x2="601.9"
                  y2="118.83"
                  style={lineStyle(9)}
                />
                <line
                  className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                  x1="656.43"
                  y1="61.46"
                  x2="713"
                  y2="159.1"
                  style={lineStyle(10)}
                />
              </g>
              <path
                className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
                d="M832.95,32.29c-1.55-2.18-14.96-20.42-38.44-21.17-3.91-.12-23.54-.75-35.45,14.6-7.63,9.84-10.81,24.57-4.85,35.52,4.95,9.1,16.17,13.06,38.42,20.6,24.33,8.25,32,7.01,40.32,15.75,1.11,1.17,10.75,11.57,9.71,25.7-1.12,15.23-14.24,29.01-32.9,34.33-3.24.93-21.22,5.76-39.07-4.14-13.14-7.28-18.76-18.4-20.55-22.41"
                style={lineStyle(11)}
              />
            </g>
          </g>
        </svg>
      </div>
      <div className="flex w-fit flex-wrap justify-center gap-x-12 gap-y-16">
        {works.map((work, workIdx) => (
          <WorkCard key={workIdx} work={work} />
        ))}
      </div>
    </div>
  );
}
