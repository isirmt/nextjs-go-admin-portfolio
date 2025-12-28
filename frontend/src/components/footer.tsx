"use client";

import { delaGothicOne } from "@/lib/fonts";
import { InformationSite } from "./latestNews";
import { useSpotlightSketch } from "@/hooks/useSpotlightSketch";
import Link from "next/link";

export default function Footer() {
  const {
    footerRef,
    sketchContainerRef,
    handleSpotlightEnter,
    handleSpotlightLeave,
    getSpotlightSide,
  } = useSpotlightSketch();

  return (
    <footer
      ref={footerRef}
      className="relative -mt-20 overflow-hidden bg-transparent select-none"
    >
      <div className="absolute left-[10%] z-1 aspect-946/2472 h-full bg-[url('/footer_stripe.svg')] bg-center bg-no-repeat opacity-5 bg-blend-saturation" />
      <div className="absolute left-[70%] z-1 aspect-946/2472 h-full bg-[url('/footer_stripe.svg')] bg-center bg-no-repeat opacity-12 bg-blend-saturation" />
      <div className="absolute left-[90%] z-1 aspect-946/2472 h-full bg-[url('/footer_stripe.svg')] bg-center bg-no-repeat opacity-8 bg-blend-saturation" />
      <div
        ref={sketchContainerRef}
        className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full"
      />
      <div className="relative z-2 flex flex-col items-center pt-20">
        <section className="flex flex-col items-center justify-center gap-2 py-12">
          <div
            className={`text-4xl text-white transition ${delaGothicOne.className} ${getSpotlightSide() !== "none" && "drop-shadow-2xl"}`}
          >
            情報発信中サイト
          </div>
          <div className="my-10 flex gap-0 text-white">
            <div
              className="pr-10 transition hover:drop-shadow-2xl"
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
              className="pl-10 transition hover:drop-shadow-2xl"
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
        <div
          className={`group relative flex w-full flex-col items-center ${getSpotlightSide() !== "none" && "drop-shadow-2xl"}`}
        >
          <div
            className={`aspect-1233/110 w-full bg-[url('/name_footer.svg')] bg-center bg-no-repeat`}
          />
          <div
            className={`group-hover:animate-jump absolute bottom-[calc(100vw*110/1233*0.7)] z-1 aspect-440/100 w-[7%] bg-[url('/glasses.png')] bg-contain bg-center bg-no-repeat ${getSpotlightSide() !== "none" && "animate-jump"}`}
          />
          <div
            className={`absolute bottom-2 left-2 z-10 text-xs leading-none font-semibold text-black ${getSpotlightSide() !== "none" && "drop-shadow-2xl"}`}
          >
            <Link
              href="/privacy-policy"
              className="block border-b border-transparent hover:border-black"
            >
              プライバシーポリシー
            </Link>
            © isirmt
          </div>
        </div>
      </div>
    </footer>
  );
}
