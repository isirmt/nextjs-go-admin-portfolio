"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

const links = [
  { href: "#profile", label: "Profile", subLabel: "プロフィール" },
  { href: "#works", label: "Works", subLabel: "制作物" },
  { href: "/console/works", label: "Console", subLabel: "コンソール" },
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
    <nav className="pointer-events-none relative top-0 z-50 -mt-24 h-24 w-full border-t-2 border-dotted border-[#888]">
      <div className="absolute top-0 left-0 size-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,1)_50%,rgba(255,255,255,1))]" />
      <ul className="font-dot flex h-full w-full items-center justify-start gap-6 px-4 tracking-wide md:px-10">
        {links.map(({ href, label, subLabel }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={href.startsWith("#") ? handleHashClick(href) : undefined}
              className="pointer-events-auto inline-flex flex-col items-center justify-center drop-shadow-xl drop-shadow-[#aaa]/80 transition-all duration-200 hover:scale-105"
            >
              <div className="text-2xl leading-none">{label}</div>
              <div className="text-sm leading-none">{subLabel}</div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
