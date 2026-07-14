import React from 'react';
import Link from 'next/link';
import { Users, Home, LogOut } from 'lucide-react';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-right p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* هيدر صفحة الآباء الموحد */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">لوحة تحكم الوالدين 🛡️</h1>
              <p className="text-slate-400 text-xs">راقب السلوك المالي لأطفالك واطلع على تقارير الذكاء الاصطناعي الفورية.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/" className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition">
              <Home className="w-5 h-5" />
            </Link>
            <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer">
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
