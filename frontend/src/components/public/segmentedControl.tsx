"use client";

type SegmentedControlProps<T extends string> = {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  name: string;
  className?: string;
  compact?: boolean;
};

export default function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  name,
  className = "",
  compact = false,
}: SegmentedControlProps<T>) {
  const selectedIndex = options.findIndex((option) => option.value === value);

  return (
    <fieldset
      className={`relative grid rounded-full border border-[#6354EB] bg-white p-0.5 ${compact ? "w-40" : "w-64"} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-full bg-[#6354EB] transition-transform duration-150 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${Math.max(selectedIndex, 0) * 100}%)`,
        }}
      />
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <label
            key={option.value}
            className={`group relative z-10 flex cursor-pointer items-center justify-center rounded-full px-2 py-1 text-sm transition-colors select-none ${selected ? "pointer-events-none text-white" : "text-[#6354EB]"}`}
          >
            <span
              className={`absolute h-[calc(100%-0.25rem)] w-9/10 rounded-full bg-transparent transition-all group-hover:bg-[#e4e0ff] ${selected ? "hidden" : "block"}`}
            />
            <input
              className="sr-only"
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
            />
            <span className="relative z-10">{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
