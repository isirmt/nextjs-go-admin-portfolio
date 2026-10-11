import type { ButtonHTMLAttributes } from "react";

type ConsoleButtonVariant = "primary" | "danger" | "text" | "icon";

type ConsoleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ConsoleButtonVariant;
};

const variantClassNames: Record<ConsoleButtonVariant, string> = {
  primary:
    "relative top-0 block w-full cursor-pointer bg-[#67c8e6] px-4 py-2 text-center text-xl font-bold text-white transition-all hover:bg-[#65b9d2] disabled:cursor-not-allowed disabled:bg-gray-300",
  danger:
    "cursor-pointer border-b text-sm leading-none font-bold text-[#e04787] transition-all hover:text-[#b03062] disabled:cursor-not-allowed disabled:opacity-50",
  text: "cursor-pointer border-b text-sm leading-none font-bold text-[#7e11d1] transition-all hover:text-[#c68ef0] disabled:cursor-not-allowed disabled:opacity-50",
  icon: "flex size-8 cursor-pointer items-center justify-center border border-[#7e11d1] text-xl leading-none font-bold text-[#7e11d1] transition hover:bg-[#7e11d1] hover:text-white disabled:cursor-not-allowed disabled:opacity-50",
};

export default function ConsoleButton({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ConsoleButtonProps) {
  return (
    <button
      type={type}
      className={`${variantClassNames[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
