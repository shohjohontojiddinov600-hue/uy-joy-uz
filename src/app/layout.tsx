import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UyJoy.uz — Uy-Joy & Talabalar Ijarasi",
  description:
    "O'zbekiston bo'ylab sotiladigan uylar, kvartira ijarasi va talabalar yotoqxonalari platformasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
