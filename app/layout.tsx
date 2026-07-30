import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/lib/providers/app-providers";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LogosFlow — 성경 연구 워크스페이스",
  description:
    "다중 번역 대조, 스트롱 원어 사전, 관주, AI 배경 해설까지 — 설교 준비와 깊이 있는 성경 연구를 위한 도구.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSerifKr.variable} h-full`} suppressHydrationWarning>
      <body className="h-full min-h-screen antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
