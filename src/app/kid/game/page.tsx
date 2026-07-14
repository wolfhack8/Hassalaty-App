"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import TriviaGame from '@/components/TriviaGame';

export default function KidGamePage() {
  const [points, setPoints] = useState<number>(120);

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
        <TriviaGame 
          childId="child_1" 
          onPointsUpdated={(newTotal) => setPoints(newTotal)} 
        />
      </div>
    </div>
  );
}
