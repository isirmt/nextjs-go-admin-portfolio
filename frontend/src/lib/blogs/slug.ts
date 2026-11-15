import type { BlogArticleSummary } from "@/types/blogs/common";

export function getTodayBlogSlugPrefix(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return `${values.year}${values.month}${values.day}`;
}

export function getNextBlogSlug(
  articles: BlogArticleSummary[],
  date = new Date(),
): string {
  const prefix = getTodayBlogSlugPrefix(date);
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  const sequence = articles.reduce((highest, article) => {
    const match = article.slug.match(pattern);
    if (!match) return highest;

    return Math.max(highest, Number(match[1]));
  }, 0);

  return `${prefix}-${sequence + 1}`;
}
