"use client";
import { signIn } from "next-auth/react";
import { Sparkles, Apple, Chrome, Play } from "lucide-react";

export default function LoginPage() {
  const login = (provider: string) => signIn(provider, { callbackUrl: "/" });
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d8f5a2,transparent_35%),linear-gradient(135deg,#f8fbf6,#e4f6eb)] p-6">
    <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl md:grid-cols-2">
      <div className="bg-[#0d684c] p-10 text-white"><div className="flex items-center gap-2 text-xl font-black"><Sparkles /> حصالتي</div><h1 className="mt-20 text-4xl font-black leading-tight">فلوسك الصغيرة،<br/>أحلامك الكبيرة</h1><p className="mt-5 max-w-sm leading-7 text-emerald-50">تعلّم الادخار والإنفاق الذكي عبر ألعاب وتحديات ممتعة، مع لوحة متابعة آمنة لولي الأمر.</p></div>
      <div className="flex flex-col justify-center p-8 md:p-14"><h2 className="text-3xl font-black">أهلًا بك</h2><p className="mt-2 text-slate-500">اختر طريقة الدخول المناسبة. حساب Google وApple ينشآن حساب ولي أمر افتراضيًا.</p><div className="mt-8 space-y-3">
        <button onClick={() => login("google")} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 p-4 font-bold hover:bg-slate-50"><Chrome size={20}/> المتابعة عبر Google</button>
        <button onClick={() => login("apple")} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 p-4 font-bold text-white"><Apple size={20}/> المتابعة عبر Apple</button>
        <div className="flex items-center gap-3 py-2 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200"/>أو<span className="h-px flex-1 bg-slate-200"/></div>
        <button onClick={() => login("credentials")} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#16a36f] p-4 font-bold text-white hover:bg-[#087f5b]"><Play size={20}/> دخول الحساب التجريبي</button>
      </div><p className="mt-6 text-center text-xs leading-5 text-slate-400">تحتاج مفاتيح Google وApple في ملف البيئة لتفعيلهما. الحساب التجريبي جاهز بعد تشغيل البذور.</p></div>
    </section>
  </main>;
}
