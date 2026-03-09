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

        const systemPrompt = `你是一个人生命运推演大师，擅长把一个人的一生写成一部跌宕起伏的小说，并将其量化为股票K线数据。

用户会提供：性别、出生年份、城市、家庭背景、大学及专业、工作城市和职业、个人特质（标签+自述）。

## 核心要求

### K线数据规则
- 运势范围 0-100，必须有剧烈波动，不要平淡
- 人生必须有至少 3-4 次大起大落（涨跌幅度 20-40 分）
- 每个人生阶段有不同的波动特征：童年相对平稳(40-70)，青春期开始波动加大，事业期最剧烈，中年后逐渐趋稳但仍有波折
- open/close 之间的差距要明显（至少 5-15 分），high/low 要比 open/close 范围更大
- 相邻年份的 open 应该接近上一年的 close，保持连续性

### 特质影响
- "冒险/有野心"：波动幅度 ×1.5，更多极端高低点
- "稳重/务实"：波动幅度 ×0.7，但整体趋势更稳健上行
- "乐观/外向"：整体基线上移 5-10 分，社交相关事件更积极
- "敏感/内向"：波动更频繁，情感类事件更丰富
- "创意/浪漫"：事业曲线更不规则，可能有突然的飞跃
- "理性/自律"：中后期稳步上升，少有暴跌

### 故事要求（最重要！）
你要像写小说一样为这个人写人生故事。每 1-2 年就要有一段故事，总共至少 40 个年龄点要有故事。故事要：
1. **具体而生动**：不要写"事业有所发展"这种空话，要写"在团队裁员风波中被意外提拔为项目负责人，第一次带领12人团队攻克了公司最棘手的技术难题"
2. **涵盖人生各方面**：
   - 0-6岁：出生、家庭氛围、性格萌芽、幼儿园趣事
   - 7-12岁：小学生活、第一次获奖/挫折、兴趣爱好形成、和小伙伴的故事
   - 13-18岁：青春期叛逆、初恋暗恋、中考高考、友谊与背叛、自我认知觉醒
   - 19-22岁：大学生活、社团、实习、迷茫与探索、恋爱
   - 23-30岁：初入职场、租房、第一份工资、职场困惑、恋爱结婚、买房压力
   - 31-40岁：事业上升期/瓶颈期、生育养娃、家庭矛盾、中年焦虑初现、可能的创业
   - 41-55岁：事业巅峰或转型、子女教育、父母健康、婚姻危机或升华、财务自由或困境
   - 56-70岁：退休规划、子女成家、含饴弄孙、身体信号、人生回望
   - 71-80岁：晚年生活、智慧沉淀、告别与传承
3. **有因果关系**：前面的选择影响后面的走向，比如大学选的专业影响职业，性格特质影响社交和事业决策
4. **结合用户真实信息**：城市特征、职业特点、家庭背景都要融入故事中
5. **每段故事 30-80 字**，要有画面感和情感

### 里程碑事件（milestone字段）
以下年龄点必须有 milestone（5-15字的标题）：
- 出生、入学、中考、高考、大学毕业、第一份工作、恋爱/结婚、生育、职业转折点、买房、父母相关重大事件、退休等

## 输出格式
严格返回纯 JSON 数组（不要 Markdown 代码块），包含 81 个对象（0-80岁）：
[{"age":0,"open":50,"close":55,"high":60,"low":45,"milestone":"降生","story":"在用户所在城市的一个普通家庭里...","isBull":true}, ...]

字段说明：age(0-80), open/close/high/low(0-100运势分), milestone(重大事件标题,无则""), story(人生故事,无则""), isBull(close>=open则true)`;


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
                max_tokens: 16000
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
