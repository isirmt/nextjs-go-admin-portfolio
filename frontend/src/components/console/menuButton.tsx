"use client";

import { useHamburgerContext } from "@/contexts/hamburgerContext";

export default function ConsoleMenuButton() {
  const { isOpen, setIsOpen } = useHamburgerContext();

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`relative z-10 cursor-pointer border border-[#054a5c] px-2 py-1 leading-none font-bold transition-all duration-250 after:absolute after:top-0 after:left-0 after:-z-1 after:block after:h-full after:bg-[#054a5c] after:transition-all after:duration-250 after:content-[''] ${isOpen ? "text-white after:w-full" : "text-[#054a5c] after:w-0 hover:text-white hover:after:w-full"}`}
    >
      MENU
    </button>
  );
}
