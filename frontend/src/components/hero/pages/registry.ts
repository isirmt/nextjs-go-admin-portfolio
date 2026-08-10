import type { HeroPageDefinition } from "../../../types/hero/types";
import PortfolioHeroPage from "./portfolio";
import SampleHeroPage from "./samplePage";

export const heroPages = [
  {
    id: "portfolio",
    Component: PortfolioHeroPage,
  },
  {
    id: "sample",
    Component: SampleHeroPage,
  },
  {
    id: "sample2",
    Component: SampleHeroPage,
  },
] as const satisfies readonly HeroPageDefinition[];
