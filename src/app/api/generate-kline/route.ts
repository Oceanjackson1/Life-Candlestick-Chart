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

        const systemPrompt = `你是一个人生剧本编剧 + 命运推演大师。你的任务是根据用户提供的真实人物档案，为这个人编写一部80年的人生剧本，并将每一年的命运起伏量化为股票K线数据。

你写的不是数据，而是一个人完整的一生。每一年都是剧本中的一个场景。好的人生K线，就像一部好的电视剧——有伏笔、有转折、有高潮、有泪点。

用户会提供完整的人物档案：姓名、性别、出生年份和城市、家庭背景、大学和专业、当前城市和职业、性格特质。你要把这些信息全部融入剧本中，让每个故事都和这个人的真实背景紧密关联。

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

### 剧本编写要求（最核心！）
你在为这个人写一部80集的人生连续剧，每一年就是一集。总共至少 40 个年龄点要有故事。

**编剧原则：**
1. **用户的真实信息是剧本的骨架**：
   - 用户填写的名字必须出现在故事中（用第三人称叙事）
   - 出生城市要影响童年故事的场景（比如北方的冬天、南方的梅雨季）
   - 家庭背景决定了原生家庭的氛围和早期人生的起点高度
   - 大学城市和专业要写进大学篇章，影响社交圈和职业方向
   - 当前职业是事业线的核心，要写出这个职业的真实细节（行业术语、典型场景）
   - 性格特质要贯穿始终，影响每一个关键决策
2. **场景化写作**：不要写"事业有所发展"这种空话，要写具体场景。比如"在深圳南山区的写字楼里加班到凌晨两点，窗外是整个城市的灯火。发出的方案被客户一次性通过，他在工位上握着拳头无声地欢呼"
3. **多线并行**：每个年龄段都要交织多条故事线：
   - 事业线：职场成长、升迁、挫折、创业、转型
   - 感情线：暗恋、恋爱、结婚、婚姻经营、可能的危机
   - 家庭线：原生家庭关系演变、为人父母、子女教育
   - 成长线：自我认知、价值观变化、人生感悟
   - 健康线：身体变化、重大疾病、衰老
   - 财务线：收入变化、买房、投资、财务自由或困境
4. **人生阶段对应的核心剧情**：
   - 0-6岁：出生、家庭氛围、性格萌芽、幼儿园趣事
   - 7-12岁：小学生活、第一次获奖/挫折、兴趣爱好、友情
   - 13-18岁：青春期、初恋暗恋、中考高考、叛逆与成长
   - 19-22岁：大学生活、社团、实习、迷茫与探索、恋爱
   - 23-30岁：初入职场、租房、第一份工资、恋爱结婚、买房
   - 31-40岁：事业上升/瓶颈、生育养娃、中年焦虑、可能创业
   - 41-55岁：事业巅峰或转型、子女教育、父母衰老、婚姻升华或危机
   - 56-70岁：退休、子女成家、含饴弄孙、人生回望
   - 71-80岁：晚年智慧、告别与传承、生命的圆满
5. **因果链**：前面的伏笔要在后面回收。比如小学时偶然接触的兴趣，可能成为40岁转型的契机
6. **每段故事 40-100 字**，有画面感、有情感、有这个人独特的印记

### 里程碑事件（milestone字段）
以下年龄点必须有 milestone（5-15字的标题）：
- 出生、入学、中考、高考、大学毕业、第一份工作、恋爱/结婚、生育、职业转折点、买房、父母相关重大事件、退休等

## 输出格式
严格返回纯 JSON 数组（不要 Markdown 代码块），包含 81 个对象（0-80岁）：
[{"age":0,"open":50,"close":55,"high":60,"low":45,"milestone":"降生","story":"在用户所在城市的一个普通家庭里...","isBull":true}, ...]

字段说明：age(0-80), open/close/high/low(0-100运势分), milestone(重大事件标题,无则""), story(人生故事,无则""), isBull(close>=open则true)`;


        // Format user data into a structured character profile for the AI
        const profileLines: string[] = [];
        if (userData.name) profileLines.push(`姓名：${userData.name}`);
        if (userData.gender) profileLines.push(`性别：${userData.gender === 'male' ? '男' : userData.gender === 'female' ? '女' : userData.gender}`);
        if (userData.birthYear) profileLines.push(`出生年份：${userData.birthYear}年（今年${new Date().getFullYear() - parseInt(userData.birthYear)}岁）`);
        if (userData.birthCity) profileLines.push(`出生/成长城市：${userData.birthCity}`);
        if (userData.parentBackground) profileLines.push(`原生家庭背景：${userData.parentBackground}`);
        if (userData.universityCity) profileLines.push(`大学所在城市：${userData.universityCity}`);
        if (userData.universityMajor) profileLines.push(`大学专业：${userData.universityMajor}`);
        if (userData.currentCity) profileLines.push(`当前工作城市：${userData.currentCity}`);
        if (userData.currentOccupation) profileLines.push(`当前职业：${userData.currentOccupation}`);
        if (userData.traits) profileLines.push(`个人特质：${userData.traits}`);

        const currentAge = userData.birthYear ? new Date().getFullYear() - parseInt(userData.birthYear) : null;

        const userContent = `## 人物档案
${profileLines.join('\n')}

## 创作要求
请根据以上人物档案，为${userData.name || '这个人'}写一部从0岁到80岁的人生剧本。
${currentAge ? `这个人目前${currentAge}岁，${currentAge}岁之前的故事要更贴合实际经历（结合城市、专业、职业等信息推演），${currentAge}岁之后的故事是对未来的预测。` : ''}
${userData.parentBackground ? `原生家庭对人生轨迹的影响很大，"${userData.parentBackground}"这个家庭背景要贯穿童年到青年期的故事。` : ''}
${userData.traits ? `"${userData.traits}"这些性格特质要深刻影响每一个人生阶段的选择和命运走向。` : ''}
${userData.currentOccupation ? `目前从事${userData.currentOccupation}，职业发展线是故事的重要主线之一。` : ''}
请把这当作一部真实的人生传记来写，每个故事都要有具体的场景、情感和细节。`;

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
