// src/app/kid/layout.tsx
import React from 'react';
import Link from 'next/link';
import { Sparkles, Home } from 'lucide-react';

export default function KidLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-right p-4 md:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* رأس الصفحة الخاص بالطفل */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-400 to-orange-400 text-white p-2.5 rounded-2xl shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">أهلاً بك يا بطل! 🚀</h1>
              <p className="text-slate-400 text-xs">تعلم، العب، وحقق أهدافك الذكية في حصّالتك.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-50 border border-amber-100 text-amber-700 px-4 py-2 rounded-2xl font-extrabold text-sm flex items-center gap-1.5 shadow-sm">
              <span>رصيدك:</span>
              <span>120 🪙</span>
            </div>
            <Link href="/" className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition">
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
