import { useMemo, useState } from "react";

type SortDirection = "asc" | "desc";

export default function useDateSort<
  T extends Record<K, string | null>,
  K extends keyof T,
>(
  items: readonly T[],
  initialKey: K,
  initialDirection: SortDirection = "desc",
) {
  const [sort, setSort] = useState<{ key: K; direction: SortDirection }>({
    key: initialKey,
    direction: initialDirection,
  });

  const toggleSort = (key: K) => {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const sortedItems = useMemo(
    () =>
      [...items].sort((left, right) => {
        const leftDate = left[sort.key];
        const rightDate = right[sort.key];
        if (!leftDate) return rightDate ? 1 : 0;
        if (!rightDate) return -1;
        const difference = Date.parse(leftDate) - Date.parse(rightDate);
        return sort.direction === "asc" ? difference : -difference;
      }),
    [items, sort],
  );

  return { sort, toggleSort, sortedItems };
}
