import backendApi from "@/lib/auth/backendFetch";
import type { CommonImage } from "@/types/images/common";

export async function uploadImage(
  file: File,
  fileName = file.name || "clipboard.png",
): Promise<CommonImage> {
  const formData = new FormData();
  formData.append("file", file, fileName);

  const response = await backendApi("/images", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error((await response.text()) || "アップロードに失敗しました");
  }

  return (await response.json()) as CommonImage;
}
