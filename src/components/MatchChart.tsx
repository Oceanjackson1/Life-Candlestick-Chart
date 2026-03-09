"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLifeStore } from '@/store/useLifeStore'
import { generateLifeData, calculateMatchScore, KlineDataPoint, MatchResult } from '@/lib/klineEngine'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft, RefreshCw, Heart } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length >= 2) {
        const d1 = payload[0].value;
        const d2 = payload[1].value;
        return (
            <div className="glass p-4 rounded-2xl shadow-xl min-w-[180px]">
                <p className="font-bold text-lg mb-2">{label} 岁</p>
                <div className="space-y-1 text-sm font-medium">
                    <div className="flex items-center justify-between text-primary">
                        <span>您的运势</span>
                        <span>{Math.round(d1)}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-500">
                        <span>TA的运势</span>
                        <span>{Math.round(d2)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
}

export default function MatchChart({ onBack }: { onBack: () => void }) {
    const { userData, partnerData } = useLifeStore()
    const [data, setData] = useState<{ age: number, user1: number, user2: number }[]>([])
    const [result, setResult] = useState<MatchResult | null>(null)
    const [isGenerating, setIsGenerating] = useState(true)

    useEffect(() => {
        let mounted = true;
        const fetchMatch = async () => {
            setIsGenerating(true);
            try {
                const [d1, d2] = await Promise.all([
                    generateLifeData(userData),
                    generateLifeData(partnerData)
                ]);

                if (!mounted) return;

                const merged = d1.map((p, i) => ({
                    age: p.age,
                    user1: p.close,
                    user2: d2[i]?.close || 50
                }));

                setData(merged);
                setResult(calculateMatchScore(d1, d2));
                setIsGenerating(false);
            } catch (e) {
                console.error(e);
                if (mounted) setIsGenerating(false);
            }
        };
        fetchMatch();
        return () => { mounted = false; };
    }, [userData, partnerData])

    if (isGenerating) {
        return (
            <div className="w-full max-w-4xl mx-auto h-[600px] glass rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                    <Heart className="absolute text-emerald-500 animate-ping opacity-75" size={40} />
                    <Heart className="absolute text-emerald-500" size={40} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-2">碰撞命运轨迹...</h3>
                    <p className="text-muted-foreground animate-pulse">正在将两人的生命抛物线置于同一时空进行共振测算</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between px-4">
                <button
                    onClick={onBack}
                    className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground flex items-center gap-2 text-sm font-medium"
                >
                    <ArrowLeft size={18} /> 返回个人 K 线
                </button>
            </div>

            <div className="glass rounded-[2.5rem] p-6 md:p-10 shadow-2xl bg-white/40 dark:bg-black/40 grid lg:grid-cols-3 gap-8">

                {/* Left column: Chart */}
                <div className="lg:col-span-2">
                    <div className="mb-8 pl-4">
                        <h2 className="text-3xl font-bold tracking-tight mb-2">双生命运交汇图</h2>
                        <div className="flex gap-4 text-sm font-medium mt-4">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /> {userData.name || '您'}</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> {partnerData.name || 'TA'}</div>
                        </div>
                    </div>

                    <div className="w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorU1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorU2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="age" tick={{ fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} minTickGap={30} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="user1" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorU1)" activeDot={{ r: 6 }} animationDuration={2000} />
                                <Area type="monotone" dataKey="user2" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorU2)" activeDot={{ r: 6 }} animationDuration={2500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right column: Report */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                        className="flex flex-col justify-center space-y-6 glass-panel rounded-3xl p-8"
                    >
                        <div>
                            <p className="text-muted-foreground font-medium mb-1">灵魂伴侣指数</p>
                            <div className="text-6xl font-black tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-emerald-500">
                                {result.score}%
                            </div>
                        </div>

                        <div className="h-px w-full bg-border" />

                        <div className="space-y-4 text-sm">
                            <div className="bg-black/5 dark:bg-white/10 p-4 rounded-xl">
                                <p className="font-bold mb-1">同频共振度: {Math.round(result.syncRatio * 100)}%</p>
                                <p className="text-muted-foreground leading-relaxed text-xs">衡量你们在面对岁月起伏时，运势相同方向的时间占比。</p>
                            </div>

                            <div className="bg-black/5 dark:bg-white/10 p-4 rounded-xl">
                                <p className="font-bold mb-1">命运交叉点: {result.crossPoints} 次</p>
                                <p className="text-muted-foreground leading-relaxed text-xs">运势发生地位反转的节点，往往也是互相救赎的关键时刻。</p>
                            </div>
                        </div>

                        <p className="text-sm font-medium leading-loose text-foreground/90 mt-4 italic">
                            "{result.report}"
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
