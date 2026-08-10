"use client";

import HeroDeck from "./deck";
import { heroPages } from "./pages/registry";

export default function HeroSection() {
  return (
    <>
      <h1 className="hidden" aria-hidden="true">
        色彩と体験
      </h1>
      <HeroDeck pages={heroPages} initialPageId="portfolio" loop />
    </>
  );
}
