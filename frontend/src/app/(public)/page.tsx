import WorkConveyer from "@/components/works/list";
import { ImagesProvider } from "@/contexts/imagesContext";
import { TechsProvider } from "@/contexts/techsContext";
import { WorksProvider } from "@/contexts/worksContext";
import { delaGothicOne } from "@/lib/fonts";
import ProfileCard from "@/components/profile/card";
import Link from "next/link";
import React from "react";

const myAreas = [
  "フロントエンド・クライアント実装",
  "バックエンド・システム設計",
  "UI/UX設計",
  "UIアニメーション",
  "機械学習",
];
const myTools = [
  "React",
  "Next.js",
  "Tailwind CSS",
  "DxLib",
  "OpenGL",
  "Unity",
  "Illustrator",
  "Photoshop",
];

const DetailBox = ({
  label,
  array,
  isApplyingEtc,
}: {
  label: string;
  array: string[];
  isApplyingEtc?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className={`text-2xl text-[#054a5c] ${delaGothicOne.className}`}>
        {label}
      </div>
      <ul className="ml-8 flex flex-wrap gap-3 text-[#054a5c]">
        {array.map((item, itemIdx) => (
          <li key={itemIdx} className="flex items-center gap-2">
            {item}
            {itemIdx < array.length - 1 && (
              <span className="text-[#9395a8] select-none">/</span>
            )}
          </li>
        ))}
        {isApplyingEtc && (
          <React.Fragment>
            <li className="flex items-center gap-2">
              <span className="text-[#9395a8] select-none">/</span>
              etc...
            </li>
          </React.Fragment>
        )}
      </ul>
    </div>
  );
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
            <section
              aria-label="top-view"
              className="relative h-dvh w-full bg-gray-50"
            >
              <div className="font-dot absolute flex size-full items-center justify-center text-8xl leading-none">
                isirmt
              </div>
            </section>
            <nav className="sticky top-0 z-50 -mt-20 h-20 w-full bg-white">
              <ul className="font-dot flex h-full w-full items-center justify-start gap-6 px-10 tracking-wide">
                <li>
                  <Link
                    href={`/`}
                    className="inline-flex flex-col items-center justify-center"
                  >
                    <div className="text-2xl leading-none">Profile</div>
                    <div className="text-sm leading-none">プロフィール</div>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/console`}
                    className="inline-flex flex-col items-center justify-center"
                  >
                    <div className="text-2xl leading-none">Console</div>
                    <div className="text-sm leading-none">コンソール</div>
                  </Link>
                </li>
              </ul>
            </nav>
            <section
              aria-label="profile"
              className="relative w-full overflow-x-hidden"
            >
              <ProfileCard age={age} />
              <div className="relative -mt-6 grid grid-cols-2 gap-20 bg-[#c6f4ff] px-40 pt-32 pb-20">
                <DetailBox label="分野" array={myAreas} />
                <DetailBox
                  label="フレームワーク・ツール等"
                  array={myTools}
                  isApplyingEtc
                />
              </div>
            </section>
            <section aria-label="works-display" className="relative w-full">
              <WorkConveyer />
            </section>
          </TechsProvider>
        </WorksProvider>
      </ImagesProvider>
    </main>
  );
}
