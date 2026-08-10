export const SINE_WAVE_FULL_PHASE = Math.PI * 2;
export const DEFAULT_SINE_WAVE_LOOP_DURATION_MS = 16000;

const WAVE_MIN_OFFSET = 8;
const WAVE_MAX_OFFSET = 32;
const WAVE_OFFSET_RATIO = 0.08;
const WAVE_MIN_LENGTH = 120;
const WAVE_LENGTH_RATIO = 0.4;
const WAVE_STEPS_PER_LENGTH = 20;

export type SineClipPathOptions = {
  phase?: number;
  waveHeightPx?: number;
  waveLengthPx?: number;
};

export const createSineClipPath = (
  width: number,
  height: number,
  { phase = 0, waveHeightPx, waveLengthPx }: SineClipPathOptions = {},
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
  const points: string[] = [`0px ${height}px`];

  const addWavePoint = (x: number) => {
    const pointPhase = (x / waveLength) * SINE_WAVE_FULL_PHASE + phase;
    const y = Math.max(0, waveOffset + Math.sin(pointPhase) * waveHeight);
    points.push(`${x}px ${y}px`);
  };

  for (let x = 0; x <= width; x += step) {
    addWavePoint(x);
  }

  if (width % step !== 0) {
    addWavePoint(width);
  }

  points.push(`${width}px ${height}px`);

  return `polygon(${points.join(",")})`;
};
