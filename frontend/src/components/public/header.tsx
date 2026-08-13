"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

/* eslint-disable @next/next/no-img-element */
export default function Header() {
  const pathname = usePathname();

  const handleLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname],
  );

  return (
    <header className="pointer-events-none fixed top-0 left-0 z-100 flex h-24 w-full items-center justify-between bg-transparent px-3 md:h-32 md:px-8">
      <Link href="/" className="pointer-events-auto" onClick={handleLogoClick}>
        <img
          src="/isirmt_logo.png"
          alt="ISIRMT Logo"
          className="h-20 w-auto drop-shadow-sm select-none md:h-28"
        />
      </Link>
    </header>
  );
}
