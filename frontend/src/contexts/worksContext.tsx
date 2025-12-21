"use client";

import { Work } from "@/types/works/common";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type WorksContextValue = {
  works: Work[];
  isLoading: boolean;
  error: string | null;
  refreshWorks: () => Promise<void>;
};

const WorksContext = createContext<WorksContextValue | null>(null);

export function WorksProvider({ children }: { children: React.ReactNode }) {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWorks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/works");
      if (!response.ok) {
        const message = (await response.text()) || "作品一覧の取得に失敗しました";
        throw new Error(message);
      }
      const parsedWorks = (await response.json()) as Work[];
      const sanitizedWorks = Array.isArray(parsedWorks)
        ? parsedWorks.map((work) => ({
            ...work,
            images: work.images ?? [],
            urls: work.urls ?? [],
            tech_stacks: work.tech_stacks ?? [],
          }))
        : [];
      setWorks(sanitizedWorks);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "作品一覧の取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWorks();
  }, [refreshWorks]);

  const value = useMemo(
    () => ({ works, isLoading, error, refreshWorks }),
    [works, isLoading, error, refreshWorks],
  );

  return (
    <WorksContext.Provider value={value}>{children}</WorksContext.Provider>
  );
}

export function useWorksContext() {
  const context = useContext(WorksContext);
  if (!context) {
    throw new Error("useWorksContext must be used within WorksProvider");
  }
  return context;
}
