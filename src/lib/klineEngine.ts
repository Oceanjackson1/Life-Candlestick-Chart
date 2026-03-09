import { UserLifeData } from '@/store/useLifeStore'

export interface KlineDataPoint {
    age: number;
    open: number;
    close: number;
    high: number;
    low: number;
    milestone?: string;
    story?: string;
    isBull?: boolean;
}

export interface MatchResult {
    score: number;
    syncRatio: number;
    crossPoints: number;
    report: string;
}

// Simple seeded random to make it somewhat deterministic
function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Parse traits string into trait keywords
function parseTraits(traits: string): string[] {
    if (!traits) return [];
    return traits.split(/[,，、\s]+/).filter(t => t.trim().length > 0).map(t => t.trim());
}

// Trait effects on volatility and trend
function getTraitModifiers(traits: string[]): { volatilityMod: number; trendMod: number } {
    let volatilityMod = 0;
    let trendMod = 0;

    const traitEffects: Record<string, { v: number; t: number }> = {
        '冒险': { v: 5, t: 2 }, '大胆': { v: 5, t: 2 }, '激进': { v: 6, t: 1 },
        '稳重': { v: -4, t: 1 }, '踏实': { v: -3, t: 1 }, '保守': { v: -4, t: 0 },
        '乐观': { v: 0, t: 3 }, '积极': { v: 0, t: 2 }, '阳光': { v: 0, t: 2 },
        '悲观': { v: 2, t: -2 }, '敏感': { v: 3, t: -1 }, '焦虑': { v: 4, t: -2 },
        '坚韧': { v: -1, t: 3 }, '执着': { v: 1, t: 2 }, '勤奋': { v: -1, t: 2 },
        '内向': { v: -2, t: 0 }, '外向': { v: 2, t: 1 }, '社交': { v: 2, t: 1 },
        '聪明': { v: 1, t: 2 }, '创意': { v: 3, t: 2 }, '理性': { v: -2, t: 1 },
        '感性': { v: 3, t: 0 }, '浪漫': { v: 2, t: 1 }, '务实': { v: -3, t: 1 },
        '独立': { v: 1, t: 2 }, '自律': { v: -2, t: 3 }, '懒散': { v: 1, t: -2 },
        '善良': { v: -1, t: 1 }, '温柔': { v: -2, t: 1 }, '强势': { v: 3, t: 2 },
        '幽默': { v: 1, t: 1 }, '有野心': { v: 4, t: 3 }, '随性': { v: 2, t: 0 },
    };

    for (const trait of traits) {
        for (const [key, effect] of Object.entries(traitEffects)) {
            if (trait.includes(key)) {
                volatilityMod += effect.v;
                trendMod += effect.t;
            }
        }
    }

    return { volatilityMod, trendMod };
}

// Story templates for different life phases
const earlyChildhoodStories = {
    bull: [
        '在家庭的温暖中快乐成长',
        '展现出超越同龄人的天赋',
        '结交了童年最好的朋友',
        '在兴趣班中发现了自己的热爱',
        '得到了一份珍贵的生日礼物',
    ],
    bear: [
        '第一次感受到与小伙伴的分离',
        '经历了一次小小的挫折',
        '对未知世界产生了困惑',
        '身体出现了一些小状况',
        '开始体会到成长的烦恼',
    ]
};

const schoolStories = {
    bull: [
        '成绩有了明显进步，获得了老师的赞赏',
        '在学校活动中崭露头角',
        '找到了自己擅长的学科方向',
        '和志同道合的朋友组成了小团队',
        '获得了一个重要的奖项或荣誉',
        '在竞赛中取得了好成绩',
    ],
    bear: [
        '面临考试的压力，成绩波动',
        '与好朋友产生了误会',
        '对未来的方向感到迷茫',
        '经历了一次重要考试的失利',
        '青春期的困惑开始显现',
        '学业压力让人喘不过气',
    ]
};

const universityStories = (city: string, major: string) => ({
    bull: [
        city ? `在${city}的大学生活充满了新鲜感` : '大学生活开启了全新篇章',
        major ? `在${major}领域找到了真正的热情` : '在专业领域找到了方向',
        '加入了一个改变人生轨迹的社团',
        '遇到了一位影响深远的导师',
        '第一次独立完成了一个重要项目',
        '在校园里收获了一段美好的感情',
    ],
    bear: [
        '初次离家的孤独感袭来',
        major ? `发现${major}并不完全是自己想象的样子` : '专业方向和预期产生了偏差',
        '社交圈的重建让人感到疲惫',
        '面临人生第一次重大选择的焦虑',
        '经济上开始需要自己操心',
        '一段感情的结束带来了成长的痛',
    ]
});

const earlyCareerStories = (occupation: string, city: string) => ({
    bull: [
        occupation ? `初入${occupation}行业，展现出了不错的潜力` : '在职场中站稳了脚跟',
        city ? `在${city}找到了属于自己的节奏` : '逐渐适应了都市的快节奏',
        '获得了第一次晋升或加薪',
        '建立了有价值的职业人脉',
        '工作中的一个突破获得了上级认可',
        '经济开始独立，有了安全感',
    ],
    bear: [
        occupation ? `${occupation}的现实和理想差距不小` : '职场的残酷让人清醒',
        '加班和压力成为了日常',
        '第一次体验到职场的不公',
        '租房搬家的疲惫消磨着热情',
        '工作和生活的平衡开始失控',
        city ? `${city}的生活成本让人倍感压力` : '大城市的生活成本压得喘不过气',
    ]
});

const midCareerStories = (occupation: string) => ({
    bull: [
        '事业进入了稳步上升期',
        occupation ? `在${occupation}领域积累了核心竞争力` : '专业能力得到了广泛认可',
        '迎来了一个重要的事业转折点',
        '投资或副业开始有了回报',
        '在行业内建立了一定的影响力',
        '找到了工作与生活的平衡点',
        '家庭生活带来了温暖和力量',
    ],
    bear: [
        '中年危机的焦虑悄然而至',
        '行业变革带来了不确定性',
        '身体发出了需要关注的信号',
        '家庭和事业的矛盾加剧',
        '同龄人的成就带来了比较的压力',
        '一次投资失误造成了经济损失',
        '感觉自己被新生力量超越',
    ]
});

const lateCareerStories = {
    bull: [
        '人生阅历成为了最宝贵的财富',
        '终于到达了曾经仰望的高度',
        '开始有能力回馈社会和家庭',
        '多年的坚持终于开花结果',
        '子女的成长带来了由衷的欣慰',
        '对生活有了更深的感悟和从容',
    ],
    bear: [
        '身体机能的下降成为不可忽视的问题',
        '对退休后的生活感到不安',
        '送别了一位重要的人',
        '面对衰老的恐惧变得真实',
        '回首往事，对某些选择感到遗憾',
        '生活节奏的改变需要重新适应',
    ]
};

const retirementStories = {
    bull: [
        '退休后的生活比想象中更加精彩',
        '终于有时间追求年轻时的梦想',
        '成为了家族中被敬重的长者',
        '旅行让晚年生活充满了色彩',
        '与老伴共度的时光格外珍贵',
        '用一生的智慧影响着下一代',
    ],
    bear: [
        '退休后的空虚感需要时间适应',
        '健康问题增多，需要更多关注',
        '社交圈的缩小让人感到孤独',
        '对过去的遗憾偶尔浮上心头',
        '身体不如从前，力不从心',
        '生活节奏骤变带来了失落感',
    ]
};

function pickStory(stories: string[], seed: number): string {
    const idx = Math.floor(seededRandom(seed) * stories.length);
    return stories[idx];
}

// Async version that calls Deepseek API first, falls back to local mock
export async function generateLifeData(user: Partial<UserLifeData>): Promise<KlineDataPoint[]> {
    try {
        const res = await fetch('/api/generate-kline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userData: user })
        });

        if (!res.ok) {
            console.warn("API Error, falling back to local simulation.");
            return generateMockLifeData(user);
        }

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
        return generateMockLifeData(user);
    } catch (error) {
        console.error("Network Fetch Error, falling back to local simulation.", error);
        return generateMockLifeData(user);
    }
}

export function generateMockLifeData(user: Partial<UserLifeData>): KlineDataPoint[] {
    const data: KlineDataPoint[] = [];
    let currentFortune = 50;

    const traits = parseTraits(user.traits || '');
    const { volatilityMod, trendMod } = getTraitModifiers(traits);

    const strToSeed = `${user.birthYear || ''}${user.birthCity || ''}${user.universityCity || ''}${user.traits || ''}`;
    let seed = 1990;
    for (let i = 0; i < strToSeed.length; i++) {
        seed += strToSeed.charCodeAt(i) * (i + 1);
    }

    const uniStories = universityStories(user.universityCity || '', user.universityMajor || '');
    const earlyCareer = earlyCareerStories(user.currentOccupation || '', user.currentCity || '');
    const midCareer = midCareerStories(user.currentOccupation || '');

    const storyAges = new Set([
        0, 3, 6, 10, 14, 18, 22, 24, 27, 30,
        33, 36, 40, 45, 50, 55, 60, 65, 70, 75, 80
    ]);

    for (let age = 0; age <= 80; age++) {
        let trend = 0 + trendMod * 0.3;
        let volatility = 10 + volatilityMod * 0.5;
        let milestone: string | undefined = undefined;
        let story: string | undefined = undefined;

        // Life phase modifiers
        if (age < 6) {
            volatility = 6 + volatilityMod * 0.2;
            trend = 2;
        } else if (age >= 6 && age < 12) {
            volatility = 8;
            trend = 1;
        } else if (age >= 12 && age < 18) {
            volatility = 12 + volatilityMod * 0.3;
            trend = 0;
        } else if (age >= 18 && age < 23) {
            volatility = 14 + volatilityMod * 0.4;
            trend = 3 + trendMod * 0.5;
        } else if (age >= 23 && age < 30) {
            volatility = 16 + volatilityMod * 0.6;
            trend = 1 + trendMod * 0.4;
        } else if (age >= 30 && age < 40) {
            volatility = 14 + volatilityMod * 0.5;
            trend = 2 + trendMod * 0.3;
        } else if (age >= 40 && age < 50) {
            volatility = 12 + volatilityMod * 0.4;
            trend = -1 + trendMod * 0.3;
        } else if (age >= 50 && age < 60) {
            volatility = 10 + volatilityMod * 0.3;
            trend = 0 + trendMod * 0.2;
        } else if (age >= 60) {
            volatility = 7 + volatilityMod * 0.2;
            trend = 1;
        }

        // Key milestones
        if (age === 18 && user.universityCity) {
            trend += 12;
            milestone = `考入大学 · ${user.universityCity}`;
        } else if (age === 22 && user.universityMajor) {
            trend += 5;
            milestone = `${user.universityMajor}毕业`;
        } else if (age === 24 && user.currentOccupation) {
            trend -= 3;
            volatility += 8;
            milestone = `踏入${user.currentOccupation}行业`;
        } else if (age === 30 && user.currentCity) {
            trend += 8;
            milestone = `在${user.currentCity}扎根`;
        } else if (age === 40) {
            trend -= 3;
            volatility += 5;
            milestone = '不惑之年';
        } else if (age === 50) {
            trend += 2;
            milestone = '知天命';
        } else if (age === 60) {
            trend += 5;
            volatility -= 3;
            milestone = '花甲之年';
        }

        const change = (seededRandom(seed++) - 0.5) * volatility + trend;
        const open = currentFortune;
        let close = currentFortune + change;
        close = Math.max(5, Math.min(95, close));

        const high = Math.min(100, Math.max(open, close) + seededRandom(seed++) * volatility * 0.5);
        const low = Math.max(0, Math.min(open, close) - seededRandom(seed++) * volatility * 0.5);
        const isBull = close >= open;

        currentFortune = close;

        if (storyAges.has(age)) {
            const storyType = isBull ? 'bull' : 'bear';
            if (age <= 5) {
                story = pickStory(earlyChildhoodStories[storyType], seed + age);
            } else if (age <= 17) {
                story = pickStory(schoolStories[storyType], seed + age);
            } else if (age <= 22) {
                story = pickStory(uniStories[storyType], seed + age);
            } else if (age <= 30) {
                story = pickStory(earlyCareer[storyType], seed + age);
            } else if (age <= 50) {
                story = pickStory(midCareer[storyType], seed + age);
            } else if (age <= 60) {
                story = pickStory(lateCareerStories[storyType], seed + age);
            } else {
                story = pickStory(retirementStories[storyType], seed + age);
            }
        }

        data.push({
            age,
            open: Math.round(open),
            close: Math.round(close),
            high: Math.round(high),
            low: Math.round(low),
            milestone,
            story: story || milestone,
            isBull,
        });
    }

    return data;
}

export function calculateMatchScore(data1: KlineDataPoint[], data2: KlineDataPoint[]): MatchResult {
    let syncCount = 0;
    let crossCount = 0;
    let totalDiff = 0;

    for (let i = 20; i <= 80; i++) {
        const d1 = data1[i];
        const d2 = data2[i];

        if (!d1 || !d2) continue;

        if (d1.isBull === d2.isBull) {
            syncCount++;
        }

        const prevD1 = data1[i - 1];
        const prevD2 = data2[i - 1];
        if (prevD1 && prevD2) {
            if ((prevD1.close > prevD2.close && d1.close < d2.close) ||
                (prevD1.close < prevD2.close && d1.close > d2.close)) {
                crossCount++;
            }
        }

        totalDiff += Math.abs(d1.close - d2.close);
    }

    const period = 60;
    const syncRatio = syncCount / period;
    const avgDiff = totalDiff / period;

    const score = Math.round((syncRatio * 50) + (Math.max(0, 100 - avgDiff) * 0.5));

    let report = "你们是天作之合，命运曲线高度吻合。在人生的低谷期你们能互相扶持，在巅峰期也能共享荣耀。灵魂伴侣指数极高。";
    if (score < 60) {
        report = "你们的生命轨迹有很多不同的方向，摩擦与错位时有发生。这需要更多的包容与理解，或许互补的性格能擦出不一样的火花。";
    } else if (score < 80) {
        report = "命运的齿轮在关键节点有所交汇。你们既有各自的人生主线，也能在特定阶段同频共振。是个充满活力与变数的组合。";
    }

    return {
        score,
        syncRatio,
        crossPoints: crossCount,
        report
    };
}
