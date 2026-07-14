// src/app/kid/layout.tsx
import React from 'react';

export default function KidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-slate-50 to-emerald-50/20 text-slate-800" dir="rtl">
      {children}
    </div>
  );
}
