"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type SelectingCubeContextValue = {
  selectingCubeId: string | null;
  setSelectingCubeId: (id: string | null) => void;
  clickedCubeId: string | null;
  clickNonce: number;
  emitCubeClick: (id: string) => void;
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
  const [clickedCubeId, setClickedCubeId] = useState<string | null>(null);
  const [clickNonce, setClickNonce] = useState(0);

  const emitCubeClick = useCallback((id: string) => {
    setClickedCubeId(id);
    setClickNonce((prev) => prev + 1);
  }, []);

  const value = useMemo(
    () => ({
      selectingCubeId,
      setSelectingCubeId,
      clickedCubeId,
      clickNonce,
      emitCubeClick,
    }),
    [
      selectingCubeId,
      clickedCubeId,
      clickNonce,
      emitCubeClick,
      setSelectingCubeId,
    ],
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
