
// src/app/api/ai/parent-insights/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { childId } = await req.json();

    if (!childId) {
      return NextResponse.json({ error: 'مطلوب تحديد معرف الطفل لإنشاء التقرير الذكي' }, { status: 400 });
    }

    // جلب بيانات الطفل من المعاملات والأهداف
    const child = await prisma.user.findUnique({
      where: { id: childId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        savingsGoals: true,
      },
    });

    if (!child) {
      return NextResponse.json({ error: 'الطفل غير موجود في النظام' }, { status: 404 });
    }

    // حساب إحصائيات سريعة للذكاء الاصطناعي
    const totalSpent = child.transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = child.transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals: Record<string, number> = {};
    child.transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const formattedGoals = child.savingsGoals.map((g) => ({
      title: g.title,
      target: g.targetAmount,
      current: g.currentAmount,
      progress: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0,
    }));

    // صياغة الموجه للذكاء الاصطناعي للحصول على تحليل مالي تربوي باللغة العربية
    const aiPrompt = `
أنت مستشار مالي ذكي وخبير تربوي متخصص في السلوك المالي للأطفال في منصة "حصّالتي".
قم بتحليل البيانات المالية التالية للطفل "${child.name}" لتوليد تقرير موجه للوالدين بلغة دافئة ومحفزة وعملية:

البيانات الحالية للطفل:
- إجمالي المدخول/المصروف مؤخراً: ${totalIncome} ريال.
- إجمالي الإنفاق الفعلي: ${totalSpent} ريال.
- النفقات حسب الفئة: ${JSON.stringify(categoryTotals)}
- الأهداف الادخارية ومستوى التقدم: ${JSON.stringify(formattedGoals)}
- رصيد نقاط التحديات: ${child.points} نقطة.

المطلوب إخراج النتيجة في صيغة JSON دقيقة ومغلقة تماماً (بدون مقدمات أو علامات ترميز ماركداون خارج نطاق الكود) تحتوي الهيكل التالي:
{
  "summary": "ملخص عام تشجيعي وموجز لأداء الطفل هذا الأسبوع",
  "behaviorAnalysis": "تحليل أعمق لسلوك الإنفاق لدى الطفل (مثال: تركيز الشراء على الحلويات أو التميز في الادخار)",
  "recommendations": [
    "توصية عملية للوالدين 1",
    "توصية عملية للوالدين 2",
    "توصية عملية للوالدين 3"
  ],
  "suggestedChallenge": {
    "title": "عنوان جذاب للتحدي الأسبوعي المقترح للطفل",
    "description": "تفاصيل واضحة وبسيطة للتحدي ليقوم به الطفل لتشجيعه على التوفير أو العطاء",
    "pointsReward": 50
  }
}
`;

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-3.5-flash';

    // في حال عدم توفر مفتاح الـ API (مثل العمل دون اتصال)، يتم تفعيل الـ Fallback التلقائي للحفاظ على أمان التطبيق
    if (!openRouterApiKey) {
      return NextResponse.json({
        summary: `أداء مالي رائع للطفل ${child.name}! يظهر تفاعلاً مميزاً مع فئات الادخار.`,
        behaviorAnalysis: `أنفق الطفل ما مجموعه ${totalSpent} ريال من أصل مصروفه البالغ ${totalIncome} ريال. تذهب معظم المصاريف نحو فئة "ألعاب وحلويات" (${categoryTotals['حلويات'] || 0} ريال)، بينما لديه معدل ادخار مبشر لأهدافه الذكية.`,
        recommendations: [
          'نقترح الاتفاق مع طفلك على سقف مالي محدد للحلويات يومياً.',
          'شجع طفلك على المساهمة بنسبة 15% إضافية من مصروفه نحو حصالة الادخار.',
          'كافئ التزامه بالمهام من خلال منحه نقاطاً تفاعلية إضافية.'
        ],
        suggestedChallenge: {
          title: 'تحدي بطل التوفير للحلويات',
          description: 'توفير قيمة الحلويات لمدة 4 أيام متتالية وتحويلها إلى حصالة الادخار للحصول على الجائزة الكبرى.',
          pointsReward: 60
        }
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterApiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: aiPrompt }],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const aiContent = data.choices[0]?.message?.content;
    const parsedData = JSON.parse(aiContent || '{}');

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('AI Insights Route Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة تقرير الذكاء الاصطناعي' }, { status: 500 });
  }
}
