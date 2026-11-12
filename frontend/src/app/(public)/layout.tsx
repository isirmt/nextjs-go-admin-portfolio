import type { Metadata } from "next";
import Footer from "@/components/public/footer";
import React from "react";
import Header from "@/components/public/header";

export const metadata: Metadata = {
  title: {
    default: "isirmt(入本 聖也)",
    template: "%s | isirmt",
  },
  description: "isirmtのポートフォリオ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.Fragment>
      <Header />
      {children}
      <Footer />
    </React.Fragment>
  );
}
