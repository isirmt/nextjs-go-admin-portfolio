type ConsoleSegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

type ConsoleSegmentedControlProps<T extends string> = {
  name: string;
  value: T;
  options: readonly ConsoleSegmentedControlOption<T>[];
  onChange: (value: T) => void;
};

export default function ConsoleSegmentedControl<T extends string>({
  name,
  value,
  options,
  onChange,
}: ConsoleSegmentedControlProps<T>) {
  const selectedIndex = options.findIndex((option) => option.value === value);

  return (
    <div
      className="relative grid w-full max-w-64 self-center rounded-full border border-[#6354eb] p-0.5"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-full bg-[#6354eb] transition-transform duration-200 ease-out"
        style={{
          width: `calc((100% - 0.25rem) / ${options.length})`,
          transform: `translateX(${Math.max(selectedIndex, 0) * 100}%)`,
        }}
      />
      {options.map((option) => (
        <label
          key={option.value}
          className="relative z-1 min-w-0 cursor-pointer"
        >
          <input
            className="peer sr-only"
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="block rounded-full px-4 py-1 text-center text-sm font-bold whitespace-nowrap text-[#6354eb] transition-colors duration-200 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#6354eb]">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
