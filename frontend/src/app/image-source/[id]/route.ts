import { isAllowedEmail } from "@/lib/auth/allowedEmails";
import { auth } from "@/lib/auth/options";

type ImageSourceRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: ImageSourceRouteContext,
) {
  const backendBaseUrl = process.env.BACKEND_BASE_URL;
  if (!backendBaseUrl) {
    return new Response("Server configuration error", { status: 500 });
  }

  const { id } = await params;
  const session = await auth();
  const isAdmin =
    session?.user?.role === "admin" && isAllowedEmail(session.user.email);
  const upstreamUrl = new URL(
    `/images/${encodeURIComponent(id)}/raw`,
    backendBaseUrl,
  );

  return fetch(upstreamUrl, {
    headers:
      isAdmin && process.env.ADMIN_SECRET
        ? { "X-Admin-Secret": process.env.ADMIN_SECRET }
        : undefined,
    cache: "no-store",
    signal: request.signal,
  });
}
