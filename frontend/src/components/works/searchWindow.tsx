/* eslint-disable @next/next/no-img-element */
"use client";

import { useSelectingCubeContext } from "@/contexts/selectingCubeContext";
import { useScrollbarControl } from "@/hooks/useScrollbarControl";
import { Work } from "@/types/works/common";
import { useEffect, useRef, useState } from "react";
import SearchIcon from "../searchIcon";
import React from "react";

const SEARCH_DELAY = 300; // ms
const SEARCH_API_URL = "/api/works/search";
const RANKING_API_URL = "/api/works/ranking";
const SEARCH_QUERY_KEY = "q";

function WorkSearchResultItem({
  work,
  emitCubeClick,
  setIsOpen,
}: {
  work: Work;
  emitCubeClick: (id: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <li
      key={work.id}
      className="relative flex cursor-pointer items-center gap-4 overflow-hidden rounded p-2 hover:bg-[#eee]/85 hover:backdrop-blur-2xl"
      onClick={() => {
        emitCubeClick(work.id);
        setIsOpen(false);
      }}
    >
      <img
        src={`/api/images/${work.thumbnail_image_id}/raw`}
        className={`pointer-events-none size-16 rounded object-cover transition-all select-none`}
        alt={`${work.title}検索サムネイル`}
        loading="lazy"
        decoding="async"
      />
      <div className="min-w-0 flex-1">
        <div className="text w-full truncate font-medium">{work.title}</div>
        <div className="w-full truncate">{work.description}</div>
      </div>
      <div
        className="absolute top-0 right-0 size-6 [clip-path:polygon(0_0,100%_0,100%_100%)]"
        style={{
          backgroundColor: work.accent_color,
        }}
      />
    </li>
  );
}

export default function SearchWindow() {
  const { emitCubeClick } = useSelectingCubeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hitWorks, setHitWorks] = useState<Work[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRequestIdRef = useRef(0);
  const [rankingWorks, setRankingWorks] = useState<Work[]>([]);

  const { scrollbarWidth } = useScrollbarControl(isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target === containerRef.current) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && !isOpen) {
        event.preventDefault();
        setIsOpen(true);
        containerRef.current?.querySelector("input")?.focus();
      } else if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        containerRef.current?.querySelector("input")?.blur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const query = searchTerm.trim();
    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    if (query === "") {
      setHitWorks([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const abortController = new AbortController();

    const handler = setTimeout(() => {
      const fetchSearchResults = async () => {
        try {
          const url = new URL(SEARCH_API_URL, window.location.origin);
          url.searchParams.append(SEARCH_QUERY_KEY, query);

          const response = await fetch(url.toString(), {
            signal: abortController.signal,
          });
          if (!response.ok) {
            const message = (await response.text()) || "検索に失敗しました";
            throw new Error(message);
          }
          const results = (await response.json()) as Work[];

          if (searchRequestIdRef.current === requestId) {
            setHitWorks(results);
          }
        } catch (error) {
          if (abortController.signal.aborted) {
            return;
          }
          console.error(
            "検索エラー:",
            error instanceof Error ? error.message : error,
          );
        } finally {
          if (searchRequestIdRef.current === requestId) {
            setIsSearching(false);
          }
        }
      };

      fetchSearchResults();
    }, SEARCH_DELAY);

    return () => {
      clearTimeout(handler);
      abortController.abort();
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchRankingWorks = async () => {
      try {
        const url = new URL(RANKING_API_URL, window.location.origin);

        const response = await fetch(url.toString());
        if (!response.ok) {
          const message =
            (await response.text()) || "ランキングの取得に失敗しました";
          throw new Error(message);
        }
        const results = (await response.json()) as Work[];
        setRankingWorks(results);
      } catch (error) {
        console.error(
          "ランキング取得エラー:",
          error instanceof Error ? error.message : error,
        );
      }
    };

    fetchRankingWorks();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 z-100 flex size-full flex-col items-end gap-6 p-6 transition-colors ${isOpen ? "pointer-events-auto bg-black/10 backdrop-blur-sm" : "pointer-events-none bg-transparent"}`}
    >
      <div
        className="relative z-10 h-12 w-78 max-w-full"
        style={{ marginRight: isOpen ? scrollbarWidth : 0 }}
      >
        <input
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isOpen ? "キーワードを入力" : ""}
          className={`font-noto pointer-events-auto block h-12 w-full rounded-full border border-[#ccc] py-1 pr-4 pl-12.5 text-[#333] shadow-md shadow-[#ccc] backdrop-blur-2xl outline-none hover:border-[#6354EB] focus:border-[#6354EB] active:border-[#6354EB] ${isOpen ? "bg-white" : "bg-white/60"}`}
        />
        <div className="absolute top-2.5 left-3.5 z-10">
          <SearchIcon
            color={isOpen ? (isSearching ? "#aaa" : "#6354EB") : "#666"}
            size={32}
            style={{
              transition: "all 0.3s",
            }}
          />
        </div>
        {!isOpen && searchTerm.trim() === "" && (
          <div className="pointer-events-none absolute top-3.25 left-13 z-10 flex items-center gap-1">
            <div
              className={`relative flex scale-y-110 items-center gap-3 overflow-hidden rounded-sm bg-[#ddd] px-1 py-px tracking-[.1rem] shadow-[0_.125rem_0_0_#bbb] transition-all duration-150 select-none`}
            >
              <span className="font-dot text-lg leading-none text-[#555]">
                /
              </span>
            </div>
            <span className="tracking-wider text-[#333]">
              を押してスマート検索
            </span>
          </div>
        )}
      </div>
      {isOpen && (
        <div
          className={`pointer-events-auto relative z-0 max-h-[calc(100vh-8rem)] w-120 max-w-full overflow-y-auto rounded border border-[#ccc] bg-white/85 p-4 backdrop-blur-2xl`}
        >
          {searchTerm.trim() === "" ? (
            <React.Fragment>
              <p className="font-dot my-2 text-center text-xl font-bold select-none">
                Featured
              </p>
              <ul className="space-y-2">
                {rankingWorks.map((work) => (
                  <WorkSearchResultItem
                    key={work.id}
                    work={work}
                    emitCubeClick={emitCubeClick}
                    setIsOpen={setIsOpen}
                  />
                ))}
              </ul>
            </React.Fragment>
          ) : hitWorks.length === 0 ? (
            <p className="text-center text-gray-500 select-none">
              作品が見つかりませんでした
            </p>
          ) : (
            <ul className="space-y-2">
              {hitWorks.map((work) => (
                <WorkSearchResultItem
                  key={work.id}
                  work={work}
                  emitCubeClick={emitCubeClick}
                  setIsOpen={setIsOpen}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
