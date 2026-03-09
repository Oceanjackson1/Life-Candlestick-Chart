import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userData } = await req.json();

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'DEEPSEEK_API_KEY is not configured in environment variables' }, { status: 500 });
        }

        const systemPrompt = `你是一个人生规划大师与命理推演专家。你需要把用户的一生（0岁-80岁）抽象成炒股的K线数据。
用户会提供他们的性别、出生年份、城市、家庭背景、大学及专业、工作地和岗位信息。
请根据这些信息，推演其0-80岁每年的人生走向（包括低谷、起伏和巅峰）。

请严格只返回一段 JSON 格式的数据（不要包含任何其他说明文字或 Markdown 标记 \`\`\`json ），它必须是一个包含 81 个对象的数组。每个对象对应0到了80岁的每年数据，其接口类型为：
[{
  "age": number, // 0 到 80
  "open": number, // 0-100 的数值，表示该岁开始时的运势
  "close": number, // 0-100，结束时的运势
  "high": number, // 0-100，这一年的波段巅峰
  "low": number, // 0-100，波段谷底
  "milestone": string | undefined, // 如果这一年有重大事件（如："考入大学", "职场晋升"），写在这里，否则留空
  "isBull": boolean // 如果 close >= open 则为 true，否则为 false
}]

注意：
1. 请根据你拥有的行业知识和用户背景，合理虚构他们可能遇到的人生拐点、危机与机遇，体现在分数（0-100）的波动上。
2. 数据务必连贯，上一年的 close 应该和下一年的 open 较近。`;

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
                temperature: 0.7,
                max_tokens: 4000,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Deepseek API error:", errText);
            return NextResponse.json({ error: 'Failed to generate from Deepseek' }, { status: 500 });
        }

        const aiData = await response.json();
        const content = aiData.choices[0].message.content;

        // Attempt to parse the JSON string from AI
        let parsedData = [];
        try {
            parsedData = JSON.parse(content);
            // Deepseek might wrap in an object for json_object type like { "data": [...] }
            if (parsedData.data && Array.isArray(parsedData.data)) {
                parsedData = parsedData.data;
            } else if (parsedData.kline && Array.isArray(parsedData.kline)) {
                parsedData = parsedData.kline;
            }
        } catch (e) {
            // Fallback or cleanup markdown
            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleaned);
            if (parsedData.data && Array.isArray(parsedData.data)) parsedData = parsedData.data;
        }

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
