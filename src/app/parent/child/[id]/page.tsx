"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Heart, PiggyBank, ShoppingBag, Plus } from 'lucide-react';
import AIParentInsights from '@/components/AIParentInsights';

interface ChildDetailProps {
  params: { id: string };
}

export default function ChildDetailPage({ params }: ChildDetailProps) {
  // محاكاة جلب تفاصيل الطفل والبيانات المالية من الـ ID البرمجي
  const childData = {
    id: params.id,
    name: params.id === '1' ? 'أحمد' : 'سارة',
    points: params.id === '1' ? 120 : 90,
    savings: {
      save: params.id === '1' ? 120 : 70,
      spend: params.id === '1' ? 45.5 : 30,
      give: params.id === '1' ? 15 : 10,
    },
    goals: [
      { title: "جهاز نينتندو سويتش 🎮", current: 120, target: 1200, percent: 10 }
    ]
  };

  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [walletType, setWalletType] = useState('save');

  const handleAddAllowance = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`تم بنجاح إيداع مبلغ ${addMoneyAmount} ريال في حصالة (${walletType === 'save' ? 'الادخار' : walletType === 'spend' ? 'الإنفاق' : 'العطاء'}) للطفل ${childData.name}! 🎉`);
    setAddMoneyAmount('');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* العودة للخلف */}
      <div className="mb-6">
        <Link 
          href="/parent" 
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm font-semibold transition"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى لوحة تحكم الوالدين
        </Link>
      </div>

      {/* الهيدر وبطاقة الإيداع السريع */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">تقرير المراقبة لـ {childData.name}</h1>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {childData.points} نقطة 🪙
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">تاريخ آخر نشاط على الحصالة: اليوم</p>
        </div>

        {/* نموذج سريع لتشجيع الطفل بالمكافآت المالية */}
        <form onSubmit={handleAddAllowance} className="flex items-center gap-2 w-full md:w-auto bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <input 
            type="number" 
            placeholder="المبلغ (ريال)"
            value={addMoneyAmount}
            onChange={(e) => setAddMoneyAmount(e.target.value)}
            required
            className="bg-white text-sm px-3 py-2 rounded-xl border border-slate-200 outline-none w-24 text-center font-bold"
          />
          <select 
            value={walletType} 
            onChange={(e) => setWalletType(e.target.value)}
            className="bg-white text-xs px-2 py-2 rounded-xl border border-slate-200 text-slate-600 outline-none"
          >
            <option value="save">ادخار</option>
            <option value="spend">إنفاق</option>
            <option value="give">عطاء</option>
          </select>
          <button 
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* رصيد الحصالات الثلاثية للطفل */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit mb-3">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h4 className="text-slate-500 text-xs font-bold">صندوق الادخار (الأهداف)</h4>
          <p className="text-2xl font-black text-emerald-600 mt-2">{childData.savings.save} ريال</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl w-fit mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="text-slate-500 text-xs font-bold">صندوق الإنفاق (اليومي)</h4>
          <p className="text-2xl font-black text-blue-600 mt-2">{childData.savings.spend} ريال</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl w-fit mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h4 className="text-slate-500 text-xs font-bold">صندوق العطاء (المجتمع)</h4>
          <p className="text-2xl font-black text-rose-600 mt-2">{childData.savings.give} ريال</p>
        </div>
      </div>

      {/* قائمة أهداف الطفل */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-8">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          أهداف الطفل الحالية 🎯
        </h3>
        {childData.goals.map((goal, idx) => (
          <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-700">{goal.title}</h4>
              <p className="text-slate-400 text-xs mt-1">المحقق: {goal.current} ريال من أصل {goal.target} ريال</p>
            </div>
            <div className="w-full md:w-1/3">
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-1">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${goal.percent}%` }} />
              </div>
              <span className="text-xs text-slate-500 font-semibold">{goal.percent}% تم تحقيقه</span>
            </div>
          </div>
        ))}
      </div>

      {/* دمج توليد التحليلات بالذكاء الاصطناعي للأب والأم */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <AIParentInsights childId={childData.id} childName={childData.name} />
      </div>
    </div>
  );
}
