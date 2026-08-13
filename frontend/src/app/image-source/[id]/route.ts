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
  const upstreamUrl = new URL(
    `/images/${encodeURIComponent(id)}/raw`,
    backendBaseUrl,
  );

  return fetch(upstreamUrl, {
    cache: "no-store",
    signal: request.signal,
  });
}
