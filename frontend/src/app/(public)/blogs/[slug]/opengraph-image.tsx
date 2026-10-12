import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getPublicBlogArticle } from "@/lib/blogs/publicApi";

const imageRevalidateSeconds = 1200;

export const alt = "isirmt ブログ";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const runtime = "nodejs";
export const revalidate = imageRevalidateSeconds;

type OpenGraphImageProps = {
  params: Promise<{ slug: string }>;
};

const fontData = readFile(
  join(process.cwd(), "assets", "NotoSansJP-ExtraBold-Sub.ttf"),
);
const backgroundImageData = readFile(
  join(process.cwd(), "public", "ogp_back.png"),
  "base64",
);

async function getThumbnailResponse(imageId: string) {
  const backendBaseUrl = process.env.BACKEND_BASE_URL;
  if (!backendBaseUrl) return null;

  const response = await fetch(
    new URL(`/images/${encodeURIComponent(imageId)}/raw`, backendBaseUrl),
    { next: { revalidate: imageRevalidateSeconds } },
  );
  return response.ok && response.body ? response : null;
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { slug } = await params;
  const article = await getPublicBlogArticle(slug, imageRevalidateSeconds);
  if (!article) return new Response("Not Found", { status: 404 });

  if (article.thumbnail_image_id) {
    const thumbnailResponse = await getThumbnailResponse(
      article.thumbnail_image_id,
    );
    if (thumbnailResponse) {
      const headers = new Headers({
        "Cache-Control": `public, max-age=${imageRevalidateSeconds}`,
      });
      const contentLength = thumbnailResponse.headers.get("Content-Length");
      const contentType = thumbnailResponse.headers.get("Content-Type");
      if (contentLength) headers.set("Content-Length", contentLength);
      if (contentType) headers.set("Content-Type", contentType);

      return new Response(thumbnailResponse.body, { headers });
    }
  }

  const [font, backgroundImage] = await Promise.all([
    fontData,
    backgroundImageData,
  ]);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        color: "#222",
        backgroundImage: `url(data:image/png;base64,${backgroundImage})`,
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        fontSize: "50px",
        fontFamily: "NotoSansJP",
      }}
    >
      <div
        style={{
          width: "70%",
          lineHeight: "1.2",
          fontWeight: "bold",
        }}
      >
        {article.title}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "NotoSansJP",
          data: font,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
