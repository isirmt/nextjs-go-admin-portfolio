"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

const publicLinks = [
  {
    href: "#profile",
    label: "Profile",
    subLabel: "プロフィール",
    thumbnail: "/menu1.webp",
  },
  {
    href: "#works",
    label: "Works",
    subLabel: "制作物",
    thumbnail: "/menu2.webp",
  },
  {
    href: "/blogs",
    label: "Blogs",
    subLabel: "ブログ",
    thumbnail: "/menu3.webp",
  },
];

export default function Navigation() {
  const router = useRouter();

  const handleHashClick =
    (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const id = href.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      router.replace(href);
    };

  return (
    <nav className="pointer-events-none relative top-0 z-50 mt-6 h-24 w-full">
      <div className="font-dot flex h-full items-end justify-between px-4 tracking-wide select-none md:px-10">
        <ul className="flex items-center gap-6">
          {publicLinks.map(({ href, label, subLabel, thumbnail }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={
                  href.startsWith("#") ? handleHashClick(href) : undefined
                }
                className="pointer-events-auto inline-flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <div
                  className="h-12 w-12 bg-cover bg-center"
                  style={{ backgroundImage: `url(${thumbnail})` }}
                />
                <div className="text-2xl leading-none">{label}</div>
                <div className="text-xs leading-none">{subLabel}</div>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          className="pointer-events-auto inline-flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
          href="/console/works"
        >
          <div className="text-2xl leading-none">Console</div>
          <div className="text-xs leading-none">コンソール</div>
        </Link>
      </div>
    </nav>
  );
}
