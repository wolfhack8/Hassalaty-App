import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  const user = await requireUser("CHILD"); if (!user) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  const { rewardId } = await req.json().catch(() => ({})); const profile = await prisma.childProfile.findUnique({ where: { userId: user.id } }); const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!profile || !reward || !reward.isActive) return NextResponse.json({ message: "المكافأة غير متاحة" }, { status: 404 });
  const link = await prisma.parentChild.findUnique({ where: { parentId_childId: { parentId: reward.parentId, childId: user.id } } }); if (!link) return NextResponse.json({ message: "هذه المكافأة ليست لك" }, { status: 403 });
  if (profile.points < reward.pointsCost) return NextResponse.json({ message: "نقاطك لا تكفي لهذه المكافأة" }, { status: 400 });
  await prisma.$transaction([prisma.childProfile.update({ where: { id: profile.id }, data: { points: { decrement: reward.pointsCost } } }), prisma.redeemedReward.create({ data: { childProfileId: profile.id, rewardId: reward.id, pointsSpent: reward.pointsCost } }), prisma.pointEvent.create({ data: { childProfileId: profile.id, points: -reward.pointsCost, reason: `استبدال: ${reward.title}` } })]);
  return NextResponse.json({ message: "تم إرسال طلبك لولي الأمر للموافقة." });
}
