"use client";

import type { Work } from "@/types/works/common";
import { useEffect, useMemo, useState } from "react";
import { useWorkTechFilter } from "./useWorkTechFilter";

export type WorkSort = "newest" | "oldest" | "popular";

const RANKING_API_URL = "/api/works/ranking";

const createdAtTime = (work: Work) => Date.parse(work.created_at) || 0;

export function useWorkListView(works: Work[]) {
  const techFilter = useWorkTechFilter(works);
  const [sort, setSort] = useState<WorkSort>("newest");
  const [rankingWorkIds, setRankingWorkIds] = useState<string[]>([]);
  const [isRankingLoading, setIsRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState<string | null>(null);

  useEffect(() => {
    if (sort !== "popular" || works.length === 0) {
      return;
    }

    const abortController = new AbortController();

    const fetchRanking = async () => {
      setIsRankingLoading(true);
      setRankingError(null);

      try {
        const url = new URL(RANKING_API_URL, window.location.origin);
        url.searchParams.set("limit", String(works.length));

        const response = await fetch(url, { signal: abortController.signal });
        if (!response.ok) {
          throw new Error(
            (await response.text()) || "人気順の取得に失敗しました",
          );
        }

        const rankingWorks = (await response.json()) as Work[];
        setRankingWorkIds(rankingWorks.map((work) => work.id));
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setRankingError(
          error instanceof Error ? error.message : "人気順の取得に失敗しました",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsRankingLoading(false);
        }
      }
    };

    void fetchRanking();

    return () => {
      abortController.abort();
    };
  }, [sort, works]);

  const visibleWorks = useMemo(() => {
    const originalIndex = new Map(works.map((work, index) => [work.id, index]));
    const compareOriginalOrder = (a: Work, b: Work) =>
      (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0);

    if (sort === "popular") {
      const filteredWorksById = new Map(
        techFilter.filteredWorks.map((work) => [work.id, work]),
      );

      return rankingWorkIds.flatMap((workId) => {
        const work = filteredWorksById.get(workId);
        return work ? [work] : [];
      });
    }

    return [...techFilter.filteredWorks].sort((a, b) => {
      const dateDifference = createdAtTime(a) - createdAtTime(b);

      if (dateDifference === 0) {
        return compareOriginalOrder(a, b);
      }

      return sort === "oldest" ? dateDifference : -dateDifference;
    });
  }, [rankingWorkIds, sort, techFilter.filteredWorks, works]);

  return {
    ...techFilter,
    sort,
    setSort,
    visibleWorks,
    isRankingLoading,
    rankingError,
  };
}
