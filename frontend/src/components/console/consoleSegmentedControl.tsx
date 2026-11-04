import { RadioGroup, RadioGroupItem } from "@/components/shadcn/ui/radio-group";

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
    <RadioGroup
      name={name}
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as T)}
      className="bg-muted relative grid h-10 w-full gap-0 rounded-2xl p-1"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        aria-hidden
        className="border-border bg-background pointer-events-none absolute inset-y-1 left-1 rounded-xl border shadow-sm transition-transform duration-200 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${Math.max(selectedIndex, 0) * 100}%)`,
        }}
      />
      {options.map((option) => (
        <label
          key={option.value}
          className="relative z-1 flex min-w-0 cursor-pointer items-center justify-center"
        >
          <RadioGroupItem
            id={`${name}-${option.value}`}
            className="peer sr-only"
            value={option.value}
          />
          <span className="text-muted-foreground peer-focus-visible:outline-ring peer-data-[state=checked]:text-foreground flex h-full w-full items-center justify-center rounded-xl px-4 text-center text-sm font-medium whitespace-nowrap transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
            {option.label}
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
