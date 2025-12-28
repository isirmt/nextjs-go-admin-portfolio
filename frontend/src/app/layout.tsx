import type { Metadata } from "next";
import "./globals.css";
import { notoSansJp } from "@/lib/fonts";
import ScrollbarWidthSetter from "@/components/scrollbarWidthSetter";

export const metadata: Metadata = {
  title: "isirmt(入本 聖也)",
  description: "isirmtのポートフォリオ",
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
      <body className={`${notoSansJp.variable} bg-white antialiased`}>
        <ScrollbarWidthSetter />
        {children}
      </body>
    </html>
  );
}
