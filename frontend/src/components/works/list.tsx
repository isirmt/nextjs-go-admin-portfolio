/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useSelectingCubeContext } from "@/contexts/selectingCubeContext";
import { useWorksContext } from "@/contexts/worksContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";
import { useScrollbarControl } from "@/hooks/useScrollbarControl";
import { useWorkListView, WORK_SORT_OPTIONS } from "@/hooks/useWorkListView";
import { smoochSans } from "@/lib/fonts";
import { SectionText } from "./sectionText";
import { CloudLarge, CloudSmall } from "./clouds";
import SelectedDetailScreen from "./selectedDetailScreen";
import WorkCard from "./workCard";
import { useTechsContext } from "@/contexts/techsContext";

export default function WorksList() {
  const { works } = useWorksContext();
  const { techs } = useTechsContext();
  const {
    visibleWorks,
    toggleTech,
    selectedTechIds,
    clearTechs,
    sort,
    setSort,
  } = useWorkListView(works);
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
  const selectedSortIndex = WORK_SORT_OPTIONS.findIndex(
    (option) => option.value === sort,
  );

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
        className={`relative flex flex-col items-center justify-center overflow-x-hidden bg-[#fcfcfc] px-8 pt-32 pb-60 sm:px-20`}
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
        <div className="relative mb-28 flex w-full flex-col items-center justify-center gap-12 sm:items-end lg:flex-row">
          <div className="flex flex-col items-start gap-1.5 select-none">
            <button
              className={`w-fit scale-100 cursor-pointer rounded-full border border-[#eb6854] bg-white px-2 py-0.5 text-sm text-[#eb6854] transition-[background-color,opacity,scale] duration-[250ms,100ms,500ms] ease-[linear,linear,cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-[#ffe4e0] ${selectedTechIds.size > 0 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
              onClick={clearTechs}
            >
              CLEAR
            </button>
            <ul className="flex flex-wrap justify-start gap-1.5">
              {techs.map((tech) => (
                <li key={tech.id}>
                  <button
                    className={`pointer-events-auto scale-100 cursor-pointer rounded-full border border-[#6354EB] px-2 py-0.5 text-sm transition-[background-color,color,scale] duration-[250ms,250ms,500ms] ease-[linear,linear,cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 ${selectedTechIds.has(tech.id) ? "bg-[#6354EB] text-white" : "bg-white text-[#6354EB] hover:bg-[#e4e0ff]"}`}
                    onClick={() => toggleTech(tech.id)}
                  >
                    #{tech.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <fieldset className="relative grid w-64 grid-cols-3 rounded-full border border-[#6354EB] bg-white p-0.5">
              <span
                className="pointer-events-none absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-[#6354EB] transition-transform duration-150 ease-out"
                style={{
                  transform: `translateX(${selectedSortIndex * 100}%)`,
                }}
              />

              {WORK_SORT_OPTIONS.map((option) => {
                const isSelected = sort === option.value;

                return (
                  <label
                    key={option.value}
                    className={`group relative z-10 flex cursor-pointer items-center justify-center rounded-full px-3 py-1 text-sm transition-colors select-none ${
                      isSelected ? "text-white" : "text-[#6354EB]"
                    }`}
                  >
                    <span
                      className={`absolute h-[calc(100%-0.25rem)] w-9/10 rounded-full bg-transparent transition-all group-hover:bg-[#e4e0ff] ${isSelected ? "hidden" : "block"}`}
                    />
                    <input
                      className="sr-only"
                      type="radio"
                      name="work-sort"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => setSort(option.value)}
                    />

                    <span className="relative z-10">{option.label}</span>
                  </label>
                );
              })}
            </fieldset>
          </div>
        </div>
        <div className="flex w-fit flex-wrap justify-center gap-x-24 gap-y-24">
          {visibleWorks.map((work) => (
            <WorkCard
              key={work.id}
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
