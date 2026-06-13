import type { Metadata } from "next";
import {
  Hanken_Grotesk,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import { auth } from "@/auth";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="th"
      className={`${hankenGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="app-body">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
