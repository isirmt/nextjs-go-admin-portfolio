import type { ComponentProps } from "react";

type ConsoleFormFeedbackProps = Pick<ComponentProps<"div">, "className"> & {
  error?: string | null;
  success?: string | null;
};

export default function ConsoleFormFeedback({
  className,
  error,
  success,
}: ConsoleFormFeedbackProps) {
  if (!error && !success) return null;

  return (
    <div className={`space-y-2 ${className ?? ""}`} aria-live="polite">
      {error ? (
        <p className="text-sm text-[#e04787]" role="alert">
          {error}
        </p>
      ) : null}
      {success ? <p className="text-sm text-[#0c8d62]">{success}</p> : null}
    </div>
  );
}
