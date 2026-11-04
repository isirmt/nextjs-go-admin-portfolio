"use client";

import type { ReactNode } from "react";
import { useHamburgerContext } from "@/contexts/hamburgerContext";
import ConsoleSidebar from "./sidebar";

export default function ConsoleShell({ children }: { children: ReactNode }) {
  const { isCollapsed } = useHamburgerContext();

  return (
    <div
      className={`relative flex min-h-dvh transition-[padding] duration-200 ${isCollapsed ? "lg:pl-16" : "lg:pl-72"}`}
    >
      <ConsoleSidebar />
      {children}
    </div>
  );
}
