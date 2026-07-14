"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Trophy, TrendingUp } from 'lucide-react';
import AIParentInsights from '@/components/AIParentInsights';

export default function ChildReportPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;

  // محاكاة جلب بيانات الطفل المختار بناءً على الـ ID
  const childrenDb: Record<string, { name: string, points: number, savings: number }> = {
    'child_1': { name: 'أحمد', points: 120, savings: 180.5 },
    'child_2': { name: 'سارة', points: 90, savings: 110.0 },
  };

  const child = childrenDb[childId] || { name: 'بطلنا الصغير', points: 0, savings: 0 };

  return (
    <div className="space-y-6">
      {/* زر العودة للوحة الآباء الرئيسية */}
      <button 
        onClick={() => router.push('/parent')}
        className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-bold text-sm transition cursor-pointer"
      >
        <ArrowRight className="w-4 h-4" />
        الرجاء اختيار طفل آخر
      </button>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">تقرير المراقبة المباشر لـ: {child.name}</h2>
            <p className="text-slate-400 text-xs">البيانات تعكس السلوك المالي الفعلي للطفل داخل التطبيق.</p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            نشط الآن
          </span>
        </div>

        {/* كروت تفاصيل مدخرات الطفل */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs block mb-1">الرصيد الادخاري الكلي</span>
              <span className="text-2xl font-black text-slate-800">{child.savings} ريال</span>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500 opacity-80" />
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs block mb-1">حصيلة النقاط المكتسبة</span>
              <span className="text-2xl font-black text-slate-800">{child.points} نقطة</span>
            </div>
            <Trophy className="w-8 h-8 text-amber-500 opacity-80" />
          </div>
        </div>

        {/* التحليلات والتوصيات الذكية */}
        <div className="border-t border-slate-100 pt-6">
          <AIParentInsights 
            childId={childId} 
            childName={child.name} 
          />
        </div>
      </div>
    </div>
  );
}
