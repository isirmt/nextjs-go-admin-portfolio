"use client";

import type { Work } from "@/types/works/common";
import { useCallback, useMemo, useState } from "react";

export function useWorkTechFilter(works: Work[]) {
  const [selectedTechIds, setSelectedTechIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleTech = useCallback((techId: string) => {
    setSelectedTechIds((current) => {
      const next = new Set(current);

      if (next.has(techId)) {
        next.delete(techId);
      } else {
        next.add(techId);
      }

      return next;
    });
  }, []);

  const clearTechs = useCallback(() => {
    setSelectedTechIds(new Set());
  }, []);

  const filteredWorks = useMemo(() => {
    if (selectedTechIds.size === 0) {
      return works;
    }

    return works.filter((work) => {
      const workTechIds = new Set(work.tech_stacks.map((tech) => tech.id));

      return [...selectedTechIds].every((techId) => workTechIds.has(techId));
    });
  }, [selectedTechIds, works]);

  return {
    selectedTechIds,
    filteredWorks,
    toggleTech,
    clearTechs,
  };
}
