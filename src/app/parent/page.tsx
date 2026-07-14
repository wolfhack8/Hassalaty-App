"use client";

import React, { useState } from 'react';
import { Users, Plus, Home, LogOut, Heart } from 'lucide-react';
import Link from 'next/link';
import AIParentInsights from '@/components/AIParentInsights';

export default function ParentDashboard() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>('child_1');

  // بيانات افتراضية للأبناء لغرض المحاكاة السريعة والفعالة
  const children = [
    { id: 'child_1', name: 'أحمد', points: 120, savings: 180.5 },
    { id: 'child_2', name: 'سارة', points: 90, savings: 110.0 },
  ];

  const currentChild = children.find(c => c.id === selectedChildId);

  return (
    <main className="min-h-screen bg-slate-50 text-right p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* هيدر صفحة الآباء */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">لوحة تحكم الوالدين 🛡️</h1>
              <p className="text-slate-400 text-xs">راقب السلوك المالي لأطفالك واقرأ تقارير الذكاء الاصطناعي الفورية والموثوقة.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* العمود الجانبي لقائمة الأطفال */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm md:text-base">
                أبنائي المضافين
              </h3>
              
              <div className="space-y-2.5">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`w-full p-4 rounded-2xl text-right border transition-all cursor-pointer block ${selectedChildId === child.id ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700'}`}
                  >
                    <h4 className="font-bold text-sm md:text-base">{child.name}</h4>
                    <div className="flex justify-between items-center mt-2 opacity-90 text-xs">
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

          {/* مساحة العرض الرئيسية وتحليلات الذكاء الاصطناعي */}
          <div className="lg:col-span-3 space-y-6">
            {currentChild ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800">تقرير المراقبة المباشر لـ: {currentChild.name}</h2>
                    <p className="text-slate-400 text-xs">عرض فوري للحصالة ومؤشرات الأداء.</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1.5 rounded-full">
                    مراقب ونشط الآن
                  </span>
                </div>

                {/* كروت تفاصيل مدخرات الطفل المختار */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl text-right border border-slate-100">
                    <span className="text-slate-400 text-xs block mb-1">الرصيد الادخاري الكلي</span>
                    <span className="text-2xl font-black text-slate-800">{currentChild.savings} ريال</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-right border border-slate-100">
                    <span className="text-slate-400 text-xs block mb-1">حصيلة النقاط المكتسبة</span>
                    <span className="text-2xl font-black text-slate-800">{currentChild.points} نقطة 🪙</span>
                  </div>
                </div>

                {/* قسم تحليلات الذكاء الاصطناعي المتكامل */}
                <div className="border-t border-slate-100 pt-6">
                  <AIParentInsights 
                    childId={currentChild.id} 
                    childName={currentChild.name} 
                  />
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">الرجاء اختيار طفل من القائمة الجانبية لبدء التحليل والمتابعة.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
