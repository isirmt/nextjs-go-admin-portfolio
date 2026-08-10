import {
  Shippori_Mincho_B1,
  Caveat,
  Noto_Sans_JP,
  Pixelify_Sans,
  DotGothic16,
  Dela_Gothic_One,
  Smooch_Sans,
  Kiwi_Maru,
} from "next/font/google";

// 既定のフォント
export const shipporiMincho = Shippori_Mincho_B1({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
});

export const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const caveat = Caveat({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify-sans",
  subsets: ["latin"],
});

export const dotGothic16 = DotGothic16({
  weight: ["400"],
  subsets: ["latin"],
});

export const delaGothicOne = Dela_Gothic_One({
  weight: ["400"],
  subsets: ["latin"],
});

export const smoochSans = Smooch_Sans({
  weight: ["400"],
  subsets: ["latin"],
});

export const kiwiMaru = Kiwi_Maru({
  variable: "--font-kiwi-maru",
  weight: ["400", "500"],
  subsets: ["latin"],
});
