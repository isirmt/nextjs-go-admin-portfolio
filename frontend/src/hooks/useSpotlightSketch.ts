"use client";

import { useCallback, useEffect, useRef } from "react";
import type p5 from "p5";
import {
  colorQuadraticTimeBasedMapping,
  vertex2DLinearTimeBasedMapping,
} from "@/lib/sketch/timeBasedMapping";
import { useTransitionState } from "./useTransitionState";
import type { ColorRGB, Vertex2D } from "@/types/sketch/common";

export type SpotlightSide = "left" | "right" | "none";

const BG_IDLE: ColorRGB = [0x67, 0xc8, 0xe6];
const BG_ACTIVE: ColorRGB = [0x3e, 0x52, 0x89];
const SPOTLIGHT_COLOR = "#e7c127";
const TRANSITION_DURATION_MS = 150;

const NORMALIZED_VERTICES: Record<SpotlightSide, Vertex2D[]> = {
  left: [
    { x: 0.5, y: 1 },
    { x: 0.45, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0.5 },
  ],
  right: [
    { x: 0.5, y: 1 },
    { x: 0.55, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 0.5 },
  ],
  none: [
    { x: 0.5, y: 1 },
    { x: 0.5, y: 1 },
    { x: 0.5, y: 1 },
    { x: 0.5, y: 1 },
  ],
};

const createVertices = (side: SpotlightSide, width: number, height: number) =>
  NORMALIZED_VERTICES[side].map((point) => ({
    x: point.x * width,
    y: point.y * height,
  }));

export function useSpotlightSketch() {
  const footerRef = useRef<HTMLElement | null>(null);
  const sketchContainerRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const spotlightTargetRef = useRef<SpotlightSide>("none");
  const activeSpotlightRef = useRef<SpotlightSide>("none");
  const appliedSizeRef = useRef({ width: 0, height: 0 });

  const vertexTransition = useTransitionState<Vertex2D[]>(
    createVertices("none", 0, 0),
    (from, to, progress) =>
      from.map((fromVertex, index) => {
        const target = to[index] ?? to[to.length - 1] ?? fromVertex;
        return vertex2DLinearTimeBasedMapping(fromVertex, target, progress);
      }),
    TRANSITION_DURATION_MS,
  );

  const colorTransition = useTransitionState<ColorRGB>(
    [...BG_IDLE],
    colorQuadraticTimeBasedMapping,
    TRANSITION_DURATION_MS,
  );

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!sketchContainerRef.current) {
        return;
      }

      const { default: P5 } = await import("p5");

      if (!isMounted || !sketchContainerRef.current) {
        return;
      }

      const sketch = (p: p5) => {
        p.setup = () => {
          const rect = footerRef.current?.getBoundingClientRect() ?? {
            width: 0,
            height: 0,
          };
          canvasSizeRef.current.width = rect.width;
          canvasSizeRef.current.height = rect.height;

          p.createCanvas(rect.width, rect.height);
          appliedSizeRef.current = { width: rect.width, height: rect.height };
          vertexTransition.jumpTo(
            createVertices("none", rect.width, rect.height),
          );
          colorTransition.jumpTo([...BG_IDLE]);
          activeSpotlightRef.current = "none";
          p.frameRate(60);
        };

        p.draw = () => {
          const targetSide = spotlightTargetRef.current;
          const sizeChanged =
            appliedSizeRef.current.width !== p.width ||
            appliedSizeRef.current.height !== p.height;

          if (targetSide !== activeSpotlightRef.current || sizeChanged) {
            vertexTransition.startTransition(
              createVertices(targetSide, p.width, p.height),
            );
            const nextColor =
              targetSide === "none"
                ? ([...BG_IDLE] as ColorRGB)
                : ([...BG_ACTIVE] as ColorRGB);
            colorTransition.startTransition(nextColor);
            activeSpotlightRef.current = targetSide;
            appliedSizeRef.current = { width: p.width, height: p.height };
          }

          const interpolatedVertices = vertexTransition.step(p.deltaTime);
          const interpolatedColor = colorTransition.step(p.deltaTime);
          const isAnimating =
            vertexTransition.getProgress() < 1 ||
            colorTransition.getProgress() < 1;

          p.background(...interpolatedColor);
          if (targetSide !== "none" || isAnimating) {
            p.noStroke();
            p.fill(SPOTLIGHT_COLOR);
            p.beginShape();
            interpolatedVertices.forEach((vertex) => {
              p.vertex(vertex.x, vertex.y);
            });
            p.endShape(p.CLOSE);
          }
        };
      };

      p5InstanceRef.current = new P5(sketch, sketchContainerRef.current);
    };

    init();

    return () => {
      isMounted = false;
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [colorTransition, vertexTransition]);

  useEffect(() => {
    const footerElement = footerRef.current;
    if (!footerElement) {
      return;
    }

    const updateSize = (width: number, height: number) => {
      const nextWidth = Math.max(0, Math.floor(width));
      const nextHeight = Math.max(0, Math.floor(height));

      canvasSizeRef.current.width = nextWidth;
      canvasSizeRef.current.height = nextHeight;

      if (p5InstanceRef.current) {
        p5InstanceRef.current.resizeCanvas(
          canvasSizeRef.current.width,
          canvasSizeRef.current.height,
        );
      }
    };

    const rect = footerElement.getBoundingClientRect();
    updateSize(rect.width, rect.height);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        updateSize(entry.contentRect.width, entry.contentRect.height);
      });
    });

    observer.observe(footerElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSpotlightEnter = useCallback((side: SpotlightSide) => {
    spotlightTargetRef.current = side;
  }, []);

  const handleSpotlightLeave = useCallback(() => {
    spotlightTargetRef.current = "none";
  }, []);

  return {
    footerRef,
    sketchContainerRef,
    handleSpotlightEnter,
    handleSpotlightLeave,
  };
}
