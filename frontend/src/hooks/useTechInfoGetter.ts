"use client";

import { useMemo } from "react";

import { useTechsContext } from "@/contexts/techsContext";
import { WorkTechStack } from "@/types/works/common";

export function useTechInfoGetter(techStacks: WorkTechStack[]) {
  const { techs } = useTechsContext();

  const techsById = useMemo(
    () => new Map(techs.map((stack) => [stack.id, stack])),
    [techs],
  );

  const techsInfo = useMemo(
    () =>
      techStacks.flatMap((stack) => {
        const tech = techsById.get(stack.id);
        return tech ? [tech] : [];
      }),
    [techStacks, techsById],
  );

  return { techsInfo };
}
