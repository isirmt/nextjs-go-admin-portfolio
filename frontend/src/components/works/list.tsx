/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useSelectingCubeContext } from "@/contexts/selectingCubeContext";
import { useWorksContext } from "@/contexts/worksContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";
import { useScrollbarControl } from "@/hooks/useScrollbarControl";
import { smoochSans } from "@/lib/fonts";
import { SectionText } from "./sectionText";
import { CloudLarge, CloudSmall } from "./clouds";
import SelectedDetailScreen from "./selectedDetailScreen";
import WorkCard from "./workCard";

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

  useScrollbarControl(Boolean(selectingWorkId));

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
        className={`relative flex flex-col items-center justify-center overflow-x-hidden bg-[#fcfcfc] px-20 pt-20 pb-60`}
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
        <SectionText />
        <div className="flex w-fit flex-wrap justify-center gap-x-24 gap-y-24">
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
