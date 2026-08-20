import type { ChangeEventHandler } from "react";

type SliderProps = {
  min: number;
  max: number;
  step?: number;
  value: number;
  primaryColor?: string;
  secondaryColor?: string;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
};

export function Slider({
  min,
  max,
  step = 1,
  value,
  onPointerDown,
  onPointerUp,
  onChange,
  primaryColor = "#000",
  secondaryColor = "#ddd",
  className = "",
}: SliderProps) {
  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onPointerDown={() => onPointerDown?.()}
      onPointerUp={() => onPointerUp?.()}
      onChange={onChange}
      style={{
        background: `linear-gradient(
          to right,
          ${primaryColor} 0%,
          ${primaryColor} ${percentage}%,
          ${secondaryColor} ${percentage}%,
          ${secondaryColor} 100%
        )`,
      }}
      className={`${className} cursor-pointer appearance-none [&::-moz-range-thumb]:opacity-0 [&::-moz-range-track]:h-full [&::-moz-range-track]:rounded-full [&::-webkit-slider-runnable-track]:h-full [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:opacity-0`}
    />
  );
}
