
"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Award, TrendingUp, CheckCircle, ChevronLeft, Lightbulb, Sparkles, RefreshCw } from 'lucide-react';

interface SuggestedChallenge {
  title: string;
  description: string;
  pointsReward: number;
}

interface AIReportData {
  summary: string;
  behaviorAnalysis: string;
  recommendations: string[];
  suggestedChallenge: SuggestedChallenge;
}

interface AIParentInsightsProps {
  childId: string;
  childName: string;
}

export default function AIParentInsights({ childId, childName }: AIParentInsightsProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<AIReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [challengeActivated, setChallengeActivated] = useState<boolean>(false);

  const fetchAIInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/parent-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      });
      
      if (!response.ok) throw new Error('تعذر جلب التقارير الذكية');
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, [childId]);

  const handleActivateChallenge = () => {
    setChallengeActivated(true);
    // محاكاة حفظ التحدي الموصى به في قاعدة بيانات الابن
    setTimeout(() => {
      alert(`تم إرسال تحدي "${report?.suggestedChallenge.title}" إلى لوحة تحكم ${childName} بنجاح!`);
    }, 300);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 text-right" dir="rtl">
      {/* رأس الصفحة والمحفز */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Brain className="w-7 h-7 text-emerald-500 animate-pulse" />
            تحليلات كوتش ذُخر الذكية لـ {childName}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            يقوم كوتش الذكاء الاصطناعي بمراقبة سلوك {childName} المالي وتقديم نصائح تربوية مخصصة لك.
          </p>
        </div>
        <button
          onClick={fetchAIInsights}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-2xl transition disabled:opacity-50 cursor-pointer text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث التحليل الذكي
        </button>
      </div>

      {/* شاشات التحميل والخطأ */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
            <Brain className="w-5 h-5 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 font-medium">يقوم كوتش ذُخر بتحليل المعاملات الادخارية والإنفاق حالياً...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700">
          <p className="font-semibold text-sm">عذراً، فشل الاتصال بالذكاء الاصطناعي:</p>
          <p className="text-xs mt-1">{error}</p>
          <button 
            onClick={fetchAIInsights} 
            className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* التقرير الذكي */}
      {report && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* العمود الرئيسي: التحليل السلوكي والتوصيات */}
          <div className="md:col-span-2 space-y-6">
            
            {/* ملخص ذكي للأداء */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-3xl p-5 md:p-6 shadow-sm">
              <h3 className="text-emerald-800 font-bold flex items-center gap-2 mb-2 text-lg">
                <Sparkles className="w-5 h-5" />
                ملخص أداء هذا الأسبوع
              </h3>
              <p className="text-emerald-900/90 leading-relaxed text-sm md:text-base">
                {report.summary}
              </p>
            </div>

            {/* التحليل السلوكي المفصل */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm">
              <h3 className="text-slate-800 font-bold text-lg flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-slate-500" />
                تحليل السلوك المالي لـ {childName}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {report.behaviorAnalysis}
              </p>
            </div>

            {/* توصيات الأبناء للآباء */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm">
              <h3 className="text-slate-800 font-bold text-lg flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                خطوات عمل وتوصيات مقترحة لك
              </h3>
              <div className="space-y-3">
                {report.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100/70 transition">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-slate-700 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* العمود الجانبي: التحدي الذكي المقترح */}
          <div className="md:col-span-1">
            <div className="bg-white border-2 border-amber-200/80 rounded-3xl p-5 md:p-6 shadow-md relative overflow-hidden h-full flex flex-col justify-between">
              
              {/* شريطة تجميلية ملونة للتحديات */}
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-l from-amber-400 to-orange-400" />
              
              <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    تحدي ذكي مقترح
                  </span>
                  <span className="text-amber-600 font-bold text-sm">
                    +{report.suggestedChallenge.pointsReward} نقطة 🪙
                  </span>
                </div>

                <h4 className="text-lg font-bold text-slate-800 mb-2">
                  {report.suggestedChallenge.title}
                </h4>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {report.suggestedChallenge.description}
                </p>
              </div>

              <div>
                {challengeActivated ? (
                  <div className="w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    تم تفعيل التحدي للابن
                  </div>
                ) : (
                  <button
                    onClick={handleActivateChallenge}
                    className="w-full py-3.5 bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl transition shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    أرسل وتحدَّ {childName} الآن
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <p className="text-slate-400 text-xs text-center mt-3">
                  سيظهر هذا التحدي مباشرة في شاشة الطفل لتشجيعه على التوفير.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
