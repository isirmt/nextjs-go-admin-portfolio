"use client";

import { useInViewAnimation } from "@/hooks/useInViewAnimation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const ORBIT_COUNT = 20;
const ORBIT_DURATION = 60;

type ProfileCardProps = {
  age: number;
};

type OrbitState = {
  d: string;
  width: number;
  height: number;
};

const parseRadius = (value: string) => {
  const raw = value.split(" ")[0] ?? "0";
  return Number.parseFloat(raw);
};

const getRoundRectPath = (
  width: number,
  height: number,
  radius: { tl: number; tr: number; br: number; bl: number },
) =>
  [
    `M ${radius.tl} 0`,
    `H ${width - radius.tr}`,
    `Q ${width} 0 ${width} ${radius.tr}`,
    `V ${height - radius.br}`,
    `Q ${width} ${height} ${width - radius.br} ${height}`,
    `H ${radius.bl}`,
    `Q 0 ${height} 0 ${height - radius.bl}`,
    `V ${radius.tl}`,
    `Q 0 0 ${radius.tl} 0`,
    "Z",
  ].join(" ");

export default function ProfileCard({ age }: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [orbit, setOrbit] = useState<OrbitState | null>(null);
  const { ref: iconRef, isActive: isActiveIcon } =
    useInViewAnimation<HTMLAnchorElement>({ threshold: 1, delayMs: 300 });

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const updateOrbit = () => {
      const rect = element.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width === 0 || height === 0) return;

      const styles = getComputedStyle(element);
      const radius = {
        tl: parseRadius(styles.borderTopLeftRadius),
        tr: parseRadius(styles.borderTopRightRadius),
        br: parseRadius(styles.borderBottomRightRadius),
        bl: parseRadius(styles.borderBottomLeftRadius),
      };
      const d = getRoundRectPath(width, height, radius);

      setOrbit({ d, width, height });
    };

    updateOrbit();
    const observer = new ResizeObserver(updateOrbit);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const orbitStyle: CSSProperties | undefined = orbit
    ? { offsetPath: `path(\"${orbit.d}\")` }
    : undefined;

  return (
    <div className="relative mt-32 w-fit">
      {orbit &&
        Array.from({ length: ORBIT_COUNT }).map((_, orbitIndex) => {
          const delay = -(ORBIT_DURATION * (orbitIndex / ORBIT_COUNT));
          return (
            <span
              key={orbitIndex}
              className="animate-orbit pointer-events-none absolute top-0 left-0 z-0 h-8 w-2 rounded-md bg-[#f7885c] opacity-20 [offset-anchor:0_4rem] [offset-rotate:auto]"
              style={{
                ...orbitStyle,
                animationDelay: `${delay}s`,
                animationDuration: `${ORBIT_DURATION}s`,
              }}
            />
          );
        })}
      <div
        ref={cardRef}
        className="relative z-10 w-fit rounded-tr-[5rem] rounded-br-3xl bg-[#ffe7bb] [box-shadow:0_.75rem_0_0_#f7885c]"
      >
        <div className="pointer-events-none absolute top-5 left-0 h-[calc(100%-40px)] w-[calc(100%-20px)] rounded-tr-[4rem] rounded-br-3xl border-y-2 border-r-2 border-dashed border-[#f7885c] opacity-70" />
        <div className="pointer-events-none absolute -bottom-9 -left-9 z-100 aspect-square size-30 scale-y-155 -rotate-10 bg-[url('/star_y.png')] bg-contain bg-center bg-no-repeat drop-shadow-[#ffd67c] -hue-rotate-40" />
        <div className="pointer-events-none absolute -right-9 -bottom-9 z-100 aspect-square size-30 rotate-20 bg-[url('/star_y.png')] bg-contain bg-center bg-no-repeat drop-shadow-[#ffd67c]" />
        <div className="pointer-events-none absolute right-6 bottom-15 z-100 aspect-square size-17 scale-y-134 rotate-11 bg-[url('/star_y.png')] bg-contain bg-center bg-no-repeat drop-shadow drop-shadow-[#ffd67c] -hue-rotate-20" />
        <div className="font-dot absolute -top-10 left-12 flex flex-col items-center justify-center lg:left-24">
          <div className="text-6xl leading-none tracking-wider">入本聖也</div>
          <div className="text-3xl leading-none font-semibold tracking-wide">
            seiya irimoto
          </div>
        </div>
        <div
          ref={cardRef}
          className="relative w-fit overflow-hidden rounded-tr-[5rem] rounded-br-3xl"
        >
          <div className="pointer-events-none absolute top-0 left-0 z-0 size-full bg-[url('/noise_color_128.png')] opacity-20 mix-blend-multiply" />
          <div className="relative flex flex-col gap-10 pt-24 pr-10 pb-18 pl-13 lg:pr-44 lg:pl-36">
            <div className="relative flex max-w-2xl flex-col items-center gap-16 md:flex-row md:gap-10">
              <div className="group relative flex flex-col items-end gap-6 pr-6 drop-shadow-xl drop-shadow-[#ffd67c] md:pr-0">
                <div className="pointer-events-none relative z-1 size-36 overflow-hidden rounded-lg transition-all select-none group-hover:opacity-0">
                  <Image
                    src={"/isirmt_icon.webp"}
                    width={144}
                    height={144}
                    alt="isirmt_icon"
                    className="pointer-events-none"
                  />
                </div>
                <Link
                  target="_blank"
                  rel="noopener"
                  href="https://itomiri.com"
                  ref={iconRef}
                  className={`animate-iv-icon-moving pointer-events-auto absolute z-0 block size-36 overflow-hidden rounded-lg select-none group-hover:top-0! group-hover:left-0! group-hover:transform-[rotate(0deg)]! group-hover:ease-linear! group-hover:[transition:all_100ms]! ${isActiveIcon ? "is-active" : ""}`}
                >
                  <Image
                    src={"/itomiri_icon.png"}
                    width={144}
                    height={144}
                    alt="itomiri_icon"
                    className="pointer-events-none"
                  />
                </Link>
              </div>
              <div className="flex w-fit flex-col gap-2.5 text-sm font-semibold tracking-wide text-[#61230b]">
                <div className="flex gap-2">
                  <div>兵庫県神戸市出身</div>
                  <div>
                    2004年 3月 8日生の&nbsp;
                    {age}&nbsp;歳
                  </div>
                </div>
                <div>インタラクティブな設計をするのが好きです</div>
                <div>
                  <Link
                    className="underline underline-offset-2 transition-colors duration-200 hover:text-[#61230b]/70"
                    href="https://itomiri.com"
                    target="_blank"
                    rel="noopener"
                  >
                    「井筒ミリ」
                  </Link>
                  名義としても活動してたり...(イラスト・音楽制作など)
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  お問い合わせ・ご依頼等は
                  <Link
                    className="underline underline-offset-2 transition-colors duration-200 hover:text-[#61230b]/70"
                    target="_blank"
                    rel="noopener"
                    href={`https://itomiri.com/contact`}
                  >
                    井筒ミリのフォーム
                  </Link>
                  または
                  <Link
                    className="underline underline-offset-2 transition-colors duration-200 hover:text-[#61230b]/70"
                    target="_blank"
                    rel="noopener"
                    href={`https://twitter.com/isirmt`}
                  >
                    XのDM(チャット)
                  </Link>
                  または
                  <svg
                    className="h-3.5 fill-[#61230b]"
                    viewBox="0 0 1513.84 217.02"
                  >
                    <path d="M46.22,179.38c-8.36,0-16.66-1.62-24.87-4.84-8.22-3.23-15.33-7.34-21.35-12.33l13.21-18.49c5.43,4.26,10.86,7.63,16.29,10.12,5.43,2.5,11.23,3.74,17.39,3.74,6.6,0,11.52-1.39,14.75-4.18,3.23-2.79,4.84-6.31,4.84-10.56,0-3.37-1.29-6.2-3.85-8.47-2.57-2.27-5.87-4.29-9.9-6.05-4.04-1.76-8.18-3.45-12.44-5.06-5.28-2.05-10.49-4.55-15.63-7.48-5.14-2.93-9.39-6.67-12.77-11.22-3.38-4.55-5.06-10.2-5.06-16.95s1.79-13.32,5.39-18.82c3.59-5.5,8.73-9.83,15.41-12.99,6.68-3.15,14.56-4.73,23.66-4.73,8.51,0,16.18,1.47,23,4.4,6.82,2.94,12.66,6.38,17.5,10.34l-13.21,17.61c-4.26-3.08-8.58-5.61-12.99-7.59-4.4-1.98-8.95-2.97-13.65-2.97-6.16,0-10.71,1.29-13.65,3.85-2.94,2.57-4.4,5.76-4.4,9.57,0,3.23,1.13,5.87,3.41,7.92,2.27,2.06,5.32,3.85,9.13,5.39,3.81,1.54,7.92,3.12,12.33,4.73,4.25,1.62,8.44,3.38,12.55,5.28,4.11,1.91,7.85,4.26,11.23,7.04,3.37,2.79,6.05,6.16,8.03,10.12,1.98,3.96,2.97,8.8,2.97,14.53,0,7.04-1.8,13.46-5.39,19.26-3.6,5.8-8.91,10.38-15.96,13.76-7.04,3.37-15.7,5.06-25.97,5.06Z" />
                    <path d="M133.82,32.79c-5.28,0-9.46-1.5-12.55-4.51-3.08-3-4.62-7-4.62-12s1.54-8.77,4.62-11.78c3.08-3.01,7.26-4.51,12.55-4.51,4.99,0,9.1,1.51,12.33,4.51,3.23,3.01,4.84,6.93,4.84,11.78s-1.62,8.99-4.84,12c-3.23,3.01-7.34,4.51-12.33,4.51ZM119.29,176.3V54.14h28.83v122.16h-28.83Z" />
                    <path d="M269.62,217.02c-12.33,0-23.99-1.91-35-5.72-11-3.82-20.69-9.54-29.05-17.17-8.36-7.63-14.97-17.17-19.81-28.61-4.84-11.45-7.26-24.8-7.26-40.06,0-17.02,2.86-32.46,8.58-46.33s13.61-25.75,23.66-35.66c10.05-9.9,21.6-17.53,34.67-22.89,13.06-5.35,26.85-8.03,41.38-8.03,17.31,0,32.32,3.63,45.01,10.9,12.69,7.26,22.49,17.32,29.38,30.15,6.9,12.84,10.34,27.7,10.34,44.57,0,11.15-1.58,20.95-4.73,29.38-3.16,8.44-7.37,15.44-12.66,21.02-5.28,5.58-11.04,9.79-17.28,12.66-6.24,2.86-12.44,4.29-18.6,4.29-6.9,0-12.88-1.61-17.94-4.84-5.06-3.23-8.11-7.92-9.13-14.09h-.66c-3.67,4.84-8.29,8.84-13.87,12-5.58,3.16-11.01,4.73-16.29,4.73-9.1,0-16.62-3.23-22.56-9.68-5.94-6.46-8.91-15.33-8.91-26.63,0-7.04,1.21-14.09,3.63-21.13s5.83-13.46,10.24-19.26c4.4-5.79,9.61-10.42,15.63-13.87,6.01-3.45,12.62-5.17,19.81-5.17,4.11,0,7.81.99,11.12,2.97,3.3,1.98,6.05,5.1,8.25,9.35h.44l3.3-10.34h18.05l-10.56,52.38c-4.11,16.73,0,25.09,12.33,25.09,5.13,0,10.12-1.91,14.97-5.72,4.84-3.81,8.84-9.32,12-16.51,3.15-7.19,4.73-15.7,4.73-25.53s-1.36-18.41-4.07-26.63c-2.72-8.22-6.86-15.48-12.44-21.79-5.58-6.31-12.69-11.22-21.35-14.75-8.66-3.52-18.86-5.28-30.59-5.28-10.86,0-21.39,2.2-31.58,6.6-10.2,4.4-19.41,10.71-27.62,18.93s-14.71,18.09-19.48,29.6c-4.77,11.52-7.15,24.4-7.15,38.63,0,12.33,1.87,23.11,5.61,32.35,3.74,9.24,8.99,16.99,15.74,23.22,6.75,6.24,14.56,10.93,23.44,14.09,8.88,3.15,18.38,4.73,28.5,4.73,7.04,0,13.98-.99,20.8-2.97,6.82-1.98,12.88-4.44,18.16-7.37l6.82,16.07c-7.34,4.25-14.97,7.37-22.89,9.35-7.92,1.98-16.29,2.97-25.09,2.97ZM266.54,144.61c2.93,0,6.01-.95,9.24-2.86,3.23-1.91,6.68-5.21,10.34-9.91l6.38-36.32c-1.76-3.23-3.74-5.5-5.94-6.82-2.2-1.32-4.77-1.98-7.7-1.98-4.26,0-8.11,1.18-11.55,3.52-3.45,2.35-6.35,5.5-8.69,9.46-2.35,3.96-4.18,8.18-5.5,12.66-1.32,4.48-1.98,8.84-1.98,13.1,0,6.6,1.43,11.45,4.29,14.53,2.86,3.08,6.57,4.62,11.12,4.62Z" />
                    <path d="M416.87,32.79c-5.28,0-9.46-1.5-12.55-4.51-3.08-3-4.62-7-4.62-12s1.54-8.77,4.62-11.78c3.08-3.01,7.26-4.51,12.55-4.51,4.99,0,9.1,1.51,12.33,4.51,3.23,3.01,4.84,6.93,4.84,11.78s-1.62,8.99-4.84,12c-3.23,3.01-7.34,4.51-12.33,4.51ZM402.34,176.3V54.14h28.83v122.16h-28.83Z" />
                    <path d="M501.6,179.38c-8.36,0-16.66-1.62-24.87-4.84-8.22-3.23-15.33-7.34-21.35-12.33l13.21-18.49c5.43,4.26,10.86,7.63,16.29,10.12,5.43,2.5,11.23,3.74,17.39,3.74,6.6,0,11.52-1.39,14.75-4.18,3.23-2.79,4.84-6.31,4.84-10.56,0-3.37-1.29-6.2-3.85-8.47-2.57-2.27-5.87-4.29-9.9-6.05-4.04-1.76-8.18-3.45-12.44-5.06-5.28-2.05-10.49-4.55-15.63-7.48-5.14-2.93-9.39-6.67-12.77-11.22-3.38-4.55-5.06-10.2-5.06-16.95s1.79-13.32,5.39-18.82c3.59-5.5,8.73-9.83,15.41-12.99,6.68-3.15,14.56-4.73,23.66-4.73,8.51,0,16.18,1.47,23,4.4,6.82,2.94,12.66,6.38,17.5,10.34l-13.21,17.61c-4.26-3.08-8.58-5.61-12.99-7.59-4.4-1.98-8.95-2.97-13.65-2.97-6.16,0-10.71,1.29-13.65,3.85-2.94,2.57-4.4,5.76-4.4,9.57,0,3.23,1.13,5.87,3.41,7.92,2.27,2.06,5.32,3.85,9.13,5.39,3.81,1.54,7.92,3.12,12.33,4.73,4.25,1.62,8.44,3.38,12.55,5.28,4.11,1.91,7.85,4.26,11.23,7.04,3.37,2.79,6.05,6.16,8.03,10.12,1.98,3.96,2.97,8.8,2.97,14.53,0,7.04-1.8,13.46-5.39,19.26-3.6,5.8-8.91,10.38-15.96,13.76-7.04,3.37-15.7,5.06-25.97,5.06Z" />
                    <path d="M589.2,32.79c-5.28,0-9.46-1.5-12.55-4.51-3.08-3-4.62-7-4.62-12s1.54-8.77,4.62-11.78c3.08-3.01,7.26-4.51,12.55-4.51,4.99,0,9.1,1.51,12.33,4.51,3.23,3.01,4.84,6.93,4.84,11.78s-1.62,8.99-4.84,12c-3.23,3.01-7.34,4.51-12.33,4.51ZM574.68,176.3V54.14h28.83v122.16h-28.83Z" />
                    <path d="M639.83,176.3V54.14h23.55l2.42,21.79h.44c4.4-7.92,9.68-14.05,15.85-18.38,6.16-4.33,12.47-6.49,18.93-6.49,3.23,0,5.9.22,8.03.66,2.12.44,4.07,1.1,5.83,1.98l-4.84,24.87c-2.2-.58-4.22-1.06-6.05-1.43-1.84-.37-4.07-.55-6.71-.55-4.7,0-9.72,1.91-15.08,5.72-5.36,3.82-9.87,10.34-13.54,19.59v74.39h-28.83Z" />
                    <path d="M732.93,176.3V54.14h23.55l2.42,16.73h.44c5.28-5.43,10.93-10.09,16.95-13.98,6.02-3.89,12.91-5.83,20.69-5.83,8.95,0,16.1,1.91,21.46,5.72,5.36,3.82,9.43,9.17,12.22,16.07,5.87-6.16,11.96-11.34,18.27-15.52,6.31-4.18,13.35-6.27,21.13-6.27,12.77,0,22.19,4.26,28.28,12.77,6.09,8.51,9.13,20.47,9.13,35.88v76.6h-28.61v-72.85c0-10.12-1.51-17.24-4.51-21.35-3.01-4.11-7.74-6.16-14.2-6.16-3.82,0-7.81,1.25-12,3.74-4.18,2.5-8.69,6.24-13.54,11.22v85.4h-28.83v-72.85c0-10.12-1.51-17.24-4.51-21.35-3.01-4.11-7.74-6.16-14.2-6.16-3.67,0-7.63,1.25-11.88,3.74-4.26,2.5-8.73,6.24-13.43,11.22v85.4h-28.83Z" />
                    <path d="M985.6,179.38c-9.39,0-16.91-1.87-22.56-5.61-5.65-3.74-9.76-8.95-12.33-15.63-2.57-6.68-3.85-14.42-3.85-23.22v-57.89h-17.39v-21.57l19.15-1.32,3.08-33.46h23.99v33.46h31.04v22.89h-31.04v58.11c0,7.04,1.43,12.36,4.29,15.96,2.86,3.6,7.23,5.39,13.1,5.39,2.05,0,4.22-.29,6.49-.88,2.27-.58,4.29-1.25,6.05-1.98l4.84,21.13c-3.23,1.03-6.93,2.05-11.12,3.08-4.18,1.02-8.77,1.54-13.76,1.54Z" />
                    <path d="M1046.79,179.38c-5.28,0-9.68-1.87-13.21-5.61-3.52-3.74-5.28-8.4-5.28-13.98s1.76-10.38,5.28-13.98c3.52-3.59,7.92-5.39,13.21-5.39s9.68,1.8,13.21,5.39c3.52,3.6,5.28,8.25,5.28,13.98s-1.76,10.24-5.28,13.98c-3.52,3.74-7.92,5.61-13.21,5.61Z" />
                    <path d="M1146.05,179.38c-11.15,0-21.17-2.53-30.04-7.59-8.88-5.06-15.92-12.4-21.13-22.01-5.21-9.61-7.81-21.09-7.81-34.45s2.86-25.24,8.58-34.78c5.72-9.54,13.24-16.84,22.56-21.9,9.32-5.06,19.4-7.59,30.26-7.59,7.63,0,14.38,1.32,20.25,3.96,5.87,2.64,11,5.94,15.41,9.9l-13.87,18.49c-3.23-2.79-6.46-4.91-9.68-6.38-3.23-1.46-6.75-2.2-10.57-2.2-6.46,0-12.21,1.65-17.28,4.95s-8.99,8-11.78,14.09c-2.79,6.09-4.18,13.24-4.18,21.46s1.39,15.15,4.18,21.24c2.79,6.09,6.6,10.79,11.45,14.09,4.84,3.3,10.34,4.95,16.51,4.95,4.84,0,9.39-.99,13.65-2.97,4.25-1.98,8.14-4.44,11.67-7.37l11.67,19.15c-5.72,4.99-12.07,8.73-19.04,11.23-6.97,2.49-13.9,3.74-20.8,3.74Z" />
                    <path d="M1252.8,179.38c-10.12,0-19.63-2.53-28.5-7.59-8.88-5.06-16.03-12.4-21.46-22.01-5.43-9.61-8.14-21.09-8.14-34.45s2.71-25.24,8.14-34.78c5.43-9.54,12.58-16.84,21.46-21.9,8.88-5.06,18.38-7.59,28.5-7.59,7.63,0,14.93,1.43,21.9,4.29,6.97,2.86,13.17,7.04,18.6,12.55,5.43,5.5,9.72,12.21,12.88,20.14,3.15,7.92,4.73,17.02,4.73,27.29,0,13.35-2.72,24.84-8.14,34.45-5.43,9.61-12.58,16.95-21.46,22.01-8.88,5.06-18.38,7.59-28.5,7.59ZM1252.8,155.61c6.01,0,11.15-1.65,15.41-4.95,4.25-3.3,7.52-8,9.79-14.09,2.27-6.09,3.41-13.17,3.41-21.24s-1.14-15.37-3.41-21.46c-2.28-6.09-5.54-10.79-9.79-14.09-4.26-3.3-9.39-4.95-15.41-4.95s-10.93,1.65-15.19,4.95c-4.26,3.3-7.52,8-9.79,14.09-2.28,6.09-3.41,13.24-3.41,21.46s1.14,15.15,3.41,21.24c2.27,6.09,5.54,10.79,9.79,14.09,4.25,3.3,9.32,4.95,15.19,4.95Z" />
                    <path d="M1339.3,176.3V54.14h23.55l2.42,16.73h.44c5.28-5.43,10.93-10.09,16.95-13.98,6.02-3.89,12.91-5.83,20.69-5.83,8.95,0,16.1,1.91,21.46,5.72,5.36,3.82,9.43,9.17,12.22,16.07,5.87-6.16,11.96-11.34,18.27-15.52,6.31-4.18,13.35-6.27,21.13-6.27,12.77,0,22.19,4.26,28.28,12.77,6.09,8.51,9.13,20.47,9.13,35.88v76.6h-28.61v-72.85c0-10.12-1.51-17.24-4.51-21.35-3.01-4.11-7.74-6.16-14.2-6.16-3.82,0-7.81,1.25-12,3.74-4.18,2.5-8.69,6.24-13.54,11.22v85.4h-28.83v-72.85c0-10.12-1.51-17.24-4.51-21.35-3.01-4.11-7.74-6.16-14.2-6.16-3.67,0-7.63,1.25-11.88,3.74-4.26,2.5-8.73,6.24-13.43,11.22v85.4h-28.83Z" />
                  </svg>
                  までお願いします
                </div>
              </div>
            </div>
            <div className="relative z-1 flex flex-wrap gap-4">
              <Link
                href="https://x.com/isirmt"
                target="_blank"
                rel="noopener"
                className="flex size-10 items-center justify-center overflow-hidden rounded-4xl bg-black shadow-lg transition-all hover:scale-110 hover:drop-shadow-xl"
              >
                <Image
                  src="/x_logo.png"
                  alt="X logo"
                  className="pointer-events-none select-none"
                  width={17}
                  height={17}
                />
              </Link>
              <Link
                href="https://github.com/isirmt"
                target="_blank"
                rel="noopener"
                className="flex size-10 items-center justify-center overflow-hidden rounded-4xl bg-black shadow-lg transition-all hover:scale-110 hover:drop-shadow-xl"
              >
                <Image
                  src="/github_logo.png"
                  alt="GitHub logo"
                  className="pointer-events-none select-none"
                  width={23}
                  height={23}
                />
              </Link>
              <Link
                href="https://qiita.com/isirmt"
                target="_blank"
                rel="noopener"
                className="flex size-10 items-center justify-center overflow-hidden rounded-4xl bg-white shadow-lg transition-all hover:scale-110 hover:drop-shadow-xl"
              >
                <Image
                  src="/qiita_logo.png"
                  alt="Qiita logo"
                  className="pointer-events-none select-none"
                  width={23}
                  height={23}
                />
              </Link>
              <Link
                href="https://zenn.dev/isirmt"
                target="_blank"
                rel="noopener"
                className="flex size-10 items-center justify-center overflow-hidden rounded-4xl bg-white shadow-lg transition-all hover:scale-110 hover:drop-shadow-xl"
              >
                <Image
                  src="/zenn_logo.svg"
                  alt="Zenn logo"
                  className="pointer-events-none select-none"
                  width={20}
                  height={20}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
