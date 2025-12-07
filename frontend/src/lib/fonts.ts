import { Shippori_Mincho_B1, Caveat, Noto_Sans_JP } from "next/font/google";

// 既定のフォント
export const shipporiMincho = Shippori_Mincho_B1({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
});

export const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"]
})

export const caveat = Caveat({
  weight: ["400", "700"],
  subsets: ["latin"]
})