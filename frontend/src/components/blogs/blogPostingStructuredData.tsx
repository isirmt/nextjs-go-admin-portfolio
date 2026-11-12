import type { BlogArticle } from "@/types/blogs/common";
import type { BlogPosting, WithContext } from "schema-dts";

type BlogPostingStructuredDataProps = {
  article: Pick<
    BlogArticle,
    "slug" | "title" | "excerpt" | "published_at" | "updated_at"
  >;
};

export default function BlogPostingStructuredData({
  article,
}: BlogPostingStructuredDataProps) {
  const baseUrl = (process.env.NEXTAUTH_URL || "https://isirmt.com").replace(
    /\/$/,
    "",
  );
  const articleUrl = `${baseUrl}/blogs/${encodeURIComponent(article.slug)}`;
  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    image: [`${articleUrl}/og-image`],
    ...(article.published_at && { datePublished: article.published_at }),
    dateModified: article.updated_at,
    author: {
      "@type": "Person",
      name: "isirmt",
      url: baseUrl,
    },
  } satisfies WithContext<BlogPosting>;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(blogPosting).replace(/</g, "\\u003c"),
      }}
    />
  );
}
