import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("CHILD"); const { id } = await params;
  if (!user || id !== "me") return NextResponse.json({ message: "غير مصرح" }, { status: 403 });
  const body = await req.json().catch(() => null); const requested = Number(body?.points);
  if (!Number.isInteger(requested) || requested < 0 || requested > 40 || body?.source !== "trivia") return NextResponse.json({ message: "نقاط غير صالحة" }, { status: 400 });
  const profile = await prisma.childProfile.findUnique({ where: { userId: user.id } }); if (!profile) return NextResponse.json({ message: "الملف غير موجود" }, { status: 404 });
  const today = new Date(); today.setHours(0, 0, 0, 0); const existing = await prisma.pointEvent.findFirst({ where: { childProfileId: profile.id, reason: "لعبة الوعي المالي", createdAt: { gte: today } } });
  if (existing) return NextResponse.json({ message: "لقد حصلت على نقاط اللعبة اليوم، عد غدًا لتحدٍ جديد!" });
  await prisma.$transaction([prisma.childProfile.update({ where: { id: profile.id }, data: { points: { increment: requested } } }), prisma.pointEvent.create({ data: { childProfileId: profile.id, points: requested, reason: "لعبة الوعي المالي" } })]);
  return NextResponse.json({ message: `رائع! أضفنا ${requested} نقطة إلى حصالتك.` });
}
