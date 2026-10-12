import { createBlogOpenGraphImageResponse } from "@/lib/blogs/openGraphImage";

export const alt = "isirmt ブログ";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const runtime = "nodejs";
export const revalidate = 1200;

type OpenGraphImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { slug } = await params;
  return createBlogOpenGraphImageResponse(slug);
}
