import type { ComponentType } from "react";

export type HeroPageDefinition = {
  id: string;
  Component: ComponentType;
  durationMs: number;
  remountOnEnter?: boolean;
};
