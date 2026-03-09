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

function parseTraits(traits: string): string[] {
    if (!traits) return [];
    return traits.split(/[,，、\s]+/).filter(t => t.trim().length > 0).map(t => t.trim());
}

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

function pickStory(stories: string[], seed: number): string {
    const idx = Math.floor(seededRandom(seed) * stories.length);
    return stories[idx];
}

// ========== Detailed story templates per life phase ==========

const babyStoriesGen = (name: string, city: string) => ({
    bull: [
        `${name}在${city || '这座城市'}的一个普通家庭里降生，第一声啼哭响亮有力，全家人围在病房里笑得合不拢嘴`,
        `${name}比同龄宝宝更早学会走路，妈妈欣喜地拍下了摇摇晃晃迈出第一步的视频`,
        `爷爷奶奶特别宠爱${name}，在充满爱的家庭氛围中健康成长，笑容成了全家人的开心果`,
    ],
    bear: [
        `${name}出生时体重偏轻，在保温箱里度过了最初的几天，让全家人揪心不已`,
        `${name}半夜频繁哭闹，父母轮流抱着哄睡，${city ? city + '冬天的夜格外漫长' : '疲惫却又心疼'}`,
        `一次高烧让全家手忙脚乱，抱着${name}冲向医院的那个深夜，好在最终化险为夷`,
    ]
});

const kindergartenStoriesGen = (name: string) => ({
    bull: [
        `${name}第一天上幼儿园没有哭，反而兴奋地拉着小朋友的手。老师说这孩子天生自来熟`,
        `六一儿童节的舞台上，${name}虽然忘了两句台词，但笑容打动了所有家长`,
        `${name}画的一幅画被贴在幼儿园走廊上展示，这是人生中第一次获得"公开认可"`,
        `${name}交到了人生中第一个"铁哥们"，两个人形影不离，连家长都成了朋友`,
    ],
    bear: [
        `${name}和小朋友抢玩具被推倒，哭着回家。第一次体会到"竞争"的滋味`,
        `${name}不愿意午睡，总是偷偷睁着眼睛看天花板，想着外面的世界`,
        `搬家换了一所幼儿园，${name}在新环境里沉默了整整两个星期`,
        `最好的朋友转学了，${name}趴在窗户上看了很久很久`,
    ]
});

const primarySchoolStoriesGen = (name: string, parentBg: string) => ({
    bull: [
        `${name}第一次考试拿了满分，小心翼翼地把试卷折好装进书包，回家路上忍不住偷看了三次`,
        `${name}被选为班长，站在讲台上管纪律时紧张得声音发抖，但同学们都很配合`,
        `在作文比赛中获奖，语文老师在全班面前朗读了${name}的文章，脸红到了耳朵根`,
        `${name}参加学校运动会拿了名次，第一次站上领奖台的感觉刻骨铭心`,
        `偶然发现了一本改变阅读兴趣的书，${name}从此打开了一个新世界的大门`,
    ],
    bear: [
        `${name}数学考试不及格，回家路上在楼道里坐了半小时才敢敲门`,
        `被同学起了难听的外号，${name}虽然表面笑着，晚上却偷偷哭了`,
        parentBg ? `${parentBg}的家庭压力有时也会传递到孩子身上，${name}蒙着被子假装听不见父母的争吵，这一夜似乎突然长大了` : `父母吵架的声音穿过卧室门，${name}蒙着被子假装听不见，这一夜似乎突然长大了`,
        `${name}近视了，戴上眼镜的那天觉得全世界都不一样了，也开始在意别人的目光`,
        `最好的朋友和别人玩在了一起，${name}第一次体会到被"抛弃"的感觉`,
    ]
});

const middleSchoolStoriesGen = (name: string) => ({
    bull: [
        `${name}进入了不错的初中，新环境激发了前所未有的学习动力，成绩一路上升`,
        `在班级文艺汇演中，${name}意外发现了自己的才艺天赋，从此多了一个闪光点`,
        `${name}遇到了一位改变人生观的班主任，那些课后谈话至今记忆犹新`,
        `第一次代表学校参加竞赛，${name}虽然紧张到手抖，但结果出乎意料的好`,
        `${name}暗恋了一个同学，每天上学的路突然变得充满期待`,
    ],
    bear: [
        `${name}进入青春期，和父母的关系变得紧张，摔门和沉默成了日常`,
        `中考的压力像一座山，${name}每天刷题到深夜，做梦都是数学公式`,
        `${name}和好朋友因为一件小事决裂，冷战了一整个学期`,
        `成绩突然滑坡，老师找家长谈话，${name}那天回家的路格外漫长`,
        `${name}第一次意识到家庭经济状况和别人不一样，心里有了说不出的复杂感受`,
    ]
});

const highSchoolStoriesGen = (name: string) => ({
    bull: [
        `${name}考进了理想的高中，分班考试发挥出色，进了重点班`,
        `参加学科竞赛拿到了省级奖项，${name}离保送的希望似乎近在咫尺`,
        `高二那年突然开窍，${name}的成绩从中游一跃成为年级前列`,
        `${name}和同桌成为了最好的朋友，一起熬过的那些晚自习成了青春里最温暖的记忆`,
        `在校运会上破了学校纪录，${name}那一刻感觉自己无所不能`,
    ],
    bear: [
        `高一的第一次月考就跌出了预期，${name}意识到高中和初中完全不是一个量级`,
        `失眠开始频繁出现，${name}凌晨三点看着天花板发呆，焦虑像潮水一样涌来`,
        `暗恋的人和别人在一起了，${name}那段时间上课完全无法集中注意力`,
        `一模成绩出来，离目标院校的分数线差了整整50分，${name}的绝望感前所未有`,
        `${name}和父母因为志愿填报大吵一架，觉得没有人真正理解自己`,
    ]
});

const universityStoriesGen = (name: string, city: string, major: string) => ({
    bull: [
        city ? `${name}拖着行李箱走进${city}的大学校园，一切都是崭新的。室友们来自五湖四海，第一晚聊到了凌晨三点` : `${name}踏入大学校园的那一刻，感觉整个世界都被打开了`,
        major ? `在${major}的课堂上，${name}找到了真正的热情，教授的一句话点燃了内心的火焰` : `${name}选修了一门改变认知的课程，从此确定了未来的方向`,
        `${name}加入了一个社团，认识了一群志同道合的人。那些通宵排练的夜晚，是青春最热烈的注脚`,
        `大二暑假${name}拿到了第一份实习，虽然工资微薄，但第一次靠自己赚钱的成就感无与伦比`,
        `${name}在校园里遇到了一个特别的人，心跳加速的感觉让整个秋天都变得温柔`,
        `毕业论文获得了优秀，答辩那天指导老师对${name}说"你比我当年强"，这句话记了很多年`,
        `大学期间${name}去了一次长途旅行，在路上重新认识了自己`,
    ],
    bear: [
        city ? `${name}初到${city}，水土不服加上想家，独自在宿舍楼道里打了二十分钟电话` : `${name}第一次离开家乡，孤独感在夜深人静时格外清晰`,
        major ? `${name}发现${major}和想象中完全不同，挂科的红灯让人开始怀疑当初的选择` : `${name}对自己的专业产生了深深的怀疑，但转专业的勇气还没攒够`,
        `${name}一段认真的感情以分手告终，那个冬天格外漫长`,
        `室友关系出了问题，${name}每天回宿舍都要深呼吸三次`,
        `${name}参加了无数场招聘会，简历投了上百份，回复却寥寥无几。秋招的焦虑弥漫在整个毕业季`,
        `考研失利，看着别人收到录取通知书，${name}内心五味杂陈`,
    ]
});

const earlyCareerStoriesGen = (name: string, occupation: string, city: string) => ({
    bull: [
        occupation ? `${name}正式入职${occupation}岗位，虽然从最基础的活干起，但每天都在飞速成长` : `${name}入职第一天，紧张又兴奋，像是推开了人生新章节的大门`,
        city ? `${name}在${city}租了一间小小的房子，下班后对着窗外的灯火，觉得这座城市终于有了自己的位置` : `${name}终于有了属于自己的小窝，虽然不大，但每一件家具都是自己挑的`,
        `${name}第一个独立完成的项目获得了客户好评，领导在周会上点名表扬`,
        `${name}遇到了职业生涯中的第一位贵人，一次偶然的对话改变了此后的发展轨迹`,
        `年终考核拿到了超预期的奖金，${name}请朋友们吃了一顿大餐`,
        `${name}谈了一场认真的恋爱，两个人一起逛超市、做饭、规划未来，平淡却很踏实`,
        occupation ? `${name}在${occupation}领域开始崭露头角，收到了猎头的第一通电话` : `${name}开始在行业内有了一些名气，LinkedIn 上的连接请求越来越多`,
    ],
    bear: [
        occupation ? `${occupation}行业的现实比想象中残酷得多，${name}加班到凌晨是常态，理想和现实的落差让人喘不过气` : `职场新人的处境比想象中艰难，${name}被甲方连续退回方案三次后，在卫生间里崩溃了五分钟`,
        city ? `${city}的房租又涨了，${name}算了算这个月的开支，发现存款又缩水了` : `${name}月底看了一眼银行卡余额，沉默了很久`,
        `${name}第一次被裁员，收拾工位的那天假装很淡定，出了公司大门才红了眼眶`,
        `连续相亲了好几次，没有一个聊得来的。父母的催促和${name}的孤独感交织在一起`,
        `${name}身体第一次亮起了红灯，医生说要注意休息，但手上的项目根本停不下来`,
        `最好的朋友结婚了，${name}参加婚礼时笑着祝福，回到出租屋后觉得有点落寞`,
    ]
});

const marriageStoriesGen = (name: string) => ({
    bull: [
        `${name}在一个普通的周末向对方求婚了。虽然没有钻戒和鲜花，但对方的眼泪就是最好的回答`,
        `婚礼那天，${name}看到父母欣慰的笑容，突然觉得自己真的长大了`,
        `蜜月旅行去了一直想去的地方，${name}牵着爱人的手走过的那些路，变成了共同的记忆`,
    ],
    bear: [
        `${name}发现婚后的生活和恋爱时很不一样，柴米油盐的磨合比想象中更考验耐心`,
        `因为婆媳关系产生了不少摩擦，${name}夹在中间左右为难`,
        `${name}婚后第一次大吵架，摔门而出在楼下坐了一个小时`,
    ]
});

const parentingStoriesGen = (name: string) => ({
    bull: [
        `孩子出生了，${name}第一次抱起那个小小的生命，感觉整个世界的重量都在怀里。从此有了软肋，也有了铠甲`,
        `孩子叫出第一声"爸爸/妈妈"的那天，${name}觉得所有的疲惫都值了`,
        `${name}带孩子去了游乐场，看着小家伙开心地奔跑，忽然理解了父母当年的心情`,
    ],
    bear: [
        `孩子半夜发高烧，${name}抱着往医院冲的路上，人生第一次感受到那种刻骨的无助`,
        `工作和育儿的冲突让${name}焦头烂额，觉得自己什么角色都没演好`,
        `${name}和另一半在教育理念上产生了分歧，关于孩子的问题成了家里最敏感的话题`,
    ]
});

const midCareerStoriesGen = (name: string, occupation: string, city: string) => ({
    bull: [
        occupation ? `${name}在${occupation}领域深耕多年，终于等到了那个"质变"的机会。一个重大项目的成功让事业迈上新台阶` : `厚积薄发，${name}多年的积累在这一年集中爆发，事业迎来了真正的上升期`,
        `${name}完成了一次重要的职级晋升，站在新的高度看到了不一样的风景`,
        `${name}开始带团队了。从个人贡献者到管理者的转变充满挑战，但也收获了新的成就感`,
        `${name}投资的一个项目开始盈利，被动收入第一次超过了一万块`,
        city ? `${name}在${city}买了人生中第一套房子。拿到钥匙的那天，在空荡荡的客厅里站了很久` : `${name}买了人生中第一套自己的房子。拿到钥匙的那天，在空荡荡的客厅里站了很久`,
        occupation ? `${name}收到了${occupation}行业顶级公司的邀约，纠结了一周后决定接受新挑战` : `一个意想不到的机会从天而降，${name}果断抓住后人生轨迹发生了转折`,
        `${name}的孩子在学校拿了第一名，看着成绩单觉得这些年的付出都有了意义`,
        `${name}带着全家一起出国旅行，在异国的街头发现生活原来可以有很多种可能`,
    ],
    bear: [
        `35岁生日那天，${name}突然意识到自己已经不再年轻了。看着镜子里的白发，中年危机不请自来`,
        `公司大规模裁员，虽然这次没轮到${name}，但那种不安全感如影随形`,
        occupation ? `${occupation}行业正在经历剧变，AI和新技术的冲击让${name}不得不重新思考自己的价值` : `行业的变化比预想中快得多，${name}曾经引以为傲的技能似乎正在贬值`,
        `${name}的体检报告上第一次出现了需要复查的指标，开始认真思考健康问题`,
        `${name}父母的身体开始出现问题，频繁往返于医院的日子让人身心俱疲`,
        `一次错误的投资决策导致了不小的经济损失，${name}好几个月都睡不好觉`,
        `${name}和另一半的关系进入了倦怠期，两个人坐在同一张沙发上却各看各的手机`,
        `孩子进入了叛逆期，一句"你不懂我"像刀子一样扎在${name}心上`,
        `${name}发现自己的收入增长已经赶不上同龄人了，焦虑感在深夜特别强烈`,
    ]
});

const lateCareerStoriesGen2 = (name: string, city: string) => ({
    bull: [
        `${name}在行业里终于有了真正的话语权，年轻人开始叫"老师"，这个称呼带着沉甸甸的分量`,
        `${name}的孩子考上了不错的大学，送去学校的路上，想起了当年父母送自己的场景`,
        `事业上积累的财富终于让${name}可以不再为钱焦虑，开始思考人生更深层的意义`,
        `${name}和老朋友重聚，聊起年少时的梦想，发现有些居然真的实现了`,
        `${name}开始做一些公益的事情，用自己的经验帮助年轻人少走弯路`,
        `50岁生日那天收到了孩子写的一封长信，${name}哭得像个孩子`,
        `${name}重新拾起了年轻时放弃的爱好，发现人生什么时候开始都不晚`,
    ],
    bear: [
        `${name}参加了一位老同事的葬礼，生命的脆弱第一次如此真实地击中了自己`,
        `${name}的膝盖开始疼了，爬楼梯时不自觉地扶着扶手。身体在提醒：你不再年轻了`,
        `孩子工作后去了远方的城市，${name}的家里突然空了，"空巢"的滋味比想象中难受`,
        `公司里越来越多年轻面孔，${name}开会时偶尔听不懂他们的术语，有种被时代抛下的恐惧`,
        `一场突如其来的疾病打乱了所有计划，${name}住院的日子里重新排列了人生的优先级`,
        city ? `${name}回到${city}发现儿时的街道已经面目全非，熟悉的人越来越少了` : `${name}回老家发现儿时的街道已经面目全非，熟悉的人越来越少了`,
        `父母相继离世，${name}人生中最坚固的靠山消失了，第一次真正成为了"大人"`,
    ]
});

const retirementStoriesGen2 = (name: string) => ({
    bull: [
        `${name}退休第一天，睡到自然醒，泡了一杯茶，在阳台上坐了一整个上午。原来慢下来的感觉这么好`,
        `${name}和老伴报名了一个老年大学的课程，重新当学生的感觉居然还挺新鲜`,
        `${name}带着孙子去公园，那双小手牵着自己的手指，心里涌起一种奇妙的温暖`,
        `${name}终于实现了环游世界的梦想，在巴黎的塞纳河边发了一条朋友圈：来得虽晚，但终究来了`,
        `${name}写了一本回忆录，虽然不打算出版，但把这一生的故事留下来，觉得很满足`,
        `金婚纪念日，孩子们从各地赶回来庆祝，${name}看着满桌的笑脸，觉得这辈子值了`,
    ],
    bear: [
        `${name}退休后的生活远没有想象中精彩，没有了工作的节奏，每一天都变得漫长`,
        `一次跌倒导致了骨折，${name}在床上躺了两个月。衰老的感觉从未如此具体`,
        `老伴的记忆开始模糊，有时候叫不出${name}的名字，每一次都心如刀割`,
        `${name}翻看年轻时的照片，那些人、那些事、那些选择——如果重来一次，会不会不一样？`,
        `孩子们都忙着自己的生活，电话越来越短越来越少。${name}理解他们，但还是觉得孤独`,
        `${name}身体的零件一个接一个地出问题，药盒里的药越来越多，这就是晚年的日常`,
    ]
});

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

    const strToSeed = `${user.birthYear || ''}${user.birthCity || ''}${user.universityCity || ''}${user.traits || ''}${user.name || ''}`;
    let seed = 1990;
    for (let i = 0; i < strToSeed.length; i++) {
        seed += strToSeed.charCodeAt(i) * (i + 1);
    }

    const name = user.name || 'ta';
    const city = user.birthCity || '';
    const occupation = user.currentOccupation || '';
    const currentCity = user.currentCity || '';
    const parentBg = user.parentBackground || '';

    const babyStories = babyStoriesGen(name, city);
    const kindergartenStories = kindergartenStoriesGen(name);
    const primarySchoolStories = primarySchoolStoriesGen(name, parentBg);
    const middleSchoolStories = middleSchoolStoriesGen(name);
    const highSchoolStories = highSchoolStoriesGen(name);
    const uniStories = universityStoriesGen(name, user.universityCity || '', user.universityMajor || '');
    const earlyCareer = earlyCareerStoriesGen(name, occupation, currentCity);
    const marriageStories = marriageStoriesGen(name);
    const parentingStories = parentingStoriesGen(name);
    const midCareer = midCareerStoriesGen(name, occupation, currentCity);
    const lateCareer = lateCareerStoriesGen2(name, city);
    const retirementStories = retirementStoriesGen2(name);

    // Story at almost every 2 years, more dense than before
    const storyAges = new Set([
        0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 19, 20, 22,
        23, 24, 25, 27, 28, 30, 32, 34, 35, 37, 39, 40,
        42, 44, 45, 47, 50, 52, 55, 57, 60, 63, 65, 68, 70, 73, 75, 78, 80
    ]);

    // Major life event triggers (add dramatic spikes)
    const dramaticEvents: Record<number, { trend: number; vol: number; milestone: string }> = {};

    // Birth
    dramaticEvents[0] = { trend: 5, vol: 5, milestone: `${name}降生` };
    // Kindergarten
    dramaticEvents[3] = { trend: 3, vol: 6, milestone: '第一天上幼儿园' };
    // Primary school
    dramaticEvents[6] = { trend: 2, vol: 8, milestone: '小学入学' };
    // Middle school
    dramaticEvents[12] = { trend: -3, vol: 10, milestone: '升入初中' };
    // High school entrance
    dramaticEvents[15] = { trend: 5, vol: 12, milestone: '中考 · 进入高中' };
    // University entrance
    dramaticEvents[18] = { trend: 15, vol: 8, milestone: user.universityCity ? `高考放榜 · 考入${user.universityCity}的大学` : '高考 · 踏入大学' };
    // Graduation
    dramaticEvents[22] = { trend: -5, vol: 12, milestone: user.universityMajor ? `${user.universityMajor}毕业 · 告别校园` : '大学毕业' };
    // First job
    dramaticEvents[23] = { trend: 8, vol: 15, milestone: occupation ? `第一份${occupation}工作` : '初入职场' };
    // Career setback (seeded)
    const setbackAge = 25 + Math.floor(seededRandom(seed + 100) * 4);
    dramaticEvents[setbackAge] = { trend: -18, vol: 22, milestone: `${name}遭遇重大挫折` };
    // Love/Marriage
    const marriageAge = 26 + Math.floor(seededRandom(seed + 200) * 6);
    dramaticEvents[marriageAge] = { trend: 12, vol: 10, milestone: `${name}步入婚姻殿堂` };
    // First child
    const childAge = marriageAge + 1 + Math.floor(seededRandom(seed + 300) * 3);
    if (childAge <= 38) {
        dramaticEvents[childAge] = { trend: 10, vol: 14, milestone: `${name}迎来新生命` };
    }
    // Career peak
    dramaticEvents[35] = { trend: 15, vol: 10, milestone: currentCity ? `事业突破 · 在${currentCity}站稳脚跟` : '事业突破 · 迎来上升期' };
    // Mid-life crisis
    dramaticEvents[40] = { trend: -12, vol: 18, milestone: '不惑之年 · 中年转折' };
    // Health scare
    const healthAge = 45 + Math.floor(seededRandom(seed + 400) * 8);
    dramaticEvents[healthAge] = { trend: -15, vol: 16, milestone: '健康亮起红灯' };
    // Child leaving home
    if (childAge && childAge + 18 <= 75) {
        dramaticEvents[childAge + 18] = { trend: -5, vol: 10, milestone: '孩子远行 · 空巢' };
    }
    // Parent health crisis
    const parentCrisisAge = 48 + Math.floor(seededRandom(seed + 500) * 7);
    dramaticEvents[parentCrisisAge] = { trend: -10, vol: 14, milestone: '父母健康危机' };
    // Retirement
    dramaticEvents[60] = { trend: 8, vol: 8, milestone: `${name}花甲之年 · 退休` };
    // Golden years event
    dramaticEvents[70] = { trend: -8, vol: 12, milestone: '古稀之年 · 回望一生' };
    // Late life
    dramaticEvents[75] = { trend: 5, vol: 6, milestone: '生命的智慧' };

    for (let age = 0; age <= 80; age++) {
        let trend = trendMod * 0.3;
        let volatility = 15 + volatilityMod * 0.5; // Base volatility increased from 10 to 15
        let milestone: string | undefined = undefined;
        let story: string | undefined = undefined;

        // Life phase base volatility (all increased)
        if (age < 6) {
            volatility = 10 + volatilityMod * 0.3;
            trend = 3;
        } else if (age < 12) {
            volatility = 14 + volatilityMod * 0.3;
            trend = 1;
        } else if (age < 18) {
            volatility = 18 + volatilityMod * 0.4;
            trend = 0;
        } else if (age < 23) {
            volatility = 22 + volatilityMod * 0.5;
            trend = 2 + trendMod * 0.5;
        } else if (age < 30) {
            volatility = 25 + volatilityMod * 0.7;
            trend = 1 + trendMod * 0.4;
        } else if (age < 40) {
            volatility = 22 + volatilityMod * 0.6;
            trend = 2 + trendMod * 0.3;
        } else if (age < 50) {
            volatility = 20 + volatilityMod * 0.5;
            trend = -1 + trendMod * 0.3;
        } else if (age < 60) {
            volatility = 16 + volatilityMod * 0.4;
            trend = 0 + trendMod * 0.2;
        } else {
            volatility = 12 + volatilityMod * 0.3;
            trend = 1;
        }

        // Apply dramatic events
        const event = dramaticEvents[age];
        if (event) {
            trend += event.trend;
            volatility += event.vol;
            milestone = event.milestone;
        }

        // Extra random spikes for drama (every ~7 years a surprise event)
        if (!event && seededRandom(seed + age * 7) > 0.85) {
            const spike = (seededRandom(seed + age * 13) - 0.5) * 25;
            trend += spike;
            volatility += 8;
        }

        // Calculate Candlestick values with more volatility
        const change = (seededRandom(seed++) - 0.5) * volatility + trend;
        const open = currentFortune;
        let close = currentFortune + change;
        close = Math.max(3, Math.min(97, close));

        const high = Math.min(100, Math.max(open, close) + seededRandom(seed++) * volatility * 0.7);
        const low = Math.max(0, Math.min(open, close) - seededRandom(seed++) * volatility * 0.7);
        const isBull = close >= open;

        currentFortune = close;

        // Generate detailed story
        if (storyAges.has(age)) {
            const storyType = isBull ? 'bull' : 'bear';
            if (age <= 2) {
                story = pickStory(babyStories[storyType], seed + age);
            } else if (age <= 5) {
                story = pickStory(kindergartenStories[storyType], seed + age);
            } else if (age <= 11) {
                story = pickStory(primarySchoolStories[storyType], seed + age);
            } else if (age <= 14) {
                story = pickStory(middleSchoolStories[storyType], seed + age);
            } else if (age <= 17) {
                story = pickStory(highSchoolStories[storyType], seed + age);
            } else if (age <= 22) {
                story = pickStory(uniStories[storyType], seed + age);
            } else if (age <= 30) {
                // Mix in marriage/parenting stories at the right ages
                if (age === marriageAge) {
                    story = pickStory(marriageStories[storyType], seed + age);
                } else if (age === childAge) {
                    story = pickStory(parentingStories[storyType], seed + age);
                } else {
                    story = pickStory(earlyCareer[storyType], seed + age);
                }
            } else if (age <= 50) {
                if (age === childAge) {
                    story = pickStory(parentingStories[storyType], seed + age);
                } else {
                    story = pickStory(midCareer[storyType], seed + age);
                }
            } else if (age <= 60) {
                story = pickStory(lateCareer[storyType], seed + age);
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
