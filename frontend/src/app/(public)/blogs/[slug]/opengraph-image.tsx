import {
  blogOpenGraphImageRevalidateSeconds,
  blogOpenGraphImageSize,
  createBlogOpenGraphImageResponse,
} from "@/lib/blogs/openGraphImage";

export const alt = "isirmt ブログ";
export const size = blogOpenGraphImageSize;
export const contentType = "image/png";
export const runtime = "nodejs";
export const revalidate = blogOpenGraphImageRevalidateSeconds;

type OpenGraphImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { slug } = await params;
  return createBlogOpenGraphImageResponse(slug);
}
