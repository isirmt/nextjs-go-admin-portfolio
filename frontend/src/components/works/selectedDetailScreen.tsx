/* eslint-disable @next/next/no-img-element */
"use client";

import { useWorksContext } from "@/contexts/worksContext";
import { useTechInfoGetter } from "@/hooks/useTechInfoGetter";
import { smoochSans } from "@/lib/fonts";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

type SelectedDetailScreenProps = {
  selectingWorkId?: string;
  lastSelectedWorkId?: string;
  setSelectingWorkId: (id?: string) => void;
};

export default function SelectedDetailScreen({
  selectingWorkId,
  lastSelectedWorkId,
  setSelectingWorkId,
}: SelectedDetailScreenProps) {
  const { works } = useWorksContext();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const selectedLastWork = useMemo(() => {
    const targetId = selectingWorkId ?? lastSelectedWorkId;
    return works.find((work) => work.id === targetId);
  }, [lastSelectedWorkId, selectingWorkId, works]);

  const { techsInfo } = useTechInfoGetter(selectedLastWork?.tech_stacks ?? []);

  useEffect(() => {
    if (!selectingWorkId) return;
    const containerElement = scrollContainerRef.current;
    if (!containerElement) return;
    const resetScroll = () => containerElement.scrollTo({ top: 0 });
    resetScroll();

    return;
  }, [selectingWorkId]);

  return (
    <div
      className={`fixed top-0 left-0 z-100 size-full transition-opacity ${selectingWorkId ? "pointer-events-auto bg-[#eee]/70 opacity-100 backdrop-blur-md backdrop-saturate-50 delay-450" : "pointer-events-none opacity-0 backdrop-blur-none delay-0"}`}
    >
      <div
        className="pointer-events-none fixed top-0 left-0 z-1 h-full bg-[linear-gradient(to_bottom,transparent_calc(100dvh-250px),rgba(255,255,255,1))]"
        style={{ right: "var(--scrollbar-width, 0px)" }}
      />
      <div className="animate-spin-reverse fixed bottom-10 left-6 size-34 bg-[url('/windmill.svg')] opacity-50 [animation-duration:10s]" />
      <div
        ref={scrollContainerRef}
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
                {selectedLastWork?.urls &&
                  selectedLastWork?.urls.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center text-center text-xl font-bold text-[#353535]">
                        <div className="h-0 flex-1 border-b" />
                        <span className="mx-4 select-none">関連リンク</span>
                        <div className="h-0 flex-1 border-b" />
                      </div>
                      <div className="flex flex-col gap-2 px-4 py-4">
                        {selectedLastWork?.urls.map((workUrl, urlIdx) => (
                          <div className="flex items-end gap-2" key={urlIdx}>
                            <Link
                              target="_blank"
                              rel="noopener"
                              href={workUrl.url}
                              className="inline-block w-fit border-b text-lg leading-none text-[#361ea0] hover:text-[#361ea0]/70"
                            >
                              {workUrl.label}
                            </Link>
                            <div className="text-xs leading-none text-[#555]">
                              {workUrl.url}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center text-center text-xl font-bold text-[#353535]">
                        <div className="h-0 flex-1 border-b" />
                      </div>
                    </div>
                  )}
                <div className="whitespace-pre-wrap">
                  {selectedLastWork?.description}
                </div>
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
  );
}
