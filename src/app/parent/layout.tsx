import React from 'react';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" dir="rtl">
      {children}
    </div>
  );
}
