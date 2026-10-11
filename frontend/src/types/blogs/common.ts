export type BlogArticleStatus = "draft" | "published";

export type BlogArticleSummary = {
  id: string;
  status: BlogArticleStatus;
  title: string;
  slug: string;
  thumbnail_image_id: string | null;
  created_at: string;
  published_at: string | null;
  updated_at: string;
};

export type BlogArticle = BlogArticleSummary & {
  body_markdown: string;
  body_image_ids: string[];
};
