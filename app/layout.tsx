import type { Metadata, Viewport } from "next";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { asset } from "@/lib/assets";
import "@fontsource/vazirmatn/arabic-400.css";
import "@fontsource/vazirmatn/arabic-500.css";
import "@fontsource/vazirmatn/arabic-600.css";
import "./globals.css";
const hasCustomFont = existsSync(
  resolve(process.cwd(), "public/fonts/mahboubeh-mehravar.woff2"),
);
const fontCss = hasCustomFont
  ? `@font-face{font-family:'Mahboubeh Mehravar';src:url('${asset("/fonts/mahboubeh-mehravar.woff2")}') format('woff2');font-weight:400 600;font-style:normal;font-display:swap;}body{--font-site:'Mahboubeh Mehravar';}`
  : "";
export const metadata: Metadata = {
  title: "مشکات | نامه‌ای برای تو",
  description:
    "یک نامهٔ تعاملی برای مشکات، از امین. تصاویر و نوشته‌های نمایشی، آماده برای شخصی‌سازی.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4eee4",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {fontCss && <style>{fontCss}</style>}
        {children}
      </body>
    </html>
  );
}
