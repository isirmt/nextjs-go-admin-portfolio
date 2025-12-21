type LabelBoxProps = {
  children: React.ReactNode;
  isLong?: boolean;
};

type LabelTextProps = {
  children: React.ReactNode;
  required?: boolean;
};

export function LabelBox({ children, isLong }: LabelBoxProps) {
  return (
    <div
      className={`flex flex-col gap-2 px-2 ${isLong ? "col-span-2" : "col-span-1"}`}
    >
      {children}
    </div>
  );
}

export function LabelText({ children, required }: LabelTextProps) {
  return (
    <p className="flex gap-0.5 text-sm font-bold text-[#7e11d1] select-none">
      {children}
      {required && <span className="text-[#e04787]">*</span>}
    </p>
  );
}
