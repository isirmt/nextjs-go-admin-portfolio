/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useImagesContext } from "@/contexts/imagesContext";
import { useSelectingCubeContext } from "@/contexts/selectingCubeContext";
import { useWorksContext } from "@/contexts/worksContext";
import { Work } from "@/types/works/common";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";
import { useTechInfoGetter } from "@/hooks/useTechInfoGetter";
import { smoochSans } from "@/lib/fonts";
import { SectionText } from "./sectionText";
import { CloudLarge, CloudSmall } from "./clouds";
import SelectedDetailScreen from "./selectedDetailScreen";
import MarqueeText from "../marqueeText";

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
  onRecordClick,
}: {
  work: Work;
  selectingId?: string;
  selectingFunc: (id?: string) => void;
  onRecordClick?: (id: string) => void;
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
      <div className="pointer-events-none absolute -top-9 z-3 max-w-full rounded-xl bg-[#6354eb] px-3 py-1 text-sm whitespace-nowrap text-white drop-shadow-sm drop-shadow-[#a39ed1] select-none before:absolute before:top-0 before:left-[50%] before:-z-1 before:block before:translate-x-[-50%] before:translate-y-full before:border-[22px_10px_0px_10px] before:border-x-transparent before:border-t-[#6354eb] before:content-['']">
        <MarqueeText text={work.comment} />
      </div>
      <button
        onClick={() => {
          if (isSelected) {
            selectingFunc(undefined);
            return;
          }
          selectingFunc(work.id);
          onRecordClick?.(work.id);
        }}
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
      <div className="flex w-76 flex-wrap justify-start gap-3">
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
  const { clickedCubeId, clickNonce } = useSelectingCubeContext();
  const [selectingWorkId, setSelectingWorkId] = useState<string>();
  const [lastSelectedWorkId, setLastSelectedWorkId] = useState<string>();
  const clickLimiterRef = useRef<Map<string, number>>(new Map());
  const lastHandledCubeClickRef = useRef(0);
  const { ref: andMoreTextRef, isActive: isAndMoreTextActive } =
    useInViewAnimation<HTMLDivElement>({
      threshold: 0.2,
      delayMs: 250,
    });

  const handleSelectWork = useCallback((id?: string) => {
    setSelectingWorkId(id);
    if (id) {
      setLastSelectedWorkId(id);
    }
  }, []);

  const recordClick = useCallback((id: string) => {
    const now = Date.now();
    const last = clickLimiterRef.current.get(id) ?? 0;
    if (now - last < 2000) {
      return;
    }
    clickLimiterRef.current.set(id, now);

    const url = `/api/works/${id}/clicks`;
    try {
      const blob = new Blob([], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    } catch {
      // do nothing
    }
  }, []);

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

  useEffect(() => {
    if (!clickedCubeId || clickNonce === 0) {
      return;
    }
    if (lastHandledCubeClickRef.current === clickNonce) {
      return;
    }
    lastHandledCubeClickRef.current = clickNonce;
    if (selectingWorkId === clickedCubeId) {
      handleSelectWork(undefined);
      return;
    }
    handleSelectWork(clickedCubeId);
    recordClick(clickedCubeId);
  }, [
    clickedCubeId,
    clickNonce,
    handleSelectWork,
    recordClick,
    selectingWorkId,
  ]);

  return (
    <React.Fragment>
      <div
        className={`relative flex flex-col items-center justify-center overflow-x-hidden bg-[#f8f8f8] px-20 pt-20 pb-60`}
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
        <div className="flex w-fit flex-wrap justify-center gap-x-20 gap-y-20">
          {works.map((work, workIdx) => (
            <WorkCard
              key={workIdx}
              work={work}
              selectingId={selectingWorkId}
              selectingFunc={handleSelectWork}
              onRecordClick={recordClick}
            />
          ))}
        </div>
      </div>
      <SelectedDetailScreen
        selectingWorkId={selectingWorkId}
        lastSelectedWorkId={lastSelectedWorkId}
        setSelectingWorkId={setSelectingWorkId}
      />
    </React.Fragment>
  );
}
