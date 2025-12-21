"use client";

import { useCallback, useEffect, useRef } from "react";
import type p5 from "p5";
import {
  linearTimeBasedMapping,
  quadraticTimeBasedMapping,
} from "@/lib/sketch/timeBasedMapping";

export type SpotlightSide = "left" | "right" | "none";

type Vertex = {
  x: number;
  y: number;
};

const BG_IDLE: [number, number, number] = [0x67, 0xc8, 0xe6];
const BG_ACTIVE: [number, number, number] = [0x3e, 0x52, 0x89];
const SPOTLIGHT_COLOR = "#e7c127";
const TRANSITION_DURATION_MS = 150;

const NORMALIZED_VERTICES: Record<SpotlightSide, Vertex[]> = {
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

const cloneVertices = (vertices: Vertex[]): Vertex[] =>
  vertices.map((vertex) => ({ ...vertex }));

export function useSpotlightSketch() {
  const footerRef = useRef<HTMLElement | null>(null);
  const sketchContainerRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const spotlightTargetRef = useRef<SpotlightSide>("none");
  const currentVerticesRef = useRef<Vertex[]>([]);
  const currentColorRef = useRef<[number, number, number]>([...BG_IDLE]);
  const transitionRef = useRef({
    fromVertices: createVertices("none", 0, 0),
    toVertices: createVertices("none", 0, 0),
    fromColor: [...BG_IDLE] as [number, number, number],
    toColor: [...BG_IDLE] as [number, number, number],
    progress: 1,
    toSide: "none" as SpotlightSide,
    duration: TRANSITION_DURATION_MS,
    width: 0,
    height: 0,
  });

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
          currentVerticesRef.current = createVertices(
            "none",
            rect.width,
            rect.height,
          );
          currentColorRef.current = [...BG_IDLE];
          transitionRef.current = {
            ...transitionRef.current,
            fromVertices: cloneVertices(currentVerticesRef.current),
            toVertices: cloneVertices(currentVerticesRef.current),
            fromColor: [...BG_IDLE],
            toColor: [...BG_IDLE],
            progress: 1,
            toSide: "none",
            width: rect.width,
            height: rect.height,
          };
          p.frameRate(60);
        };

        p.draw = () => {
          const transition = transitionRef.current;
          const targetSide = spotlightTargetRef.current;
          const sizeChanged =
            transition.width !== p.width || transition.height !== p.height;

          if (targetSide !== transition.toSide || sizeChanged) {
            transition.fromVertices = currentVerticesRef.current.length
              ? cloneVertices(currentVerticesRef.current)
              : createVertices(transition.toSide, p.width, p.height);
            transition.toVertices = createVertices(
              targetSide,
              p.width,
              p.height,
            );
            transition.fromColor = [...currentColorRef.current];
            transition.toColor =
              targetSide === "none" ? [...BG_IDLE] : [...BG_ACTIVE];
            transition.progress = 0;
            transition.toSide = targetSide;
            transition.width = p.width;
            transition.height = p.height;
          }

          if (transition.progress < 1) {
            transition.progress = Math.min(
              1,
              transition.progress + p.deltaTime / transition.duration,
            );
          }

          const rate = transition.progress;
          const interpolatedVertices = transition.fromVertices.map(
            (fromVertex, index) => {
              const toVertex = transition.toVertices[index];
              return {
                x: linearTimeBasedMapping(fromVertex.x, toVertex.x, rate),
                y: linearTimeBasedMapping(fromVertex.y, toVertex.y, rate),
              };
            },
          );
          currentVerticesRef.current = interpolatedVertices;

          const interpolatedColor = transition.fromColor.map((start, index) =>
            quadraticTimeBasedMapping(start, transition.toColor[index], rate),
          ) as [number, number, number];
          currentColorRef.current = interpolatedColor;

          p.background(...interpolatedColor);
          if (targetSide !== "none" || transition.progress < 1) {
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
  }, []);

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
