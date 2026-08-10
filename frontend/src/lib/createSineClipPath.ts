export const SINE_WAVE_FULL_PHASE = Math.PI * 2;
export const DEFAULT_SINE_WAVE_LOOP_DURATION_MS = 16000;

const WAVE_MIN_OFFSET = 8;
const WAVE_MAX_OFFSET = 32;
const WAVE_OFFSET_RATIO = 0.08;
const WAVE_MIN_LENGTH = 120;
const WAVE_LENGTH_RATIO = 0.4;
const WAVE_STEPS_PER_LENGTH = 20;

export type SineClipPathEdge = "top" | "bottom" | "both";

export type SineClipPathOptions = {
  edge?: SineClipPathEdge;
  phase?: number;
  waveHeightPx?: number;
  waveLengthPx?: number;
};

export const createSineClipPath = (
  width: number,
  height: number,
  {
    edge = "top",
    phase = 0,
    waveHeightPx,
    waveLengthPx,
  }: SineClipPathOptions = {},
) => {
  const responsiveOffset = Math.min(
    WAVE_MAX_OFFSET,
    Math.max(WAVE_MIN_OFFSET, Math.floor(height * WAVE_OFFSET_RATIO)),
  );
  const waveHeight =
    waveHeightPx === undefined
      ? responsiveOffset * 0.6
      : Math.max(0, waveHeightPx);
  const waveOffset = waveHeightPx === undefined ? responsiveOffset : waveHeight;
  const waveLength = Math.max(
    1,
    waveLengthPx ??
      Math.max(WAVE_MIN_LENGTH, Math.floor(width * WAVE_LENGTH_RATIO)),
  );
  const step = Math.max(8, Math.floor(waveLength / WAVE_STEPS_PER_LENGTH));
  const wavePoints: Array<{ x: number; inset: number }> = [];

  const addWavePoint = (x: number) => {
    const pointPhase = (x / waveLength) * SINE_WAVE_FULL_PHASE + phase;
    const inset = Math.max(0, waveOffset + Math.sin(pointPhase) * waveHeight);
    wavePoints.push({ x, inset });
  };

  for (let x = 0; x <= width; x += step) {
    addWavePoint(x);
  }

  if (width % step !== 0) {
    addWavePoint(width);
  }

  const topPoints = wavePoints.map(({ x, inset }) => `${x}px ${inset}px`);
  const bottomPoints = wavePoints
    .slice()
    .reverse()
    .map(({ x, inset }) => `${x}px ${Math.max(0, height - inset)}px`);

  let points: string[];
  if (edge === "bottom") {
    points = [`0px 0px`, `${width}px 0px`, ...bottomPoints];
  } else if (edge === "both") {
    points = [...topPoints, ...bottomPoints];
  } else {
    points = [`0px ${height}px`, ...topPoints, `${width}px ${height}px`];
  }

  return `polygon(${points.join(",")})`;
};
