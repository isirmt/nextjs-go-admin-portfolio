"use client";

import { useSelectingCubeContext } from "@/contexts/selectingCubeContext";
import { useEffect } from "react";
import SearchWindow from "./searchWindow";

export default function HomeSearchWindow({
  initialWorkId,
}: {
  initialWorkId?: string;
}) {
  const { emitCubeClick } = useSelectingCubeContext();

  useEffect(() => {
    if (initialWorkId) emitCubeClick(initialWorkId);
  }, [initialWorkId, emitCubeClick]);

  return <SearchWindow onSelectWork={emitCubeClick} />;
}
