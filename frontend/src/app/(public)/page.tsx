import WorkConveyer from "@/components/works/list";
import { ImagesProvider } from "@/contexts/imagesContext";
import { TechsProvider } from "@/contexts/techsContext";
import { WorksProvider } from "@/contexts/worksContext";
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
                className="relative h-dvh w-full overflow-hidden bg-[repeating-linear-gradient(0deg,#c6f4ff,#c6f4ff_4rem,#d8f6fe_4rem,#d8f6fe_8rem)]"
              >
                <div className="animate-spin-reverse absolute right-4 bottom-4 size-34 bg-[url('/windmill.svg')] opacity-50 [animation-duration:10s]" />
                <HeroSection />
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
