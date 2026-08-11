/* eslint-disable @next/next/no-img-element */
"use client";

import ProfileCard from "@/components/profile/card";
import { useSineClipPath } from "@/hooks/useSineClipPath";
import { delaGothicOne } from "@/lib/fonts";

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

type DetailBoxProps = {
  label: string;
  array: string[];
  isApplyingEtc?: boolean;
};

const DetailBox = ({ label, array, isApplyingEtc }: DetailBoxProps) => (
  <div className="flex flex-col gap-6">
    <div className={`text-2xl text-[#054a5c] ${delaGothicOne.className}`}>
      {label}
    </div>
    <ul className="ml-8 flex flex-wrap gap-3 text-[#054a5c]">
      {array.map((item, itemIndex) => (
        <li key={item} className="flex items-center gap-2">
          {item}
          {itemIndex < array.length - 1 && (
            <span className="text-[#9395a8] select-none">/</span>
          )}
        </li>
      ))}
      {isApplyingEtc && (
        <li className="flex items-center gap-2">
          <span className="text-[#9395a8] select-none">/</span>
          etc...
        </li>
      )}
    </ul>
  </div>
);

export default function ProfileSection({ age }: { age: number }) {
  const waveRef = useSineClipPath<HTMLDivElement>({ edge: "both" });

  return (
    <section
      aria-label="profile"
      className="relative z-1 w-full overflow-x-clip overflow-y-visible"
    >
      <div className="relative flex flex-wrap items-end justify-start overflow-visible bg-[linear-gradient(#ffffff,#f2faff_63%,#eef2ff)]">
        <img
          loading="lazy"
          className="pointer-events-none absolute right-8 bottom-0 hidden w-100 max-w-full xl:block"
          alt="miri_transparent"
          src="/miri_transparent.webp"
        />
        <span className="font-dot pointer-events-none absolute right-8 bottom-13 hidden bg-[#f43f5e] px-2.5 text-right text-3xl leading-none text-white select-none xl:block">
          井筒&nbsp;ミリ
        </span>
        <ProfileCard age={age} />
      </div>
      <div
        ref={waveRef}
        className="relative -mt-14 -mb-20 grid grid-cols-1 gap-14 bg-[#c6f4ff] px-10 pt-44 pb-40 lg:grid-cols-2 lg:gap-20 lg:px-40"
      >
        <DetailBox label="分野" array={myAreas} />
        <DetailBox
          label="フレームワーク・ツール等"
          array={myTools}
          isApplyingEtc
        />
      </div>
    </section>
  );
}
