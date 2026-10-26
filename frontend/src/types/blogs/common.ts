export type BlogArticleStatus = "draft" | "published";

export type BlogTag = {
  id: string;
  name: string;
  slug: string;
};

export type BlogSeriesLink = {
  id: string;
  title: string;
  slug: string;
};

export type BlogArticleSummary = {
  id: string;
  status: BlogArticleStatus;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_image_id: string | null;
  created_at: string;
  published_at: string | null;
  updated_at: string;
  tags: BlogTag[];
};

export type BlogArticle = BlogArticleSummary & {
  body_markdown: string;
  body_image_ids: string[];
  series: BlogSeriesLink[];
};

export type BlogSeries = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  articles: BlogArticleSummary[];
};
