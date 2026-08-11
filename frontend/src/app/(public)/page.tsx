import WorkConveyer from "@/components/works/list";
import { ImagesProvider } from "@/contexts/imagesContext";
import { TechsProvider } from "@/contexts/techsContext";
import { WorksProvider } from "@/contexts/worksContext";
import { Suspense } from "react";
import Navigation from "@/components/public/navigation";
import HeroSection from "@/components/hero/section";
import { SelectingCubeContextProvider } from "@/contexts/selectingCubeContext";
import { Metadata } from "next";
import SearchWindow from "@/components/works/searchWindow";
import ProfileSection from "@/components/profile/section";

export const metadata: Metadata = {
  title: "isirmt - 色彩と体験 | 入本聖也",
  description: "isirmtのポートフォリオサイト。制作物を掲載しています。",
  openGraph: {
    url: "/",
    type: "website",
    siteName: "入本聖也 - isirmt",
    description: "isirmtのポートフォリオサイト。制作物を掲載しています。",
    title: "isirmt - 色彩と体験 | 入本聖也",
    images: {
      url: "/opengraph-image.png",
      width: 1200,
      height: 630,
    },
  },
  twitter: {
    card: "summary_large_image",
    creator: "@isirmt",
    site: "@isirmt",
    title: "isirmt - 色彩と体験 | 入本聖也",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const birthDate = new Date(2004, 3 - 1, 8);
  const today = new Date();
  const hasHadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());
  const age =
    today.getFullYear() - birthDate.getFullYear() - (hasHadBirthday ? 0 : 1);

  return (
    <main>
      <ImagesProvider>
        <WorksProvider>
          <TechsProvider>
            <SelectingCubeContextProvider>
              <SearchWindow />
              <section
                aria-label="top-view"
                className="relative h-[calc(100dvh+72px)] w-full bg-[#C6F4FF]"
              >
                <Suspense fallback={null}>
                  <HeroSection />
                </Suspense>
              </section>
              <Navigation />
              <ProfileSection age={age} />
              <section aria-label="works-display" className="relative w-full">
                <WorkConveyer />
              </section>
            </SelectingCubeContextProvider>
          </TechsProvider>
        </WorksProvider>
      </ImagesProvider>
    </main>
  );
}
