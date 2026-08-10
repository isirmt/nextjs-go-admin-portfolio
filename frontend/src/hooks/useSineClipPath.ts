"use client";

import {
  createSineClipPath,
  DEFAULT_SINE_WAVE_LOOP_DURATION_MS,
  SINE_WAVE_FULL_PHASE,
  type SineClipPathEdge,
} from "@/lib/createSineClipPath";
import { useEffect, useRef } from "react";

export type UseSineClipPathOptions = {
  edge?: SineClipPathEdge;
  loopDurationMs?: number;
  waveHeightPx?: number;
  waveLengthPx?: number;
};

export function useSineClipPath<T extends HTMLElement>({
  edge = "top",
  loopDurationMs = DEFAULT_SINE_WAVE_LOOP_DURATION_MS,
  waveHeightPx,
  waveLengthPx,
}: UseSineClipPathOptions = {}) {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let width = 0;
    let height = 0;
    let phase = 0;
    let animationFrame: number | null = null;
    let lastTimestamp = performance.now();
    const safeLoopDuration = Math.max(1, loopDurationMs);

    const applyClipPath = () => {
      element.style.clipPath = createSineClipPath(width, height, {
        edge,
        phase,
        waveHeightPx,
        waveLengthPx,
      });
    };

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      width = Math.max(0, Math.floor(rect.width));
      height = Math.max(0, Math.floor(rect.height));
      applyClipPath();
    };

    const render = (timestamp: number) => {
      const deltaTime = Math.max(0, timestamp - lastTimestamp);
      lastTimestamp = timestamp;
      phase =
        (phase + (deltaTime / safeLoopDuration) * SINE_WAVE_FULL_PHASE) %
        SINE_WAVE_FULL_PHASE;
      applyClipPath();
      animationFrame = requestAnimationFrame(render);
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (animationFrame !== null) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        return;
      }

      lastTimestamp = performance.now();
      if (animationFrame === null) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrame = requestAnimationFrame((timestamp) => {
      lastTimestamp = timestamp;
      render(timestamp);
    });

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [edge, loopDurationMs, waveHeightPx, waveLengthPx]);

  return elementRef;
}
