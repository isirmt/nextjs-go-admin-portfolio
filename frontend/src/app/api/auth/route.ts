import { isAllowedEmail } from "@/lib/auth/allowedEmails";
import { auth } from "@/lib/auth/options";

const ADMIN_HEADER = "X-Admin-Secret";
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;

async function proxy(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiUrl = searchParams.get("api_url");
  const session = await auth();

  if (!session) return new Response("Unauthorized", { status: 401 });
  if (!apiUrl)
    return new Response("parameter(api_url) is required", { status: 400 });
  if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://"))
    return new Response("parameter(api_url) must be a relative path", {
      status: 400,
    });
  if (!isAllowedEmail(session.user?.email))
    return new Response("Forbidden", { status: 403 });

  if (!ADMIN_SECRET) {
    return new Response("server configuration error", { status: 500 });
  }
  if (!BACKEND_BASE_URL) {
    return new Response("server configuration error", { status: 500 });
  }

  const upstreamUrl = new URL(apiUrl, BACKEND_BASE_URL);

  const bodyAllowed = request.method !== "GET" && request.method !== "HEAD";
  const upstreamRequest = request.clone();
  const headers = new Headers(upstreamRequest.headers);
  headers.set(ADMIN_HEADER, ADMIN_SECRET); // secretをヘッダーに追加
  headers.delete("host");

  const fetchInit: RequestInit & { duplex?: "half" } = {
    method: upstreamRequest.method,
    headers,
    redirect: "manual",
  };
  if (bodyAllowed) {
    fetchInit.body = upstreamRequest.body;
    fetchInit.duplex = "half";
  }
  const upstreamResponse = await fetch(upstreamUrl, fetchInit);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: upstreamResponse.headers,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
