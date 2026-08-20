"use client";
import {
  animate,
  at,
  defineTimeline,
  set,
  TimelineStatus,
  useWaapiTimeline,
} from "@isirmt/react-cues";
import { lineSeedJp } from "@/lib/fonts";
import HeroPageFrame from "../pageFrame";
import { useCallback, useEffect, useRef, useState } from "react";
import Sparkle from "@/components/shapes/sparkle";
import { Slider } from "@/components/public/slider";
import MediaPauserIcon from "@/components/public/mediaPauserIcon";

const WAVE_KEYFRAMES: Keyframe[] = [
  { transform: "translateY(0)" },
  { transform: "translateY(-600dvh)" },
];

const APPEAR_KEYFRAMES: Keyframe[] = [
  { transform: "translateY(-130%)" },
  { transform: "translateY(0)" },
];

const APPEAR_EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

type OpeningTimelineState = {
  isColorful: boolean;
};

const openingTimelineDefinition = defineTimeline<OpeningTimelineState>({
  initialState: {
    isColorful: false,
  },
  cues: [
    at(2300, set("isColorful", true)),
    at(
      0,
      animate("pink-wave", WAVE_KEYFRAMES, {
        duration: 4000,
        easing: "linear",
      }),
    ),
    at(
      500,
      animate("blue-wave", WAVE_KEYFRAMES, {
        duration: 4000,
        easing: "linear",
      }),
    ),
    at(
      4000,
      animate("background", APPEAR_KEYFRAMES, {
        duration: 1000,
        easing: APPEAR_EASING,
      }),
    ),
    at(
      4400,
      animate("circles", APPEAR_KEYFRAMES, {
        duration: 1000,
        easing: APPEAR_EASING,
      }),
    ),
    at(
      4800,
      animate("sparkles", APPEAR_KEYFRAMES, {
        duration: 1000,
        easing: APPEAR_EASING,
      }),
    ),
  ],
});

export default function OpeningHeroPage() {
  const [colorfulOverride, setColorfulOverride] = useState<boolean | null>(
    null,
  );
  const { bind, snapshot, timeline } = useWaapiTimeline(
    openingTimelineDefinition,
  );
  const playbackStateRef = useRef<TimelineStatus | null>(null);
  const isColorful = colorfulOverride ?? snapshot.state.isColorful;

  useEffect(() => {
    timeline.play();

    return () => timeline.pause();
  }, [timeline]);

  const handleSeekBarPointerDown = useCallback(() => {
    playbackStateRef.current = snapshot.status;
    timeline.pause();
  }, [snapshot.status, timeline]);

  const handleSeekBarPointerUp = useCallback(() => {
    if (playbackStateRef.current === "playing") {
      timeline.play();
    } else if (playbackStateRef.current === "paused") {
      timeline.pause();
    }
  }, [timeline]);

  return (
    <HeroPageFrame>
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-[#ffffff] font-bold select-none ${lineSeedJp.className}`}
      >
        <button
          className={`ease-over pointer-events-auto absolute bottom-3 left-[calc(34*0.25rem+1.5rem)] z-50 size-8 cursor-pointer text-[#F43F5E] transition-all duration-400 hover:scale-110 active:scale-95 md:left-[calc(63*0.25rem+1.5rem)]`}
          onClick={() => {
            if (snapshot.status === "playing") {
              timeline.pause();
            } else {
              timeline.play();
            }
          }}
        >
          <MediaPauserIcon
            isPlaying={snapshot.status === "playing"}
            className="size-7 fill-current"
          />
        </button>
        <Slider
          min={0}
          max={snapshot.duration}
          step={10}
          value={snapshot.currentTime}
          onChange={(event) => {
            timeline.seek(event.currentTarget.valueAsNumber);
          }}
          primaryColor="#9AEBE6"
          secondaryColor="#EEE"
          onPointerDown={handleSeekBarPointerDown}
          onPointerUp={handleSeekBarPointerUp}
          className="pointer-events-auto absolute bottom-5 left-[calc(45*0.25rem+1.5rem)] z-50 h-3.5 w-[calc(100%-45*0.25rem-3rem)] rounded-full [corner-shape:bevel] md:left-[calc(75*0.25rem+1.5rem)] md:w-[calc(100%-75*0.25rem-3rem)]"
        />
        {/* Gray scale */}
        <div
          className={`absolute z-10 aspect-square rounded-full bg-transparent backdrop-grayscale-100 transition-all duration-1500 ease-in-out ${isColorful ? "size-0" : "size-[calc(max(100dvh,100dvw)*1.414)]"}`}
        />
        <div
          ref={bind("background")}
          className="absolute top-0 left-0 flex size-full transform-[translateY(-130%)] items-center justify-center"
        >
          <div className="absolute -top-[85dvh] h-[180dvh] w-[180dvw] rounded-b-full bg-[linear-gradient(45deg,#d1fafa_40vw,#d1f0ff_140vw)]" />
          <div className="animate-up-down-smooth absolute -top-[110dvh] h-[120dvh] w-[120dvw] translate-x-[30dvw] rounded-b-full bg-[linear-gradient(45deg,#baf8dd_40vw,#cdfefe_140vw)] [animation-delay:0.5s]" />

          <div
            ref={bind("circles")}
            className="absolute top-0 left-0 flex size-full transform-[translateY(-130%)] items-center justify-center"
          >
            <div
              className={`animate-up-down-smooth absolute -top-[3%] -left-[3%] aspect-square w-30 overflow-hidden rounded-full bg-[#d29cef] [animation-delay:-.5s]`}
            >
              <div className="animate-up-down-smooth absolute right-0 bottom-0 size-[140%] translate-x-1/2 translate-y-1/2 rounded-full bg-[#d5c3f8] duration-1000 [animation-delay:-.5s]" />
            </div>
            <div
              className={`animate-up-down-smooth absolute top-[25%] -right-[10%] aspect-square w-50 overflow-hidden rounded-full bg-[#9aebe6] [animation-delay:-.9s] sm:-right-[1%]`}
            >
              <div className="animate-up-down-smooth absolute bottom-0 left-0 size-[140%] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#b0f3ee] duration-1000 [animation-delay:-.9s]" />
            </div>
          </div>
          <div
            ref={bind("sparkles")}
            className="absolute top-0 left-0 flex size-full transform-[translateY(-130%)] items-center justify-center"
          >
            <Sparkle
              className={`animate-up-down-smooth absolute top-[15%] -left-[5%] aspect-3/4 w-40 bg-[#f8c774] sm:left-[5%] md:left-[10%] md:w-65`}
            >
              <div className="animate-up-down-smooth absolute bottom-0 left-0 size-[140%] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#f6d992] duration-1000" />
            </Sparkle>
            <Sparkle
              className={`animate-up-down-smooth absolute right-[20%] bottom-[-5%] aspect-1/2 w-38 bg-[#f494ae] [animation-delay:-.7s]`}
            >
              <div className="animate-up-down-smooth absolute right-0 bottom-0 size-[140%] translate-x-1/2 translate-y-1/2 rounded-full bg-[#f3c2e2] duration-1000 [animation-delay:-.7s]" />
            </Sparkle>
          </div>
        </div>
        <div
          ref={bind("pink-wave")}
          className="absolute top-[300dvh] right-0 h-[300dvh] w-[300dvh] rounded-full bg-[linear-gradient(180deg,#faddf1,#f5c2e5)] ease-out md:right-1/3"
        />
        <div
          ref={bind("blue-wave")}
          className="absolute top-[300dvh] left-0 h-[300dvh] w-[300dvh] rounded-full bg-[linear-gradient(180deg,#cbf9ff,#b2f2fb)] ease-out md:left-1/3"
        />
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="animate-up-down-smooth flex flex-row items-center justify-center gap-12">
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
                className={`animate-up-down-smooth ease-over pointer-events-auto z-20 flex size-full cursor-pointer items-center justify-center bg-[#f8d16e] text-7xl leading-none text-white transition-[scale,background-color] delay-[0ms,800ms] duration-[350ms,1000ms] hover:scale-90 active:scale-80`}
                onClick={() =>
                  setColorfulOverride(
                    (current) => !(current ?? snapshot.state.isColorful),
                  )
                }
              >
                と
              </button>
            </div>
          </div>
          <div className="animate-up-down-smooth flex flex-row items-center justify-center gap-12">
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
