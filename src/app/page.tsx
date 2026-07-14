import Link from 'next/link';
import { Shield, Sparkles, PiggyBank } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 bg-emerald-100/80 text-emerald-800 font-bold text-sm px-4 py-1.5 rounded-full mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
          مرحباً بك في حصّالتي
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          نصنع جيلاً ذكياً <span className="text-emerald-500">مالياً</span> 🪙
        </h1>
        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
          تطبيق تفاعلي ممتع يعلم الأطفال مهارات الادخار، الإنفاق الذكي، والمسؤولية المجتمعية من خلال التلعيب ومساعد الذكاء الاصطناعي وبمراقبة من الوالدين.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
        {/* خيار الآباء */}
        <Link 
          href="/parent" 
          className="group bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-emerald-300 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200 text-right flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-50 rounded-full -translate-x-6 -translate-y-6 opacity-40 group-hover:scale-125 transition-transform duration-300" />
          <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-2xl w-fit">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">بوابة الآباء</h3>
            <p className="text-slate-500 text-xs md:text-sm">تابع مصروفات طفلك اليومية، واطلع على تقارير وتوصيات كوتش ذُخر التربوية المخصصة.</p>
          </div>
        </Link>

        {/* خيار الأطفال */}
        <Link 
          href="/kid" 
          className="group bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-amber-300 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200 text-right flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-24 h-24 bg-amber-50 rounded-full -translate-x-6 -translate-y-6 opacity-40 group-hover:scale-125 transition-transform duration-300" />
          <div className="bg-amber-100 text-amber-600 p-3.5 rounded-2xl w-fit">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-amber-700 transition-colors">بوابة الأطفال</h3>
            <p className="text-slate-500 text-xs md:text-sm">قسم حصالاتك الثلاثة (ادخار، إنفاق، عطاء)، العب التحديات الممتعة، ودردش مع كوتش ذُخر.</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
