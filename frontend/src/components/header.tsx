"use client";
import Link from "next/link";

/* eslint-disable @next/next/no-img-element */
export default function Header() {
  return (
    <header className="pointer-events-none fixed top-0 left-0 z-999 flex h-32 w-full items-center justify-between bg-transparent px-6 md:px-8">
      <Link href="/" className="pointer-events-auto">
        <img src="/isirmt_logo.png" alt="ISIRMT Logo" className="h-28 w-auto" />
      </Link>
    </header>
  );
}
