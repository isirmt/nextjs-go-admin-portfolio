"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

const publicLinks = [
  { href: "#profile", label: "Profile", subLabel: "プロフィール" },
  { href: "#works", label: "Works", subLabel: "制作物" },
  { href: "/blogs", label: "Blogs", subLabel: "ブログ" },
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
    <nav className="pointer-events-none relative top-0 z-50 h-24 w-full">
      <div className="font-dot flex h-full items-center justify-between px-4 tracking-wide select-none md:px-10">
        <ul className="flex items-center gap-6">
          {publicLinks.map(({ href, label, subLabel }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={
                  href.startsWith("#") ? handleHashClick(href) : undefined
                }
                className="pointer-events-auto inline-flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <div className="text-2xl leading-none">{label}</div>
                <div className="text-sm leading-none">{subLabel}</div>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          className="pointer-events-auto inline-flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
          href="/console/works"
        >
          <div className="text-2xl leading-none">Console</div>
          <div className="text-sm leading-none">コンソール</div>
        </Link>
      </div>
    </nav>
  );
}
