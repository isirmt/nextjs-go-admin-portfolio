"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { delaGothicOne } from "@/lib/fonts";

type Options = {
  feedUrl: string;
};

type SiteOptions = {
  siteUrl: string;
  siteName: string;
  siteDescription: string;
  siteImagePath: string;
};

type FeedData = {
  title: string;
  link: string;
};

export function LatestNews({ feedUrl }: Options) {
  const [feedData, setFeedData] = useState<FeedData>();

  useEffect(() => {
    let isMounted = true;

    const fetchLatest = async () => {
      try {
        const res = await fetch(feedUrl, { cache: "no-store" });
        const xmlText = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "application/xml");
        const firstItem = xml.querySelector("item, entry");
        if (!firstItem) return;

        const title = firstItem.querySelector("title")?.textContent?.trim();
        const link = firstItem.querySelector("link")?.textContent?.trim();
        if (title && link && isMounted) {
          setFeedData({ title, link });
        }
      } catch (error) {
        console.error("Failed to load feed", error);
      }
    };

    fetchLatest();

    return () => {
      isMounted = false;
    };
  }, [feedUrl]);

  return (
    <div className="">
      {feedData?.title ? (
        <Link href={feedData.link}>{feedData.title}</Link>
      ) : (
        <div>データ取得に失敗しました&nbsp;&gt;&lt;</div>
      )}
    </div>
  );
}

export function InformationSite({
  siteUrl,
  feedUrl,
  siteName,
  siteImagePath,
  siteDescription,
}: SiteOptions & Options) {
  return (
    <div className="flex flex-col gap-2.5">
      <Link
        href={siteUrl}
        target="_blank"
        rel="noopener"
        className="flex flex-col gap-2.5"
      >
        <div className="aspect-1200/630 w-96 overflow-hidden rounded-lg">
          <Image
            src={siteImagePath}
            width={1200}
            height={630}
            alt={siteName + "_thumbnail"}
          />
        </div>
        <div className={`text-xl ${delaGothicOne.className}`}>{siteName}</div>
        <div className="font-bold">{siteDescription}</div>
      </Link>
      <div className={`text-center text-lg ${delaGothicOne.className}`}>
        新着情報
      </div>
      <LatestNews feedUrl={feedUrl} />
    </div>
  );
}
