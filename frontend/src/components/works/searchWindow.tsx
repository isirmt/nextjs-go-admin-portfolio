/* eslint-disable @next/next/no-img-element */
"use client";

import { useSelectingCubeContext } from "@/contexts/selectingCubeContext";
import { useScrollbarControl } from "@/hooks/useScrollbarControl";
import { Work } from "@/types/works/common";
import { useEffect, useRef, useState } from "react";

const SEARCH_DELAY = 300; // ms
const SEARCH_API_URL = "/api/works/search";
const SEARCH_QUERY_KEY = "q";

export default function SearchWindow() {
  const { emitCubeClick } = useSelectingCubeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hitWorks, setHitWorks] = useState<Work[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollbarWidth } = useScrollbarControl(isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") return;

    const handler = setTimeout(() => {
      const fetchSearchResults = async () => {
        try {
          const url = new URL(SEARCH_API_URL, window.location.origin);
          url.searchParams.append(SEARCH_QUERY_KEY, searchTerm);

          const response = await fetch(url.toString());
          if (!response.ok) {
            const message = (await response.text()) || "検索に失敗しました";
            throw new Error(message);
          }
          const results = (await response.json()) as Work[];
          setHitWorks(results);
          console.log("検索結果:", results);
        } catch (error) {
          console.error(
            "検索エラー:",
            error instanceof Error ? error.message : error,
          );
        }
      };

      fetchSearchResults();
    }, SEARCH_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none fixed top-0 left-0 z-100 flex size-full flex-col items-end gap-6 p-6 transition-all ${isOpen ? "bg-black/10 backdrop-blur-sm" : "bg-transparent"}`}
    >
      <div
        className="relative z-10 h-12 w-78 max-w-full"
        style={{ marginRight: isOpen ? scrollbarWidth : 0 }}
      >
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`font-noto pointer-events-auto block h-12 w-full rounded-full border border-[#ccc] px-4 py-1 text-[#333] shadow-md shadow-[#ccc] backdrop-blur-2xl outline-none hover:border-[#777] focus:border-[#777] active:border-[#777] ${isOpen ? "bg-white" : "bg-white/60"}`}
        />
      </div>
      {isOpen && (
        <div
          className={`pointer-events-auto relative z-0 max-h-[calc(100vh-8rem)] w-120 max-w-full overflow-y-auto rounded border border-[#ccc] bg-white/85 p-4 backdrop-blur-2xl`}
        >
          {hitWorks.length === 0 ? (
            <p className="text-center text-gray-500">
              作品が見つかりませんでした
            </p>
          ) : (
            <ul className="space-y-2">
              {hitWorks.map((work) => (
                <li
                  key={work.id}
                  className="relative flex cursor-pointer items-center gap-4 rounded p-2 hover:bg-[#eee]/85 hover:backdrop-blur-2xl"
                  onClick={() => {
                    emitCubeClick(work.id);
                    setIsOpen(false);
                  }}
                >
                  <img
                    src={`/api/images/${work.thumbnail_image_id}/raw`}
                    className={`pointer-events-none size-16 rounded object-cover transition-all`}
                    alt={`${work.title}検索サムネイル`}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text w-full truncate font-medium">
                      {work.title}
                    </div>
                    <div className="w-full truncate">{work.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
