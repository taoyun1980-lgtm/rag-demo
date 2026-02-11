import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG 演示系统 - 深入理解检索增强生成",
  description: "可视化展示 RAG 工作原理的教学系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
