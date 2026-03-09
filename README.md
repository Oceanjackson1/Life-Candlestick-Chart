# 人生 K 线图 (Life Candlestick Chart) 📈

> "将命运的起伏，化作一张跃然屏上的 K 线图。"

这是一款基于现代前端架构（Next.js + 苹果级 UI/UX）打造的数据可视化创新应用。它将用户生活中的背景、出生地、事业节点等生命核心参数，通过模拟演算法转换为极具表现力的股票型“K 线图”，甚至能够为你与你的另一半进行“命运折线的双端测算与同频共振分析”。

## 🌟 核心功能亮点 (Features)

*   **个人命运波动图 (Personal Destiny K-Line)**  
    使用丝滑的苹果式表单（基于 Framer Motion）录入生命基础信息。内置算子引擎（Mock Engine）根据年龄动态生成随机与必然交织的走势图，为你画出 0-80 岁的“牛市”高光时刻和“熊市”震荡周期。
*   **双生命运交汇测算 (Soulmate Synergy Chart)**  
    非侵入式的伴侣数据分析，仅需填写你所知的基础特征。AI 引擎会将两人的命运抛物线放在同一个时空进行对比，输出：
    *   💞 **灵魂伴侣指数** 
    *   🤝 **同频共振度** (运势走向一致性)
    *   ⚔️ **命运交叉节点** (地位与运势反转救赎时刻)
*   **Apple-style 设计语言 (Premium UX)**  
    *   **极简主义**：大量优美留白与粗大版式。
    *   **毛玻璃美学 (Glassmorphism)**：高度细腻的半透明层叠加。
    *   **丝滑顺动**：在视图之间保持零延迟感的流畅动画切换。

## 🛠️ 技术栈 (Tech Stack)

本项目使用以下核心技术构建，保证了0成本的静态部署：

- **核心框架**: [Next.js (App Router)](https://nextjs.org/) + React 19 + TypeScript
- ** UI & 样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **过场与微动画**: [Framer Motion](https://www.framer.com/motion/)
- **数据可视化**: [Recharts](https://recharts.org/) (深度定制极简 Candlestick 与 Area 图表)
- **图标组件**: [Lucide React](https://lucide.dev/)

## 🚀 本地运行 (Getting Started)

这是一个标准的 Next.js 应用程序。

```bash
# 1. 克隆项目
git clone https://github.com/Oceanjackson1/Life-Candlestick-Chart.git
cd Life-Candlestick-Chart

# 2. 安装依赖
npm install

# 3. 开启本地开发服务器
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始测算。

## 🌐 部署 (Deployment)

得益于全客户端渲染与 Zustand 内存级存储设计，本应用**无需**挂载任何数据库 (如 Supabase/PostgreSQL)。为了保护您的 Deepseek API Key 不被泄露，应用内所有的 AI 分析均通过安全的 Serverless API Route 代理转发请求。

推荐直接将代码 Import 到 **[Vercel](https://vercel.com/)**，实现快速部署：

1. 在 Vercel 导入该 GitHub 仓库。
2. 在 **Environment Variables** (环境变量) 设置中，添加您自己的 API 原生密钥：
   - Name: `DEEPSEEK_API_KEY`
   - Value: `sk-589ae78...` (填入真实的 Key)
3. 点击 Deploy，等待数十秒即可上线！

---

*Enjoy the journey of your life.*
