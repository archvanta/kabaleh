import type { Metadata, Viewport } from "next";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { asset } from "@/lib/assets";
import "@fontsource/vazirmatn/arabic-400.css";
import "@fontsource/vazirmatn/arabic-500.css";
import "@fontsource/vazirmatn/arabic-600.css";
import "./globals.css";
import "./styles/book.css";
import "./styles/objects.css";
import "./styles/chrome.css";
const hasCustomFont = existsSync(
  resolve(process.cwd(), "public/fonts/mahboubeh-mehravar.woff2"),
);
const fontCss = hasCustomFont
  ? `@font-face{font-family:'Mahboubeh Mehravar';src:url('${asset("/fonts/mahboubeh-mehravar.woff2")}') format('woff2');font-weight:400 600;font-style:normal;font-display:swap;}body{--font-site:'Mahboubeh Mehravar';}`
  : "";
export const metadata: Metadata = {
  title:
    "KABALEH | \u0644\u0627\u0628\u0647 \u0644\u0627\u06CC \u0622\u0630\u0631",
  description:
    "\u06CC\u0647 \u062F\u0641\u062A\u0631 \u06A9\u0648\u0686\u06CC\u06A9 \u0627\u0632 \u062E\u0627\u0637\u0631\u0647 \u0647\u0627\u0645\u0648\u0646 \u0628\u0631\u0627\u06CC \u062A\u0648\u0644\u062F \u0645\u0634\u06A9\u0627\u062A",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4eee4",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {fontCss && <style>{fontCss}</style>}
        {children}
      </body>
    </html>
  );
}
