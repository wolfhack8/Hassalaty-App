import './globals.css'; 
import { Tajawal } from 'next/font/google';

const tajawal = Tajawal({ 
  subsets: ['arabic'], 
  weight: ['400', '500', '700', '800', '900'] 
});

export const metadata = {
  title: 'حصّالتي - الوعي المالي التفاعلي للأطفال',
  description: 'منصة عائلية تفاعلية لتنمية مهارات الادخار والإنفاق الذكي للأطفال تحت إشراف الآباء',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.className} bg-slate-50 text-slate-800 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
