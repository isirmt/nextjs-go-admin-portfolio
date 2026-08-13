"use client";
import { lineSeedJp } from "@/lib/fonts";
import HeroPageFrame from "../pageFrame";
import { useEffect, useState } from "react";
import Sparkle from "@/components/shapes/sparkle";

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
        {/* Gray scale */}
        <div
          className={`absolute z-10 aspect-square rounded-full bg-transparent backdrop-grayscale-100 transition-all duration-1500 ease-in-out ${isColorful ? "size-0" : "size-[calc(max(100dvh,100dvw)*1.414)]"}`}
        />
        <div className="absolute -top-[85dvh] h-[180dvh] w-[180dvw] rounded-b-full bg-[linear-gradient(45deg,#d1fafa_40vw,#d1f0ff_140vw)]" />
        <div className="animate-up-down-smooth absolute -top-[110dvh] h-[120dvh] w-[120dvw] translate-x-[30dvw] rounded-b-full bg-[linear-gradient(45deg,#baf8dd_40vw,#cdfefe_140vw)] [animation-delay:0.5s]" />

        <Sparkle
          className={`animate-up-down-smooth absolute top-[15%] left-[20%] aspect-3/4 w-45 bg-[#f8c774]`}
        >
          <div className="animate-up-down-smooth absolute bottom-0 left-0 size-[140%] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#f6d992] duration-1000" />
        </Sparkle>
        <div
          className={`animate-up-down-smooth absolute -top-[3%] -left-[3%] aspect-square w-30 overflow-hidden rounded-full bg-[#d29cef] [animation-delay:-.5s]`}
        >
          <div className="animate-up-down-smooth absolute right-0 bottom-0 size-[140%] translate-x-1/2 translate-y-1/2 rounded-full bg-[#d5c3f8] duration-1000 [animation-delay:-.5s]" />
        </div>
        <Sparkle
          className={`animate-up-down-smooth absolute right-[20%] bottom-[-5%] aspect-1/2 w-38 bg-[#f494ae] [animation-delay:-.7s]`}
        >
          <div className="animate-up-down-smooth absolute right-0 bottom-0 size-[140%] translate-x-1/2 translate-y-1/2 rounded-full bg-[#f3c2e2] duration-1000 [animation-delay:-.7s]" />
        </Sparkle>
        <div className="animate-btt absolute top-[300dvh] right-0 h-[300dvh] w-[300dvh] rounded-full bg-[#faddf1] ease-out md:right-1/3" />
        <div className="animate-btt absolute top-[300dvh] left-0 h-[300dvh] w-[300dvh] rounded-full bg-[#cbf9ff] ease-out [animation-delay:0.5s] md:left-1/3" />
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex flex-row items-center justify-center gap-12">
            <div className="relative flex size-26 items-center justify-center">
              <div className="flex size-full items-center justify-center bg-[#f09ba9] text-8xl leading-none text-white">
                色
              </div>
            </div>
            <div className="relative flex size-26 items-center justify-center">
              <div className="flex size-full items-center justify-center bg-[#f4a18f] text-8xl leading-none text-white">
                彩
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center gap-12">
            <div className="group relative flex size-20 items-center justify-center">
              <button
                className={`ease-over pointer-events-auto z-20 flex size-full cursor-pointer items-center justify-center text-7xl leading-none text-white transition-[scale,background-color] duration-[350ms,1000ms] hover:scale-90 active:scale-80 ${
                  isColorful ? "bg-[#aaa]" : "bg-[#f8d16e]"
                }`}
                onClick={() => setIsColorful((current) => !current)}
              >
                と
              </button>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center gap-12">
            <div className="relative flex size-26 items-center justify-center">
              <div className="flex size-full items-center justify-center bg-[#d9aeeb] text-8xl leading-none text-white">
                体
              </div>
            </div>
            <div className="relative flex size-26 items-center justify-center">
              <div className="flex size-full items-center justify-center bg-[#9bd1a4] text-8xl leading-none text-white">
                験
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeroPageFrame>
  );
}
