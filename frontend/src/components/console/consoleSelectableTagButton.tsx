import type { ReactNode } from "react";

type ConsoleSelectableTagButtonProps = {
  children: ReactNode;
  isSelected: boolean;
  onToggled: () => void;
  onDeleteRequested?: () => void;
};

export default function ConsoleSelectableTagButton({
  children,
  isSelected,
  onToggled,
}: ConsoleSelectableTagButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggled}
      className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded border-2 bg-white px-3 py-2 shadow-[.25rem_.25rem_0_0_#67c8e6] ${isSelected ? "border-[#65a6df]" : "border-[#67c8e6]"}`}
    >
      <span
        className={`absolute top-0 left-0 z-1 flex size-full items-center justify-center transition-all duration-200 ${isSelected ? "bg-[#65a6df]/75" : "bg-transparent hover:bg-[#65a6df]/75"}`}
      />
      <span className="text-sm font-semibold text-[#3a3a3a]">{children}</span>
    </button>
  );
}
