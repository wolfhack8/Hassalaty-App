"use client";

import React from 'react';
import Link from 'next/link';
import { PiggyBank, Heart, ShoppingBag, Trophy, MessageSquare, Gamepad2, ShoppingCart } from 'lucide-react';

export default function KidDashboardPage() {
  return (
    <div className="space-y-8">
      {/* قائمة الخيارات والمسارات الإضافية للطفل */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/kid/assistant" 
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="text-right">
              <h4 className="font-bold text-sm md:text-base">دردش مع كوتش ذُخر</h4>
              <p className="text-white/80 text-xs">اسألني أي سؤال عن الادخار والمال!</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/kid/game" 
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div className="text-right">
              <h4 className="font-bold text-sm md:text-base">تحدي ذُخر المالي</h4>
              <p className="text-white/80 text-xs">العب وجاوب على الأسئلة واكسب نقاطاً!</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/kid/store" 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="text-right">
              <h4 className="font-bold text-sm md:text-base">متجر الجوائز</h4>
              <p className="text-white/80 text-xs">استبدل نقاطك الذهبية بمكافآت مذهلة!</p>
            </div>
          </div>
        </Link>
      </div>

      {/* عرض الحصالات الثلاثة الموزعة بالتساوي */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* حصالة الادخار */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-500" />
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl w-fit mb-4">
            <PiggyBank className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">حصالة الادخار (الأهداف)</h3>
          <p className="text-slate-400 text-xs mb-4">لجمع المال من أجل تحقيق أهدافك وأحلامك الكبيرة في المستقبل.</p>
          <span className="text-3xl font-black text-emerald-600">120.00 <span className="text-sm font-bold text-slate-500">ريال</span></span>
        </div>

        {/* حصالة الإنفاق */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-blue-500" />
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl w-fit mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">حصالة الإنفاق (اليومي)</h3>
          <p className="text-slate-400 text-xs mb-4">لشراء وجباتك، حلوياتك المفضلة، أو احتياجاتك اليومية الخفيفة.</p>
          <span className="text-3xl font-black text-blue-600">45.50 <span className="text-sm font-bold text-slate-500">ريال</span></span>
        </div>

        {/* حصالة العطاء */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-rose-500" />
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl w-fit mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">حصالة العطاء (المسؤولية)</h3>
          <p className="text-slate-400 text-xs mb-4">لمساعدة الآخرين، أو تقديم هدايا لعائلتك وأصدقائك الرائعين.</p>
          <span className="text-3xl font-black text-rose-600">15.00 <span className="text-sm font-bold text-slate-500">ريال</span></span>
        </div>
      </div>

      {/* الهدف النشط للطفل */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          هدفي الكبير الحالي 🎯
        </h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl">
          <div>
            <h4 className="font-bold text-slate-700">شراء جهاز ألعاب نينتندو سويتش 🎮</h4>
            <p className="text-slate-400 text-xs mt-0.5">الهدف الكلي: 1200 ريال | تم ادخار 120 ريال حتى الآن في الصندوق.</p>
          </div>
          <div className="w-full md:w-1/3">
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-1">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '10%' }} />
            </div>
            <span className="text-xs text-slate-500 font-semibold">نسبة التقدم المنجزة: 10%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
