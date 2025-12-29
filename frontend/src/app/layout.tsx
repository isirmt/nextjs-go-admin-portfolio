import type { Metadata } from "next";
import "./globals.css";
import { notoSansJp } from "@/lib/fonts";
import ScrollbarWidthSetter from "@/components/scrollbarWidthSetter";
import { GoogleTagManager } from "@next/third-parties/google";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const metadataBase = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    title: "isirmt - 色彩と体験 | 入本聖也",
    description: "isirmtのポートフォリオサイト。制作物を掲載しています。",
    metadataBase: new URL(metadataBase),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {process.env.GOOGLE_TAG_MANAGER_ID && (
        <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER_ID} />
      )}
      <head>
        <meta name="application-name" content="Folims" />
      </head>
      <body
        className={`${notoSansJp.variable} overflow-x-hidden bg-white antialiased`}
      >
        <ScrollbarWidthSetter />
        {children}
      </body>
    </html>
  );
}
