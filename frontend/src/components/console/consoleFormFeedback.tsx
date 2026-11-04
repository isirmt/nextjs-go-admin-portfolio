"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ConsoleFormFeedbackProps = {
  className?: string;
  error?: string | null;
  success?: string | null;
};

export default function ConsoleFormFeedback({
  error,
  success,
}: ConsoleFormFeedbackProps) {
  const lastError = useRef<string | null>(null);
  const lastSuccess = useRef<string | null>(null);

  useEffect(() => {
    if (!error) {
      lastError.current = null;
      return;
    }
    if (lastError.current === error) return;

    lastError.current = error;
    toast.error(error);
  }, [error]);

  useEffect(() => {
    if (!success) {
      lastSuccess.current = null;
      return;
    }
    if (lastSuccess.current === success) return;

    lastSuccess.current = success;
    toast.success(success);
  }, [success]);

  return null;
}
