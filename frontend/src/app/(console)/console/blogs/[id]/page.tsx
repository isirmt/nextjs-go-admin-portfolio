import BlogArticleEditor from "@/components/console/blogArticleEditor";

type EditBlogArticlePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogArticlePage({
  params,
}: EditBlogArticlePageProps) {
  const { id } = await params;

  return <BlogArticleEditor articleId={id} />;
}
