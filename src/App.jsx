import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FaWallet, FaPiggyBank, FaHeart, FaTasks, FaRobot, FaUserShield,
  FaUserPlus, FaCheckCircle, FaPlus, FaArrowLeft, FaHistory,
  FaExclamationTriangle, FaGamepad, FaUtensils, FaFilm, FaLock,
  FaUniversity, FaCode, FaSyncAlt, FaCheckDouble, FaTimes, FaChartPie,
  FaStore, FaTrophy, FaCoins, FaStar, FaLightbulb, FaInfoCircle
} from 'react-icons/fa';

/* ================================================================
   منصة حصالتي المتكاملة مع ميزات "نقــد" الذكية (Hackathon Final Ultra Build)
   ----------------------------------------------------------------
   المعمارية والميزات المدمجة:
   1) State مركزي موحد لإدارة الأرصدة، النقاط، العمليات، والمهام.
   2) نظام التلعيب المالي (Gamification): محاكي استثمار يعتمد على سيناريوهات لاتخاذ القرار.
   3) متجر مكافآت الأبناء (Rewards Store) المبني على النقاط المكتسبة.
   4) كوتش الذكاء الاصطناعي "ذُخر" التفاعلي الذي يحلل محفظة الطفل لحظياً قبل الرد.
   5) لوحة تحكم الأب المتطورة مع رسوم بيانية SVG ومحاكاة المصرفية المفتوحة (Alinma Sandbox).
   ================================================================ */

// ---------------- أدوات عامة ومسميات ----------------
const formatDate = (d) =>
  d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const boxLabels = {
  spend: { name: 'صندوق الإنفاق', color: 'orange', hex: '#f97316' },
  save: { name: 'صندوق الادخار', color: 'violet', hex: '#8b5cf6' },
  give: { name: 'صندوق العطاء', color: 'emerald', hex: '#10b981' },
};

const CORRECT_PIN = '1234';

// سيناريوهات لعبة محاكاة الاستثمار والقرارات المالية (ميزات نقد)
const SCENARIOS = [
  {
    id: 1,
    question: "حصلت على مكافأة نجاح بقيمة 150 ريال، كيف ستتصرف بها؟",
    options: [
      { text: "توزيعها ذكياً: 50 للإنفاق، 80 للادخار، و20 ريال للعطاء والمجتمع.", points: 30, bonusBalance: { spend: 50, save: 80, give: 20 }, msg: "رائع جداً! هذا هو التوازن المالي الذكي الذي يحميك مستقبلاً." },
      { text: "شراء بطاقات شحن ألعاب إلكترونية كاملة والاستمتاع بها فوراً.", points: 10, bonusBalance: { spend: 150, save: 0, give: 0 }, msg: "المتعة الفورية جميلة، ولكن صرف كامل المبلغ يحرمك من بناء مدخرات للأهداف الكبرى." }
    ]
  },
  {
    id: 2,
    question: "رأيت حملة تبرع رسمية لمساعدة العائلات المحتاجة في منصة إحسان، ما هي خطتك؟",
    options: [
      { text: "المساهمة بـ 30 ريال من صندوق العطاء المخصص للمسؤولية المجتمعية.", points: 40, bonusBalance: { spend: 0, save: 0, give: -30 }, msg: "بارك الله فيك! العطاء ينمي فيك روح الإنسانية والمواطنة الصالحة ويعود بالبركة." },
      { text: "تجاوز الحملة والاحتفاظ بالمال لشراء وجبة سريعة إضافية لاحقاً.", points: 5, bonusBalance: { spend: 0, save: 0, give: 0 }, msg: "تذكر أن صندوق العطاء وُجد لتصنع به أثراً إيجابياً في مجتمعك." }
    ]
  },
  {
    id: 3,
    question: "تريد شراء دراجة هوائية جديدة بـ 300 ريال، ورصيدك الحالي لا يكفي بالكامل، ماذا تفعل؟",
    options: [
      { text: "الالتزام بتوفير جزء من المصروف الأسبوعي وإنجاز مهام منزلية لكسب المكافأة.", points: 35, bonusBalance: { spend: 0, save: 0, give: 0 }, msg: "كلام حكيم! الصبر والجهد هما أقصر الطرق لتحقيق الأهداف المالية الكبيرة بنجاح." },
      { text: "طلب سلفة مالية (دين) من الأب وشراء الدراجة فوراً والوقوع في مأزق سداد مستقبلي.", points: 10, bonusBalance: { spend: 0, save: 0, give: 0 }, msg: "احذر من الديون الاستهلاكية غير الضرورية! الادخار أولاً هو الخيار الأسلم دائماً." }
    ]
  }
];

// ---------------- طبقة الـ API الوهمية للمحاكاة ----------------
const simulateRequest = (payload, delay = 500) =>
  new Promise((resolve) => setTimeout(() => resolve(payload), delay));

const api = {
  tasks: {
    approve: async (task) => simulateRequest({ ...task, status: 'approved' }),
  },
  wallet: {
    spend: async (box, amount, label) => simulateRequest({ box, amount, label }),
    transfer: async (fromBox, toBox, amount, label) => simulateRequest({ fromBox, toBox, amount, label }),
  },
  bank: {
    fetchStatement: async () =>
      simulateRequest({
        provider: 'Alinma Open Banking Sandbox',
        accountHolder: 'أ. أحمد عبد الله',
        linkedWallet: 'محفظة سلمان - حصالتي ونقد',
        currency: 'SAR',
        fetchedAt: new Date().toISOString(),
        transactions: [
          { id: 'TX-9901', type: 'إيداع', description: 'المصروف الأسبوعي التلقائي', amount: 100, date: '2026-07-05T08:00:00' },
          { id: 'TX-9902', type: 'تحويل', description: 'مكافأة إنجاز مهمة القراءة الصيفية', amount: 20, date: '2026-07-07T14:20:00' },
          { id: 'TX-9903', type: 'خصم', description: 'مشتريات مقصف المدرسة', amount: -15, date: '2026-07-08T10:15:00' },
        ],
      }, 800),
  },
};

// ---------------- المكوّن الرئيسي للمنصة ----------------
export default function App() {
  const [view, setView] = useState('landing');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [isParentAuthed, setIsParentAuthed] = useState(false);

  // الحسابات المالية والنقاط التنافسية (تكامل نقد وحصالتي)
  const [balances, setBalances] = useState({ spend: 90, save: 250, give: 40 });
  const [points, setPoints] = useState(120); // نظام نقاط نقد
  const [activeScenario, setActiveScenario] = useState(0); // مؤشر سيناريو اللعبة الحالي

  const idCounter = useRef(3000);
  const nextId = () => (idCounter.current += 1);

  const [tasks, setTasks] = useState([
    { id: 1, title: 'قراءة كتاب ريادة الأعمال للناشئين لمدة ٢٠ دقيقة', reward: 15, pointsReward: 30, status: 'pending' },
    { id: 2, title: 'مساعدة الوالدة في ترتيب المنزل وإعادة التدوير', reward: 10, pointsReward: 20, status: 'completed' },
    { id: 3, title: 'تنظيم وتخطيط المصروف الأسبوعي على الورق', reward: 20, pointsReward: 40, status: 'approved' },
  ]);

  const [transactions, setTransactions] = useState([
    { id: nextId(), box: 'save', type: 'income', amount: 20, label: 'مكافأة مهمة: التخطيط المالي', date: new Date() },
    { id: nextId(), box: 'spend', type: 'expense', amount: 30, label: 'صرف على: أدوات رسم', date: new Date(Date.now() - 86400000) },
  ]);

  const [redeemedItems, setRedeemedItems] = useState([
    { id: 101, title: 'ساعة إضافية على الألعاب الإلكترونية', cost: 50, status: 'approved', date: new Date() }
  ]);

  // متجر المكافآت المعتمد من الأهل
  const storeItems = [
    { id: 1, title: 'ساعة إضافية على الألعاب الإلكترونية', cost: 50, icon: <FaGamepad className="text-amber-500" /> },
    { id: 2, title: 'وجبة عشاء من اختيارك في نهاية الأسبوع', cost: 80, icon: <FaUtensils className="text-emerald-500" /> },
    { id: 3, title: 'تذكرة سينما عائلية مع الفشار', cost: 150, icon: <FaFilm className="text-violet-500" /> },
  ];

  // شات بوت كوتش ذُخر الذكي
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'مرحباً يا بطل! أنا كوتش "ذُخر" مستشارك الذكي المدعوم بتقنيات نقد وحصالتي المتقدمة 🧠. لقد قمت للتو بتحليل حركاتك وأرصدتك المالية الحالية؛ كيف يمكنني مساعدتك اليوم في تنمية مدخراتك؟' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // ---------------- نظام الـ Toasts ----------------
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const [loadingStates, setLoadingStates] = useState({ approving: null, completing: null, action: false });

  const addTransaction = (box, type, amount, label) => {
    setTransactions((prev) => [{ id: nextId(), box, type, amount, label, date: new Date() }, ...prev]);
  };

  // ---------------- إدارة بوابات الدخول ----------------
  const handlePinSuccess = () => {
    setIsParentAuthed(true);
    setPinModalOpen(false);
    setView('parent');
    addToast('مرحباً بك في بوابة التحكم والمراقبة العائلية الآمنة 🛡️', 'success');
  };

  const logoutToLanding = () => {
    setIsParentAuthed(false);
    setView('landing');
  };

  // ---------------- منطق المهام والمكافآت ----------------
  const handleAddTask = (title, reward, pts) => {
    if (!title.trim() || !reward || reward <= 0) return;
    setTasks((prev) => [...prev, { id: nextId(), title: title.trim(), reward: Math.round(reward), pointsReward: pts || 20, status: 'pending' }]);
    addToast('تم إدراج المهمة الحافزة الجديدة في القائمة 📌', 'info');
  };

  const handleCompleteTask = async (id) => {
    setLoadingStates(p => ({ ...p, completing: id }));
    await simulateRequest(null, 400);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t)));
    setLoadingStates(p => ({ ...p, completing: null }));
    addToast('تم رفع الإنجاز للأب بنجاح بانتظار الاعتماد المالي ⏳', 'info');
  };

  const handleApproveTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status !== 'completed') return;
    setLoadingStates(p => ({ ...p, approving: id }));
    try {
      await api.tasks.approve(task);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t)));
      setBalances((prev) => ({ ...prev, save: prev.save + task.reward }));
      setPoints((prev) => prev + task.pointsReward);
      addTransaction('save', 'income', task.reward, `مكافأة مهمة: ${task.title}`);
      addToast(`رائع! تم تحويل المبلع وصرف النقاط بنجاح (+${task.reward} ريال / +${task.pointsReward} نقطة نقد) 💸`, 'success');
    } finally {
      setLoadingStates(p => ({ ...p, approving: null }));
    }
  };

  // ---------------- العمليات المالية على الصناديق ----------------
  const handleSpendFromBox = async (box, amount, label) => {
    if (amount <= 0 || balances[box] < amount) {
      addToast(`عذراً، الرصيد المتاح غير كافٍ لإجراء هذه العملية في ${boxLabels[box].name} ❌`, 'error');
      return;
    }
    setLoadingStates(p => ({ ...p, action: true }));
    try {
      await api.wallet.spend(box, amount, label);
      setBalances((prev) => ({ ...prev, [box]: prev[box] - amount }));
      addTransaction(box, 'expense', amount, label);
      addToast(`تم تسجيل حركة الصرف وقص الفاتورة بنجاح بنجاح (-${amount} ريال) 🧾`, 'success');
    } finally {
      setLoadingStates(p => ({ ...p, action: false }));
    }
  };

  const handleTransferFunds = async (targetBox, amount, label) => {
    if (balances.spend < amount) {
      addToast(`رصيد الإنفاق غير كافٍ لإعادة توجيه الاستثمار نحو ${boxLabels[targetBox].name}`, 'error');
      return;
    }
    setLoadingStates(p => ({ ...p, action: true }));
    try {
      await api.wallet.transfer('spend', targetBox, amount, label);
      setBalances((prev) => ({ ...prev, spend: prev.spend - amount, [targetBox]: prev[targetBox] + amount }));
      addTransaction('spend', 'expense', amount, label);
      addTransaction(targetBox, 'income', amount, label);
      addToast(`تمت عملية النقل والتحويل بين الصناديق الذكية بنجاح 💸`, 'success');
    } finally {
      setLoadingStates(p => ({ ...p, action: false }));
    }
  };

  // ---------------- شراء المكافآت بالنقاط (ميزة متجر نقد) ----------------
  const handleRedeemItem = (item) => {
    if (points < item.cost) {
      addToast(`نقاط جدارتك الحالية لا تكفي لشراء هذا البند، أنجز مزيداً من المهام والسيناريوهات الماليّة! 🔥`, 'error');
      return;
    }
    setPoints(p => p - item.cost);
    setRedeemedItems(prev => [{ id: nextId(), title: item.title, cost: item.cost, status: 'pending', date: new Date() }, ...prev]);
    addToast(`تم إرسال طلب المكافأة للأب! استمتع بثمار انضباطك المالي 🏆`, 'success');
  };

  // ---------------- كوتش الذكاء الاصطناعي "ذُخر" التفاعلي النشط ----------------
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsAiThinking(true);

    await simulateRequest(null, 1000); // محاكاة استجابة نموذج LLM

    let reply = "";
    const lowerText = userText.toLowerCase();

    // بناء ذكاء اصطناعي واعي ومحلل حقيقي للبيانات المالية المدخلة للطفل
    if (lowerText.includes('ادخار') || lowerText.includes('أوفر') || lowerText.includes('ازيد')) {
      reply = `تحليلي المالي لك يا بطل: رصيد ادخارك الحالي هو (${balances.save} ريال) ورصيد إنفاقك هو (${balances.spend} ريال). بما أنك تريد زيادة مدخراتك، أنصحك بالدخول لتبويب "المهام الحافزة" وإنجاز المهمة المعلقة لكسب كاش ونقاط فوراً، أو القيام بتحويل 20 ريال من صندوق الإنفاق الاستهلاكي إلى صندوق الادخار للأهداف الكبرى!`;
    } else if (lowerText.includes('إنفاق') || lowerText.includes('اشتري') || lowerText.includes('العاب')) {
      if (balances.spend > balances.save) {
        reply = `تنبيه استباقي ومبكر ⚠️: رصيد صندوق إنفاقك الحالي هو (${balances.spend} ريال) وهو أعلى من مدخراتك! أنصحك بالتوقف عن الشراء غير الضروري هذا الأسبوع حتى نحمي ميزانيتك من النفاد المبكر وتتعلم التمييز بين الحاجيات والرغبات.`;
      } else {
        reply = `رصيد الإنفاق المتاح لديك حالياً هو (${balances.spend} ريال). يمكنك شراء ما تحتاجه في حدود هذا المبلغ، ولكن تذكر دائماً قاعدة نقد الذهبية: فكّر ثلاث مرات قبل تأكيد الشراء الاستهلاكي الفوري!`;
      }
    } else if (lowerText.includes('نقاط') || lowerText.includes('المكافآت') || lowerText.includes('لعبة')) {
      reply = `رصيد نقاط جدارتك الماليّة الحالي هو (${points} نقطة نقد) 🏆! يمكنك الآن التوجه مباشرة لـ "محاكي الاستثمار" لاختبار مهاراتك وربح نقاط إضافية، أو زيارة "متجر المكافآت" لاستبدالها بامتيازات مذهلة وافق عليها والداك مسبقاً.`;
    } else {
      reply = `سؤال رائع جداً! بصفتي كوتش "ذُخر" المالي، أرى أنك تسير في الطريق الصحيح نحو الاستقلال المالي الواعي. مجموع رصيدك في كل الصناديق هو (${balances.spend + balances.save + balances.give} ريال)، حافظ على هذا التوازن الرائع واجعل العطاء جزءاً من هويتك الماليّة!`;
    }

    setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    setIsAiThinking(false);
  };

  // ---------------- تحليلات الذكاء الاصطناعي المبنية على البيانات الفعلية ----------------
  const aiAnalysis = useMemo(() => {
    const total = balances.spend + balances.save + balances.give || 1;
    const spendPct = Math.round((balances.spend / total) * 100);
    const savePct = Math.round((balances.save / total) * 100);
    const givePct = 100 - spendPct - savePct;

    const overspending = balances.spend > balances.save;
    let note = "الوضعية المالية الحالية مستقرة ومتوازنة بين الإنفاق والادخار والمشاركة المجتمعية.";
    let severity = "success";

    if (overspending) {
      severity = "warning";
      note = `تنبيه سلوكي مالي: تجاوز رصيد صندوق الإنفاق (${balances.spend} ريال) رصيد الادخار الخاص بالطوارئ والأهداف (${balances.save} ريال). يوصى بحث سلمان وتوجيهه لكبح جماح الاستهلاك اليومي.`;
    } else if (balances.save >= balances.spend * 1.5) {
      note = "رائع! سلمان يظهر انضباطاً مالياً فائقاً من خلال المحافظة على نسبة ادخار عالية جداً تعزز وعيه التخطيطي الاستراتيجي.";
    }

    return { spendPct, savePct, givePct, overspending, note, severity };
  }, [balances]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased" dir="rtl">
      <Header view={view} goLanding={logoutToLanding} />

      {view === 'landing' && <Landing onSelectParent={() => setPinModalOpen(true)} onSelectChild={() => setView('child')} />}

      {view === 'parent' && isParentAuthed && (
        <ParentDashboard
          balances={balances}
          tasks={tasks}
          transactions={transactions}
          redeemedItems={redeemedItems}
          setRedeemedItems={setRedeemedItems}
          aiAnalysis={aiAnalysis}
          loadingStates={loadingStates}
          onAddTask={handleAddTask}
          onApproveTask={handleApproveTask}
        />
      )}

      {view === 'child' && (
        <ChildDashboard
          balances={balances}
          points={points}
          setPoints={setPoints}
          setBalances={setBalances}
          tasks={tasks}
          loadingStates={loadingStates}
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isAiThinking={isAiThinking}
          storeItems={storeItems}
          redeemedItems={redeemedItems}
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
          onCompleteTask={handleCompleteTask}
          onSpend={handleSpendFromBox}
          onTransfer={handleTransferFunds}
          onRedeem={handleRedeemItem}
          onSendChat={handleSendChatMessage}
          addTransaction={addTransaction}
          addToast={addToast}
        />
      )}

      {pinModalOpen && (
        <PinModal onClose={() => setPinModalOpen(false)} onSuccess={handlePinSuccess} onFail={() => addToast('رمز التحقق الذي أدخلته غير صحيح ❌', 'error')} />
      )}

      <ToastContainer toasts={toasts} />

      <footer className="bg-white border-t border-slate-100 text-center py-5 text-xs text-slate-400 mt-auto">
        تمت الحوكمة والربط بامتثال تام مع موجهات الشمول المالي والمصرفية المفتوحة لبنك الإنماء وهندسة التلعيب الرقمي لنقد ٢٠٢٦ ©
      </footer>
    </div>
  );
}

// ================= مكون الهيدر العلوي =================
function Header({ view, goLanding }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={goLanding}>
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-2.5 rounded-2xl font-bold text-xl shadow-md shadow-emerald-600/20">
            حصالتي × نقد
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight hidden sm:inline">
            منصة حصالتي الذكية{' '}
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">PRO AI</span>
          </span>
        </div>
        {view !== 'landing' && (
          <button
            onClick={goLanding}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition font-medium text-sm"
          >
            <FaArrowLeft className="text-xs" /> الخروج والعودة للرئيسية
          </button>
        )}
      </div>
    </header>
  );
}

// ================= شاشة اختيار الدور الرئيسية =================
function Landing({ onSelectParent, onSelectChild }) {
  return (
    <main className="flex-grow flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold mb-6">
        <FaRobot className="animate-pulse" /> تم الدمج بنجاح: تمكين التلعيب المالي وكوتش الذكاء الاصطناعي "ذُخر"
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900 leading-tight">
        منظومة التوجيه والوعي المالي لجيل الغد ✨
      </h1>
      <p className="text-md text-slate-600 mb-12 max-w-xl leading-relaxed">
        أهلاً بك في منصة حصالتي المطورة بمحرك نقد الذكي. الرجاء اختيار واجهة الدخول المناسبة لبدء المحاكاة التفاعلية الفورية.
      </p>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-8 w-full max-w-2xl">
        <div
          onClick={onSelectParent}
          className="relative bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-violet-600 cursor-pointer shadow-sm hover:shadow-xl transition-all group text-right"
        >
          <span className="absolute top-4 left-4 text-[10px] font-bold bg-violet-50 text-violet-600 px-2 py-1 rounded-full flex items-center gap-1">
            <FaLock /> أمان مشدد
          </span>
          <div className="bg-violet-100 text-violet-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-violet-600 group-hover:text-white transition-all">
            <FaUserShield />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900">لوحة تحكم الأب (الأولياء)</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            متابعة حركات الإنفاق، إسناد المهام الاستباقية، الموافقة على طلبات المكافآت، والاطلاع على تقارير الذكاء الاصطناعي للمصرفية المفتوحة.
          </p>
        </div>

        <div
          onClick={onSelectChild}
          className="bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-emerald-600 cursor-pointer shadow-sm hover:shadow-xl transition-all group text-right"
        >
          <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <FaUserPlus />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900">واجهة الابن (سلمان - ١٢ سنة)</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            إدارة الصناديق المالية الثلاثة، كسب المال والنقاط من المهام ولعبة محاكاة الاستثمار، وشراء المكافآت، والتحدث مع كوتش ذُخر.
          </p>
        </div>
      </div>
    </main>
  );
}

// ================= مودال الـ PIN لدخول الأب =================
function PinModal({ onClose, onSuccess, onFail }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError(false);
    await simulateRequest(null, 400);
    setChecking(false);
    if (pin === CORRECT_PIN) {
      onSuccess();
      setPin('');
    } else {
      setError(true);
      onFail();
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative ${error ? 'animate-shake' : ''}`}>
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-slate-700 transition">
          <FaTimes />
        </button>

        <div className="bg-violet-100 text-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5">
          <FaLock />
        </div>
        <h3 className="text-xl font-bold text-center text-slate-900 mb-1">التحقق من هوية ولي الأمر</h3>
        <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
          حفاظاً على قواعد الأمان وحوكمة البيانات المالية والمصرفية للعائلة.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            autoFocus
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className={`w-full text-center text-3xl tracking-[1em] py-3 rounded-2xl border-2 mb-2 focus:outline-none transition ${
              error ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-violet-500'
            }`}
          />
          {error && <p className="text-red-500 text-xs text-center mb-3">رمز المرور غير صحيح (تلميح للتجربة: 1234)</p>}

          <button
            type="submit"
            disabled={pin.length !== 4 || checking}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2 mt-3"
          >
            {checking ? <FaSyncAlt className="animate-spin" /> : 'تأكيد الرمز والدخول الآمن'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ================= حاوية التنبيهات العائمة =================
function ToastContainer({ toasts }) {
  const styles = { success: 'bg-emerald-600', error: 'bg-red-500', info: 'bg-slate-800' };
  return (
    <div className="fixed bottom-5 left-5 z-[70] flex flex-col gap-2 max-w-xs">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles[t.type]} text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2`}>
          <FaCheckDouble className="shrink-0" />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ================= لوحة تحكم الأب (التقارير والمصرفية) =================
function ParentDashboard({ balances, tasks, transactions, redeemedItems, setRedeemedItems, aiAnalysis, loadingStates, onAddTask, onApproveTask }) {
  const [tab, setTab] = useState('overview'); // overview | bank | rewards_control
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState('');

  const handleCreateTask = (e) => {
    e.preventDefault();
    onAddTask(newTaskTitle, parseInt(newTaskReward, 10), parseInt(newTaskPoints, 10) || 20);
    setNewTaskTitle('');
    setNewTaskReward('');
    setNewTaskPoints('');
  };

  const handleApproveRedeem = (id) => {
    setRedeemedItems(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
  };

  return (
    <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            بوابة الإشراف العائلي: أ. أحمد عبد الله <FaLock className="text-xs text-violet-200" />
          </h2>
          <p className="text-violet-100 text-xs">متابعة السلوك الاستثماري والذكاء الاستباقي لـ: سـلمان (١٢ سنة)</p>
        </div>
      </div>

      {/* التبويبات الفرعية */}
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit overflow-x-auto">
        <button onClick={() => setTab('overview')} className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${tab === 'overview' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
          <FaChartPie /> التقارير والذكاء الاصطناعي
        </button>
        <button onClick={() => setTab('rewards_control')} className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${tab === 'rewards_control' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
          <FaStore /> اعتماد مكافآت المتجر
        </button>
        <button onClick={() => setTab('bank')} className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${tab === 'bank' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
          <FaUniversity /> المصرفية المفتوحة (Sandbox)
        </button>
      </div>

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* إسناد المهام بنظام نقد المطور كاش + نقاط */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-900">
                <FaTasks className="text-violet-500" /> لوحة التكليفات والمهام المنزلية
              </h3>
              <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl mb-4">
                <input type="text" placeholder="اسم المهمة أو السلوك المطلوب..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="md:col-span-2 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500" required />
                <input type="number" placeholder="المكافأة (ريال)" value={newTaskReward} onChange={(e) => setNewTaskReward(e.target.value)} className="px-3 py-2 text-xs rounded-xl border border-slate-200 text-center" required />
                <div className="flex gap-2">
                  <input type="number" placeholder="نقاط نقد" value={newTaskPoints} onChange={(e) => setNewTaskPoints(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-center" />
                  <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-4 rounded-xl transition shrink-0 text-xs font-bold">+</button>
                </div>
              </form>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white shadow-xs">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm">{task.title}</h4>
                      <p className="text-[11px] text-violet-600 font-bold mt-0.5">المحفزات: +{task.reward} ريال | +{task.pointsReward} نقطة نقد</p>
                    </div>
                    <div>
                      {task.status === 'pending' && <span className="text-[11px] bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-bold">قيد التنفيذ</span>}
                      {task.status === 'completed' && (
                        <button onClick={() => onApproveTask(task.id)} disabled={loadingStates.approving === task.id} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">
                          {loadingStates.approving === task.id ? 'جاري الصرف...' : 'اعتماد وصرف المكافأة'}
                        </button>
                      )}
                      {task.status === 'approved' && <span className="text-[11px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold">تم الإيداع ✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* سجل حركات الابن */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-slate-900">
                <FaHistory className="text-slate-400" /> التدفق المالي اللحظي لحساب سلمان
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {transactions.map((tr) => (
                  <div key={tr.id} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700">{tr.label}</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{boxLabels[tr.box].name} • {formatDate(tr.date)}</div>
                    </div>
                    <span className={`font-extrabold ${tr.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tr.type === 'income' ? '+' : '-'} {tr.amount} ريال
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* عمود تقارير تحليل محرك نقد الاستباقي AI */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <h3 className="text-sm font-bold mb-4 text-slate-900 flex items-center gap-2 justify-center">
                <FaChartPie className="text-emerald-500" /> الهيكل النسبي للصناديق الثلاثة
              </h3>
              {/* رسم بياني دائري تفاعلي ومبسط بـ Pure SVG */}
              <div className="relative w-36 h-36 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f97316" strokeWidth="4" strokeDasharray={`${aiAnalysis.spendPct} ${100 - aiAnalysis.spendPct}`} strokeDashoffset="0" />
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="4" strokeDasharray={`${aiAnalysis.savePct} ${100 - aiAnalysis.savePct}`} strokeDashoffset={`-${aiAnalysis.spendPct}`} />
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray={`${aiAnalysis.givePct} ${100 - aiAnalysis.givePct}`} strokeDashoffset={`-${aiAnalysis.spendPct + aiAnalysis.savePct}`} />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xs font-bold text-slate-500 block">المجموع</span>
                  <span className="text-base font-extrabold text-slate-800">{balances.spend + balances.save + balances.give} ر.س</span>
                </div>
              </div>

              <div className="text-right text-xs space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center"><span className="text-orange-600 font-bold">● الإنفاق (المقصف والألعاب)</span> <span className="font-bold">{aiAnalysis.spendPct}%</span></div>
                <div className="flex justify-between items-center"><span className="text-violet-600 font-bold">● الادخار (الأهداف والمستقبل)</span> <span className="font-bold">{aiAnalysis.savePct}%</span></div>
                <div className="flex justify-between items-center"><span className="text-emerald-600 font-bold">● العطاء (الإحسان والمجتمع)</span> <span className="font-bold">{aiAnalysis.givePct}%</span></div>
              </div>
            </div>

            {/* بطاقة التوجيه التربوي المدعومة بالـ AI */}
            <div className={`p-5 rounded-3xl border shadow-xs ${aiAnalysis.severity === 'warning' ? 'bg-amber-50/70 border-amber-200' : 'bg-emerald-50/70 border-emerald-200'}`}>
              <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5 text-slate-900">
                <FaRobot className={aiAnalysis.severity === 'warning' ? 'text-amber-600' : 'text-emerald-600'} /> الاستبصار الذكي الموجه لولي الأمر:
              </h4>
              <p className="text-xs leading-relaxed text-slate-700">{aiAnalysis.note}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'rewards_control' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-900">
            <FaStore className="text-violet-500" /> إدارة طلبات استبدال نقاط جدارة نقد
          </h3>
          <div className="space-y-3">
            {redeemedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">التكلفة المستقطعة: {item.cost} نقطة جدارة ماليّة</p>
                </div>
                <div>
                  {item.status === 'pending' ? (
                    <button onClick={() => handleApproveRedeem(item.id)} className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
                      اعتماد وتفعيل الامتياز للطفل
                    </button>
                  ) : (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold flex items-center gap-1">تمت الموافقة والتفعيل ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'bank' && <OpenBankingSandbox />}
    </main>
  );
}

// ================= ميزة محاكاة الـ Open Banking لبنك الإنماء =================
function OpenBankingSandbox() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBankAPI = async () => {
    setLoading(true);
    const res = await api.bank.fetchStatement();
    setData(res);
    setLoading(false);
  </h5>

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FaUniversity className="text-emerald-600" /> Alinma Open Banking Sandbox Endpoint
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">محاكاة جلب كشف الحساب الفعلي للولي لتغذية الحصالة رقمياً عبر الـ API الرسمي لبنك الإنماء ٢٠٢٦</p>
        </div>
        <button onClick={fetchBankAPI} disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5">
          {loading ? 'جاري الاتصال بالسيرفر...' : 'استدعاء بيانات الحساب البنكي المربوط'}
        </button>
      </div>

      {data ? (
        <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl overflow-x-auto shadow-inner leading-relaxed">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-400 text-xs">
          انقر على الزر بالقول لتجربة محاكاة معايير المصرفية المفتوحة وجلب تدفق مالي حي.
        </div>
      )}
    </div>
  );
}

// ================= لوحة تحكم الابن (الصناديق، اللعبة، الكوتش والـ Store) =================
function ChildDashboard({ balances, points, setPoints, setBalances, tasks, loadingStates, chatMessages, chatInput, setChatInput, isAiThinking, storeItems, redeemedItems, activeScenario, setActiveScenario, onCompleteTask, onSpend, onTransfer, onRedeem, onSendChat, addTransaction, addToast }) {
  const [subTab, setSubTab] = useState('boxes'); // boxes | tasks | coach | game | store
  const [spendAmount, setSpendAmount] = useState('');
  const [spendReason, setSpendReason] = useState('');
  const [activeBox, setActiveBox] = useState('spend');

  const [transferAmount, setTransferAmount] = useState('');
  const [targetBox, setTargetBox] = useState('save');

  const handleSpendSubmit = (e) => {
    e.preventDefault();
    const amt = parseInt(spendAmount, 10);
    if (!amt || amt <= 0) return;
    onSpend(activeBox, amt, `صرف على: ${spendReason.trim() || 'مشتريات عامة'}`);
    setSpendAmount('');
    setSpendReason('');
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const amt = parseInt(transferAmount, 10);
    if (!amt || amt <= 0) return;
    onTransfer(targetBox, amt, `إعادة توجيه من الإنفاق إلى ${boxLabels[targetBox].name}`);
    setTransferAmount('');
  };

  const handleGameAnswer = (option) => {
    setPoints(prev => prev + option.points);
    setBalances(prev => ({
      spend: prev.spend + (option.bonusBalance.spend || 0),
      save: prev.save + (option.bonusBalance.save || 0),
      give: prev.give + (option.bonusBalance.give || 0),
    }));
    
    // تسجيل الحركات الناتجة عن اللعبة في السجل الرئيسي
    if(option.bonusBalance.spend !== 0) addTransaction('spend', option.bonusBalance.spend > 0 ? 'income' : 'expense', Math.abs(option.bonusBalance.spend), 'محاكي نقد الاستثماري');
    if(option.bonusBalance.save !== 0) addTransaction('save', option.bonusBalance.save > 0 ? 'income' : 'expense', Math.abs(option.bonusBalance.save), 'محاكي نقد الاستثماري');

    addToast(`نتيجة القرار: ${option.msg} (+${option.points} نقطة نقد)`, 'success');
    if (activeScenario < SCENARIOS.length - 1) {
      setActiveScenario(prev => prev + 1);
    } else {
      addToast('تهانينا يا بطل المالي الصغير! لقد أتممت جميع سيناريوهات جدارة المتاحة اليوم 🏆', 'info');
      setActiveScenario(0);
    }
  };

  return (
    <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
      {/* شريط الإحصاءات العلوي للطفل (دمج رصيد الكاش ونقاط الجدارة نقد) */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-3xl shadow-md mb-6 flex justify-between items-center flex-wrap gap-3 animate-fade-in">
        <div>
          <span className="text-xs bg-emerald-600/40 px-2.5 py-1 rounded-full font-bold inline-block mb-1">لوحة الطفل البطل 🚀</span>
          <h2 className="text-xl font-bold">أهلاً بك يا سلمان، فلندخر بذكاء!</h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/15 px-4 py-2 rounded-2xl text-center backdrop-blur-md">
            <span className="text-[10px] text-emerald-100 font-bold block mb-0.5">رصيد الكاش الإجمالي</span>
            <span className="text-lg font-black">{balances.spend + balances.save + balances.give} ريال</span>
          </div>
          <div className="bg-amber-400 text-slate-900 px-4 py-2 rounded-2xl text-center font-bold shadow-sm flex items-center gap-2">
            <FaTrophy className="text-amber-800 text-lg animate-bounce" />
            <div className="text-right">
              <span className="text-[9px] text-amber-900 block font-bold">نقاط جدارة نقد</span>
              <span className="text-base font-black">{points} نقطة</span>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة التنقل الرئيسية للابن (تبويبات نقد وحصالتي) */}
      <div className="flex gap-1 mb-6 bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto">
        <button onClick={() => setSubTab('boxes')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${subTab === 'boxes' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>💰 حصالتي الذكية</button>
        <button onClick={() => setSubTab('tasks')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${subTab === 'tasks' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>📌 المهام المعلقة</button>
        <button onClick={() => setSubTab('game')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${subTab === 'game' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>🎮 محاكي الاستثمار</button>
        <button onClick={() => setSubTab('store')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${subTab === 'store' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>🛍️ متجر المكافآت</button>
        <button onClick={() => setSubTab('coach')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${subTab === 'coach' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><FaRobot /> اسأل كوتش ذُخر</button>
      </div>

      {/* 1. التبويب الرئيسي: إدارة الصناديق الثلاثة والإنفاق */}
      {subTab === 'boxes' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
            <BoxCard type="spend" current={balances.spend} active={activeBox === 'spend'} onClick={() => setActiveBox('spend')} />
            <BoxCard type="save" current={balances.save} active={activeBox === 'save'} onClick={() => setActiveBox('save')} />
            <BoxCard type="give" current={balances.give} active={activeBox === 'give'} onClick={() => setActiveBox('give')} />

            {/* سحب وفاتورة الصرف */}
            <div className="sm:col-span-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mt-2">
              <h3 className="text-sm font-bold mb-3 text-slate-800 flex items-center gap-1">
                <FaWallet className="text-orange-500" /> تسجيل مشتريات أو صرف من: {boxLabels[activeBox].name}
              </h3>
              <form onSubmit={handleSpendSubmit} className="grid sm:grid-cols-3 gap-3">
                <input type="number" min="1" placeholder="المبلغ المستهلك (ريال)..." value={spendAmount} onChange={(e) => setSpendAmount(e.target.value)} className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-center" required />
                <input type="text" placeholder="مثال: شراء عصير، علبة ألوان..." value={spendReason} onChange={(e) => setSpendReason(e.target.value)} className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500" required />
                <button type="submit" disabled={loadingStates.action} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-xl transition">
                  {loadingStates.action ? 'جاري التقييد...' : 'تأكيد وقص الفاتورة 🧾'}
                </button>
              </form>
            </div>
          </div>

          {/* عمود إعادة توجيه التوفير الفوري وموازنة الميزانية */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5 text-slate-900">
                <FaCoins className="text-amber-500" /> إعادة توجيه وتدوير المال
              </h3>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">يمكنك نقل مبالغ فائضة من رصيد الإنفاق اليومي لتنمية صناديق العطاء أو الادخار المستقبلي.</p>
              
              <form onSubmit={handleTransferSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">الوجهة والمستقبل الاستثماري:</label>
                  <select value={targetBox} onChange={(e) => setTargetBox(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none">
                    <option value="save">صندوق الادخار للأهداف</option>
                    <option value="give">صندوق العطاء ومساعدة الآخرين</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">المبلغ المراد نقله (ريال):</label>
                  <input type="number" min="1" placeholder="مثال: 15 ريال" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-center" required />
                </div>
                <button type="submit" disabled={loadingStates.action} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition">
                  نقل وتحويل فوري للمبلغ 💸
                </button>
              </form>
            </div>
            <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2">
              <FaLightbulb className="text-emerald-600 text-sm shrink-0 mt-0.5" />
              <p className="text-[10px] text-emerald-800 leading-relaxed"><b>نصيحة نقد:</b> تحويلك للمال نحو الادخار يزيد من وعيك ومقاومتك لإغراء الشراء الفوري!</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. تبويب المهام السلوكية للابن */}
      {subTab === 'tasks' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-900">
            <FaTasks className="text-emerald-500" /> مهامي المعتمدة لتنمية أرباح حصالتي
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                  <div className="flex gap-3 text-[11px] font-semibold text-emerald-600 mt-1">
                    <span>💵 +{task.reward} ريال كاش</span>
                    <span className="text-amber-600">★ +{task.pointsReward} نقطة جدارة</span>
                  </div>
                </div>
                <div className="text-left">
                  {task.status === 'pending' && (
                    <button onClick={() => onCompleteTask(task.id)} disabled={loadingStates.completing === task.id} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
                      {loadingStates.completing === task.id ? 'جاري الرفع مراجعة الأب...' : 'لقد أنجزت المهمة! اطلب مكافأتك 🚀'}
                    </button>
                  )}
                  {task.status === 'completed' && <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-bold inline-block">⏳ بانتظار مراجعة واعتماد الوالد</span>}
                  {task.status === 'approved' && <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold inline-block">✓ تم الإنجاز واستلام الأرباح والمسارات</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. تبويب محاكي الاستثمار والقرارات (ميزة التلعيب لنقد) */}
      {subTab === 'game' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-xl text-lg"><FaGamepad /></div>
            <div>
              <h3 className="text-base font-bold text-slate-900">محاكي نقد التعليمي لاتخاذ القرار الاستثماري</h3>
              <p className="text-[11px] text-slate-400">واجه السيناريوهات الواقعية، وتعلّم كيف تفكر كالمستثمرين الأذكياء لتربح النقاط!</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-6">
            <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">المرحلة الحالية {activeScenario + 1} من {SCENARIOS.length}</span>
            <p className="text-sm font-bold text-slate-800 mt-2 leading-relaxed">{SCENARIOS[activeScenario].question}</p>
          </div>

          <div className="space-y-3">
            {SCENARIOS[activeScenario].options.map((opt, idx) => (
              <button key={idx} onClick={() => handleGameAnswer(opt)} className="w-full text-right text-xs p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition font-medium flex justify-between items-center gap-4">
                <span className="text-slate-800 leading-relaxed">{opt.text}</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-lg font-bold shrink-0">+{opt.points} نقطة</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. تبويب متجر مكافآت الجدارة بالنقاط */}
      {subTab === 'store' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold mb-1 flex items-center gap-2 text-slate-900">
              <FaStore className="text-amber-500" /> متجر استبدال نقاط الجدارة بالمكافآت والامتيازات
            </h3>
            <p className="text-xs text-slate-400 mb-6">يمكنك تحويل رصيد نقاطك المتراكمة هنا لامتيازات ترفيهية حقيقية يوافق عليها الآباء.</p>

            <div className="grid sm:grid-cols-3 gap-4">
              {storeItems.map((item) => (
                <div key={item.id} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between items-center text-center gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs md:text-sm leading-relaxed">{item.title}</h4>
                    <span className="text-xs text-amber-600 font-extrabold block mt-1">المطلوب: {item.cost} نقطة جدارة</span>
                  </div>
                  <button onClick={() => onRedeem(item)} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl transition">
                    استبدال النقاط الآن 🛍️
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold mb-3 text-slate-800">سجل مكافآتي وجوائزي السابقة</h3>
            <div className="space-y-2">
              {redeemedItems.map((ri, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 text-xs rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">{ri.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">-{ri.cost} نقطة</span>
                    {ri.status === 'pending' ? (
                      <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold text-[10px]">بانتظار تفعيل الوالد</span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold text-[10px]">مفعّلة وجاهزة للاستخدام ✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. تبويب كوتش ذُخر المالي النشط */}
      {subTab === 'coach' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto overflow-hidden flex flex-col h-[460px]">
          <div className="bg-slate-900 p-4 text-white flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-2 rounded-xl"><FaRobot /></div>
            <div>
              <h3 className="text-sm font-bold">كوتش ذُخر المالي الذكي (صديقك المحلل والموجه)</h3>
              <p className="text-[10px] text-slate-400">يسألني ويحلل سلوكي المالي فورياً من واقع سجل حصالتي!</p>
            </div>
          </div>

          {/* مساحة عرض المحادثات */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.sender === 'bot' ? 'bg-white text-slate-800 border border-slate-100 shadow-xs self-start rounded-tr-none' : 'bg-emerald-500 text-white self-end rounded-tl-none'}`}>
                {msg.text}
              </div>
            ))}
            {isAiThinking && (
              <div className="self-start bg-white border border-slate-100 rounded-2xl rounded-tr-none px-4 py-2 flex gap-1 items-center shadow-xs">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </div>
            )}
          </div>

          <form onSubmit={onSendChat} className="p-3 border-t border-slate-200 flex gap-2 bg-white">
            <input
              type="text"
              placeholder="اسأل ذُخر (مثال: كيف أزيد ادخاري اليوم؟)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              disabled={isAiThinking}
            />
            <button type="submit" disabled={isAiThinking || !chatInput.trim()} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl transition text-xs">إرسال</button>
          </form>
        </div>
      )}
    </main>
  );
}

// ================= مكوّن كارت الصندوق الذكي التفاعلي =================
function BoxCard({ type, current, active, onClick }) {
  const styles = {
    spend: { name: 'صندوق الإنفاق', desc: 'للمصروفات والمقصف والألعاب اليومية', bg: 'border-orange-500 bg-orange-50/20 text-orange-600', icon: <FaWallet /> },
    save: { name: 'صندوق الادخار', desc: 'للأهداف البعيدة وبناء الطوارئ والمستقبل', bg: 'border-violet-500 bg-violet-50/20 text-violet-600', icon: <FaPiggyBank /> },
    give: { name: 'صندوق العطاء', desc: 'للمشاركة المجتمعية وإحداث أثر ومساعدة المحتاجين', bg: 'border-emerald-500 bg-emerald-50/20 text-emerald-600', icon: <FaHeart /> },
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-3xl border-2 transition-all cursor-pointer text-right flex flex-col justify-between h-40 ${
        active ? `${styles[type].bg} shadow-md scale-[1.02]` : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={`text-xl p-2.5 rounded-xl ${active ? 'bg-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>{styles[type].icon}</div>
        {active && <span className="text-[10px] font-extrabold bg-white border px-2 py-0.5 rounded-full shadow-2xs">نشط حالياً</span>}
      </div>
      <div>
        <h4 className="font-extrabold text-slate-900 text-xs md:text-sm">{styles[type].name}</h4>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{styles[type].desc}</p>
        <div className="text-xl font-black text-slate-800 mt-2">{current} <span className="text-xs font-bold text-slate-500">ريال</span></div>
      </div>
    </div>
  );
}
