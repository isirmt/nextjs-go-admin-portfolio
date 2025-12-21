"use client";

import { useWorksContext } from "@/contexts/worksContext";
import { useEffect } from "react";

export default function WorksViewer() {
  const { works, isLoading, error } = useWorksContext();

  useEffect(() => {
    console.log({ works, isLoading, error });
  }, [works, isLoading, error]);

  return null;
}
