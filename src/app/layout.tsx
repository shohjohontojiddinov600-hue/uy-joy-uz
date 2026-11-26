import type { Metadata } from "next";
import PhoneAuthGate from "@/components/PhoneAuthGate";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
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
      <body className="relative min-h-full flex flex-col font-sans bg-[#EEF2F8] text-slate-900 transition-colors duration-300 dark:bg-[#0B1120] dark:text-slate-100">
        {/* Zamonaviy Mesh-Gradient va Nuqtali (Dot-Pattern) Fon */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="bg-dot-pattern absolute inset-0 opacity-70 dark:opacity-50" />
          <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-[#3B82F6]/12 blur-3xl dark:bg-[#3B82F6]/15" />
          <div className="absolute -top-24 -right-28 h-[380px] w-[380px] rounded-full bg-[#6366F1]/10 blur-3xl dark:bg-[#6366F1]/15" />
          <div className="absolute top-1/2 left-1/3 h-[340px] w-[340px] rounded-full bg-[#10B981]/8 blur-3xl dark:bg-[#10B981]/10" />
        </div>

        <ThemeProvider>
          <ToastProvider>
            <PhoneAuthGate>{children}</PhoneAuthGate>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
