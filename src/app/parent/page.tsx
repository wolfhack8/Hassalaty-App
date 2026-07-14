"use client";

import React from 'react';
import Link from 'next/link';
import { Users, Plus, ArrowLeft, TrendingUp, Award, DollarSign } from 'lucide-react';

// بيانات تجريبية لمحاكاة الأبناء المضافين
const mockChildren = [
  { id: '1', name: 'أحمد', savings: 180.5, points: 120, activeGoals: 1 },
  { id: '2', name: 'سارة', savings: 110.0, points: 90, activeGoals: 2 },
];

export default function ParentDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* رأس الصفحة */}
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">بوابة الآباء 🛡️</h1>
          <p className="text-slate-500 text-sm mt-1">تابع نمو الوعي المالي لأطفالك ووجههم نحو الادخار الذكي والمستدام.</p>
        </div>
        <Link 
          href="/" 
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all"
        >
          الرئيسية
        </Link>
      </header>

      {/* ملخص إحصاءات العائلة السريع */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block">إجمالي مدخرات الأبناء</span>
            <span className="text-xl font-extrabold text-slate-800">290.50 ريال</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block">مجموع نقاط التحديات</span>
            <span className="text-xl font-extrabold text-slate-800">210 نقطة 🪙</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block">الأهداف النشطة حالياً</span>
            <span className="text-xl font-extrabold text-slate-800">3 أهداف</span>
          </div>
        </div>
      </div>

      {/* لوحة إدارة الأبناء */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            أبنائي المضافين
          </h2>
          <button className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            إضافة طفل جديد
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockChildren.map((child) => (
            <div 
              key={child.id} 
              className="bg-slate-50 border border-slate-100 hover:border-emerald-200 p-6 rounded-2xl flex flex-col justify-between h-44 transition-all hover:shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{child.name}</h3>
                  <p className="text-slate-400 text-xs mt-1">الأهداف النشطة: {child.activeGoals}</p>
                </div>
                <span className="bg-emerald-100/60 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                  مستمر في الادخار 📈
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200/60 pt-4 mt-4">
                <div className="flex gap-4">
                  <div>
                    <span className="text-slate-400 text-[10px] block">الرصيد</span>
                    <span className="text-sm font-extrabold text-slate-700">{child.savings} ريال</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">النقاط</span>
                    <span className="text-sm font-extrabold text-slate-700">{child.points} 🪙</span>
                  </div>
                </div>
                <Link 
                  href={`/parent/child/${child.id}`}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
                >
                  عرض التفاصيل والتحليلات
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
