"use client";

import {
  IconBrandFacebook,
  IconBrandX,
  IconExternalLink,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

type BlogArticleShareProps = {
  title: string;
};

export default function BlogArticleShare({ title }: BlogArticleShareProps) {
  const [shareURL, setShareURL] = useState("");

  useEffect(() => {
    setShareURL(window.location.href);
  }, []);

  const shareArticle = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareURL });
        return;
      }
    } catch {}
  };

  const encodedURL = encodeURIComponent(shareURL);
  const encodedTitle = encodeURIComponent(title);

  return (
    <section className="flex w-full flex-col gap-2 px-3 py-4">
      <p className="font-noto text-center text-sm font-semibold text-[#555] select-none">
        ＼&nbsp;記事をシェア&nbsp;／
      </p>
      <div className="flex w-full items-center justify-center gap-2 text-center">
        <a
          className="block cursor-pointer text-gray-500 transition-colors hover:text-black"
          href={`https://x.com/intent/post?url=${encodedURL}&text=${encodedTitle}`}
          target="_blank"
          rel="noreferrer"
          title="Xでシェア"
        >
          <IconBrandX className="size-8" />
        </a>
        <a
          className="block cursor-pointer text-gray-500 transition-colors hover:text-[#1877f2]"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`}
          target="_blank"
          rel="noreferrer"
          title="Facebookでシェア"
        >
          <IconBrandFacebook className="size-8" />
        </a>
        <button
          className="block cursor-pointer text-gray-500 transition-colors hover:text-[#ab4bfa]"
          type="button"
          onClick={shareArticle}
          title="共有する"
        >
          <IconExternalLink className="size-8" />
        </button>
      </div>
    </section>
  );
}
