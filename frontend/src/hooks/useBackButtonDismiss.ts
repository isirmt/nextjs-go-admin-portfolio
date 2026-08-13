"use client";

import { useEffect, useRef } from "react";

const HISTORY_STATE_KEY = "BACK_BUTTON_DISMISS_ENTRY_ID";

type UseBackButtonDismissOptions = {
  isOpen: boolean;
  onDismiss: () => void;
};

const getCurrentHistoryState = (): Record<string, unknown> => {
  const state: unknown = window.history.state;

  if (state && typeof state === "object" && !Array.isArray(state)) {
    return state as Record<string, unknown>;
  }

  return {};
};

const createEntryId = () => crypto.randomUUID();

export function useBackButtonDismiss({
  isOpen,
  onDismiss,
}: UseBackButtonDismissOptions) {
  const activeEntryIdRef = useRef<string | null>(null);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const handlePopState = () => {
      if (!activeEntryIdRef.current) return;

      activeEntryIdRef.current = null;
      onDismissRef.current();
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (activeEntryIdRef.current) return;

      const entryId = createEntryId();
      activeEntryIdRef.current = entryId;
      window.history.pushState(
        {
          ...getCurrentHistoryState(),
          [HISTORY_STATE_KEY]: entryId,
        },
        "",
        window.location.href,
      );
      return;
    }

    const entryId = activeEntryIdRef.current;
    if (!entryId) return;

    activeEntryIdRef.current = null;

    if (window.history.state?.[HISTORY_STATE_KEY] === entryId) {
      window.history.back();
    }
  }, [isOpen]);
}
