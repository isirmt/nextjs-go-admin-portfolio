import type { HeroPageDefinition } from "../../../types/hero/types";
import PortfolioHeroPage from "./portfolio";

export const heroPages = [
  {
    id: "portfolio",
    Component: PortfolioHeroPage,
  },
] as const satisfies readonly HeroPageDefinition[];
