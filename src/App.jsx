import React, { useState } from 'react';
import { FaWallet, FaPiggyBank, FaHeart, FaTasks, FaRobot, FaUserShield, FaUserPlus, FaCheckCircle, FaPlus, FaArrowLeft } from 'react-icons/fa';

export default function App() {
  const [view, setView] = useState('landing'); 
  const [balances, setBalances] = useState({ spend: 120, save: 250, give: 40 });
  const [tasks, setTasks] = useState([
    { id: 1, title: 'ترتيب الغرفة والمطالعة لمدة ٢٠ دقيقة', reward: 15, status: 'pending' },
    { id: 2, title: 'مساعدة العائلة في تجهيز وجبة العشاء', reward: 10, status: 'completed' },
    { id: 3, title: 'حل واجب الرياضيات المنزلي بالكامل', reward: 20, status: 'approved' }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('');
  
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'أهلاً بك يا بطل! أنا كوتش المالي الخاص بك "ذُخر" من منصة حصالتي. كيف يمكنني مساعدتك اليوم في التخطيط لصناديقك المالية؟ 🪙✨' }
  ]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskReward) return;
    setTasks([...tasks, {
      id: Date.now(),
      title: newTaskTitle,
      reward: parseInt(newTaskReward),
      status: 'pending'
    }]);
    setNewTaskTitle('');
    setNewTaskReward('');
  };

  const completeTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const approveTask = (id, reward) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    setBalances({ ...balances, save: balances.save + reward });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput.trim();
    const newMessages = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMessages);
    setChatInput('');

    setTimeout(() => {
      let botResponse = "رائع جداً! تذكر دائماً أن تقسيم المال في منصة حصالتي بين الصناديق الثلاثة (الإنفاق، الادخار، العطاء) هو سر نجاحك المالي الذكي مستقبلاً! 💸🚀";
      
      if (userMsg.includes('ادخر') || userMsg.includes('أشتري') || userMsg.includes('هدف')) {
        botResponse = `حسب معدل ادخارك الحالي في صندوق الادخار بالحصالة (${balances.save} ريال)، أنت تسير بخطى ممتازة لتحقيق هدفك القادم! استمر وتجنب الصرف الاندفاعي المستهلك. 🎯`;
      } else if (userMsg.includes('صرف') || userMsg.includes('ألعاب')) {
        botResponse = `رصيد صندوق الإنفاق الحالي لديك هو ${balances.spend} ريال. أنصحك بعدم استهلاك أكثر من ٢٠ ريال اليوم حتى لا تنفد ميزانيتك الأسبوعية مبكراً! ⚠️`;
      } else if (userMsg.includes('تبرع') || userMsg.includes('عطاء')) {
        botResponse = "فخور بك جداً! صندوق العطاء الخاص بك ينمو، والتبرع والمساهمة المجتمعية يباركان في مالك ويصنعان منك قائداً مسؤولاً وعطاءً. 🌟❤️";
      }

      setMessages([...newMessages, { sender: 'bot', text: botResponse }]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased" dir="rtl">
      
      {/* هيدر المنصة العلوي */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
            <div className="bg-emerald-600 text-white p-2.5 rounded-2xl font-bold text-xl shadow-md shadow-emerald-600/20">حصـالتي</div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">منصة حصالتي <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">النسخة التجريبية MVP</span></span>
          </div>
          {view !== 'landing' && (
            <button onClick={() => setView('landing')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition font-medium">
              <FaArrowLeft className="text-xs" /> العودة للرئيسية
            </button>
          )}
        </div>
      </header>

      {/* 1. واجهة اختيار الأدوار (Landing Screen) */}
      {view === 'landing' && (
        <main className="flex-grow flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 leading-tight">الاستقلال المالي الموجّه لجيل الغد ✨</h1>
          <p className="text-lg text-slate-600 mb-12 max-w-xl">مرحباً بك في منصة "حصالتي". يرجى اختيار نوع واجهة الدخول لاستعراض تجربة المستشار المالي والتحكم العائلي لحظياً.</p>
          
          <div className="grid md:grid-cols-2 grid-cols-1 gap-8 w-full max-w-2xl">
            <div onClick={() => setView('parent')} className="bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-violet-500 cursor-pointer shadow-sm hover:shadow-xl transition-all group text-right">
              <div className="bg-violet-100 text-violet-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-violet-500 group-hover:text-white transition-all">
                <FaUserShield />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900">بوابة أولياء الأمور (الآباء)</h3>
              <p className="text-slate-600">متابعة الأرصدة، إسناد المهام المنزلية والموافقة على المكافآت والاطلاع على تقارير الذكاء الاصطناعي لنمو وعي طفلك.</p>
            </div>

            <div onClick={() => setView('child')} className="bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 cursor-pointer shadow-sm hover:shadow-xl transition-all group text-right">
              <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <FaUserPlus />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900">بوابة الأبناء (الطفل والمراهق)</h3>
              <p className="text-slate-600">إدارة الصناديق الثلاثة الذكية بحصالتك، إنجاز المهام لكسب المال، والتحدث المباشر مع كوتش التوجيه الذكي "ذُخر".</p>
            </div>
          </div>
        </main>
      )}

      {/* 2. بوابة أولياء الأمور (Parent Interface) */}
      {view === 'parent' && (
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-1">لوحة تحكم الأب: أ. أحمد عبد الله 👋</h2>
            <p className="text-violet-100 text-sm">مراقبة وإدارة أداء طفلك المالي في حصالتي: سـلمان (١٢ سنة)</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900"><FaTasks className="text-violet-500" /> لوحة إدارة المهام العائلية</h3>
              
              <form onSubmit={handleAddTask} className="grid grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl">
                <input type="text" placeholder="مثال: قراءة كتاب، تنظيف غرفتك..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="col-span-2 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 text-sm" />
                <div className="flex gap-2">
                  <input type="number" placeholder="المكافأة 💰" value={newTaskReward} onChange={(e) => setNewTaskReward(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 text-center text-sm" />
                  <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-xl transition flex items-center justify-center"><FaPlus /></button>
                </div>
              </form>

              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-slate-200 transition">
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm md:text-base">{task.title}</h4>
                      <span className="text-xs font-bold text-violet-600 mt-1 inline-block">المكافأة الحافزة: +{task.reward} ريال</span>
                    </div>
                    <div>
                      {task.status === 'pending' && <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-medium">في انتظار الإنجاز</span>}
                      {task.status === 'completed' && (
                        <button onClick={() => approveTask(task.id, task.reward)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-xl transition flex items-center gap-1">
                          <FaCheckCircle /> اعتماد وتحويل المكافأة
                        </button>
                      )}
                      {task.status === 'approved' && <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1"> تم تحويل المال للحصالة ✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-slate-900">📊 تحليل صرف الأرصدة الحالية للابن</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-medium"><span>صندوق الإنفاق (الاستهلاك الحالي)</span><span className="font-bold">{balances.spend} ريال</span></div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-orange-500 h-full rounded-full" style={{ width: '35%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-medium"><span>صندوق الادخار (الأهداف المستقبلية)</span><span className="font-bold">{balances.save} ريال</span></div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-violet-500 h-full rounded-full" style={{ width: '55%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-medium"><span>صندوق العطاء (المجتمع والخير)</span><span className="font-bold">{balances.give} ريال</span></div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: '10%' }}></div></div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
                <h3 className="text-md font-bold mb-2 flex items-center gap-2 text-emerald-800"><FaRobot /> تقرير كوتش ذُخر للأبناء في حصالتي</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">"سلمان يظهر وعياً متزايداً هذا الأسبوع، حيث قام بتحويل ٦٠٪ من عوائد المهام إلى صندوق الادخار لشراء مستلزماته التعليمية، قمنا بتوجيهه استباقياً لتقليل شراء الألعاب المكررة لتفادي استنزاف صندوق إنفاقه وحصاليته."</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 3. بوابة الأبناء (Child Interface) */}
      {view === 'child' && (
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-lg mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">محفظة البطل: سلمان عبد الله 🪙</h2>
              <p className="text-emerald-50 text-sm">تعلم، ادخر واصنع مستقبلك المالي الذكي برعاية منصة حصالتي</p>
            </div>
            <div className="text-left"><span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-medium">المستوى الذكي: ٢ 🔥</span></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl border-2 border-orange-100 shadow-sm text-center">
              <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4"><FaWallet /></div>
              <h3 className="text-slate-600 font-medium text-sm mb-1">صندوق الإنفاق المباشر</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">{balances.spend} ريال</div>
              <button onClick={() => setBalances({...balances, spend: Math.max(0, balances.spend - 10)})} className="w-full text-xs bg-orange-50 text-orange-600 font-bold py-2.5 rounded-xl hover:bg-orange-500 hover:text-white transition">شراء غرض استهلاكي (-١٠ ريال)</button>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-violet-100 shadow-sm text-center">
              <div className="bg-violet-100 text-violet-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4"><FaPiggyBank /></div>
              <h3 className="text-slate-600 font-medium text-sm mb-1">صندوق الادخار للحصالة</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">{balances.save} ريال</div>
              <div className="flex gap-2">
                <button onClick={() => { if(balances.spend >= 10) setBalances({spend: balances.spend - 10, save: balances.save + 10, give: balances.give}) }} className="w-full text-[11px] bg-violet-50 text-violet-600 font-bold py-2 rounded-xl hover:bg-violet-600 hover:text-white transition">ادخر من الإنفاق للحصالة (+١٠)</button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm text-center">
              <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4"><FaHeart /></div>
              <h3 className="text-slate-600 font-medium text-sm mb-1">صندوق العطاء والتبرع</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">{balances.give} ريال</div>
              <button onClick={() => { if(balances.spend >= 5) setBalances({spend: balances.spend - 5, save: balances.save, give: balances.give + 5}) }} className="w-full text-xs bg-emerald-50 text-emerald-600 font-bold py-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition">تبرع ومساهمة خيرية مجتمعية (+٥ ريال)</button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-slate-900">🎯 مهامي المطلوبة لكسب المال</h3>
              <div className="space-y-3">
                {tasks.filter(t => t.status !== 'approved').map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm">{task.title}</h4>
                      <span className="text-xs font-bold text-emerald-600 mt-0.5 inline-block">المكافأة: +{task.reward} ريال</span>
                    </div>
                    {task.status === 'pending' ? (
                      <button onClick={() => completeTask(task.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition">تم الإنجاز! 🚀</button>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium">في انتظار موافقة الأب</span>
                    )}
                  </div>
                ))}
                {tasks.filter(t => t.status !== 'approved').length === 0 && <p className="text-center text-sm text-slate-500 py-6">لقد أنجزت جميع مهامك بالكامل اليوم يا بطل! 🌟</p>}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[400px] overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-xl text-white text-md"><FaRobot /></div>
                <div>
                  <h4 className="font-bold text-sm">الكوتش المالي الذكي: ذُخر 🤖</h4>
                  <span className="text-[10px] text-emerald-400 font-medium">تحليل سلوكي استباقي متطور لحصالتك</span>
                </div>
              </div>
              
              <div className="flex-grow p-4 overflow-y-auto space-y-3 flex flex-col">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${msg.sender === 'bot' ? 'bg-slate-100 text-slate-800 self-start rounded-tr-none' : 'bg-emerald-500 text-white self-end rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50">
                <input type="text" placeholder="اسأل ذُخر (مثال: كيف أزيد مدخرات حصالتي اليوم؟)" value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-grow px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white text-sm" />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl transition font-medium text-sm">إرسال</button>
              </form>
            </div>
          </div>
        </main>
      )}

      <footer className="bg-white border-t border-slate-100 text-center py-4 text-xs text-slate-400 mt-auto">
        تم تطوير المنصة بامتثال تام مع موجهات الشمول المالي والمصرفية المفتوحة لبنك الإنماء وأكاديمية طويق ٢٠٢٦ ©
      </footer>
    </div>
  );
}
