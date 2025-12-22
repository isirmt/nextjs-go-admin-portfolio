"use client";

import { CommonTechStack } from "@/types/techStacks/common";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type TechsContextValue = {
  techs: CommonTechStack[];
  isLoading: boolean;
  error: string | null;
  refreshTechs: () => Promise<void>;
};

const sortByName = (stacks: CommonTechStack[]) =>
  [...stacks].sort((a, b) => a.name.localeCompare(b.name, "ja"));

const TechsContext = createContext<TechsContextValue | null>(null);

export function TechsProvider({ children }: { children: React.ReactNode }) {
  const [techs, setTechs] = useState<CommonTechStack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTechs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tech-stacks");
      if (!response.ok) throw new Error("技術スタックの取得に失敗しました");
      const parsedTechs = (await response.json()) as CommonTechStack[];
      setTechs(sortByName(parsedTechs));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "技術スタックの取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTechs();
  }, [fetchTechs]);

  const value = useMemo(
    () => ({ techs, isLoading, error, refreshTechs: fetchTechs }),
    [techs, isLoading, error, fetchTechs],
  );

  return (
    <TechsContext.Provider value={value}>{children}</TechsContext.Provider>
  );
}

export function useTechsContext() {
  const context = useContext(TechsContext);
  if (!context) {
    throw new Error("useTechsContext must be used within a TechsProvider");
  }
  return context;
}
