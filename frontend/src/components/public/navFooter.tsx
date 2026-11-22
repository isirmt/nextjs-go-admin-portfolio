"use client";

import { publicLinks } from "@/lib/publicLinks";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavigationMenuItem from "./navigationMenuItem";

export default function NavFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");

    const updateVisibility = () => {
      const pastFirstViewport =
        pathname !== "/" || window.scrollY >= window.innerHeight;
      const footerRect = footer?.getBoundingClientRect();
      const footerVisible = footerRect
        ? footerRect.top < window.innerHeight && footerRect.bottom > 0
        : false;

      setVisible(pastFirstViewport && !footerVisible);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    const observer = footer ? new IntersectionObserver(updateVisibility) : null;
    if (footer && observer) observer.observe(footer);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
      observer?.disconnect();
    };
  }, [pathname]);

  return (
    <nav
      inert={!visible}
      className={`font-zen fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-90 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 rounded-full border border-[#95cad6] bg-[#f8feff] px-7 py-0.5 shadow-[0_2px_0_#95cad6] transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-[calc(100%+env(safe-area-inset-bottom)+0.75rem)]"}`}
    >
      <ul className="flex items-center font-bold">
        {publicLinks.map(({ href, label, thumbnail }) => (
          <NavigationMenuItem
            key={href}
            href={href}
            subLabel={label}
            thumbnail={thumbnail}
            hidden={!isHome && href !== "/blogs"}
            itemClassName={`overflow-hidden whitespace-nowrap transition-[max-width,margin,opacity] duration-300 ease-in-out ${href === "/blogs" ? "max-w-24" : isHome ? "mr-6 max-w-24 opacity-100" : "mr-0 max-w-0 opacity-0"}`}
          />
        ))}
      </ul>
    </nav>
  );
}
