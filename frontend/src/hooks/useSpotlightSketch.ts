"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  colorQuadraticTimeBasedMapping,
  vertex2DCubicBezierTimeBasedMapping,
} from "@/lib/sketch/timeBasedMapping";
import { useTransitionState } from "./useTransitionState";
import type { ColorRGB, Vertex2D } from "@/types/sketch/common";
import { Snowflake } from "@/sketch/snowflake";

const toNormalizedColor = (color: ColorRGB) =>
  color.map((channel) => channel / 255) as [number, number, number];

export type SpotlightSide = "left" | "right" | "none";

const BG_IDLE: ColorRGB = [0x67, 0xc8, 0xe6];
const BG_ACTIVE: ColorRGB = [0x3e, 0x52, 0x89];
const SPOTLIGHT_COLOR: ColorRGB = [0xe7, 0xc1, 0x27];

const SNOWFLAKE_COUNT = 100;
const SNOWFLAKE_SIZE_RANGE: [number, number] = [5, 12];
const SNOWFLAKE_SPEED_RANGE: [number, number] = [25, 70];
const SNOWFLAKE_ROTATION_SPEED_RANGE: [number, number] = [-40, 40];

const SF_LINE: ColorRGB = [0xfa, 0xfa, 0xfa];
const SF_LINE_NORMALIZED = toNormalizedColor(SF_LINE);
const SNOWFLAKE_COLOR: [number, number, number, number] = [
  SF_LINE_NORMALIZED[0],
  SF_LINE_NORMALIZED[1],
  SF_LINE_NORMALIZED[2],
  0.85,
];

const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 fragColor;
void main() {
  fragColor = u_color;
}
`;

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

const SPOTLIGHT_COLOR_NORMALIZED = toNormalizedColor(SPOTLIGHT_COLOR);

const convertVerticesToClipSpace = (
  vertices: Vertex2D[],
  width: number,
  height: number,
) =>
  vertices.flatMap(({ x, y }) => {
    const clipX = width === 0 ? 0 : (x / width) * 2 - 1;
    const clipY = height === 0 ? 0 : 1 - (y / height) * 2;
    return [clipX, clipY];
  });

type WebGLResources = {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vertexBuffer: WebGLBuffer;
  snowflakeBuffer: WebGLBuffer;
  positionLocation: number;
  colorLocation: WebGLUniformLocation | null;
  canvas: HTMLCanvasElement;
};

const createShader = (
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Failed to create shader");
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const createProgram = (
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram | null => {
  const deleteShaders = (
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
  ) => {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  };

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) {
    if (vertexShader) {
      gl.deleteShader(vertexShader);
    }
    if (fragmentShader) {
      gl.deleteShader(fragmentShader);
    }
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    deleteShaders(vertexShader, fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    deleteShaders(vertexShader, fragmentShader);
    return null;
  }

  deleteShaders(vertexShader, fragmentShader);

  return program;
};

const createVertices = (side: SpotlightSide, width: number, height: number) =>
  NORMALIZED_VERTICES[side].map((point) => ({
    x: point.x * width,
    y: point.y * height,
  }));

export function useSpotlightSketch() {
  const footerRef = useRef<HTMLElement | null>(null);
  const sketchContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spotlightTargetRef = useRef<SpotlightSide>("none");
  const [spotlightSide, setSpotlightSide] = useState<SpotlightSide>("none");
  const activeSpotlightRef = useRef<SpotlightSide>("none");
  const appliedSizeRef = useRef({ width: 0, height: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const webglResourcesRef = useRef<WebGLResources | null>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);

  const vertexTransition = useTransitionState<Vertex2D[]>(
    createVertices("none", 0, 0),
    (from, to, progress) =>
      from.map((fromVertex, index) => {
        const target = to[index] ?? to[to.length - 1] ?? fromVertex;
        return vertex2DCubicBezierTimeBasedMapping(
          fromVertex,
          target,
          progress,
          {
            x1: 0.34,
            y1: 1.56,
            x2: 0.64,
            y2: 1,
          },
        );
      }),
    300,
  );

  const colorTransition = useTransitionState<ColorRGB>(
    [...BG_IDLE],
    colorQuadraticTimeBasedMapping,
    150,
  );

  useEffect(() => {
    let isMounted = true;

    const container = sketchContainerRef.current;
    if (!container) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.replaceChildren(canvas);
    canvasRef.current = canvas;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
    }) as WebGL2RenderingContext | null;

    if (!gl) {
      console.error("WebGL is not supported");
      return () => {
        canvas.remove();
        canvasRef.current = null;
      };
    }

    const program = createProgram(
      gl,
      VERTEX_SHADER_SOURCE,
      FRAGMENT_SHADER_SOURCE,
    );
    if (!program) {
      canvas.remove();
      canvasRef.current = null;
      return () => {};
    }

    const vertexBuffer = gl.createBuffer();
    const snowflakeBuffer = gl.createBuffer();

    if (!vertexBuffer || !snowflakeBuffer) {
      if (vertexBuffer) {
        gl.deleteBuffer(vertexBuffer);
      }
      if (snowflakeBuffer) {
        gl.deleteBuffer(snowflakeBuffer);
      }
      gl.deleteProgram(program);
      canvas.remove();
      canvasRef.current = null;
      snowflakesRef.current = [];
      return () => {};
    }

    gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
    gl.blendFuncSeparate(
      gl.ONE_MINUS_DST_COLOR,
      gl.ONE_MINUS_SRC_COLOR,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const colorLocation = gl.getUniformLocation(program, "u_color");

    const rect = footerRef.current?.getBoundingClientRect() ?? {
      width: 0,
      height: 0,
    };
    const initialWidth = Math.max(0, Math.floor(rect.width));
    const initialHeight = Math.max(0, Math.floor(rect.height));
    canvas.width = initialWidth;
    canvas.height = initialHeight;
    appliedSizeRef.current = { width: initialWidth, height: initialHeight };

    webglResourcesRef.current = {
      gl,
      program,
      vertexBuffer,
      snowflakeBuffer,
      positionLocation,
      colorLocation,
      canvas,
    };

    snowflakesRef.current = Array.from(
      { length: SNOWFLAKE_COUNT },
      () =>
        new Snowflake(gl, snowflakeBuffer, {
          bounds: { width: initialWidth, height: initialHeight },
          sizeRange: SNOWFLAKE_SIZE_RANGE,
          speedRange: SNOWFLAKE_SPEED_RANGE,
          rotationSpeedRange: SNOWFLAKE_ROTATION_SPEED_RANGE,
        }),
    );

    vertexTransition.jumpTo(
      createVertices("none", initialWidth, initialHeight),
    );
    colorTransition.jumpTo([...BG_IDLE]);
    activeSpotlightRef.current = "none";
    gl.viewport(0, 0, initialWidth, initialHeight);

    let lastTimestamp = performance.now();

    const render = (timestamp: number) => {
      if (!isMounted) {
        return;
      }

      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      const resources = webglResourcesRef.current;
      if (!resources) {
        return;
      }

      const {
        gl: currentGl,
        canvas: currentCanvas,
        vertexBuffer: currentBuffer,
      } = resources;

      const targetSide = spotlightTargetRef.current;
      const sizeChanged =
        appliedSizeRef.current.width !== currentCanvas.width ||
        appliedSizeRef.current.height !== currentCanvas.height;

      if (targetSide !== activeSpotlightRef.current || sizeChanged) {
        vertexTransition.startTransition(
          createVertices(targetSide, currentCanvas.width, currentCanvas.height),
        );
        const nextColor =
          targetSide === "none"
            ? ([...BG_IDLE] as ColorRGB)
            : ([...BG_ACTIVE] as ColorRGB);
        colorTransition.startTransition(nextColor);
        activeSpotlightRef.current = targetSide;
        appliedSizeRef.current = {
          width: currentCanvas.width,
          height: currentCanvas.height,
        };
      }

      const safeDelta = Math.max(0, deltaTime);
      const interpolatedVertices = vertexTransition.step(safeDelta);
      const interpolatedColor = colorTransition.step(safeDelta);
      const isAnimating =
        vertexTransition.getProgress() < 1 || colorTransition.getProgress() < 1;

      currentGl.viewport(0, 0, currentCanvas.width, currentCanvas.height);
      currentGl.clearColor(
        interpolatedColor[0] / 255,
        interpolatedColor[1] / 255,
        interpolatedColor[2] / 255,
        1,
      );
      currentGl.clear(currentGl.COLOR_BUFFER_BIT);

      currentGl.useProgram(resources.program);
      currentGl.enableVertexAttribArray(resources.positionLocation);

      const shouldRenderSpotlight =
        (targetSide !== "none" || isAnimating) &&
        currentCanvas.width > 0 &&
        currentCanvas.height > 0;

      if (shouldRenderSpotlight) {
        const vertices = convertVerticesToClipSpace(
          interpolatedVertices,
          currentCanvas.width,
          currentCanvas.height,
        );

        currentGl.bindBuffer(currentGl.ARRAY_BUFFER, currentBuffer);
        currentGl.bufferData(
          currentGl.ARRAY_BUFFER,
          new Float32Array(vertices),
          currentGl.STREAM_DRAW,
        );

        currentGl.vertexAttribPointer(
          resources.positionLocation,
          2,
          currentGl.FLOAT,
          false,
          0,
          0,
        );
        if (resources.colorLocation) {
          currentGl.uniform4f(
            resources.colorLocation,
            SPOTLIGHT_COLOR_NORMALIZED[0],
            SPOTLIGHT_COLOR_NORMALIZED[1],
            SPOTLIGHT_COLOR_NORMALIZED[2],
            1,
          );
        }
        gl.disable(gl.BLEND);
        currentGl.drawArrays(
          currentGl.TRIANGLE_FAN,
          0,
          interpolatedVertices.length,
        );
      }

      const snowflakes = snowflakesRef.current;
      if (
        snowflakes.length > 0 &&
        currentCanvas.width > 0 &&
        currentCanvas.height > 0
      ) {
        const bounds = {
          width: currentCanvas.width,
          height: currentCanvas.height,
        };
        if (targetSide !== "none") gl.enable(gl.BLEND);
        snowflakes.forEach((flake) => {
          flake.update(safeDelta, bounds);
          flake.render({
            positionLocation: resources.positionLocation,
            colorLocation: resources.colorLocation,
            color: SNOWFLAKE_COLOR,
          });
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame((timestamp) => {
      lastTimestamp = timestamp;
      render(timestamp);
    });

    return () => {
      isMounted = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      const resources = webglResourcesRef.current;
      if (resources) {
        resources.gl.deleteBuffer(resources.vertexBuffer);
        resources.gl.deleteBuffer(resources.snowflakeBuffer);
        resources.gl.deleteProgram(resources.program);
      }
      webglResourcesRef.current = null;
      snowflakesRef.current = [];
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
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

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }

      const resources = webglResourcesRef.current;
      if (resources) {
        resources.gl.viewport(0, 0, nextWidth, nextHeight);
      }

      const bounds = { width: nextWidth, height: nextHeight };
      snowflakesRef.current.forEach((flake) => flake.update(0, bounds));
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
    setSpotlightSide(side);
  }, []);

  const handleSpotlightLeave = useCallback(() => {
    spotlightTargetRef.current = "none";
    setSpotlightSide("none");
  }, []);

  const getSpotlightSide = useCallback(() => {
    return spotlightSide;
  }, [spotlightSide]);

  return {
    footerRef,
    sketchContainerRef,
    handleSpotlightEnter,
    handleSpotlightLeave,
    getSpotlightSide,
  };
}
