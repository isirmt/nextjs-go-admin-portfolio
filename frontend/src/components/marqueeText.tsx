"use client";
import React, { useCallback, useEffect, useRef } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type Props = {
  text: string;
  containerClassName?: string;
  innerClassName?: string;
  containerStyle?: React.CSSProperties;
  speedFactor?: number;
  pauseSeconds?: number;
};

export default function MarqueeText({
  text,
  containerClassName = "",
  innerClassName = "",
  containerStyle,
  speedFactor = 40,
  pauseSeconds = 1.5,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<Animation | null>(null);

  const calcAnimation = useCallback(() => {
    const c = containerRef.current;
    const i = innerRef.current;
    if (!c || !i) return;

    const cw = c.clientWidth;
    const iw = i.scrollWidth;
    const distance = iw - cw;
    if (distance <= 2) {
      animationRef.current?.cancel();
      animationRef.current = null;
      i.style.transform = "translateX(0)";
      return;
    }

    const moveTime = clamp(distance / speedFactor, 1.2, 8);
    const total = pauseSeconds + moveTime + pauseSeconds;
    const startPauseOffset = pauseSeconds / total;
    const moveEndOffset = (pauseSeconds + moveTime) / total;
    const almostEndOffset = 0.99999;
    const endTranslate = `-${distance}px`;

    animationRef.current?.cancel();
    animationRef.current = i.animate(
      [
        { transform: "translateX(0)", offset: 0 },
        { transform: "translateX(0)", offset: startPauseOffset },
        { transform: `translateX(${endTranslate})`, offset: moveEndOffset },
        { transform: `translateX(${endTranslate})`, offset: almostEndOffset },
        { transform: "translateX(0)", offset: 1 },
      ],
      {
        duration: total * 1000,
        easing: "linear",
        iterations: Infinity,
      },
    );
  }, [pauseSeconds, speedFactor]);

  useEffect(() => {
    const onResize = () => calcAnimation();
    calcAnimation();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, [calcAnimation, text]);

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{ overflow: "hidden", display: "block", ...containerStyle }}
      title={text}
    >
      <div ref={innerRef} className={`marquee-inner ${innerClassName}`}>
        {text}
      </div>
    </div>
  );
}
