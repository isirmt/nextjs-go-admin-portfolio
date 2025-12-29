import type { Metadata } from "next";
import "./globals.css";
import { notoSansJp } from "@/lib/fonts";
import ScrollbarWidthSetter from "@/components/scrollbarWidthSetter";

export const metadata: Metadata = {
  title: "isirmt - 色彩と体験 | 入本聖也",
  description: "isirmtのポートフォリオサイト。制作物を掲載しています。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
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
