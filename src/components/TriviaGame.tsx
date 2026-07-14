"use client";

import React, { useState } from 'react';
import { Award, Check, X, Sparkles, Trophy, Gamepad2, Play, RefreshCw, ArrowRight } from 'lucide-react';

interface Question {
  id: number;
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
}

// قائمة الأسئلة التعليمية المالية المصممة للأطفال في منصة حصالتي
const QUESTIONS: Question[] = [
  {
    id: 1,
    questionText: "عند استلام مصروفك الأسبوعي، ما هو أفضل تصرف تقوم به؟",
    options: [
      { text: "إنفاقه كاملاً على الحلويات والألعاب في أول يوم 🍭", isCorrect: false },
      { text: "تقسيمه بذكاء بين صناديق حصالتي (إنفاق، ادخار، عطاء) 🪙", isCorrect: true },
      { text: "تخبئة الأموال في درج سري وعدم الاستمتاع بها أبداً 🤫", isCorrect: false }
    ],
    explanation: "تقسيم المصروف بذكاء يساعدك على شراء ما تحتاج إليه، وجمع المال لأهدافك الكبيرة، ومساعدة من تحبهم أيضاً!"
  },
  {
    id: 2,
    questionText: "ما هي فائدة حصالة 'صندوق الادخار للأهداف'؟",
    options: [
      { text: "تجميع الأموال لشراء غرض ثمين في المستقبل مثل دراجة أو جهاز ألعاب 🚲🎮", isCorrect: true },
      { text: "شراء المشروبات الغازية اليومية 🥤", isCorrect: false },
      { text: "صندوق نجمع فيه الأوراق القديمة فقط 📄", isCorrect: false }
    ],
    explanation: "صندوق الادخار يساعدك على الصبر وجمع المبالغ تدريجياً لتحقيق أحلامك الكبيرة بمجهودك الرائع."
  },
  {
    id: 3,
    questionText: "أنت تريد شراء لعبة تكلفتها 20 ريالاً، ومصروفك اليومي 5 ريالات، كم يوماً تحتاج للادخار إذا وفرت ريالين كل يوم؟",
    options: [
      { text: "5 أيام 🗓️", isCorrect: false },
      { text: "10 أيام 🗓️", isCorrect: true },
      { text: "30 يوماً 🗓️", isCorrect: false }
    ],
    explanation: "صحيح! بتوفير ريالين كل يوم لمدة 10 أيام، ستجمع 20 ريالاً (2 × 10 = 20) وتستطيع شراء لعبتك المفضلة."
  },
  {
    id: 4,
    questionText: "لماذا يحتوي تطبيق حصالتي على صندوق يسمى 'صندوق العطاء ومسؤوليتي'؟",
    options: [
      { text: "للشراء من المطاعم الفاخرة 🍔", isCorrect: false },
      { text: "للتبرع ومساعدة الآخرين، والمشاركة في الأعمال الخيرية الطيبة 🤝🤍", isCorrect: true },
      { text: "لادخار المال لشراء تذاكر السينما 🎬", isCorrect: false }
    ],
    explanation: "العطاء هو صفة الأبطال الحقيقيين! صندوق المسؤولية ينمي بداخلك حب مساعدة المحتاجين والتعاون مع عائلتك ومجتمعك."
  }
];

interface TriviaGameProps {
  childId: string;
  onPointsUpdated?: (newTotal: number) => void;
}

export default function TriviaGame({ childId, onPointsUpdated }: TriviaGameProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [savingPoints, setSavingPoints] = useState<boolean>(false);
  const [earnedPointsResult, setEarnedPointsResult] = useState<number>(0);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  const handleOptionSelect = (optionIdx: number) => {
    if (selectedOptionIndex !== null) return; // منع التحديد المزدوج
    setSelectedOptionIndex(optionIdx);
    setShowExplanation(true);
    
    if (currentQuestion.options[optionIdx].isCorrect) {
      setScore((prev) => prev + 10);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionIndex(null);
    setShowExplanation(false);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameFinished(true);
    setIsPlaying(false);
    setSavingPoints(true);

    const pointsEarned = score;
    setEarnedPointsResult(pointsEarned);

    try {
      // إرسال النقاط التي فاز بها الطفل وحفظها في قاعدة البيانات عبر الـ API
      const response = await fetch('/api/child/add-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          pointsEarned,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (onPointsUpdated) {
          onPointsUpdated(data.currentPoints);
        }
      }
    } catch (err) {
      console.error('Error auto-saving points:', err);
    } finally {
      setSavingPoints(false);
    }
  };

  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setShowExplanation(false);
    setGameFinished(false);
    setIsPlaying(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-right font-sans" dir="rtl">
      
      {/* 1. واجهة الترحيب وبدء اللعبة */}
      {!isPlaying && !gameFinished && (
        <div className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white rounded-3xl p-6 md:p-10 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-16 -translate-x-16 blur-2xl" />

          <div className="bg-white/20 p-4 rounded-full mb-6">
            <Gamepad2 className="w-12 h-12 text-white animate-bounce" />
          </div>

          <h2 className="text-3xl font-extrabold mb-3">تحدي ذُخر الذكي للوعي المالي! 🎮</h2>
          <p className="text-emerald-50 max-w-md text-sm md:text-base leading-relaxed mb-8">
            أهلاً بك يا بطل في لعبتنا الشيقة. أجب عن الأسئلة المالية بذكاء واجمع النقاط الذهبية لتشحن حصالتك وتشتري جوائزك المفضلة!
          </p>

          <button
            onClick={() => setIsPlaying(true)}
            className="px-8 py-4 bg-white hover:bg-slate-50 text-emerald-600 font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            ابدأ التحدي الآن
          </button>
        </div>
      )}

      {/* 2. واجهة الأسئلة النشطة */}
      {isPlaying && !gameFinished && currentQuestion && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl transition-all duration-300">
          
          {/* مؤشرات التقدم والدرجات */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <span className="text-slate-400 text-sm font-semibold">
              السؤال {currentQuestionIndex + 1} من {QUESTIONS.length}
            </span>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-sm">النقاط: {score} 🪙</span>
            </div>
          </div>

          {/* شريط التقدم الفعلي بصرياً */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-8">
            <div 
              className="bg-gradient-to-l from-emerald-400 to-teal-500 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* نص السؤال الرئيسي */}
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 leading-relaxed">
            {currentQuestion.questionText}
          </h3>

          {/* الخيارات التفاعلية للإجابة */}
          <div className="space-y-3.5 mb-6">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOptionIndex === idx;
              const isCorrect = option.isCorrect;
              
              let buttonStyle = "border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-300 text-slate-700";
              
              if (selectedOptionIndex !== null) {
                if (isCorrect) {
                  buttonStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-400/20";
                } else if (isSelected) {
                  buttonStyle = "bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-400/20";
                } else {
                  buttonStyle = "opacity-50 border-slate-100 text-slate-400 bg-white cursor-not-allowed";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={selectedOptionIndex !== null}
                  className={`w-full p-4 text-right rounded-2xl border-2 font-medium flex items-center justify-between transition-all duration-200 text-sm md:text-base ${buttonStyle} cursor-pointer`}
                >
                  <span>{option.text}</span>
                  {selectedOptionIndex !== null && isCorrect && (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {selectedOptionIndex !== null && isSelected && !isCorrect && (
                    <X className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* صندوق التوضيح والتعليق التعليمي */}
          {showExplanation && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 animate-[pulse_1s_ease-in-out_1]">
              <h4 className="text-blue-800 font-bold text-sm mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                تعلم مع كوتش ذُخر:
              </h4>
              <p className="text-blue-900/80 text-xs md:text-sm leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* زر المتابعة للسؤال التالي */}
          {selectedOptionIndex !== null && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              {currentQuestionIndex < QUESTIONS.length - 1 ? (
                <>
                  السؤال التالي
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'إنهاء اللعبة وحفظ النقاط'
              )}
            </button>
          )}

        </div>
      )}

      {/* 3. شاشة انتهاء اللعبة والفوز بالنقاط */}
      {gameFinished && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-xl text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-2">
            عمل رائع جداً يا بطل! 🎉
          </h2>
          <p className="text-slate-500 text-sm md:text-base mb-6 max-w-md">
            لقد أنهيت بنجاح أسئلة الوعي المالي اليوم واستمتعت مع التحديات المميزة.
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 w-full max-w-sm">
            <span className="text-slate-400 text-sm block mb-1">إجمالي النقاط المكتسبة</span>
            <span className="text-4xl font-extrabold text-emerald-600 block">
              +{earnedPointsResult} نقطة 🪙
            </span>
            {savingPoints ? (
              <span className="text-slate-400 text-xs block mt-2 animate-pulse">جاري شحن نقاطك في قاعدة البيانات...</span>
            ) : (
              <span className="text-emerald-500 text-xs block mt-2 font-medium">تم شحن الحصالة بنجاح وبشكل آمن!</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={restartGame}
              className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-500/10 cursor-pointer text-sm flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              العب مجدداً
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
