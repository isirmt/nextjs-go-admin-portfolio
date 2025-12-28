"use client";

import { createContext, useContext, useMemo, useState } from "react";

type SelectingCubeContextValue = {
  selectingCubeId: string | null;
  setSelectingCubeId: (id: string | null) => void;
};

const SelectingCubeContext = createContext<SelectingCubeContextValue | null>(
  null,
);

export function SelectingCubeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectingCubeId, setSelectingCubeId] = useState<string | null>(null);

  const value = useMemo(
    () => ({ selectingCubeId, setSelectingCubeId }),
    [selectingCubeId, setSelectingCubeId],
  );

  return (
    <SelectingCubeContext.Provider value={value}>
      {children}
    </SelectingCubeContext.Provider>
  );
}

export function useSelectingCubeContext() {
  const context = useContext(SelectingCubeContext);
  if (!context) {
    throw new Error(
      "useSelectingCubeContext must be used within a SelectingCubeContextProvider",
    );
  }
  return context;
}
