/* eslint-disable @next/next/no-img-element */
"use client";

import { useImagesContext } from "@/contexts/imagesContext";
import { useTechsContext } from "@/contexts/techsContext";
import { useWorksContext } from "@/contexts/worksContext";
import { Work } from "@/types/works/common";
import React, { useMemo, useState, type CSSProperties } from "react";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";
import { smoochSans } from "@/lib/fonts";

function SectionText() {
  const { ref: lineAnimationRef, isActive: isLineActive } =
    useInViewAnimation<HTMLDivElement>({
      delayMs: 150,
      threshold: 0.3,
    });

  return (
    <div
      ref={lineAnimationRef}
      className="relative mt-10 mb-30 flex flex-col items-center gap-4 drop-shadow-2xl drop-shadow-[#a9e4e4]"
    >
      <svg
        className={`animate-iv-line w-96 ${isLineActive ? "is-active" : ""}`}
        viewBox="0 0 852.65 170.1"
        style={totalLineStyle(12, 0.05)}
      >
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
        <path
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          d="M330.77,10.16c-41.08,0-74.89,33.8-74.89,74.89,0,41.08,33.81,74.89,74.89,74.89s74.89-33.81,74.89-74.89S371.85,10.16,330.77,10.16Z"
          style={lineStyle(4)}
        />
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
        <path
          className="fill-none stroke-[#8ba1e7] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          d="M832.95,32.29c-1.55-2.18-14.96-20.42-38.44-21.17-3.91-.12-23.54-.75-35.45,14.6-7.63,9.84-10.81,24.57-4.85,35.52,4.95,9.1,16.17,13.06,38.42,20.6,24.33,8.25,32,7.01,40.32,15.75,1.11,1.17,10.75,11.57,9.71,25.7-1.12,15.23-14.24,29.01-32.9,34.33-3.24.93-21.22,5.76-39.07-4.14-13.14-7.28-18.76-18.4-20.55-22.41"
          style={lineStyle(11)}
        />
      </svg>
      <svg
        className={`animate-iv-line absolute top-0 left-0 w-96 ${isLineActive ? "is-active" : ""}`}
        viewBox="0 0 852.65 170.1"
        style={totalLineStyle(12, 0.1)}
      >
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
        <path
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          d="M330.77,10.16c-41.08,0-74.89,33.8-74.89,74.89,0,41.08,33.81,74.89,74.89,74.89s74.89-33.81,74.89-74.89S371.85,10.16,330.77,10.16Z"
          style={lineStyle(4)}
        />
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
        <path
          className="fill-none stroke-[#6354eb] stroke-[19.84px] [stroke-linecap:round] [stroke-linejoin:round]"
          d="M832.95,32.29c-1.55-2.18-14.96-20.42-38.44-21.17-3.91-.12-23.54-.75-35.45,14.6-7.63,9.84-10.81,24.57-4.85,35.52,4.95,9.1,16.17,13.06,38.42,20.6,24.33,8.25,32,7.01,40.32,15.75,1.11,1.17,10.75,11.57,9.71,25.7-1.12,15.23-14.24,29.01-32.9,34.33-3.24.93-21.22,5.76-39.07-4.14-13.14-7.28-18.76-18.4-20.55-22.41"
          style={lineStyle(11)}
        />
      </svg>
      <div className="text-[#777] select-none">
        中学校時代の制作物も添えて───
      </div>
    </div>
  );
}

const lineStyle = (index: number) =>
  ({ "--work-line-index": index }) as CSSProperties;

const totalLineStyle = (count: number, staggerSeconds = 0.12) =>
  ({
    "--work-line-total": count,
    "--work-line-stagger": `${staggerSeconds}s`,
  }) as CSSProperties;

const delayFromId = (id: string, maxDelay = 500) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return (hash >>> 0) % (maxDelay + 1);
};

type CloudProps = {
  className?: string;
};

function CloudLarge({ className }: CloudProps) {
  return (
    <svg className={className} viewBox="0 0 760.65 453.52" aria-hidden="true">
      <path
        className="fill-[#f3f3e9] stroke-[#c4c0c0] stroke-[22.68px] [stroke-linecap:round] [stroke-linejoin:round]"
        d="M606.12,150.95c-22.66,0-44.08,5.27-63.13,14.64-14.44-42.91-54.99-73.81-102.77-73.81-12.94,0-25.35,2.27-36.86,6.43-18.78-50.72-67.58-86.87-124.82-86.87-73.49,0-133.07,59.58-133.07,133.07,0,10.55,1.23,20.8,3.55,30.64-1.36-.04-2.72-.07-4.08-.07-73.79,0-133.6,59.82-133.6,133.6s59.82,133.6,133.6,133.6c46.16,0,86.85-23.41,110.85-59.01,25.38,33.38,65.51,54.94,110.67,54.94,50.4,0,94.54-26.84,118.89-67,25.43,39.81,70.01,66.21,120.76,66.21,79.08,0,143.19-64.11,143.19-143.19s-64.11-143.19-143.19-143.19Z"
      />
    </svg>
  );
}

function CloudSmall({ className }: CloudProps) {
  return (
    <svg className={className} viewBox="0 0 555.67 382.2" aria-hidden="true">
      <path
        className="fill-[#f3f3e9] stroke-[#c4c0c0] stroke-[17px] [stroke-linecap:round] [stroke-linejoin:round]"
        d="M410.73,103.66c-15.89,0-31.12,2.78-45.26,7.87-14.64-57.59-66.83-100.19-128.97-100.19-73.49,0-133.07,59.58-133.07,133.07,0,.38.01.76.01,1.15-52.14,7.86-92.11,52.85-92.11,107.19,0,59.87,48.53,108.4,108.4,108.4,32.63,0,61.89-14.42,81.76-37.23,19.87,22.81,49.13,37.23,81.76,37.23,18.96,0,36.78-4.87,52.29-13.43,21.42,14.6,47.3,23.15,75.18,23.15,73.79,0,133.6-59.82,133.6-133.6s-59.82-133.6-133.6-133.6Z"
      />
    </svg>
  );
}

function WorkCard({
  work,
  selectingId,
  selectingFunc,
}: {
  work: Work;
  selectingId?: string;
  selectingFunc: (id?: string) => void;
}) {
  const { images } = useImagesContext();
  const { techs } = useTechsContext();
  const randomInViewDelayMs = useMemo(
    () => delayFromId(work.id, 300),
    [work.id],
  );
  const randomSelectingDelayMs = useMemo(
    () => delayFromId(work.id, 150),
    [work.id],
  );
  const { ref: cardBackAnimationRef, isActive: isCardBackActive } =
    useInViewAnimation<HTMLDivElement>({
      threshold: 0.15,
      delayMs: randomInViewDelayMs,
    });
  const { ref: cardFrontAnimationRef, isActive: isCardFrontActive } =
    useInViewAnimation<HTMLDivElement>({
      threshold: 0.15,
      delayMs: randomInViewDelayMs,
    });
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
  const createdYear = useMemo(() => {
    return new Date(work.created_at).getFullYear();
  }, [work.created_at]);

  return (
    <div
      className={`relative flex flex-col items-center gap-3 transition-opacity select-none ${selectingId === work.id ? "opacity-100" : selectingId ? "pointer-events-none opacity-0" : "opacity-100"}`}
      onClick={() =>
        selectingFunc(selectingId === work.id ? undefined : work.id)
      }
      style={{
        transitionDelay: `${randomSelectingDelayMs}ms`,
      }}
    >
      <div className="pointer-events-none absolute -top-9 z-3 max-w-full rounded-xl bg-[#6354eb] px-3 py-1 text-white drop-shadow-sm drop-shadow-[#a39ed1] select-none before:absolute before:top-0 before:left-[50%] before:-z-1 before:block before:translate-x-[-50%] before:translate-y-full before:border-[22px_10px_0px_10px] before:border-x-transparent before:border-t-[#6354eb] before:content-['']">
        {work.comment}
      </div>
      <button className="group relative flex cursor-pointer items-center justify-center drop-shadow-2xl transition-all duration-150">
        <div className="ease-over pointer-events-none absolute z-0 size-[95%] rotate-17 bg-[#94d5f3] transition-all duration-300 group-hover:rotate-107" />
        <div className="relative z-2 flex aspect-square size-72 items-center justify-center overflow-hidden rounded-xl bg-white">
          <img
            src={`/api/images/${work.thumbnail_image_id}/raw`}
            className="pointer-events-none size-72 object-cover transition-all duration-200 ease-out group-hover:scale-110 group-hover:skew-x-1 group-hover:brightness-110"
            alt={thumbnailAlt}
          />
        </div>
        <div className="pointer-events-none absolute top-0 left-0 z-3 size-full overflow-hidden rounded-xl">
          <div
            className="absolute top-0 left-0 size-0 border-[1.5rem] transition-all duration-150 group-hover:border-[1.75rem]"
            style={{
              borderColor: `${work.accent_color} transparent transparent ${work.accent_color}`,
            }}
          />
          {/* title */}
          <div className="absolute top-0 left-0 flex size-full flex-col-reverse items-start p-3 [background:linear-gradient(to_bottom,rgba(0,0,0,0.1)_65%,rgba(0,0,0,0.7))]">
            <div className="text-xs font-black text-white">{createdYear}年</div>
            <div className="text-xl font-black text-white">{work.title}</div>
          </div>
          {/* in-view */}
          <div
            ref={cardBackAnimationRef}
            className={`animate-iv-out-down absolute top-0 left-0 z-4 size-full bg-[#6354eb] ${isCardBackActive ? "is-active" : ""}`}
          />
          <div
            ref={cardFrontAnimationRef}
            className={`animate-iv-out-down absolute top-0 left-0 z-5 size-full bg-[#94d5f3] ${isCardFrontActive ? "is-active" : ""}`}
          />
        </div>
      </button>
      <div className="flex w-full justify-start gap-2">
        {techsInfo.map((stack, techIdx) => (
          <div
            key={techIdx}
            className={`hover:translate-0.5"} relative flex scale-y-110 items-center gap-3 overflow-hidden bg-[#2a7186] px-2 py-px tracking-[.1rem] shadow-[.125rem_.125rem_0_0_#67c8e6] transition-all duration-150`}
          >
            <span className="font-dot text-lg leading-none text-[#98e3fa]">
              {stack.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WorksList() {
  const { works } = useWorksContext();
  const [selectingWorkId, setSelectingWorkId] = useState<string>();
  const { ref: andMoreTextRef, isActive: isAndMoreTextActive } =
    useInViewAnimation<HTMLDivElement>({
      threshold: 0.2,
      delayMs: 250,
    });
  const selectedLastWork = useMemo(() => {
    return works.find((work) => work.id === selectingWorkId);
  }, [selectingWorkId, works]);

  return (
    <React.Fragment>
      <div
        className={`relative flex flex-col items-center justify-center overflow-x-hidden bg-[#f8f8f8] px-20 pt-20 pb-40`}
      >
        <CloudLarge className="animate-up-down absolute bottom-[5%] left-[10%] size-36 [animation-delay:.13s] [animation-duration:1s]" />
        <CloudLarge className="animate-up-down absolute right-[30%] bottom-[35%] size-36 [animation-delay:.23s] [animation-duration:2s]" />
        <CloudLarge className="animate-up-down absolute top-[25%] -left-[3%] size-36 [animation-delay:.23s] [animation-duration:2s]" />
        <CloudSmall className="animate-up-down absolute top-[10%] left-[25%] size-36 [animation-delay:.53s] [animation-duration:3s]" />
        <CloudSmall className="animate-up-down absolute -right-[2%] bottom-[40%] size-36 [animation-delay:.13s] [animation-duration:1s]" />
        <CloudSmall className="animate-up-down absolute right-[10%] bottom-[10%] size-36 [animation-delay:.33s] [animation-duration:1s]" />
        <div
          ref={andMoreTextRef}
          className={`animate-iv-fade-tracking absolute bottom-5 z-0 text-9xl text-[#aaa] select-none ${smoochSans.className} ${isAndMoreTextActive ? "is-active" : ""}`}
        >
          And More
        </div>
        <div className="pointer-events-none absolute top-0 left-0 z-0 size-full bg-[url('/noise_color_128.png')] opacity-20 mix-blend-multiply" />
        <SectionText />
        <div className="flex w-fit flex-wrap justify-center gap-x-12 gap-y-16">
          {works.map((work, workIdx) => (
            <WorkCard
              key={workIdx}
              work={work}
              selectingId={selectingWorkId}
              selectingFunc={setSelectingWorkId}
            />
          ))}
        </div>
      </div>
      <div
        className={`fixed top-0 left-0 z-100 size-full ${selectingWorkId ? "pointer-events-auto bg-[#eee]/70 opacity-100 backdrop-blur-md backdrop-saturate-50 [transition-property:all_backdrop-filter_background-color] delay-250" : "pointer-events-none opacity-0 backdrop-blur-none [transition-property:all_backdrop-filter_background-color_opacity] delay-0"}`}
      >
        <div className="pointer-events-none fixed top-0 left-0 z-1 size-full bg-[linear-gradient(to_bottom,transparent_calc(100dvh-250px),rgba(255,255,255,1))]" />
        <div className="size-full overflow-y-auto overscroll-contain">
          <div className="relative min-h-full">
            <div className="pointer-events-none absolute top-0 left-0 z-0 size-full bg-[url('/noise_color_128.png')] opacity-20 mix-blend-multiply" />
            <div className="absolute top-26 left-0 h-0 w-full border-b border-[#555]" />
            <section className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-10 pt-5 pb-10">
              <div>
                <div className="text-7xl leading-none font-black whitespace-nowrap text-[#6354eb]">
                  {selectedLastWork?.title}
                </div>
              </div>
              <div className="relative grid min-h-full flex-1 grid-cols-2 gap-10 pt-10">
                <div className="relative flex flex-col gap-6">
                  <div className="relative rounded-lg bg-[#666] p-4 text-white after:absolute after:-top-15 after:left-7 after:z-200 after:block after:size-0 after:border-[30px_10px] after:border-[transparent_transparent_#666_transparent] after:content-['']">
                    {selectedLastWork?.comment}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div
                      className="h-4 w-24 rounded-full"
                      style={{
                        backgroundColor: `${selectedLastWork?.accent_color}`,
                      }}
                    />
                    <div
                      className="size-4 rounded-full"
                      style={{
                        backgroundColor: `${selectedLastWork?.accent_color}`,
                      }}
                    />
                    <div
                      className="size-4 rounded-full"
                      style={{
                        backgroundColor: `${selectedLastWork?.accent_color}`,
                      }}
                    />
                    <div
                      className="size-4 rounded-full"
                      style={{
                        backgroundColor: `${selectedLastWork?.accent_color}`,
                      }}
                    />
                  </div>
                  <div>{selectedLastWork?.description}</div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  {selectedLastWork?.images.map((imageId, imageIdx) => (
                    <div key={imageIdx} className="my-5">
                      <img
                        src={`/api/images/${imageId.image_id}/raw`}
                        alt={`選択中の制作物画像${imageIdx + 1}`}
                        className="mx-auto max-h-[60vh] object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="group sticky bottom-10 z-2 flex cursor-pointer items-center gap-4"
                onClick={() => setSelectingWorkId(undefined)}
              >
                <div className="h-0 grow border-b border-[#aaa] transition-all"></div>
                <div
                  className={`shrink-0 px-10 text-6xl leading-none tracking-wider transition-all group-hover:px-0 ${smoochSans.className}`}
                >
                  CLOSE
                </div>
                <div className="h-0 grow border-b border-[#aaa] transition-all"></div>
              </button>
            </section>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
