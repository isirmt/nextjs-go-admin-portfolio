"use client";

import { useEffect, useRef } from "react";
import {
  resolveShootingStarsOptions,
  ShootingStarsScene,
  type ShootingStar,
  type ShootingStarsOptions,
} from "@/sketch/shootingStars";

export type { MinMaxRange, ShootingStarsOptions } from "@/sketch/shootingStars";

const DEFAULT_OPTIONS: ShootingStarsOptions = {};

export function useShootingStars(
  options: ShootingStarsOptions = DEFAULT_OPTIONS,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<ShootingStarsScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !container || !context) return;

    const scene = new ShootingStarsScene(resolveShootingStarsOptions(options));
    sceneRef.current = scene;
    let frameId: number | null = null;
    let lastTime: number | null = null;
    let isIntersecting = false;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene.resize(width, height);
      scene.draw(context);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    scene.prewarm(options.initialElapsed ?? 30000);
    scene.draw(context);

    const frame = (timestamp: number) => {
      const deltaMs =
        lastTime === null ? 0 : Math.min(timestamp - lastTime, 50);
      lastTime = timestamp;
      scene.update(deltaMs);
      scene.draw(context);
      frameId = requestAnimationFrame(frame);
    };

    const syncAnimation = () => {
      if (isIntersecting && !document.hidden) {
        if (frameId === null) {
          lastTime = null;
          frameId = requestAnimationFrame(frame);
        }
      } else if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
        lastTime = null;
      }
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      syncAnimation();
    });
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      syncAnimation();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      observer.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      sceneRef.current = null;
    };
  }, [options]);

  return {
    canvasRef,
    spawn: (): ShootingStar | null => sceneRef.current?.spawn() ?? null,
    getStar: (id: number): ShootingStar | undefined =>
      sceneRef.current?.stars.get(id),
  };
}
