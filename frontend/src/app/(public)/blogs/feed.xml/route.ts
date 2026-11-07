import Rss from "rss";
import { getPublicBlogArticles } from "@/lib/blogs/publicApi";

const feedRevalidateSeconds = 1200;

function getBaseUrl() {
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export async function GET() {
  const baseUrl = getBaseUrl();
  const feed = new Rss({
    title: "isirmtの新着投稿",
    description: "「isirmt」のブログ新着投稿フィード",
    feed_url: `${baseUrl}/blogs/feed.xml`,
    site_url: baseUrl,
    language: "ja",
  });
  const articles = await getPublicBlogArticles(
    undefined,
    feedRevalidateSeconds,
  );

  articles.forEach((article) => {
    feed.item({
      title: article.title,
      description: article.excerpt,
      url: `${baseUrl}/blogs/${encodeURIComponent(article.slug)}`,
      date: new Date(article.published_at ?? article.updated_at),
      guid: article.id,
    });
  });

  return new Response(feed.xml(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${feedRevalidateSeconds}, stale-while-revalidate=86400`,
      "Access-Control-Allow-Origin": "*",
    },
  });
}
