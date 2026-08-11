import type { HeroPageDefinition } from "../../../types/hero/types";
import PortfolioHeroPage from "./portfolio";
import SampleHeroPage from "./samplePage";

export const heroPages = [
  {
    id: "portfolio",
    Component: PortfolioHeroPage,
    durationMs: 10 * 1000,
  },
  {
    id: "sample",
    Component: SampleHeroPage,
    durationMs: 4 * 1000,
  },
] as const satisfies readonly HeroPageDefinition[];
