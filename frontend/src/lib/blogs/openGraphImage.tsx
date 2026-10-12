import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getPublicBlogArticle } from "./publicApi";

export const blogOpenGraphImageRevalidateSeconds = 1200;

export const blogOpenGraphImageSize = {
  width: 1200,
  height: 630,
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
    { next: { revalidate: blogOpenGraphImageRevalidateSeconds } },
  );
  return response.ok && response.body ? response : null;
}

export async function createBlogOpenGraphImageResponse(slug: string) {
  const article = await getPublicBlogArticle(
    slug,
    blogOpenGraphImageRevalidateSeconds,
  );
  if (!article) return new Response("Not Found", { status: 404 });

  if (article.thumbnail_image_id) {
    const thumbnailResponse = await getThumbnailResponse(
      article.thumbnail_image_id,
    );
    if (thumbnailResponse) {
      const headers = new Headers({
        "Cache-Control": `public, max-age=${blogOpenGraphImageRevalidateSeconds}`,
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
  const response = new ImageResponse(
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
      ...blogOpenGraphImageSize,
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
  response.headers.set(
    "Cache-Control",
    `public, max-age=${blogOpenGraphImageRevalidateSeconds}`,
  );
  return response;
}
