"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import KidAssistantChat from '@/components/KidAssistantChat';

export default function KidAssistantPage() {
  return (
    <div className="space-y-6">
      <Link 
        href="/kid" 
        className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 font-bold text-sm transition cursor-pointer"
      >
        <ArrowRight className="w-4 h-4" />
        الرجوع إلى لوحة التحكم
      </Link>
      
      <div>
        <KidAssistantChat 
          childName="أحمد" 
          pointsBalance={120} 
        />
      </div>
    </div>
  );
}
