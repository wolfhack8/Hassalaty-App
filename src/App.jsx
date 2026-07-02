import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FaWallet, FaPiggyBank, FaHeart, FaTasks, FaRobot, FaUserShield,
  FaUserPlus, FaCheckCircle, FaPlus, FaArrowLeft, FaHistory,
  FaExclamationTriangle, FaGamepad, FaUtensils, FaFilm, FaLock,
  FaUniversity, FaCode, FaSyncAlt, FaCheckDouble, FaTimes, FaChartPie,
} from 'react-icons/fa';

/* ================================================================
   منصة حصالتي — النسخة المتقدمة (Hackathon Final Build)
   ----------------------------------------------------------------
   المعمارية:
   1) State مركزي واحد في App (Single Source of Truth).
   2) طبقة "api" وهمية تحاكي طلبات FastAPI/Firebase عبر
      Promise + setTimeout (Async/Await حقيقي في الكود)، بحيث يسهل
      لاحقاً استبدال جسم الدالة بـ fetch() حقيقي دون تغيير الواجهة.
   3) نظام Toast Notifications + Loading States لكل عملية حساسة.
   4) حماية دخول لوحة الأب عبر Simulated PIN (1234).
   5) محاكاة Open Banking Sandbox بصيغة JSON قابلة للعرض.
   6) رسم بياني Donut مبني بالكامل بـ SVG نقي (بدون مكتبات خارجية).
   7) كوتش "ذُخر": يحلل مصفوفة الحركات المالية فعلياً قبل الرد.
   ================================================================ */

// ---------------- أدوات عامة ----------------
const formatDate = (d) =>
  d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const boxLabels = {
  spend: { name: 'صندوق الإنفاق', color: 'orange', hex: '#f97316' },
  save: { name: 'صندوق الادخار', color: 'violet', hex: '#8b5cf6' },
  give: { name: 'صندوق العطاء', color: 'emerald', hex: '#10b981' },
};

const CORRECT_PIN = '1234';

// ---------------- طبقة الـ API الوهمية (جاهزة لاستبدالها بـ FastAPI/Firebase) ----------------
// كل دالة هنا تُحاكي زمن استجابة شبكة حقيقي عبر Promise + setTimeout،
// بحيث يبقى جسم الاستدعاء في الواجهة (await api.wallet.spend(...)) كما هو
// تماماً عند الانتقال لباك-إند فعلي؛ فقط يُستبدل الجسم الداخلي بـ fetch().
const simulateRequest = (payload, delay = 650) =>
  new Promise((resolve) => setTimeout(() => resolve(payload), delay));

const api = {
  tasks: {
    approve: async (task) => simulateRequest({ ...task, status: 'approved' }, 700),
  },
  wallet: {
    spend: async (box, amount, label) => simulateRequest({ box, amount, label }, 550),
    transfer: async (fromBox, toBox, amount, label) => simulateRequest({ fromBox, toBox, amount, label }, 550),
  },
  bank: {
    // محاكاة استدعاء Open Banking Sandbox API لبنك الإنماء
    fetchStatement: async () =>
      simulateRequest(
        {
          provider: 'Alinma Open Banking Sandbox',
          accountHolder: 'أ. أحمد عبد الله',
          linkedWallet: 'محفظة سلمان - حصالتي',
          currency: 'SAR',
          fetchedAt: new Date().toISOString(),
          transactions: [
            { id: 'AB-2201', type: 'إيداع', description: 'إيداع المصروف الأسبوعي', amount: 100, date: '2026-06-28T09:00:00' },
            { id: 'AB-2202', type: 'تحويل', description: 'تحويل مكافأة إنجاز مهمة إلى صندوق الادخار', amount: 20, date: '2026-06-29T18:30:00' },
            { id: 'AB-2203', type: 'خصم', description: 'شراء من متجر الألعاب الإلكتروني', amount: -10, date: '2026-06-30T14:12:00' },
            { id: 'AB-2204', type: 'تحويل', description: 'مساهمة في صندوق العطاء', amount: -5, date: '2026-07-01T11:05:00' },
          ],
        },
        1100,
      ),
  },
};

// ---------------- المكوّن الرئيسي ----------------
export default function App() {
  const [view, setView] = useState('landing');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [isParentAuthed, setIsParentAuthed] = useState(false);

  const [balances, setBalances] = useState({ spend: 90, save: 250, give: 40 });

  const idCounter = useRef(2000);
  const nextId = () => (idCounter.current += 1);

  const [tasks, setTasks] = useState([
    { id: 1, title: 'ترتيب الغرفة والمطالعة لمدة ٢٠ دقيقة', reward: 15, status: 'pending' },
    { id: 2, title: 'مساعدة العائلة في تجهيز وجبة العشاء', reward: 10, status: 'completed' },
    { id: 3, title: 'حل واجب الرياضيات المنزلي بالكامل', reward: 20, status: 'approved' },
  ]);

  const [transactions, setTransactions] = useState([
    { id: nextId(), box: 'save', type: 'income', amount: 20, label: 'مكافأة: حل واجب الرياضيات', date: new Date() },
    { id: nextId(), box: 'spend', type: 'expense', amount: 30, label: 'صرف على: ألعاب', date: new Date(Date.now() - 86400000) },
  ]);

  // ---------------- Toasts ----------------
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  };

  // ---------------- حالات التحميل لكل عملية على حدة ----------------
  const [approvingId, setApprovingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [spendingKey, setSpendingKey] = useState(null); // مثال: "spend-ألعاب"

  const addTransaction = (box, type, amount, label) => {
    setTransactions((prev) => [{ id: nextId(), box, type, amount, label, date: new Date() }, ...prev]);
  };

  // ---------------- منطق الدخول الآمن لبوابة الأب ----------------
  const requestParentAccess = () => setPinModalOpen(true);

  const handlePinSuccess = () => {
    setIsParentAuthed(true);
    setPinModalOpen(false);
    setView('parent');
    addToast('تم التحقق بنجاح ✅ أهلاً بك في بوابة الأولياء', 'success');
  };

  const goLanding = () => {
    setIsParentAuthed(false); // كل عودة للرئيسية تُبطل الجلسة الآمنة (Session-like behavior)
    setView('landing');
  };

  // ---------------- منطق المهام (Async) ----------------
  const addTask = (title, reward) => {
    if (!title.trim() || !reward || reward <= 0) return;
    setTasks((prev) => [...prev, { id: nextId(), title: title.trim(), reward: Math.round(reward), status: 'pending' }]);
    addToast('تمت إضافة المهمة الجديدة 📌', 'info');
  };

  const completeTask = async (id) => {
    setCompletingId(id);
    await simulateRequest(null, 500);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t)));
    setCompletingId(null);
    addToast('تم إرسال المهمة لمراجعة الأب بانتظار الاعتماد ⏳', 'info');
  };

  const approveTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status !== 'completed') return; // قيد منطقي صارم
    setApprovingId(id);
    try {
      await api.tasks.approve(task);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t)));
      setBalances((prev) => ({ ...prev, save: prev.save + task.reward }));
      addTransaction('save', 'income', task.reward, `مكافأة مهمة: ${task.title}`);
      addToast(`تم تحويل المكافأة بنجاح 💸 (+${task.reward} ريال لصندوق الادخار)`, 'success');
    } finally {
      setApprovingId(null);
    }
  };

  // ---------------- منطق الصناديق المالية (Async) ----------------
  const spendFromBox = async (box, amount, label, key) => {
    if (amount <= 0) return;
    if (balances[box] < amount) {
      addToast(`الرصيد غير كافٍ في ${boxLabels[box].name} (المتاح: ${balances[box]} ريال)`, 'error');
      return;
    }
    setSpendingKey(key);
    try {
      await api.wallet.spend(box, amount, label);
      setBalances((prev) => ({ ...prev, [box]: prev[box] - amount }));
      addTransaction(box, 'expense', amount, label);
      addToast(`تم تسجيل الصرف بنجاح (-${amount} ريال) 🧾`, 'success');
    } finally {
      setSpendingKey(null);
    }
  };

  const transferFromSpend = async (targetBox, amount, label, key) => {
    if (balances.spend < amount) {
      addToast(`رصيد صندوق الإنفاق لا يكفي لتحويل ${amount} ريال`, 'error');
      return;
    }
    setSpendingKey(key);
    try {
      await api.wallet.transfer('spend', targetBox, amount, label);
      setBalances((prev) => ({ ...prev, spend: prev.spend - amount, [targetBox]: prev[targetBox] + amount }));
      addTransaction('spend', 'expense', amount, label);
      addTransaction(targetBox, 'income', amount, label);
      addToast(`تم التحويل بنجاح 💸 (+${amount} ريال إلى ${boxLabels[targetBox].name})`, 'success');
    } finally {
      setSpendingKey(null);
    }
  };

  // ---------------- تحليل الذكاء الاصطناعي المبني على بيانات فعلية ----------------
  const aiAnalysis = useMemo(() => analyzeFinancialData(balances, transactions), [balances, transactions]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased" dir="rtl">
      <Header view={view} goLanding={goLanding} />

      {view === 'landing' && <Landing onSelectParent={requestParentAccess} onSelectChild={() => setView('child')} />}

      {view === 'parent' && isParentAuthed && (
        <ParentDashboard
          balances={balances}
          tasks={tasks}
          transactions={transactions}
          aiAnalysis={aiAnalysis}
          approvingId={approvingId}
          onAddTask={addTask}
          onApproveTask={approveTask}
        />
      )}

      {view === 'child' && (
        <ChildDashboard
          balances={balances}
          tasks={tasks}
          completingId={completingId}
          spendingKey={spendingKey}
          aiAnalysis={aiAnalysis}
          onCompleteTask={completeTask}
          onSpend={spendFromBox}
          onTransfer={transferFromSpend}
        />
      )}

      {pinModalOpen && (
        <PinModal onClose={() => setPinModalOpen(false)} onSuccess={handlePinSuccess} onFail={() => addToast('رمز التحقق غير صحيح ❌', 'error')} />
      )}

      <ToastContainer toasts={toasts} />

      <footer className="bg-white border-t border-slate-100 text-center py-4 text-xs text-slate-400 mt-auto">
        تم تطوير المنصة بامتثال تام مع موجهات الشمول المالي والمصرفية المفتوحة لبنك الإنماء وأكاديمية طويق ٢٠٢٦ ©
      </footer>
    </div>
  );
}

// ================= تحليل مالي ذكي (يُستخدم في التقارير والشات بوت) =================
function analyzeFinancialData(balances, transactions) {
  const total = balances.spend + balances.save + balances.give || 1;
  const spendPct = Math.round((balances.spend / total) * 100);
  const savePct = Math.round((balances.save / total) * 100);
  const givePct = 100 - spendPct - savePct;

  const spendTx = transactions.filter((t) => t.box === 'spend' && t.type === 'expense');
  const categoryTally = {};
  spendTx.forEach((t) => {
    const cat = t.label.replace('صرف على: ', '');
    categoryTally[cat] = (categoryTally[cat] || 0) + t.amount;
  });
  const topCategory = Object.entries(categoryTally).sort((a, b) => b[1] - a[1])[0];

  const spendExceedsSave = balances.spend > balances.save;
  const savingsHealthy = balances.save >= balances.spend * 1.2;

  let note;
  let severity = 'info';
  if (spendExceedsSave) {
    severity = 'warning';
    note = `تنبيه سلوكي: رصيد صندوق الإنفاق (${balances.spend} ريال) تجاوز رصيد الادخار (${balances.save} ريال). ننصح بتوجيه سلمان لتحويل جزء من مصروفه للادخار قبل أي عملية شراء جديدة.`;
  } else if (savingsHealthy) {
    severity = 'success';
    note = 'مستوى ادخار ممتاز! سلمان يوجّه جزءاً كبيراً من أمواله نحو المستقبل بدل الاستهلاك الفوري.';
  } else {
    note = 'التوازن بين الصناديق الثلاثة جيد، استمروا في متابعة المهام لتعزيز عادة الادخار تدريجياً.';
  }

  return { spendPct, savePct, givePct, topCategory, spendExceedsSave, savingsHealthy, note, severity };
}

// ================= الهيدر =================
function Header({ view, goLanding }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={goLanding}>
          <div className="bg-emerald-600 text-white p-2.5 rounded-2xl font-bold text-xl shadow-md shadow-emerald-600/20">
            حصـالتي
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight hidden sm:inline">
            منصة حصالتي{' '}
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">MVP</span>
          </span>
        </div>
        {view !== 'landing' && (
          <button
            onClick={goLanding}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition font-medium text-sm"
          >
            <FaArrowLeft className="text-xs" /> العودة للرئيسية
          </button>
        )}
      </div>
    </header>
  );
}

// ================= شاشة اختيار الدور =================
function Landing({ onSelectParent, onSelectChild }) {
  return (
    <main className="flex-grow flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 leading-tight">
        الاستقلال المالي الموجّه لجيل الغد ✨
      </h1>
      <p className="text-lg text-slate-600 mb-12 max-w-xl">
        مرحباً بك في منصة "حصالتي". يرجى اختيار نوع واجهة الدخول لاستعراض تجربة المستشار المالي والتحكم العائلي لحظياً.
      </p>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-8 w-full max-w-2xl">
        <div
          onClick={onSelectParent}
          className="relative bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-violet-500 cursor-pointer shadow-sm hover:shadow-xl transition-all group text-right"
        >
          <span className="absolute top-4 left-4 text-[10px] font-bold bg-violet-50 text-violet-600 px-2 py-1 rounded-full flex items-center gap-1">
            <FaLock /> يتطلب رمز تحقق
          </span>
          <div className="bg-violet-100 text-violet-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-violet-500 group-hover:text-white transition-all">
            <FaUserShield />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-slate-900">بوابة أولياء الأمور (الآباء)</h3>
          <p className="text-slate-600">
            متابعة الأرصدة، إسناد المهام المنزلية والموافقة على المكافآت والاطلاع على تقارير الذكاء الاصطناعي والمصرفية المفتوحة.
          </p>
        </div>

        <div
          onClick={onSelectChild}
          className="bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 cursor-pointer shadow-sm hover:shadow-xl transition-all group text-right"
        >
          <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <FaUserPlus />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-slate-900">بوابة الأبناء (الطفل والمراهق)</h3>
          <p className="text-slate-600">
            إدارة الصناديق الثلاثة الذكية بحصالتك، إنجاز المهام لكسب المال، والتحدث المباشر مع كوتش التوجيه الذكي "ذُخر".
          </p>
        </div>
      </div>
    </main>
  );
}

// ================= مودال رمز التحقق (PIN) =================
function PinModal({ onClose, onSuccess, onFail }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError(false);
    // محاكاة التحقق عبر الخادم (Auth Endpoint)
    await simulateRequest(null, 500);
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" dir="rtl">
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative ${error ? 'animate-shake' : ''}`}>
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-slate-700 transition">
          <FaTimes />
        </button>

        <div className="bg-violet-100 text-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5">
          <FaLock />
        </div>
        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">الدخول الآمن لبوابة الأولياء</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          لأسباب أمنية (Financial Security Guardrails)، يجب إدخال رمز التحقق الخاص بولي الأمر للمتابعة.
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
          {error && <p className="text-red-500 text-xs text-center mb-3">رمز غير صحيح، حاول مجدداً (تلميح تجريبي: 1234)</p>}

          <button
            type="submit"
            disabled={pin.length !== 4 || checking}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2 mt-3"
          >
            {checking ? (
              <>
                <FaSyncAlt className="animate-spin" /> جاري التحقق...
              </>
            ) : (
              'تحقق ودخول'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ================= نظام التنبيهات العائمة (Toasts) =================
function ToastContainer({ toasts }) {
  const styles = {
    success: 'bg-emerald-600',
    error: 'bg-red-500',
    info: 'bg-slate-800',
  };
  return (
    <div className="fixed bottom-5 left-5 z-[70] flex flex-col gap-2 max-w-xs">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles[t.type]} text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-lg animate-toast-in flex items-center gap-2`}
        >
          {t.type === 'success' && <FaCheckDouble className="shrink-0" />}
          {t.type === 'error' && <FaExclamationTriangle className="shrink-0" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ================= لوحة تحكم الأب =================
function ParentDashboard({ balances, tasks, transactions, aiAnalysis, approvingId, onAddTask, onApproveTask }) {
  const [tab, setTab] = useState('overview'); // overview | bank
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    onAddTask(newTaskTitle, parseInt(newTaskReward, 10));
    setNewTaskTitle('');
    setNewTaskReward('');
  };

  return (
    <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg mb-6 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            لوحة تحكم الأب: أ. أحمد عبد الله <FaLock className="text-sm text-violet-200" title="جلسة موثّقة" />
          </h2>
          <p className="text-violet-100 text-sm">مراقبة وإدارة أداء طفلك المالي في حصالتي: سـلمان (١٢ سنة)</p>
        </div>
      </div>

      {/* تبويبات */}
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit">
        <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={<FaChartPie />} label="نظرة عامة وتقارير" />
        <TabButton active={tab === 'bank'} onClick={() => setTab('bank')} icon={<FaUniversity />} label="ربط الحساب البنكي (Open Banking)" />
      </div>

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                <FaTasks className="text-violet-500" /> لوحة إدارة المهام العائلية
              </h3>

              <form onSubmit={handleAddTask} className="grid grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl">
                <input
                  type="text"
                  placeholder="مثال: قراءة كتاب، تنظيف غرفتك..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="col-span-3 sm:col-span-2 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                />
                <div className="col-span-3 sm:col-span-1 flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="المكافأة 💰"
                    value={newTaskReward}
                    onChange={(e) => setNewTaskReward(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 text-center text-sm"
                  />
                  <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-xl transition flex items-center justify-center shrink-0">
                    <FaPlus />
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-slate-200 transition">
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm md:text-base">{task.title}</h4>
                      <span className="text-xs font-bold text-violet-600 mt-1 inline-block">المكافأة الحافزة: +{task.reward} ريال</span>
                    </div>
                    <div className="shrink-0">
                      {task.status === 'pending' && (
                        <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-medium">في انتظار الإنجاز</span>
                      )}
                      {task.status === 'completed' && (
                        <button
                          onClick={() => onApproveTask(task.id)}
                          disabled={approvingId === task.id}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-medium px-4 py-2 rounded-xl transition flex items-center gap-1.5 min-w-[150px] justify-center"
                        >
                          {approvingId === task.id ? (
                            <>
                              <FaSyncAlt className="animate-spin" /> جاري التحويل...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle /> اعتماد وتحويل المكافأة
                            </>
                          )}
                        </button>
                      )}
                      {task.status === 'approved' && (
                        <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                          تم تحويل المال للحصالة ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                <FaHistory className="text-slate-500" /> سجل حركات الابن (أين ومتى صرف)
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pl-1">
                {transactions.length === 0 && <p className="text-sm text-slate-500 text-center py-4">لا توجد حركات مسجّلة بعد.</p>}
                {transactions.map((tr) => (
                  <div key={tr.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="font-medium text-slate-700">{tr.label}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {boxLabels[tr.box].name} • {formatDate(tr.date)}
                      </div>
                    </div>
                    <span className={`font-bold ${tr.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tr.type === 'income' ? '+' : '-'}
                      {tr.amount} ريال
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">
                <FaChartPie className="text-violet-500" /> توزيع الأرصدة (رسم تفاعلي)
              </h3>
              <DonutChart balances={balances} />
            </div>

            <div className={`p-6 rounded-3xl border shadow-sm ${aiAnalysis.severity === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <h3 className={`text-md font-bold mb-2 flex items-center gap-2 ${aiAnalysis.severity === 'warning' ? 'text-amber-800' : 'text-emerald-800'}`}>
                <FaRobot /> تقرير كوتش ذُخر للأبناء في حصالتي
              </h3>
              <p className={`text-xs leading-relaxed mb-3 ${aiAnalysis.severity === 'warning' ? 'text-amber-700' : 'text-emerald-700'}`}>{aiAnalysis.note}</p>
              <div className="flex gap-2 text-[11px] font-bold flex-wrap">
                <span className="bg-white px-2 py-1 rounded-lg text-orange-600">إنفاق {aiAnalysis.spendPct}%</span>
                <span className="bg-white px-2 py-1 rounded-lg text-violet-600">ادخار {aiAnalysis.savePct}%</span>
                <span className="bg-white px-2 py-1 rounded-lg text-emerald-600">عطاء {aiAnalysis.givePct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'bank' && <OpenBankingPanel />}
    </main>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
        active ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ================= رسم بياني Donut بـ SVG نقي =================
function DonutChart({ balances }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  const total = balances.spend + balances.save + balances.give || 1;
  const segments = [
    { key: 'spend', value: balances.spend },
    { key: 'save', value: balances.save },
    { key: 'give', value: balances.give },
  ];

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 160 160" className="w-44 h-44 -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="20" />
        {segments.map((seg) => {
          const fraction = seg.value / total;
          const dash = animate ? fraction * circumference : 0;
          const gap = circumference - dash;
          const offset = -cumulative * circumference;
          cumulative += fraction;
          return (
            <circle
              key={seg.key}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={boxLabels[seg.key].hex}
              strokeWidth="20"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 1.1s ease-out' }}
            />
          );
        })}
      </svg>
      <div className="grid grid-cols-3 gap-3 w-full mt-2 text-center">
        {segments.map((seg) => (
          <div key={seg.key}>
            <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: boxLabels[seg.key].hex }} />
            <div className="text-[11px] text-slate-500">{boxLabels[seg.key].name}</div>
            <div className="text-sm font-bold text-slate-800">{seg.value} ريال</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= محاكاة المصرفية المفتوحة (Open Banking Sandbox) =================
function OpenBankingPanel() {
  const [loading, setLoading] = useState(false);
  const [statement, setStatement] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    setStatement(null);
    const data = await api.bank.fetchStatement();
    setStatement(data);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">
            <FaUniversity />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">محاكاة ربط الحساب البنكي — بنك الإنماء</h3>
            <p className="text-xs text-slate-500">Open Banking Sandbox API (Transaction APIs) — بيئة تجريبية آمنة</p>
          </div>
        </div>
        <button
          onClick={handleFetch}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2"
        >
          {loading ? (
            <>
              <FaSyncAlt className="animate-spin" /> جاري الاتصال بالبنك...
            </>
          ) : (
            <>
              <FaSyncAlt /> استخراج كشف الحساب
            </>
          )}
        </button>
      </div>

      {loading && <BankSkeleton />}

      {!loading && !statement && (
        <p className="text-sm text-slate-400 text-center py-10">اضغط "استخراج كشف الحساب" لمحاكاة سحب البيانات عبر Open Banking API.</p>
      )}

      {!loading && statement && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-full mb-2">
              <FaCheckDouble /> متصل بنجاح: {statement.provider}
            </div>
            {statement.transactions.map((tr) => (
              <div key={tr.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-medium text-slate-700">{tr.description}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {tr.type} • {new Date(tr.date).toLocaleString('ar-SA')}
                  </div>
                </div>
                <span className={`font-bold ${tr.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tr.amount > 0 ? '+' : ''}
                  {tr.amount} ريال
                </span>
              </div>
            ))}
          </div>

          <div>
            <button
              onClick={() => setShowRawJson((s) => !s)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
            >
              <FaCode /> {showRawJson ? 'إخفاء استجابة الـ API الخام' : 'عرض استجابة الـ API الخام (JSON)'}
            </button>
            {showRawJson && (
              <pre className="bg-slate-900 text-emerald-300 text-[11px] leading-relaxed rounded-2xl p-4 overflow-x-auto max-h-80 overflow-y-auto" dir="ltr">
                {JSON.stringify(statement, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BankSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-slate-100 rounded-xl" />
      ))}
    </div>
  );
}

// ================= لوحة تحكم الابن =================
function ChildDashboard({ balances, tasks, completingId, spendingKey, aiAnalysis, onCompleteTask, onSpend, onTransfer }) {
  const pendingTasks = tasks.filter((t) => t.status !== 'approved');

  return (
    <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-lg mb-6 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">محفظة البطل: سلمان عبد الله 🪙</h2>
          <p className="text-emerald-50 text-sm">تعلم، ادخر واصنع مستقبلك المالي الذكي برعاية منصة حصالتي</p>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-medium">المستوى الذكي: ٢ 🔥</span>
      </div>

      {aiAnalysis.spendExceedsSave && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-2xl flex items-center gap-2">
          <FaExclamationTriangle className="shrink-0" /> {aiAnalysis.note}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <SpendBox balances={balances} onSpend={onSpend} spendingKey={spendingKey} />
        <SaveBox balances={balances} onTransfer={onTransfer} spendingKey={spendingKey} />
        <GiveBox balances={balances} onTransfer={onTransfer} spendingKey={spendingKey} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-4 text-slate-900">🎯 مهامي المطلوبة لكسب المال</h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl">
                <div>
                  <h4 className="font-medium text-slate-800 text-sm">{task.title}</h4>
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 inline-block">المكافأة: +{task.reward} ريال</span>
                </div>
                {task.status === 'pending' ? (
                  <button
                    onClick={() => onCompleteTask(task.id)}
                    disabled={completingId === task.id}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-xl transition shrink-0 min-w-[110px]"
                  >
                    {completingId === task.id ? <FaSyncAlt className="animate-spin inline" /> : 'تم الإنجاز! 🚀'}
                  </button>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium shrink-0">في انتظار موافقة الأب</span>
                )}
              </div>
            ))}
            {pendingTasks.length === 0 && <p className="text-center text-sm text-slate-500 py-6">لقد أنجزت جميع مهامك بالكامل اليوم يا بطل! 🌟</p>}
          </div>
        </div>

        <ZukhrChat balances={balances} aiAnalysis={aiAnalysis} />
      </div>
    </main>
  );
}

function SpendBox({ balances, onSpend, spendingKey }) {
  const options = [
    { key: 'ألعاب', amount: 10, icon: <FaGamepad /> },
    { key: 'وجبة/مطعم', amount: 15, icon: <FaUtensils /> },
    { key: 'ترفيه', amount: 8, icon: <FaFilm /> },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-orange-100 shadow-sm text-center">
      <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">
        <FaWallet />
      </div>
      <h3 className="text-slate-600 font-medium text-sm mb-1">صندوق الإنفاق المباشر</h3>
      <div className="text-3xl font-bold text-slate-900 mb-4">{balances.spend} ريال</div>
      <div className="space-y-2">
        {options.map((opt) => {
          const key = `spend-${opt.key}`;
          const isLoading = spendingKey === key;
          return (
            <button
              key={opt.key}
              disabled={isLoading}
              onClick={() => onSpend('spend', opt.amount, `صرف على: ${opt.key}`, key)}
              className="w-full flex items-center justify-between text-xs bg-orange-50 text-orange-600 font-bold py-2.5 px-3 rounded-xl hover:bg-orange-500 hover:text-white transition disabled:opacity-60"
            >
              <span className="flex items-center gap-1">
                {isLoading ? <FaSyncAlt className="animate-spin" /> : opt.icon} {opt.key}
              </span>
              <span>-{opt.amount} ريال</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SaveBox({ balances, onTransfer, spendingKey }) {
  const key = 'save-transfer';
  const isLoading = spendingKey === key;
  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-violet-100 shadow-sm text-center">
      <div className="bg-violet-100 text-violet-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">
        <FaPiggyBank />
      </div>
      <h3 className="text-slate-600 font-medium text-sm mb-1">صندوق الادخار للحصالة</h3>
      <div className="text-3xl font-bold text-slate-900 mb-4">{balances.save} ريال</div>
      <button
        disabled={isLoading}
        onClick={() => onTransfer('save', 10, 'تحويل من الإنفاق إلى الادخار', key)}
        className="w-full text-[11px] bg-violet-50 text-violet-600 font-bold py-2.5 rounded-xl hover:bg-violet-600 hover:text-white transition disabled:opacity-60 flex items-center justify-center gap-1"
      >
        {isLoading && <FaSyncAlt className="animate-spin" />} ادخر من الإنفاق للحصالة (+١٠)
      </button>
    </div>
  );
}

function GiveBox({ balances, onTransfer, spendingKey }) {
  const key = 'give-transfer';
  const isLoading = spendingKey === key;
  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm text-center">
      <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">
        <FaHeart />
      </div>
      <h3 className="text-slate-600 font-medium text-sm mb-1">صندوق العطاء والتبرع</h3>
      <div className="text-3xl font-bold text-slate-900 mb-4">{balances.give} ريال</div>
      <button
        disabled={isLoading}
        onClick={() => onTransfer('give', 5, 'تبرع ومساهمة خيرية', key)}
        className="w-full text-xs bg-emerald-50 text-emerald-600 font-bold py-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition disabled:opacity-60 flex items-center justify-center gap-1"
      >
        {isLoading && <FaSyncAlt className="animate-spin" />} تبرع ومساهمة خيرية مجتمعية (+٥ ريال)
      </button>
    </div>
  );
}

// ================= كوتش ذُخر — يحلل بيانات حقيقية قبل الرد =================
function ZukhrChat({ balances, aiAnalysis }) {
  const [chatInput, setChatInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'أهلاً بك يا بطل! أنا كوتش المالي الخاص بك "ذُخر" من منصة حصالتي. كيف يمكنني مساعدتك اليوم في التخطيط لصناديقك المالية؟ 🪙✨',
    },
  ]);

  const buildResponse = (userMsg) => {
    // القاعدة الأهم: تحليل حقيقي لمقارنة الإنفاق بالادخار قبل أي رد آخر
    if (aiAnalysis.spendExceedsSave && (userMsg.includes('صرف') || userMsg.includes('ألعاب') || userMsg.includes('اشتري') || userMsg === '')) {
      const topCat = aiAnalysis.topCategory ? `، ولاحظت أن أغلب إنفاقك يذهب إلى "${aiAnalysis.topCategory[0]}"` : '';
      return `⚠️ انتبه: رصيد صندوق إنفاقك (${balances.spend} ريال) أصبح أعلى من رصيد ادخارك (${balances.save} ريال)${topCat}. أقترح تحويل جزء من إنفاقك للادخار الآن قبل أي عملية شراء جديدة، حتى لا تفقد فرصة تحقيق هدفك القادم.`;
    }
    if (userMsg.includes('ادخر') || userMsg.includes('أشتري') || userMsg.includes('هدف')) {
      return `حسب معدل ادخارك الحالي في صندوق الادخار بالحصالة (${balances.save} ريال)، أنت تسير بخطى ممتازة لتحقيق هدفك القادم! استمر وتجنب الصرف الاندفاعي المستهلك. 🎯`;
    }
    if (userMsg.includes('صرف') || userMsg.includes('ألعاب')) {
      if (balances.spend < 10) {
        return `تنبيه ⚠️: رصيد صندوق الإنفاق لديك منخفض حالياً (${balances.spend} ريال فقط)، يُفضّل تأجيل أي شراء غير ضروري حتى تنجز مهمة جديدة.`;
      }
      return `رصيد صندوق الإنفاق الحالي لديك هو ${balances.spend} ريال. أنصحك بعدم استهلاك أكثر من ٢٠ ريال اليوم حتى لا تنفد ميزانيتك الأسبوعية مبكراً! ⚠️`;
    }
    if (userMsg.includes('تبرع') || userMsg.includes('عطاء')) {
      return `فخور بك جداً! رصيد صندوق العطاء لديك الآن ${balances.give} ريال، والتبرع والمساهمة المجتمعية يباركان في مالك ويصنعان منك قائداً مسؤولاً وعطاءً. 🌟❤️`;
    }
    return 'رائع جداً! تذكر دائماً أن تقسيم المال في منصة حصالتي بين الصناديق الثلاثة (الإنفاق، الادخار، العطاء) هو سر نجاحك المالي الذكي مستقبلاً! 💸🚀';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setThinking(true);

    // محاكاة زمن معالجة نموذج الذكاء الاصطناعي
    await simulateRequest(null, 750);
    setMessages((prev) => [...prev, { sender: 'bot', text: buildResponse(userMsg) }]);
    setThinking(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[440px] overflow-hidden">
      <div className="bg-slate-900 text-white p-4 flex items-center gap-3">
        <div className="bg-emerald-600 p-2 rounded-xl text-white text-md">
          <FaRobot />
        </div>
        <div>
          <h4 className="font-bold text-sm">الكوتش المالي الذكي: ذُخر 🤖</h4>
          <span className="text-[10px] text-emerald-400 font-medium">تحليل سلوكي استباقي متطور لحصالتك</span>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto space-y-3 flex flex-col">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
              msg.sender === 'bot' ? 'bg-slate-100 text-slate-800 self-start rounded-tr-none' : 'bg-emerald-500 text-white self-end rounded-tl-none'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {thinking && (
          <div className="self-start bg-slate-100 rounded-2xl rounded-tr-none px-4 py-3 flex gap-1 items-center">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50">
        <input
          type="text"
          placeholder="اسأل ذُخر (مثال: كيف أزيد مدخرات حصالتي اليوم؟)"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-grow px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white text-sm"
        />
        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl transition font-medium text-sm shrink-0">
          إرسال
        </button>
      </form>
    </div>
  );
}
