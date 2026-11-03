import type { Metadata } from "next";
import "./globals.css";
import { notoSansJp } from "@/lib/fonts";
import ScrollbarWidthSetter from "@/components/public/scrollbarWidthSetter";
import { GoogleTagManager } from "@next/third-parties/google";
import { Noto_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="ja" className={cn("font-sans", notoSans.variable)}>
      {process.env.GOOGLE_TAG_MANAGER_ID && (
        <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER_ID} />
      )}
      <body
        className={`${notoSansJp.variable} overflow-x-hidden bg-white antialiased`}
      >
        <ScrollbarWidthSetter />
        {children}
      </body>
    </html>
  );
}
