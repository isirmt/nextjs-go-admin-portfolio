"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import SearchWindow from "./searchWindow";

export default function BlogSearchWindow() {
  const router = useRouter();
  const handleSelectWork = useCallback(
    (id: string) =>
      router.push(`/?work=${encodeURIComponent(id)}#works-display`),
    [router],
  );

  return <SearchWindow defaultMode="blogs" onSelectWork={handleSelectWork} />;
}
