"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, ArrowLeft } from 'lucide-react';

export default function ParentDashboard() {
  const router = useRouter();

  // بيانات افتراضية للأبناء لغرض العرض والتحويل
  const children = [
    { id: 'child_1', name: 'أحمد', points: 120, savings: 180.5 },
    { id: 'child_2', name: 'سارة', points: 90, savings: 110.0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* قائمة الأطفال الجانبية */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm md:text-base">
            أبنائي المضافين
          </h3>
          
          <div className="space-y-2.5">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => router.push(`/parent/child/${child.id}`)}
                className="w-full p-4 rounded-2xl text-right border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 transition-all cursor-pointer block group"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm md:text-base group-hover:text-emerald-700">{child.name}</h4>
                  <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:-translate-x-1" />
                </div>
                <div className="flex justify-between items-center mt-2 opacity-95 text-xs text-slate-500">
                  <span>النقاط: {child.points} 🪙</span>
                  <span>الادخار: {child.savings} ريال</span>
                </div>
              </button>
            ))}
          </div>

          <button className="w-full mt-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer">
            <Plus className="w-4 h-4" />
            إضافة طفل جديد
          </button>
        </div>
      </div>

      {/* منطقة العرض الترحيبية البدئية */}
      <div className="lg:col-span-3">
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm h-full flex flex-col justify-center items-center">
          <Users className="w-16 h-16 text-emerald-200 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">أهلاً بك في بوابة العائلة ذُخر</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            الرجاء اختيار أحد أطفالك من القائمة الجانبية لعرض تقريره المالي المفصل وتحليلات الذكاء الاصطناعي المخصصة لسلوكه الادخاري.
          </p>
        </div>
      </div>
    </div>
  );
}
