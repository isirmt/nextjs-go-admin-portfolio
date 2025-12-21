import { ColorRGB, Vertex2D } from "@/types/sketch/common";

// 線形的に変化させるマッピング関数
export function linearTimeBasedMapping(
  start: number,
  end: number,
  rate: number,
): number {
  return start + (end - start) * rate;
}

// 二次関数的に変化させるマッピング関数
export function quadraticTimeBasedMapping(
  start: number,
  end: number,
  rate: number,
): number {
  const t = rate;
  return start + (end - start) * t * t;
}

// 色の変化の近似に使用可能な二次関数的マッピング関数
export function colorQuadraticTimeBasedMapping(
  start: ColorRGB,
  end: ColorRGB,
  rate: number,
): ColorRGB {
  return [
    quadraticTimeBasedMapping(start[0], end[0], rate),
    quadraticTimeBasedMapping(start[1], end[1], rate),
    quadraticTimeBasedMapping(start[2], end[2], rate),
  ];
}

// 2D頂点の線形的マッピング関数
export function vertex2DLinearTimeBasedMapping(
  start: Vertex2D,
  end: Vertex2D,
  rate: number,
): Vertex2D {
  return {
    x: linearTimeBasedMapping(start.x, end.x, rate),
    y: linearTimeBasedMapping(start.y, end.y, rate),
  };
}

export function vertex2DQuadraticTimeBasedMapping(
  start: Vertex2D,
  end: Vertex2D,
  rate: number,
): Vertex2D {
  return {
    x: quadraticTimeBasedMapping(start.x, end.x, rate),
    y: quadraticTimeBasedMapping(start.y, end.y, rate),
  };
}
