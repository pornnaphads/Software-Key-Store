import type { Metadata } from "next";
import {
  Hanken_Grotesk,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import Providers from "@/components/Providers";

import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SoftKeyStore - ซอฟต์แวร์ลิขสิทธิ์แท้ ส่งคีย์ทันที",
    template: "%s | SoftKeyStore",
  },
  description:
    "เลือกซื้อซอฟต์แวร์ลิขสิทธิ์แท้ พร้อมจัดส่งคีย์อัตโนมัติและบริการช่วยเหลือตลอด 24 ชั่วโมง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${hankenGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <body className="app-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
