import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow 60 seconds for the AI to generate the 81 years of data
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'DEEPSEEK_API_KEY is not configured in environment variables' }, { status: 500 });
        }

        const { userData } = await req.json();

        const systemPrompt = `你是一个人生规划大师与命理推演专家。你需要把用户的一生（0岁-80岁）抽象成炒股的K线数据。
用户会提供他们的性别、出生年份、城市、家庭背景、大学及专业、工作地和岗位信息。
你需要：
1. 复盘他们的过去：根据年龄和经历生成过去的 K 线波动。
2. 预测他们的未来轨迹：结合当前的信息，在剩余的年龄里（直到 80 岁）合理推理并预测他们未来的人生走向（高潮、低谷、机遇或危机），体现在运势分数（0-100）上。

请严格并且只返回一段包含 81 个对象的 JSON 数组，不需要输出多余的Markdown说明，格式必须直接是一个纯数组：
[
    {
      "age": number, // 0 到 80
      "open": number, // 0-100 的数值，该岁开始时的运势
      "close": number, // 0-100，结束时的运势
      "high": number, // 0-100，波段巅峰
      "low": number, // 0-100，波段谷底
      "milestone": string, // 如果这一年有重大事件（无论是过去的事件，还是未来的预测事件如"创业失败", "移民海外"），写在这里，否则留空字符串 ""
      "isBull": boolean // 如果 close >= open 则为 true，否则为 false
    }
]

请确保生成严格连贯、带有戏剧性起伏的 81 年数据，并用真实感极强的 milestone 预测未来。`;

        const userContent = JSON.stringify(userData);

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ],
                temperature: 0.8,
                max_tokens: 8000
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Deepseek API error:", errText);
            return NextResponse.json({ error: 'Failed to generate from Deepseek' }, { status: 500 });
        }

        const aiData = await response.json();
        const content = aiData.choices[0].message.content;

        // Extract JSON array robustly via regex matching the brackets 
        let parsedData = [];
        try {
            const match = content.match(/\[([\s\S]*?)\]/);
            if (match) {
                parsedData = JSON.parse(`[${match[1]}]`);
            } else {
                parsedData = JSON.parse(content);
            }
            if (parsedData.data && Array.isArray(parsedData.data)) parsedData = parsedData.data;
        } catch (e) {
            console.error("Failed to parse Deepseek response content:", content);
            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleaned);
        }

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
