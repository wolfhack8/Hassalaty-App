import { NextResponse } from "next/server";
import { requireUser, parentOwnsChild } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
type Insight = { summary: string; behaviorAnalysis: string; recommendations: string[]; suggestedChallenge: { title: string; description: string; pointsReward: number } };
function fallback(name: string, totals: Record<string, number>, expenses: number): Insight {
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]; const share = top && expenses ? Math.round(top[1] / expenses * 100) : 0;
  const category = top?.[0] ?? "الادخار";
  return { summary: `${name} أنفق ${expenses.toFixed(0)} ر.س هذا الأسبوع. أكبر فئة هي «${category}» بنسبة ${share}%.`, behaviorAnalysis: share >= 50 ? `هناك تركيز واضح على ${category}. هذا وقت مناسب لحوار هادئ حول الفرق بين الحاجة والرغبة.` : "الإنفاق متوازن نسبيًا، ويمكن تعزيز عادة الادخار المنتظم.", recommendations: ["اتفقا على مبلغ ادخار صغير قبل الشراء.", `ناقشا مشتريات «${category}» واختارا بديلًا واحدًا أقل تكلفة.`, "احتفلا بالقرارات الذكية بدل التركيز على المنع."], suggestedChallenge: { title: "بطل الادخار", description: `وفّر 10 ر.س هذا الأسبوع قبل شراء أي شيء من فئة ${category}.`, pointsReward: 25 } };
}
export async function POST(req: Request) {
  const user = await requireUser("PARENT"); const { childId } = await req.json().catch(() => ({})); if (!user || typeof childId !== "string" || !(await parentOwnsChild(user.id, childId))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const child = await prisma.user.findUnique({ where: { id: childId }, include: { childProfile: { include: { transactions: { where: { occurredAt: { gte: new Date(Date.now() - 7 * 864e5) }, type: "EXPENSE" } } } } } }); if (!child?.childProfile) return NextResponse.json({ error: "الطفل غير موجود" }, { status: 404 });
  const totals = child.childProfile.transactions.reduce<Record<string, number>>((a, t) => ({ ...a, [t.category]: (a[t.category] ?? 0) + t.amount }), {}); const expenses = Object.values(totals).reduce((a, b) => a + b, 0); const local = fallback(child.name ?? "طفلك", totals, expenses);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json(local);
  try { const prompt = `أنت مرشد مالي تربوي عربي. حلل بيانات طفل دون تشخيص أو لوم. أعد JSON فقط بهذه المفاتيح: summary, behaviorAnalysis, recommendations (مصفوفة 3), suggestedChallenge {title,description,pointsReward}. الاسم: ${child.name}. الإنفاق الأسبوعي: ${JSON.stringify(totals)}. إجمالي الإنفاق: ${expenses}.`; const r = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini", temperature: 0.35, messages: [{ role: "user", content: prompt }] }) }); const data = await r.json(); const text = data.choices?.[0]?.message?.content; const ai = JSON.parse(text.replace(/^```json|```$/g, "").trim()) as Insight; return NextResponse.json(ai); } catch { return NextResponse.json(local); }
}
