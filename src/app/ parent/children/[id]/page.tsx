import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { parentOwnsChild } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import AIParentInsights from "@/components/AIParentInsights";

export default async function ChildReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") redirect("/login");
  if (!(await parentOwnsChild(session.user.id, id))) notFound();
  const child = await prisma.user.findUnique({ where: { id }, include: { childProfile: { include: { transactions: { orderBy: { occurredAt: "desc" }, take: 20 }, goals: true, pointEvents: { orderBy: { createdAt: "desc" }, take: 8 }, redemptions: { include: { reward: true }, orderBy: { redeemedAt: "desc" } } } } } });
  if (!child?.childProfile) notFound(); const c = child.childProfile;
  return <main className="shell"><Link href="/parent" className="navlink inline-block bg-white shadow-sm">→ العودة للأطفال</Link><header className="mt-6 flex flex-wrap items-end justify-between gap-3"><div><p className="font-bold text-[#087f5b]">تقرير الطفل</p><h1 className="text-3xl font-black">{child.name} {c.avatar ?? "🧒"}</h1></div><div className="rounded-2xl bg-[#d8f5a2] px-5 py-3 font-black">{c.points} نقطة · المستوى {c.level}</div></header>
    <section className="mt-7 grid gap-5 lg:grid-cols-3"><div className="card p-5 lg:col-span-2"><h2 className="text-lg font-black">الحركات المالية</h2><div className="mt-4 divide-y divide-slate-100">{c.transactions.map(t => <div className="flex items-center justify-between py-3" key={t.id}><div><b>{t.category}</b><p className="text-xs text-slate-400">{t.description ?? "بدون وصف"}</p></div><span className={t.type === "EXPENSE" ? "font-bold text-rose-600" : "font-bold text-[#087f5b]"}>{t.type === "EXPENSE" ? "-" : "+"}{t.amount} ر.س</span></div>)}</div></div><div className="card p-5"><h2 className="font-black">أهداف الادخار</h2>{c.goals.map(g => <div key={g.id} className="mt-4"><div className="flex justify-between text-sm"><b>{g.title}</b><span>{g.currentAmount}/{g.targetAmount}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#16a36f]" style={{ width: `${Math.min(100, g.currentAmount / g.targetAmount * 100)}%` }}/></div></div>)}</div></section>
    <section className="mt-5 grid gap-5 lg:grid-cols-2"><div className="card p-5"><h2 className="font-black">النقاط والمكافآت</h2><div className="mt-3 space-y-2 text-sm">{c.pointEvents.map(p => <p key={p.id} className="flex justify-between rounded-xl bg-amber-50 p-3"><span>{p.reason}</span><b>+{p.points}</b></p>)}{c.redemptions.map(r => <p key={r.id} className="flex justify-between rounded-xl bg-slate-50 p-3"><span>{r.reward.title}</span><b>{r.pointsSpent}−</b></p>)}</div></div><AIParentInsights childId={id} childName={child.name ?? "طفلك"}/></section>
  </main>;
}
