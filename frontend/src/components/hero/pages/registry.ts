import type { HeroPageDefinition } from "../../../types/hero/types";
import PortfolioHeroPage from "./portfolio";
import SampleHeroPage from "./samplePage";

export const heroPages = [
  {
    id: "portfolio",
    Component: PortfolioHeroPage,
    durationMs: 8000,
  },
  {
    id: "sample",
    Component: SampleHeroPage,
    durationMs: 4000,
  },
  {
    id: "sample2",
    Component: SampleHeroPage,
    durationMs: 8000,
  },
] as const satisfies readonly HeroPageDefinition[];
