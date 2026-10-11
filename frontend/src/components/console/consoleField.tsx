import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

type ConsoleTextFieldProps = InputHTMLAttributes<HTMLInputElement>;
type ConsoleTextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function ConsoleTextField({
  className,
  ...props
}: ConsoleTextFieldProps) {
  return (
    <input
      className={`w-full border-b-2 border-[#c68ef0] px-4 py-2 outline-none focus:border-[#7e11d1] ${className ?? ""}`}
      {...props}
    />
  );
}

export const ConsoleTextArea = forwardRef<
  HTMLTextAreaElement,
  ConsoleTextAreaProps
>(function ConsoleTextArea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`field-sizing-content min-h-[5lh] w-full border-y border-[#c68ef0] px-4 py-3 outline-none focus:border-[#7e11d1] ${className ?? ""}`}
      {...props}
    />
  );
});
