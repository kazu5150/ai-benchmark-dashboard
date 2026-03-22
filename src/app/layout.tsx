import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "日本語AIベンチマーク比較ダッシュボード",
  description:
    "日本語LLMベンチマーク（JGLUE, RAKUDA, Nejumi, MT-Bench JP）の結果をインタラクティブに比較",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <Header />
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
