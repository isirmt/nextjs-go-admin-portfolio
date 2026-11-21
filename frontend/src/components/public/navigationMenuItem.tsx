"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

type NavigationMenuItemProps = {
  href: string;
  label?: string;
  subLabel?: string;
  thumbnail: string;
  itemClassName?: string;
  hidden?: boolean;
};

export default function NavigationMenuItem({
  href,
  label,
  subLabel,
  thumbnail,
  itemClassName,
  hidden = false,
}: NavigationMenuItemProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("#")) return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    router.replace(href);
  };

  return (
    <li className={itemClassName} inert={hidden}>
      <Link
        href={href}
        onClick={handleClick}
        className="pointer-events-auto inline-flex flex-col items-center justify-center text-[#333] transition-all duration-200 hover:scale-105 hover:text-[#6354EB]"
      >
        <div
          className="h-12 w-12 bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
        {label && <div className="text-2xl leading-none">{label}</div>}
        {subLabel && <div className="text-xs leading-none">{subLabel}</div>}
      </Link>
    </li>
  );
}
