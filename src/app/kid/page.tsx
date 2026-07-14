"use client";

import React, { useState } from "react";
import { ArrowUpRight, TrendingUp, Heart, Wallet, Plus, Coins } from "lucide-react";

export default function ChildDashboard() {
  // الأرصدة الافتراضية
  const [spending, setSpending] = useState(45.0);
  const [saving, setSaving] = useState(120.0);
  const [giving, setGiving] = useState(15.0);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const handleDeposit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    // قانون الحصالات الثلاث الذكي (50% إنفاق، 40% ادخار، 10% عطاء)
    setSpending((prev) => prev + numAmount * 0.5);
    setSaving((prev) => prev + numAmount * 0.4);
    setGiving((prev) => prev + numAmount * 0.1);

    setAmount("");
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* بطاقة الرصيد الإجمالي */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-xl shadow-emerald-100 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <p className="text-sm opacity-90">مجموع مدخراتك الذكية 💰</p>
        <h1 className="text-3xl font-extrabold mt-1">{(spending + saving + giving).toFixed(2)} ر.س</h1>

        <div className="mt-6 flex justify-between items-center bg-white/10 p-3 rounded-2xl">
          <p className="text-xs">رصيدك يحميك للمستقبل، واصل الادخار!</p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-white text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> أضف مصروفي
          </button>
        </div>
      </div>

      {/* عرض الصناديق الثلاثة التفاعلية */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-700 text-sm">صناديق حصالتي الذكية</h3>

        {/* 1. حصالة الإنفاق */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-700 text-sm">حصالة الإنفاق (50%)</h4>
              <p className="text-[10px] text-slate-400">لألعابك المفضلة ومشترياتك اليومية</p>
            </div>
          </div>
          <p className="font-extrabold text-blue-600 text-base">{spending.toFixed(2)} ر.س</p>
        </div>

        {/* 2. حصالة الادخار */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-700 text-sm">حصالة الادخار للأهداف (40%)</h4>
              <p className="text-[10px] text-slate-400">لشراء الأشياء الثمينة في المستقبل</p>
            </div>
          </div>
          <p className="font-extrabold text-amber-600 text-base">{saving.toFixed(2)} ر.س</p>
        </div>

        {/* 3. حصالة العطاء والصدقة */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-700 text-sm">حصالة العطاء والمساعدة (10%)</h4>
              <p className="text-[10px] text-slate-400">لمساعدة الآخرين وصنع الخير</p>
            </div>
          </div>
          <p className="font-extrabold text-rose-600 text-base">{giving.toFixed(2)} ر.س</p>
        </div>
      </div>

      {/* الـ Modal المخصص لإضافة مصروف وإعادة توزيعه برمجياً */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl text-right" dir="rtl">
            <h3 className="text-base font-bold text-slate-800 mb-2">أدخل مبلغ مصروفك اليومي 🪙</h3>
            <p className="text-xs text-slate-400 mb-4">
              سيقوم نظام ذخر بتقسيم المبلغ تلقائياً لحمايتك وتعليمك التخطيط المالي الذكي.
            </p>
            <input
              type="number"
              placeholder="مثال: 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-center py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeposit}
                className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 transition cursor-pointer"
              >
                توزيع وتقسيم الرصيد
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
