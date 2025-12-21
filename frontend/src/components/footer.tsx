"use client";

import { delaGothicOne } from "@/lib/fonts";
import { InformationSite } from "./latestNews";
import { useSpotlightSketch } from "@/hooks/useSpotlightSketch";

export default function Footer() {
  const {
    footerRef,
    sketchContainerRef,
    handleSpotlightEnter,
    handleSpotlightLeave,
  } = useSpotlightSketch();

  return (
    <footer ref={footerRef} className="relative bg-[#67c8e6]">
      <div
        ref={sketchContainerRef}
        className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full"
      />
      <div className="relative z-1">
        <section className="flex flex-col items-center justify-center py-12">
          <div className={`text-4xl text-white ${delaGothicOne.className}`}>
            情報発信中サイト
          </div>
          <div className="my-10 flex gap-0 text-white">
            <div
              className="pr-6"
              onMouseEnter={() => handleSpotlightEnter("left")}
              onMouseLeave={handleSpotlightLeave}
              onFocus={() => handleSpotlightEnter("left")}
              onBlur={handleSpotlightLeave}
            >
              <InformationSite
                siteUrl="https://itomiri.com"
                feedUrl="https://itomiri.com/feed"
                siteName="井筒ミリ オフィシャルサイト"
                siteImagePath="/itomiri_com_ogp.png"
                siteDescription="「井筒ミリ」名義での活動を告知・紹介するサイト"
              />
            </div>
            <div
              className="pl-6"
              onMouseEnter={() => handleSpotlightEnter("right")}
              onMouseLeave={handleSpotlightLeave}
              onFocus={() => handleSpotlightEnter("right")}
              onBlur={handleSpotlightLeave}
            >
              <InformationSite
                siteUrl="https://blog.isirmt.com"
                feedUrl="https://blog.isirmt.com/feed"
                siteName="isirmt ブログ"
                siteImagePath="/blog_isirmt_com_ogp.png"
                siteDescription="「isirmt」名義で技術ブログを運用中"
              />
            </div>
          </div>
        </section>
        <div className="aspect-1235/110 bg-[url('/name_footer.svg')] bg-center bg-no-repeat" />
      </div>
    </footer>
  );
}
