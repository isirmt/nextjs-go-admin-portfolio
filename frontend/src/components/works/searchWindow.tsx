/* eslint-disable @next/next/no-img-element */
"use client";

import { useScrollbarControl } from "@/hooks/useScrollbarControl";
import { useCustomMediaQuery } from "@/hooks/useCustomMediaQuery";
import type { BlogArticleSummary } from "@/types/blogs/common";
import type { Work } from "@/types/works/common";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import SearchIcon from "../public/searchIcon";
import SegmentedControl from "../public/segmentedControl";

type SearchMode = "works" | "blogs";

const SEARCH_DELAY = 300; //ms
const SEARCH_API_URLS: Record<SearchMode, string> = {
  works: "/api/works/search",
  blogs: "/api/blogs/search",
};
const SEARCH_QUERY_PARAM = "q";
const WORK_RANKING_API_URL = "/api/works/ranking";
const LATEST_BLOGS_API_URL = "/api/blogs?limit=5";
const SEARCH_MODES = [
  { value: "works", label: "制作物" },
  { value: "blogs", label: "ブログ" },
] as const;

function WorkSearchResultItem({
  work,
  onSelect,
}: {
  work: Work;
  onSelect: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        className="relative flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded p-2 text-left select-none hover:bg-[#eee]/85 hover:backdrop-blur-2xl"
        onClick={() => onSelect(work.id)}
      >
        <img
          src={`/api/images/${work.thumbnail_image_id}/raw`}
          className="pointer-events-none size-16 rounded object-cover"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="min-w-0 flex-1">
          <div className="block w-full truncate font-medium">{work.title}</div>
          <div className="mt-0.5 flex w-full items-center gap-2 text-[#888]">
            <span className="bg-[#888] px-1 py-0.5 text-xs leading-none text-white">
              {work.search_match?.label}
            </span>
            <span className="flex-1 truncate leading-none">
              {work.search_match?.content ?? work.description}
            </span>
          </div>
        </div>
        <span
          className="absolute top-0 right-0 size-6 [clip-path:polygon(0_0,100%_0,100%_100%)]"
          style={{ backgroundColor: work.accent_color }}
        />
      </button>
    </li>
  );
}

function BlogSearchResultItem({
  article,
  onSelect,
}: {
  article: BlogArticleSummary;
  onSelect: () => void;
}) {
  return (
    <li>
      <Link
        href={`/blogs/${article.slug}`}
        className="flex items-center gap-4 overflow-hidden rounded p-2 hover:bg-[#eee]/85 hover:backdrop-blur-2xl"
        onClick={onSelect}
      >
        <img
          src={`/blogs/${article.slug}/og-image`}
          className="pointer-events-none size-16 rounded object-cover"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="min-w-0 flex-1">
          <div className="block w-full truncate font-medium">
            {article.title}
          </div>
          <div className="mt-0.5 flex w-full items-center gap-2 text-[#888]">
            {article.search_match?.label && (
              <span className="bg-[#888] px-1 py-0.5 text-xs leading-none text-white">
                {article.search_match.label}
              </span>
            )}
            <span className="min-w-0 flex-1 truncate leading-none">
              {article.search_match?.content ?? article.excerpt}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function SearchWindow({
  defaultMode = "works",
  onSelectWork,
}: {
  defaultMode?: SearchMode;
  onSelectWork: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<SearchMode>(defaultMode);
  const [searchTerm, setSearchTerm] = useState("");
  const [hitWorks, setHitWorks] = useState<Work[]>([]);
  const [hitBlogs, setHitBlogs] = useState<BlogArticleSummary[]>([]);
  const [rankingWorks, setRankingWorks] = useState<Work[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogArticleSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRequestIdRef = useRef(0);
  const { mq } = useCustomMediaQuery();
  const { scrollbarWidth } = useScrollbarControl(isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target === containerRef.current) setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key === "/" &&
        !isOpen &&
        !target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        event.preventDefault();
        setIsOpen(true);
        containerRef.current
          ?.querySelector<HTMLInputElement>("input[type='search']")
          ?.focus();
      } else if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        containerRef.current
          ?.querySelector<HTMLInputElement>("input[type='search']")
          ?.blur();
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
    const requestId = ++searchRequestIdRef.current;
    if (!query) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const controller = new AbortController();
    const handler = window.setTimeout(async () => {
      try {
        const url = new URL(SEARCH_API_URLS[mode], window.location.origin);
        url.searchParams.set(SEARCH_QUERY_PARAM, query);
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          const message = (await response.text()) || "検索に失敗しました";
          throw new Error(message);
        }
        const results = await response.json();
        if (searchRequestIdRef.current !== requestId) return;
        if (mode === "works") setHitWorks(results as Work[]);
        else setHitBlogs(results as BlogArticleSummary[]);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(
            "検索エラー:",
            error instanceof Error ? error.message : error,
          );
        }
      } finally {
        if (
          !controller.signal.aborted &&
          searchRequestIdRef.current === requestId
        )
          setIsSearching(false);
      }
    }, SEARCH_DELAY);
    return () => {
      window.clearTimeout(handler);
      controller.abort();
    };
  }, [searchTerm, mode]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch(WORK_RANKING_API_URL, { signal: controller.signal }),
      fetch(LATEST_BLOGS_API_URL, { signal: controller.signal }),
    ])
      .then(async ([worksResponse, blogsResponse]) => {
        if (worksResponse.ok)
          setRankingWorks((await worksResponse.json()) as Work[]);
        if (blogsResponse.ok)
          setLatestBlogs((await blogsResponse.json()) as BlogArticleSummary[]);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const handleSelectWork = useCallback(
    (id: string) => {
      setIsOpen(false);
      onSelectWork(id);
    },
    [onSelectWork],
  );

  const query = searchTerm.trim();
  const workResults = query ? hitWorks : rankingWorks;
  const blogResults = query ? hitBlogs : latestBlogs;

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 z-100 flex size-full flex-col items-end gap-3 p-6 transition-colors ${isOpen ? "pointer-events-auto bg-black/10 backdrop-blur-sm" : "pointer-events-none bg-transparent"}`}
    >
      {isOpen && (
        <div className="pointer-events-auto absolute inset-y-0 right-0 hidden w-[calc(32rem+1.5rem)] bg-[#fafafa] md:block" />
      )}
      <div
        className="relative z-10 max-w-full"
        style={{ marginRight: isOpen ? scrollbarWidth : 0 }}
      >
        <div className="flex max-w-full flex-col-reverse items-end gap-2 md:flex-row md:items-center">
          {isOpen && (
            <SegmentedControl
              value={mode}
              options={SEARCH_MODES}
              onChange={setMode}
              name="search-mode"
              compact
              className="pointer-events-auto shrink-0"
            />
          )}
          <div
            className={`relative h-12 max-w-full ${isOpen ? "w-78" : "w-12 md:w-78"}`}
          >
            <input
              type="search"
              aria-label={mode === "works" ? "制作物を検索" : "記事を検索"}
              value={searchTerm}
              onFocus={() => setIsOpen(true)}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={isOpen ? "キーワードを入力" : ""}
              className={`font-noto pointer-events-auto block h-12 w-full rounded-full border border-[#6354EB] bg-white outline-none hover:border-[#6354EB] focus:border-[#6354EB] active:border-[#6354EB] md:border-[#ccc] ${isOpen ? "py-1 pr-4 pl-12.5 text-[#333] md:shadow-none" : "cursor-pointer p-0 text-transparent transition-[box-shadow,border] duration-150 select-none md:cursor-auto md:py-1 md:pr-4 md:pl-12.5 md:text-[#333] md:shadow-[0_2px_0_#ccc] md:drop-shadow-sm md:select-auto md:hover:shadow-[0_2px_0_#6354EB]"}`}
            />
            <div
              className={`pointer-events-none absolute top-2.5 z-10 ${isOpen ? "left-3.5" : "left-2 md:left-3.5"}`}
            >
              <SearchIcon
                color={
                  isOpen
                    ? isSearching
                      ? "#aaa"
                      : "#6354EB"
                    : mq("md")
                      ? "#666"
                      : "#6354EB"
                }
                size={32}
                style={{ transition: "all 0.3s" }}
              />
            </div>
            {!isOpen && !query && (
              <div className="pointer-events-none absolute top-3.25 left-13 z-10 hidden items-center gap-1 select-none md:flex">
                <span className="font-dot relative flex scale-y-110 items-center gap-3 overflow-hidden rounded-sm bg-[#ddd] px-1 py-px text-lg leading-none tracking-[.1rem] text-[#555] shadow-[0_.125rem_0_0_#bbb]">
                  /
                </span>
                <span className="tracking-wider text-[#333]">
                  を押してスマート検索
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="pointer-events-auto relative z-0 max-h-[calc(100vh-11rem)] w-128 max-w-full overflow-y-auto rounded border border-[#ccc] bg-[#fafafa] p-4 select-none md:max-h-[calc(100vh-8rem)] md:rounded-none md:border-transparent md:bg-transparent">
          {!query && (
            <p className="font-dot my-2 text-center text-xl font-bold select-none">
              Featured
            </p>
          )}
          {mode === "works" ? (
            workResults.length ? (
              <ul className="space-y-2">
                {workResults.map((work) => (
                  <WorkSearchResultItem
                    key={work.id}
                    work={work}
                    onSelect={handleSelectWork}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">
                作品が見つかりませんでした
              </p>
            )
          ) : blogResults.length ? (
            <ul className="space-y-2">
              {blogResults.map((article) => (
                <BlogSearchResultItem
                  key={article.id}
                  article={article}
                  onSelect={() => setIsOpen(false)}
                />
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              記事が見つかりませんでした
            </p>
          )}
        </div>
      )}
    </div>
  );
}
