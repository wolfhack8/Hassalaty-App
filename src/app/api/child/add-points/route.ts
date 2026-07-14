// src/app/api/child/add-points/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { childId, pointsEarned, challengeId } = await req.json();

    if (!childId || pointsEarned === undefined) {
      return NextResponse.json({ error: 'البيانات المرسلة غير مكتملة' }, { status: 400 });
    }

    // تحديث رصيد نقاط الطفل بزيادة تراكمية
    const child = await prisma.user.update({
      where: { id: childId },
      data: {
        points: {
          increment: pointsEarned,
        },
      },
    });

    // في حال كان الفوز مرتبطاً بتحدي أسبوعي معين، نقوم بوضعه كـ "مكتمل"
    if (challengeId) {
      await prisma.weeklyChallenge.update({
        where: { id: challengeId },
        data: { isCompleted: true },
      });
    }

    return NextResponse.json({
      success: true,
      currentPoints: child.points,
      message: `مبروك! تم شحن حصالتك بـ ${pointsEarned} نقطة بنجاح 🪙✨`,
    });
  } catch (error) {
    console.error('Update Points Error:', error);
    return NextResponse.json({ error: 'فشل في حفظ نقاط الطفل بقاعدة البيانات' }, { status: 500 });
  }
}
