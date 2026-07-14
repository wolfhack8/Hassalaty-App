// src/app/kid/store/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Check } from 'lucide-react';

export default function KidStorePage() {
  const [points, setPoints] = useState<number>(120);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  const storeItems = [
    { id: 'reward_1', name: 'نصف ساعة لعب بلايستيشن إضافية 🎮', cost: 50, icon: '👾' },
    { id: 'reward_2', name: 'رحلة ممتعة لحديقة الألعاب 🎢', cost: 100, icon: '🎡' },
    { id: 'reward_3', name: 'تناول وجبتك المفضلة اليوم 🍔', cost: 40, icon: '🍟' },
  ];

  const handleBuy = (id: string, cost: number) => {
    if (points >= cost) {
      setPoints(prev => prev - cost);
      setPurchasedItems(prev => [...prev, id]);
      alert('تهانينا يا بطل! لقد حصلت على الجائزة، بانتظار تأكيد الوالد عليها! 🎉');
    } else {
      alert('رصيد نقاطك لا يكفي حالياً، العب المزيد من التحديات واجمع النقاط! 🪙');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link 
          href="/kid" 
          className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-bold text-sm transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          الرجوع إلى لوحة التحكم
        </Link>
        <div className="bg-amber-100 text-amber-800 font-extrabold text-xs px-3 py-1.5 rounded-full">
          النقاط المتوفرة لديك: {points} 🪙
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-500" />
          متجر الجوائز الكبرى 🎁
        </h3>
        <p className="text-slate-400 text-xs mb-6">استبدل نقاطك الذهبية التي كسبتها بجوائز حقيقية ومرحة توافق عليها عائلتك!</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {storeItems.map((item) => {
            const isOwned = purchasedItems.includes(item.id);
            return (
              <div key={item.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between items-center text-center gap-3 relative">
                <span className="text-4xl">{item.icon}</span>
                <h4 className="font-bold text-slate-700 text-sm leading-relaxed">{item.name}</h4>
                <span className="text-amber-600 font-extrabold text-xs">{item.cost} نقطة 🪙</span>
                
                <button
                  onClick={() => handleBuy(item.id, item.cost)}
                  disabled={isOwned}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${isOwned ? 'bg-emerald-100 text-emerald-700 cursor-default flex items-center justify-center gap-1' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'}`}
                >
                  {isOwned ? (
                    <>
                      <Check className="w-4 h-4" /> تم الطلب
                    </>
                  ) : 'استبدل الآن'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
