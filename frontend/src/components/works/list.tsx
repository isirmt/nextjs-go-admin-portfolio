/* eslint-disable @next/next/no-img-element */
"use client";

import { useImagesContext } from "@/contexts/imagesContext";
import { useWorksContext } from "@/contexts/worksContext";
import { Work } from "@/types/works/common";
import React, { useEffect, useMemo, useState } from "react";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";
import { useTechInfoGetter } from "@/hooks/useTechInfoGetter";
import { smoochSans } from "@/lib/fonts";
import { SectionText } from "./sectionText";
import { CloudLarge, CloudSmall } from "./clouds";

const delayFromId = (id: string, maxDelay = 500) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return (hash >>> 0) % (maxDelay + 1);
};

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

  const { techsInfo } = useTechInfoGetter(work.tech_stacks);
  const thumbnailAlt = useMemo(
    () => imageInfo?.file_name ?? `${work.title}のサムネイル`,
    [imageInfo, work.title],
  );
  const isSelected = selectingId === work.id;

  return (
    <div
      className={`relative flex flex-col items-center gap-3 transition-opacity select-none ${isSelected ? "opacity-100" : selectingId ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{
        transitionDelay: `${randomSelectingDelayMs}ms`,
      }}
    >
      <div className="pointer-events-none absolute -top-9 z-3 max-w-full rounded-xl bg-[#6354eb] px-3 py-1 text-white drop-shadow-sm drop-shadow-[#a39ed1] select-none before:absolute before:top-0 before:left-[50%] before:-z-1 before:block before:translate-x-[-50%] before:translate-y-full before:border-[22px_10px_0px_10px] before:border-x-transparent before:border-t-[#6354eb] before:content-['']">
        {work.comment}
      </div>
      <button
        onClick={() => selectingFunc(isSelected ? undefined : work.id)}
        className={`group relative flex cursor-pointer items-center justify-center drop-shadow-2xl transition-all duration-100 ${isSelected ? "scale-110" : ""}`}
      >
        <div
          className={`pointer-events-none absolute z-0 size-[95%] bg-[#94d5f3] transition-all duration-300 ${isSelected ? "-rotate-360 delay-200 ease-linear" : "ease-over rotate-17"}`}
        />
        <div
          className={`relative z-2 flex aspect-square size-72 items-center justify-center overflow-hidden bg-white transition-all ${isSelected ? "rounded-3xl" : "rounded-xl"}`}
        >
          <img
            src={`/api/images/${work.thumbnail_image_id}/raw`}
            className={`pointer-events-none size-72 object-cover transition-all duration-200 ease-out ${isSelected ? "skew-x-1 brightness-120 duration-100" : "group-hover:scale-110 group-hover:skew-x-1 group-hover:brightness-110"}`}
            alt={thumbnailAlt}
          />
        </div>
        <div
          className={`pointer-events-none absolute top-0 left-0 z-3 size-full overflow-hidden transition-all ${isSelected ? "rounded-3xl" : "rounded-xl"}`}
        >
          <div
            className="absolute top-0 left-0 size-0 border-[1.5rem] transition-all duration-150"
            style={{
              borderColor: `${work.accent_color} transparent transparent ${work.accent_color}`,
            }}
          />
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
  const [lastSelectedWorkId, setLastSelectedWorkId] = useState<string>();
  const { ref: andMoreTextRef, isActive: isAndMoreTextActive } =
    useInViewAnimation<HTMLDivElement>({
      threshold: 0.2,
      delayMs: 250,
    });

  const selectedLastWork = useMemo(() => {
    const targetId = selectingWorkId ?? lastSelectedWorkId;
    return works.find((work) => work.id === targetId);
  }, [lastSelectedWorkId, selectingWorkId, works]);

  const handleSelectWork = (id?: string) => {
    setSelectingWorkId(id);
    if (id) {
      setLastSelectedWorkId(id);
    }
  };

  const { techsInfo } = useTechInfoGetter(selectedLastWork?.tech_stacks ?? []);

  useEffect(() => {
    if (!selectingWorkId) {
      return;
    }
    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previousOverscroll = style.overscrollBehavior;
    const previousTouchAction = style.touchAction;
    const previousPaddingRight = style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    style.overflow = "hidden";
    style.overscrollBehavior = "contain";
    style.touchAction = "none";
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      style.overflow = previousOverflow;
      style.overscrollBehavior = previousOverscroll;
      style.touchAction = previousTouchAction;
      style.paddingRight = previousPaddingRight;
    };
  }, [selectingWorkId]);

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
              selectingFunc={handleSelectWork}
            />
          ))}
        </div>
      </div>
      <div
        className={`fixed top-0 left-0 z-100 size-full transition-opacity ${selectingWorkId ? "pointer-events-auto bg-[#eee]/70 opacity-100 backdrop-blur-md backdrop-saturate-50 delay-450" : "pointer-events-none opacity-0 backdrop-blur-none delay-0"}`}
      >
        <div
          className="pointer-events-none fixed top-0 left-0 z-1 h-full bg-[linear-gradient(to_bottom,transparent_calc(100dvh-250px),rgba(255,255,255,1))]"
          style={{ right: "var(--scrollbar-width, 0px)" }}
        />
        <div className="animate-spin-reverse fixed bottom-10 left-6 size-34 bg-[url('/windmill.svg')] opacity-50 [animation-duration:10s]" />
        <div
          className={`size-full ${selectingWorkId ? "overflow-y-scroll overscroll-contain" : "overflow-y-hidden"}`}
        >
          <div className="relative min-h-full">
            <div className="pointer-events-none absolute top-0 left-0 z-0 size-full bg-[url('/noise_color_128.png')] opacity-20 mix-blend-multiply" />
            <div className="absolute top-26 left-0 h-0 w-full border-b border-[#555]" />
            <section className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-10 pt-5 pb-10">
              <div>
                <div className="text-7xl leading-none font-black whitespace-nowrap text-[#6354eb]">
                  {selectedLastWork?.title}
                </div>
              </div>
              <div className="relative mb-14 grid min-h-full flex-1 grid-cols-2 gap-10 pt-10">
                <div className="relative flex flex-col gap-6">
                  <div className="relative -top-2 rounded-lg bg-[#666] px-6 py-4 text-white after:absolute after:-top-15 after:left-7 after:z-200 after:block after:size-0 after:border-[30px_10px] after:border-[transparent_transparent_#666_transparent] after:content-['']">
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
                  <div>{selectedLastWork?.description}</div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  {selectedLastWork?.images.map((imageId, imageIdx) => (
                    <div key={imageIdx} className="my-5">
                      <img
                        src={`/api/images/${imageId.image_id}/raw`}
                        alt={`選択中の制作物画像${imageIdx + 1}`}
                        className="mx-auto max-h-[60vh] object-contain select-none"
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
