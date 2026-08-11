"use client";
import { lineSeedJp } from "@/lib/fonts";
import HeroPageFrame from "../pageFrame";
import { useEffect, useState } from "react";

export default function OpeningHeroPage() {
  const [isColorful, setIsColorful] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsColorful(true);
    }, 2300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <HeroPageFrame>
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-[#ffffff] font-bold select-none ${lineSeedJp.className}`}
      >
        <div
          className={`absolute z-10 aspect-square rounded-full bg-transparent backdrop-grayscale-100 transition-all duration-1500 ${isColorful ? "size-0" : "size-[calc(max(100dvh,100dvw)*1.414)]"}`}
        />
        <div className="animate-btt absolute top-[300dvh] right-0 h-[300dvh] w-[300dvh] rounded-full bg-[#faddf1] md:right-1/3" />
        <div className="animate-btt absolute top-[300dvh] left-0 h-[300dvh] w-[300dvh] rounded-full bg-[#cbf9ff] [animation-delay:0.5s] md:left-1/3" />
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex flex-row items-center justify-center gap-12">
            <div className="relative flex size-26 items-center justify-center">
              <div className="flex size-full items-center justify-center bg-[#F43F5E] text-8xl leading-none text-white">
                色
              </div>
            </div>
            <div className="relative flex size-26 items-center justify-center">
              <div className="flex size-full items-center justify-center bg-[#F4603F] text-8xl leading-none text-white">
                彩
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center gap-12">
            <div className="group relative flex size-20 items-center justify-center">
              <button
                className={`ease-over pointer-events-auto z-20 flex size-full cursor-pointer items-center justify-center text-7xl leading-none text-white transition-[scale,background-color] duration-[150ms,1000ms] hover:scale-90 active:scale-80 ${
                  isColorful ? "bg-[#aaa]" : "bg-[#F4CE6B]"
                }`}
                onClick={() => setIsColorful((current) => !current)}
              >
                と
              </button>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center gap-12">
            <div className="relative flex size-26 items-center justify-center">
              <div className="flex size-full items-center justify-center bg-[#D386F4] text-8xl leading-none text-white">
                体
              </div>
            </div>
            <div className="relative flex size-26 items-center justify-center">
              <div className="flex size-full items-center justify-center bg-[#90F4A1] text-8xl leading-none text-white">
                験
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeroPageFrame>
  );
}
