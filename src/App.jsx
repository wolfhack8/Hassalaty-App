import React, { useState, useMemo, useRef } from 'react';
import {
  FaWallet, FaPiggyBank, FaHeart, FaTasks, FaRobot, FaUserShield,
  FaUserPlus, FaCheckCircle, FaPlus, FaArrowLeft, FaHistory,
  FaExclamationTriangle, FaGamepad, FaUtensils, FaFilm
} from 'react-icons/fa';

/* ============================================================
   منصة حصالتي — MVP
   ------------------------------------------------------------
   الحالة المركزية (balances / tasks / transactions) موجودة كلها
   داخل App الأب، وتُمرَّر كـ props لكل من لوحتي الأب والابن.
   بهذا الشكل أي تغيير (إضافة/اعتماد مهمة، صرف من صندوق) ينعكس
   فوراً في الواجهتين لأنهما تقرآن من نفس المصدر الواحد للحقيقة
   (Single Source of Truth) بدل أن تحتفظ كل واجهة بنسخة خاصة بها.
   ============================================================ */

// ---------- أدوات مساعدة عامة ----------
const formatDate = (d) =>
  d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const boxLabels = {
  spend: { name: 'صندوق الإنفاق', color: 'orange' },
  save: { name: 'صندوق الادخار', color: 'violet' },
  give: { name: 'صندوق العطاء', color: 'emerald' },
};

// ---------- المكون الرئيسي ----------
export default function App() {
  const [view, setView] = useState('landing');

  // الحالة المركزية للأرصدة
  const [balances, setBalances] = useState({ spend: 120, save: 250, give: 40 });

  // عدّاد معرّفات آمن (بدل الاعتماد فقط على Date.now الذي قد يتكرر
  // إن أضيف أكثر من عنصر بنفس المليّة الزمنية)
  const idCounter = useRef(1000);
  const nextId = () => {
    idCounter.current += 1;
    return idCounter.current;
  };

  // المهام
  const [tasks, setTasks] = useState([
    { id: 1, title: 'ترتيب الغرفة والمطالعة لمدة ٢٠ دقيقة', reward: 15, status: 'pending' },
    { id: 2, title: 'مساعدة العائلة في تجهيز وجبة العشاء', reward: 10, status: 'completed' },
    { id: 3, title: 'حل واجب الرياضيات المنزلي بالكامل', reward: 20, status: 'approved' },
  ]);

  // سجل الحركات المالية (المصدر الذي تعرضه لوحة الأب كـ "أين وصرف متى")
  const [transactions, setTransactions] = useState([
    { id: nextId(), box: 'save', type: 'income', amount: 20, label: 'مكافأة: حل واجب الرياضيات', date: new Date() },
  ]);

  const addTransaction = (box, type, amount, label) => {
    setTransactions((prev) => [
      { id: nextId(), box, type, amount, label, date: new Date() },
      ...prev,
    ]);
  };

  // ---------- منطق المهام ----------
  const addTask = (title, reward) => {
    if (!title.trim() || !reward || reward <= 0) return;
    setTasks((prev) => [...prev, { id: nextId(), title: title.trim(), reward: Math.round(reward), status: 'pending' }]);
  };

  const completeTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t)));
  };

  // عند اعتماد الأب: تنتقل حالة المهمة + يُضاف المبلغ فعلياً لصندوق ادخار الابن + يُسجَّل في السجل
  const approveTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status !== 'completed') return; // قيد منطقي: لا اعتماد إلا لمهمة مكتملة فعلاً
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t)));
    setBalances((prev) => ({ ...prev, save: prev.save + task.reward }));
    addTransaction('save', 'income', task.reward, `مكافأة مهمة: ${task.title}`);
  };

  // ---------- منطق الصناديق المالية ----------
  // خصم من صندوق مع قيد منطقي صارم: لا يمكن تجاوز الرصيد المتاح إطلاقاً
  const spendFromBox = (box, amount, label) => {
    if (amount <= 0) return { ok: false, message: 'المبلغ غير صالح.' };
    if (balances[box] < amount) {
      return { ok: false, message: `الرصيد غير كافٍ في ${boxLabels[box].name} (المتاح: ${balances[box]} ريال).` };
    }
    setBalances((prev) => ({ ...prev, [box]: prev[box] - amount }));
    addTransaction(box, 'expense', amount, label);
    return { ok: true };
  };

  // تحويل من صندوق الإنفاق إلى الادخار أو العطاء، بنفس القيد المنطقي لعدم تجاوز الرصيد
  const transferFromSpend = (targetBox, amount, label) => {
    if (balances.spend < amount) {
      return { ok: false, message: `رصيد صندوق الإنفاق لا يكفي لتحويل ${amount} ريال.` };
    }
    setBalances((prev) => ({
      ...prev,
      spend: prev.spend - amount,
      [targetBox]: prev[targetBox] + amount,
    }));
    addTransaction('spend', 'expense', amount, label);
    addTransaction(targetBox, 'income', amount, label);
    return { ok: true };
  };

  // ---------- تقرير الذكاء الاصطناعي (مبني على الحالة الحقيقية) ----------
  const aiReport = useMemo(() => {
    const total = balances.spend + balances.save + balances.give || 1;
    const savePct = Math.round((balances.save / total) * 100);
    const spendPct = Math.round((balances.spend / total) * 100);
    const givePct = 100 - savePct - spendPct;

    let note;
    if (savePct >= 50) {
      note = 'مستوى ادخار ممتاز! سلمان يوجّه أكثر من نصف أمواله نحو المستقبل بدل الاستهلاك الفوري.';
    } else if (spendPct >= 60) {
      note = 'تنبيه: نسبة الإنفاق مرتفعة نسبياً هذا الأسبوع، يُنصح بتشجيعه على تحويل جزء من مصروفه للادخار.';
    } else {
      note = 'التوازن بين الصناديق الثلاثة جيد، استمروا في متابعة المهام لتعزيز عادة الادخار تدريجياً.';
    }
    return { savePct, spendPct, givePct, note };
  }, [balances]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased" dir="rtl">
      <Header view={view} setView={setView} />

      {view === 'landing' && <Landing setView={setView} />}

      {view === 'parent' && (
        <ParentDashboard
          balances={balances}
          tasks={tasks}
          transactions={transactions}
          aiReport={aiReport}
          onAddTask={addTask}
          onApproveTask={approveTask}
        />
      )}

      {view === 'child' && (
        <ChildDashboard
          balances={balances}
          tasks={tasks}
          onCompleteTask={completeTask}
          onSpend={spendFromBox}
          onTransfer={transferFromSpend}
        />
      )}

      <footer className="bg-white border-t border-slate-100 text-center py-4 text-xs text-slate-400 mt-auto">
        تم تطوير المنصة بامتثال تام مع موجهات الشمول المالي والمصرفية المفتوحة لبنك الإنماء وأكاديمية طويق ٢٠٢٦ ©
      </footer>
    </div>
  );
}

// ================= الهيدر =================
function Header({ view, setView }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-emerald-600 text-white p-2.5 rounded-2xl font-bold text-xl shadow-md shadow-emerald-600/20">
            حصـالتي
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight hidden sm:inline">
            منصة حصالتي{' '}
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              النسخة التجريبية MVP
            </span>
          </span>
        </div>
        {view !== 'landing' && (
          <button
            onClick={() => setView('landing')}
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
function Landing({ setView }) {
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
          onClick={() => setView('parent')}
          className="bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-violet-500 cursor-pointer shadow-sm hover:shadow-xl transition-all group text-right"
        >
          <div className="bg-violet-100 text-violet-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-violet-500 group-hover:text-white transition-all">
            <FaUserShield />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-slate-900">بوابة أولياء الأمور (الآباء)</h3>
          <p className="text-slate-600">
            متابعة الأرصدة، إسناد المهام المنزلية والموافقة على المكافآت والاطلاع على تقارير الذكاء الاصطناعي لنمو وعي طفلك.
          </p>
        </div>

        <div
          onClick={() => setView('child')}
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

// ================= لوحة تحكم الأب =================
function ParentDashboard({ balances, tasks, transactions, aiReport, onAddTask, onApproveTask }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    onAddTask(newTaskTitle, parseInt(newTaskReward, 10));
    setNewTaskTitle('');
    setNewTaskReward('');
  };

  const total = balances.spend + balances.save + balances.give || 1;

  return (
    <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-1">لوحة تحكم الأب: أ. أحمد عبد الله 👋</h2>
        <p className="text-violet-100 text-sm">مراقبة وإدارة أداء طفلك المالي في حصالتي: سـلمان (١٢ سنة)</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* عمود المهام + سجل الحركات */}
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
                <button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-xl transition flex items-center justify-center shrink-0"
                >
                  <FaPlus />
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-slate-200 transition"
                >
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm md:text-base">{task.title}</h4>
                    <span className="text-xs font-bold text-violet-600 mt-1 inline-block">
                      المكافأة الحافزة: +{task.reward} ريال
                    </span>
                  </div>
                  <div className="shrink-0">
                    {task.status === 'pending' && (
                      <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-medium">
                        في انتظار الإنجاز
                      </span>
                    )}
                    {task.status === 'completed' && (
                      <button
                        onClick={() => onApproveTask(task.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-xl transition flex items-center gap-1"
                      >
                        <FaCheckCircle /> اعتماد وتحويل المكافأة
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

          {/* سجل الحركات المالية — يظهر فوراً أي صرف يقوم به الابن */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
              <FaHistory className="text-slate-500" /> سجل حركات الابن (أين ومتى صرف)
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pl-1">
              {transactions.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">لا توجد حركات مسجّلة بعد.</p>
              )}
              {transactions.map((tr) => (
                <div
                  key={tr.id}
                  className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
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

        {/* عمود التحليل والتقارير */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-slate-900">📊 تحليل صرف الأرصدة الحالية للابن</h3>
            <div className="space-y-4">
              <BalanceBar label="صندوق الإنفاق (الاستهلاك الحالي)" value={balances.spend} pct={Math.round((balances.spend / total) * 100)} color="bg-orange-500" />
              <BalanceBar label="صندوق الادخار (الأهداف المستقبلية)" value={balances.save} pct={Math.round((balances.save / total) * 100)} color="bg-violet-500" />
              <BalanceBar label="صندوق العطاء (المجتمع والخير)" value={balances.give} pct={Math.round((balances.give / total) * 100)} color="bg-emerald-500" />
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
            <h3 className="text-md font-bold mb-2 flex items-center gap-2 text-emerald-800">
              <FaRobot /> تقرير كوتش ذُخر للأبناء في حصالتي
            </h3>
            <p className="text-xs text-emerald-700 leading-relaxed mb-3">{aiReport.note}</p>
            <div className="flex gap-2 text-[11px] font-bold">
              <span className="bg-white px-2 py-1 rounded-lg text-orange-600">إنفاق {aiReport.spendPct}%</span>
              <span className="bg-white px-2 py-1 rounded-lg text-violet-600">ادخار {aiReport.savePct}%</span>
              <span className="bg-white px-2 py-1 rounded-lg text-emerald-600">عطاء {aiReport.givePct}%</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function BalanceBar({ label, value, pct, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1 font-medium">
        <span>{label}</span>
        <span className="font-bold">{value} ريال</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}></div>
      </div>
    </div>
  );
}

// ================= لوحة تحكم الابن =================
function ChildDashboard({ balances, tasks, onCompleteTask, onSpend, onTransfer }) {
  const [error, setError] = useState('');

  const notify = (result) => {
    if (!result.ok) {
      setError(result.message);
      setTimeout(() => setError(''), 3500);
    }
  };

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

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-2xl flex items-center gap-2">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <SpendBox balances={balances} onSpend={onSpend} notify={notify} />
        <SaveBox balances={balances} onTransfer={onTransfer} notify={notify} />
        <GiveBox balances={balances} onTransfer={onTransfer} notify={notify} />
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
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shrink-0"
                  >
                    تم الإنجاز! 🚀
                  </button>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium shrink-0">
                    في انتظار موافقة الأب
                  </span>
                )}
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-6">لقد أنجزت جميع مهامك بالكامل اليوم يا بطل! 🌟</p>
            )}
          </div>
        </div>

        <ZukhrChat balances={balances} />
      </div>
    </main>
  );
}

// -------- صندوق الإنفاق: يسمح للطفل باختيار فئة صرف حقيقية --------
function SpendBox({ balances, onSpend, notify }) {
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
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => notify(onSpend('spend', opt.amount, `صرف على: ${opt.key}`))}
            className="w-full flex items-center justify-between text-xs bg-orange-50 text-orange-600 font-bold py-2.5 px-3 rounded-xl hover:bg-orange-500 hover:text-white transition"
          >
            <span className="flex items-center gap-1">{opt.icon} {opt.key}</span>
            <span>-{opt.amount} ريال</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// -------- صندوق الادخار --------
function SaveBox({ balances, onTransfer, notify }) {
  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-violet-100 shadow-sm text-center">
      <div className="bg-violet-100 text-violet-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">
        <FaPiggyBank />
      </div>
      <h3 className="text-slate-600 font-medium text-sm mb-1">صندوق الادخار للحصالة</h3>
      <div className="text-3xl font-bold text-slate-900 mb-4">{balances.save} ريال</div>
      <button
        onClick={() => notify(onTransfer('save', 10, 'تحويل من الإنفاق إلى الادخار'))}
        className="w-full text-[11px] bg-violet-50 text-violet-600 font-bold py-2.5 rounded-xl hover:bg-violet-600 hover:text-white transition"
      >
        ادخر من الإنفاق للحصالة (+١٠)
      </button>
    </div>
  );
}

// -------- صندوق العطاء --------
function GiveBox({ balances, onTransfer, notify }) {
  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm text-center">
      <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">
        <FaHeart />
      </div>
      <h3 className="text-slate-600 font-medium text-sm mb-1">صندوق العطاء والتبرع</h3>
      <div className="text-3xl font-bold text-slate-900 mb-4">{balances.give} ريال</div>
      <button
        onClick={() => notify(onTransfer('give', 5, 'تبرع ومساهمة خيرية'))}
        className="w-full text-xs bg-emerald-50 text-emerald-600 font-bold py-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition"
      >
        تبرع ومساهمة خيرية مجتمعية (+٥ ريال)
      </button>
    </div>
  );
}

// -------- كوتش ذُخر: يقرأ الأرصدة الحقيقية من الحالة --------
function ZukhrChat({ balances }) {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'أهلاً بك يا بطل! أنا كوتش المالي الخاص بك "ذُخر" من منصة حصالتي. كيف يمكنني مساعدتك اليوم في التخطيط لصناديقك المالية؟ 🪙✨',
    },
  ]);

  const buildResponse = (userMsg) => {
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const newMessages = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMessages);
    setChatInput('');

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text: buildResponse(userMsg) }]);
    }, 700);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[420px] overflow-hidden">
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
              msg.sender === 'bot'
                ? 'bg-slate-100 text-slate-800 self-start rounded-tr-none'
                : 'bg-emerald-500 text-white self-end rounded-tl-none'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50">
        <input
          type="text"
          placeholder="اسأل ذُخر (مثال: كيف أزيد مدخرات حصالتي اليوم؟)"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-grow px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white text-sm"
        />
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl transition font-medium text-sm shrink-0"
        >
          إرسال
        </button>
      </form>
    </div>
  );
}
