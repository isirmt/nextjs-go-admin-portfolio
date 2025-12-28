"use client";

import { useSelectingCubeContext } from "@/contexts/selectingCubeContext";
import RealtimeWorld from "./realtimeWorld";
import HorizontalViewer from "./works/horizontalViewer";
import React, { useMemo } from "react";
import { useWorksContext } from "@/contexts/worksContext";

export default function HeroSection() {
  const { works } = useWorksContext();
  const { selectingCubeId } = useSelectingCubeContext();

  const selectingWork = useMemo(() => {
    return works.find((work) => work.id === selectingCubeId);
  }, [works, selectingCubeId]);

  return (
    <React.Fragment>
      <HorizontalViewer />
      <div className="pointer-events-none absolute top-0 left-0 size-full bg-[linear-gradient(0deg,transparent_calc(100%-1px),#000_calc(100%-1px)),linear-gradient(90deg,transparent_calc(100%-1px),#000_calc(100%-1px))] bg-size-[64px_64px] opacity-10" />
      <RealtimeWorld />
      <div className="pointer-events-none absolute flex size-full items-center justify-center">
        {selectingWork ? (
          <div className="absolute flex flex-col gap-2 text-center text-[#222]">
            <div className="font-noto text-6xl font-bold">
              {selectingWork.title}
            </div>
            <div className="font-noto text-2xl">詳細を表示</div>
          </div>
        ) : (
          <div className="font-dot absolute text-8xl leading-none">isirmt</div>
        )}
      </div>
    </React.Fragment>
  );
}
