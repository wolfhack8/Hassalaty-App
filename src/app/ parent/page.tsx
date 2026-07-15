import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Baby, Coins, Trophy, Users } from "lucide-react";

export default async function ParentDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") redirect("/login");
  const links = await prisma.parentChild.findMany({ where: { parentId: session.user.id }, include: { child: { include: { childProfile: { include: { challenges: { where: { isCompleted: false }, take: 1 } } } } } } });
  return <main className="shell"><header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold text-[#087f5b]">لوحة ولي الأمر</p><h1 className="text-3xl font-black">مرحبًا {session.user.name ?? "بك"} 👋</h1><p className="mt-2 text-slate-500">تابع تقدّم أطفالك المالي وشجّع عاداتهم الذكية.</p></div><Link href="/login" className="navlink bg-white shadow-sm">تبديل الحساب</Link></header>
    <section className="mb-7 grid gap-4 md:grid-cols-3"><div className="card p-5"><Users className="text-[#087f5b]"/><p className="mt-3 text-sm text-slate-500">الأطفال المرتبطون</p><strong className="text-3xl">{links.length}</strong></div><div className="card p-5"><Coins className="text-amber-500"/><p className="mt-3 text-sm text-slate-500">إجمالي النقاط</p><strong className="text-3xl">{links.reduce((n, x) => n + (x.child.childProfile?.points ?? 0), 0)}</strong></div><div className="card p-5"><Trophy className="text-purple-600"/><p className="mt-3 text-sm text-slate-500">التحديات النشطة</p><strong className="text-3xl">{links.reduce((n, x) => n + x.child.childProfile!.challenges.length, 0)}</strong></div></section>
    <h2 className="mb-4 text-xl font-black">أطفالي</h2><section className="grid gap-4 md:grid-cols-2">{links.map(({ child }) => <Link key={child.id} href={`/parent/children/${child.id}`} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:border-[#16a36f]"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d8f5a2] text-2xl">{child.childProfile?.avatar ?? "🧒"}</div><div className="flex-1"><h3 className="font-black">{child.name}</h3><p className="mt-1 text-sm text-slate-500">المستوى {child.childProfile?.level} · {child.childProfile?.points} نقطة</p></div><ArrowLeft className="text-slate-400 transition group-hover:-translate-x-1"/></Link>)}</section>
  </main>;
}
