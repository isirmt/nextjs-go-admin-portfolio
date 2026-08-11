import type { HeroPageDefinition } from "../../../types/hero/types";
import PortfolioHeroPage from "./portfolio";
import OpeningHeroPage from "./openingPage";

export const heroPages = [
  {
    id: "opening",
    Component: OpeningHeroPage,
    durationMs: 6 * 1000,
    remountOnEnter: true,
  },
  {
    id: "portfolio",
    Component: PortfolioHeroPage,
    durationMs: 10 * 1000,
  },
] as const satisfies readonly HeroPageDefinition[];
