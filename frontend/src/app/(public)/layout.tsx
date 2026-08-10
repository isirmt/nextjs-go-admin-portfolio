import type { Metadata } from "next";
import Footer from "@/components/footer";
import React from "react";
import Header from "@/components/header";

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
    <React.Fragment>
      <Header />
      {children}
      <Footer />
    </React.Fragment>
  );
}
