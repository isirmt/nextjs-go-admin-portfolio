import { isAllowedEmail } from "@/lib/auth/allowedEmails";
import { auth } from "@/lib/auth/options";
import { createBlogOpenGraphImageResponseFromArticle } from "@/lib/blogs/openGraphImage";
import type { BlogArticle } from "@/types/blogs/common";

const adminSecret = process.env.ADMIN_SECRET;
const backendBaseUrl = process.env.BACKEND_BASE_URL;

type ConsoleBlogOpenGraphImageRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: ConsoleBlogOpenGraphImageRouteProps,
) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (!isAllowedEmail(session.user?.email) || session.user?.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }
  if (!adminSecret || !backendBaseUrl) {
    return new Response("Server configuration error", { status: 500 });
  }

  const { id } = await params;
  const response = await fetch(
    new URL(`/blogs/${encodeURIComponent(id)}`, backendBaseUrl),
    {
      headers: { "X-Admin-Secret": adminSecret },
      cache: "no-store",
    },
  );
  if (!response.ok) return new Response("Not Found", { status: 404 });

  const article = (await response.json()) as BlogArticle;
  return createBlogOpenGraphImageResponseFromArticle(
    article,
    "private, no-store",
  );
}
