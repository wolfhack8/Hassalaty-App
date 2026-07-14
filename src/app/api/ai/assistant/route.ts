import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, childName, pointsBalance } = await req.json();

    if (!message) {
      return NextResponse.json({ reply: 'أهلاً بك يا بطل! اكتب لي سؤالك وسأجيبك فوراً 🪙' }, { status: 400 });
    }

    // صياغة موجه ذكي بشخصية كوتش ذخر المالي للأطفال
    const aiPrompt = `
أنت "كوتش ذُخر"، المساعد الذكي والمستشار المالي المرح المخصص للأطفال في تطبيق "حصّالتي". 
اسم الطفل الذي يتحدث معك هو "${childName}" ورصيد نقاطه الحالي هو ${pointsBalance} نقطة.

أجب على سؤاله التالي بطريقة:
1. مشجعة ومرحة جداً ومناسبة للأطفال (عمر 6-12 سنة).
2. استخدم الكثير من الرموز التعبيرية (الإيموجي) مثل 🪙، 🌟، 🚀، 👏، 💡.
3. وجّهه دائماً نحو مبادئ الادخار الذكي، وتقسيم المصروف (إنفاق، ادخار، عطاء)، وكيفية جني المزيد من النقاط عبر الألعاب والتحديات في التطبيق.
4. اجعل الإجابة مختصرة وسهلة الفهم (لا تتجاوز 3-4 أسطر).

سؤال الطفل: "${message}"
`;

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-3.5-flash';

    // في حال غياب مفتاح الـ API، نستخدم نظام الردود البديلة السريعة لضمان استمرارية التشغيل التجريبي
    if (!openRouterApiKey) {
      return NextResponse.json({
        reply: `يا بطل يا ${childName}! 🌟 سؤالك رائع جداً! لتوفير المال لشراء ما تحب، حاول دائماً ادخار جزء بسيط من مصروفك اليومي في "حصالة الادخار" ولا تنفقه كله على الحلويات 🍬. وإذا أردت زيادة نقاطك المذهلة (${pointsBalance} نقطة حالياً)، اذهب والعب لعبة التحديات الآن! 🪙🚀`
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
      }),
    });

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'أنا هنا دائماً لمساعدتك وتوجيهك يا بطل! 🪙';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Assistant API Error:', error);
    return NextResponse.json({ reply: 'يبدو أن حصالتي الذكية مشغولة قليلاً بتنظيم النقود الآن، أعد محادثتي بعد قليل يا بطل! 🪙✨' });
  }
}
