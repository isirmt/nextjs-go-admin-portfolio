/* eslint-disable @next/next/no-img-element */
"use client";

import { useSelectingCubeContext } from "@/contexts/selectingCubeContext";
import RealtimeWorld from "./realtimeWorld";
import VerticalViewer from "./works/verticalViewer";
import React, { useMemo } from "react";
import { useWorksContext } from "@/contexts/worksContext";
import Link from "next/link";
import MarqueeText from "./marqueeText";

export default function HeroSection() {
  const { works } = useWorksContext();
  const { selectingCubeId } = useSelectingCubeContext();

  const selectingWork = useMemo(() => {
    return works.find((work) => work.id === selectingCubeId);
  }, [works, selectingCubeId]);

  return (
    <React.Fragment>
      <div
        className={`absolute top-0 left-0 size-full transition-all duration-300 ${selectingWork ? "opacity-0" : "opacity-100"}`}
      >
        <VerticalViewer />
      </div>
      <div
        className={`absolute top-0 left-0 size-full overflow-hidden bg-white transition-all duration-300 ${selectingWork ? "opacity-100 delay-300" : "opacity-0"}`}
      >
        {selectingWork && (
          <img
            alt={`${selectingWork.title}`}
            className="size-full object-cover opacity-25"
            src={`/api/images/${selectingWork.thumbnail_image_id}/raw`}
          />
        )}
      </div>
      <div className="pointer-events-none absolute flex size-full -translate-y-10 items-center justify-center text-[#111111] drop-shadow-md drop-shadow-[#aaa]">
        {selectingWork ? (
          <div className="absolute flex w-full flex-col gap-2 px-10 text-center lg:px-20">
            <div className="font-noto relative max-w-full text-6xl font-bold whitespace-nowrap text-[#751aab] md:text-8xl">
              <MarqueeText
                speedFactor={120}
                pauseSeconds={0.5}
                text={selectingWork.title}
              />
              <div className="absolute left-[50%] translate-x-[-50%] translate-y-4 text-2xl text-[#222]">
                詳細を表示
              </div>
            </div>
          </div>
        ) : (
          <div className="font-dot absolute text-[6rem] leading-none md:text-[10rem]">
            isirmt
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute top-0 left-0 size-full bg-[linear-gradient(0deg,transparent_calc(100%-1px),#000_calc(100%-1px)),linear-gradient(90deg,transparent_calc(100%-1px),#000_calc(100%-1px))] bg-size-[64px_64px] opacity-10" />
      <RealtimeWorld />
      <Link
        className="group absolute right-0 bottom-24 z-10 size-[300px] bg-[#f43f5e] transition-all [clip-path:polygon(100%_0%,100%_100%,0%_100%)] hover:bg-[#ff5a75]"
        href="https://itomiri.com"
        target="_blank"
        rel="noopener"
      >
        <div className="relative flex size-full items-center justify-center">
          <svg
            className="size-full transition-all group-hover:-translate-0.5 group-hover:scale-105"
            viewBox="0 0 300 300"
          >
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="63.43"
              y1="263.02"
              x2="83.01"
              y2="243.45"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="73.22"
              y1="253.23"
              x2="97.24"
              y2="277.26"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="87.69"
              y1="287.28"
              x2="107.31"
              y2="267.66"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="245.14"
              y1="81.31"
              x2="264.72"
              y2="61.73"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="254.93"
              y1="71.52"
              x2="278.95"
              y2="95.54"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="269.4"
              y1="105.57"
              x2="289.02"
              y2="85.95"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="187.35"
              y1="139.11"
              x2="206.92"
              y2="119.53"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="197.13"
              y1="129.32"
              x2="221.16"
              y2="153.34"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="211.61"
              y1="163.37"
              x2="231.23"
              y2="143.74"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="91.38"
              y1="235.08"
              x2="110.42"
              y2="216.03"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="100.9"
              y1="225.55"
              x2="124.92"
              y2="249.57"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] opacity-28 [stroke-linecap:round] [stroke-linejoin:round]"
              x1="187.58"
              y1="138.87"
              x2="206.63"
              y2="119.82"
            />
            <circle
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              cx="144.48"
              cy="205.94"
              r="16.99"
            />
            <polyline
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              points="181.4 193.1 157.38 169.07 185.24 177.36 176.88 149.57 201.02 173.47"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="216.72"
              y1="109.73"
              x2="240.74"
              y2="133.75"
            />
            <path
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              d="M229.21,97.25c3.84-3.84,10.3-3.97,14.17-.1,3.87,3.87,3.89,10.12.04,13.96"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="243.42"
              y1="111.1"
              x2="230.75"
              y2="123.77"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="229.27"
              y1="97.19"
              x2="216.66"
              y2="109.79"
            />
            <line
              className="fill-none stroke-[#ffffff] stroke-[3.67px] [stroke-linecap:round] [stroke-linejoin:round]"
              x1="260.36"
              y1="114.13"
              x2="240.54"
              y2="114.13"
            />
            <path
              className="origin-center animate-spin fill-[#ffffff] [animation-duration:3700ms] transform-fill group-hover:[animation-duration:1000ms]"
              d="M149.57,200.51l-8.87.37c-.28.01-.41.35-.21.55l1.51,1.51c.13.13.13.33,0,.46l-3.95,3.95c-.13.13-.13.33,0,.46l4.57,4.57c.13.13.33.13.46,0l3.95-3.95c.13-.13.33-.13.46,0l1.51,1.51c.2.2.54.07.55-.21l.37-8.87c0-.19-.15-.34-.33-.33Z"
            />
          </svg>
        </div>
      </Link>
    </React.Fragment>
  );
}
