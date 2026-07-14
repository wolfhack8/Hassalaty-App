"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Brain } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface KidAssistantChatProps {
  childName: string;
  pointsBalance: number;
}

export default function KidAssistantChat({ childName, pointsBalance }: KidAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: `أهلاً بك يا بطل المالي ${childName}! 🌟 أنا كوتش ذُخر، صديقك ومساعدك الذكي في حصّالتي. هل تريد أن تسألني كيف توفر نقودك لشراء لعبة رائعة؟ أو تريد معرفة كيف تنمي نقاطك؟ أنا هنا للإجابة عليك بكل فرح ومرح! 🤖🪙` 
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          childName,
          pointsBalance
        }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: 'أهلاً بك يا بطل! يبدو أن ذكائي يسترخي قليلاً الآن، تذكر دائماً: توفير جزء بسيط اليوم يصنع حلماً كبيراً غداً! 😉🪙' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[550px] text-right" dir="rtl">
      
      {/* رأس المحادثة اللطيف */}
      <div className="bg-gradient-to-l from-emerald-500 to-teal-600 p-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-2xl">
            <Brain className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg flex items-center gap-1">
              كوتش ذُخر الذكي
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h3>
            <p className="text-emerald-100 text-xs">صديقك المالي المفضل لمستقبل مشرق</p>
          </div>
        </div>
        <div className="bg-emerald-600/50 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
          نقاطك الحالية: {pointsBalance} 🪙
        </div>
      </div>

      {/* مساحة عرض الرسائل التفاعلية */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white rounded-tl-none font-medium'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tr-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tr-none px-5 py-3.5 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* حقل إدخال الرسائل للأطفال */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اسأل كوتش ذُخر (مثال: كيف أوفر مالي لشراء دراجة؟)"
          disabled={loading}
          className="flex-grow px-4 py-3.5 border border-slate-200 focus:border-emerald-400 focus:outline-none rounded-2xl text-slate-700 text-sm md:text-base transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="w-5 h-5 -rotate-90" />
        </button>
      </form>

    </div>
  );
}
