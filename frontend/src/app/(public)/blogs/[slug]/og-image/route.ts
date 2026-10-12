import {
  blogOpenGraphImageRevalidateSeconds,
  createBlogOpenGraphImageResponse,
} from "@/lib/blogs/openGraphImage";

export const runtime = "nodejs";
export const revalidate = blogOpenGraphImageRevalidateSeconds;

type BlogOpenGraphImageRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  _request: Request,
  { params }: BlogOpenGraphImageRouteProps,
) {
  const { slug } = await params;
  return createBlogOpenGraphImageResponse(slug);
}
