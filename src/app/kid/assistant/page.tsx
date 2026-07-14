"use client";

import React, { useState } from "react";
import { Sparkles, Send, Bot } from "lucide-react";

export default function AssistantPage() {
  const [chat, setChat] = useState([
    { sender: "bot", text: "أهلاً يا صديقي البطل! أنا كوتش ذُخر مستشارك المالي الذكي. كيف يمكنني مساعدتك اليوم لتصبح مستثمراً ناجحاً؟ 🚀" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setChat((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // محاكاة استجابة مخصصة ومصاغة للأطفال بناء على تساؤلاتهم
    setTimeout(() => {
      let botResponse = "رائع جداً! الاستثمار والادخار المبكر هما سر الثراء. حاول دائماً الحفاظ على حصالة الادخار لأهدافك الكبيرة.";
      
      if (input.includes("بلايستيشن") || input.includes("لعبة")) {
        botResponse = "حلم رائع! لشراء بلايستيشن أسرع، أنصحك بنقل 15% إضافية من مصروف الإنفاق اليومي إلى حصالة الادخار لتصل لهدفك بذكاء وسرعة! 🎮";
      } else if (input.includes("ادخار") || input.includes("ادخر")) {
        botResponse = "الادخار يعني تأجيل شراء الأشياء البسيطة الآن لشراء أشياء رائعة وبطلة جداً في المستقبل! 🌟";
      }

      setChat((prev) => [...prev, { sender: "bot", text: botResponse }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* الرأس */}
      <div className="bg-emerald-500 text-white p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-sm">كوتش ذُخر المالي 🤖</h3>
          <p className="text-[10px] opacity-80">معك خطوة بخطوة للوعي المالي</p>
        </div>
      </div>

      {/* منطقة الشات */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
              msg.sender === "bot"
                ? "bg-slate-100 text-slate-800 self-start rounded-tr-none"
                : "bg-emerald-500 text-white self-end rounded-tl-none"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-slate-100 rounded-2xl rounded-tr-none px-4 py-2 text-xs text-slate-400 animate-pulse">
            ذُخر يفكر في نصيحة مالية...
          </div>
        )}
      </div>

      {/* مدخل النص */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
        <input
          type="text"
          placeholder="اسأل ذُخر (مثال: كيف أشتري لعبتي المفضلة؟)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
