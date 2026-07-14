"use client";

import React, { useState } from 'react';
import { PiggyBank, Heart, ShoppingBag, Trophy, MessageSquare, Gamepad2, Sparkles, Home } from 'lucide-react';
import Link from 'next/link';
import TriviaGame from '@/components/TriviaGame';
import KidAssistantChat from '@/components/KidAssistantChat';

export default function KidDashboard() {
  const [points, setPoints] = useState<number>(120); // رصيد نقاط الطفل الافتراضي للتجربة
  const [activeTab, setActiveTab] = useState<'dash' | 'game' | 'chat'>('dash');

  return (
    <main className="min-h-screen bg-slate-50 text-right p-4 md:p-8" dir="rtl">
      {/* رأس الصفحة للطفل */}
      <header className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-400 to-orange-400 text-white p-2.5 rounded-2xl shadow-md">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">أهلاً بك يا بطل! 🚀</h1>
            <p className="text-slate-400 text-xs">رصيدك المالي ممتع وذكي دائماً.</p>
          </div>
        </div>

        {/* أزرار التنقل السريعة للأطفال */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('dash')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition cursor-pointer ${activeTab === 'dash' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
          >
            حصالاتي الثلاثة
          </button>
          <button 
            onClick={() => setActiveTab('game')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition cursor-pointer ${activeTab === 'game' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
          >
            <Gamepad2 className="w-4 h-4 inline-block ml-1" />
            تحدي ذُخر
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition cursor-pointer ${activeTab === 'chat' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
          >
            <MessageSquare className="w-4 h-4 inline-block ml-1" />
            كوتش ذُخر
          </button>
        </div>

        {/* عدّاد نقاط الطفل ورابط العودة للرئيسية */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-100 text-amber-700 px-4 py-2 rounded-2xl font-extrabold text-sm flex items-center gap-1.5 shadow-sm">
            <span>رصيدك:</span>
            <span>{points} 🪙</span>
          </div>
          <Link href="/" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition">
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        {/* التبويب 1: لوحة الحصالات والميزانية */}
        {activeTab === 'dash' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* حصالة الادخار */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-500" />
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl w-fit mb-4">
                  <PiggyBank className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">حصالة الادخار (الأهداف)</h3>
                <p className="text-slate-400 text-xs mb-4">لجمع المال من أجل تحقيق أهدافك وأحلامك الكبيرة في المستقبل.</p>
                <span className="text-3xl font-black text-emerald-600">120.00 <span className="text-sm font-bold text-slate-500">ريال</span></span>
              </div>

              {/* حصالة الإنفاق */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-blue-500" />
                <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl w-fit mb-4">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">حصالة الإنفاق (اليومي)</h3>
                <p className="text-slate-400 text-xs mb-4">لشراء وجباتك، حلوياتك المفضلة، أو احتياجاتك اليومية الخفيفة.</p>
                <span className="text-3xl font-black text-blue-600">45.50 <span className="text-sm font-bold text-slate-500">ريال</span></span>
              </div>

              {/* حصالة العطاء */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-rose-500" />
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl w-fit mb-4">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">حصالة العطاء (المسؤولية)</h3>
                <p className="text-slate-400 text-xs mb-4">لمساعدة المحتاجين، أو شراء هدايا لطيفة لتقديمها لعائلتك وأصدقائك.</p>
                <span className="text-3xl font-black text-rose-600">15.00 <span className="text-sm font-bold text-slate-500">ريال</span></span>
              </div>

            </div>

            {/* الأهداف النشطة للطفل */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-right">
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
        )}

        {/* التبويب 2: لعبة التحدي المالي */}
        {activeTab === 'game' && (
          <div className="py-4">
            <TriviaGame 
              childId="default-child-id" 
              onPointsUpdated={(newTotal) => setPoints(newTotal)} 
            />
          </div>
        )}

        {/* التبويب 3: المحادثة التفاعلية مع الذكاء الاصطناعي */}
        {activeTab === 'chat' && (
          <div className="py-4">
            <KidAssistantChat 
              childName="أحمد" 
              pointsBalance={points} 
            />
          </div>
        )}
      </div>
    </main>
  );
}
