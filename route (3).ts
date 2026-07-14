import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "حصالتي | الوعي المالي للصغار", description: "منصة تعليم مالي ذكية للأطفال بإشراف أولياء الأمور" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
