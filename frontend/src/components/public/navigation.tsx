"use client";

import Link from "next/link";
import { publicLinks } from "@/lib/publicLinks";
import NavigationMenuItem from "./navigationMenuItem";

export default function Navigation() {
  return (
    <nav className="pointer-events-none relative top-0 z-50 mt-6 w-full">
      <div className="font-dot flex h-full flex-col items-start justify-normal gap-y-6 px-4 tracking-wide select-none md:flex-row md:items-end md:justify-between md:px-10">
        <ul className="flex items-center gap-6">
          {publicLinks.map(({ href, label, subLabel, thumbnail }) => (
            <NavigationMenuItem
              key={href}
              href={href}
              label={label}
              subLabel={subLabel}
              thumbnail={thumbnail}
            />
          ))}
        </ul>
        <Link
          className="pointer-events-auto ml-auto inline-flex flex-col items-center justify-center text-[#888] transition-all duration-200 hover:scale-105 hover:text-[#6354EB] md:ml-0"
          href="/console/works"
        >
          <div className="text-2xl leading-none">Console</div>
          <div className="text-xs leading-none">コンソール</div>
        </Link>
      </div>
    </nav>
  );
}
