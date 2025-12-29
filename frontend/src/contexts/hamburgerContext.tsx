"use client";
import { createContext, useContext, useMemo, useState } from "react";

type HamburgerContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const HamburgerContext = createContext<HamburgerContextValue | null>(null);

export function HamburgerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
    }),
    [isOpen],
  );

  return (
    <HamburgerContext.Provider value={value}>
      {children}
    </HamburgerContext.Provider>
  );
}

export function useHamburgerContext() {
  const context = useContext(HamburgerContext);
  if (!context)
    throw new Error(
      "useHamburgerContext must be used within HamburgerProvider",
    );
  return context;
}
