"use client"

import { useEffect, useState } from 'react'
import { useLifeStore } from '@/store/useLifeStore'
import { generateLifeData, KlineDataPoint } from '@/lib/klineEngine'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Share, RefreshCw } from 'lucide-react'

// Custom shape for the K-Line Candlestick
// Uses background prop to compute y positions since BarChart doesn't pass yAxis.scale to shapes
const Candlestick = (props: any) => {
    const { x, width, payload, background } = props;
    if (!payload) return null;

    const { open, close, high, low, isBull } = payload;

    const chartTop = background?.y ?? 0;
    const chartHeight = background?.height ?? 500;

    const scale = (val: number) => chartTop + chartHeight - (val / 100) * chartHeight;

    const yHigh = scale(high);
    const yLow = scale(low);
    const yOpen = scale(open);
    const yClose = scale(close);

    const vTop = Math.min(yOpen, yClose);
    const vBottom = Math.max(yOpen, yClose);
    const vHeight = Math.max(2, vBottom - vTop);

    const midX = x + width / 2;
    const color = isBull ? "#10b981" : "#ef4444";

    return (
        <g>
            <line x1={midX} y1={yHigh} x2={midX} y2={yLow} stroke={color} strokeWidth={1.5} />
            <rect
                x={x + 1}
                y={vTop}
                width={Math.max(width - 2, 2)}
                height={vHeight}
                fill={isBull ? color : color}
                fillOpacity={isBull ? 0.2 : 0.8}
                stroke={color}
                strokeWidth={1.5}
                rx={1}
            />
        </g>
    );
};

// Custom Tooltip with story display
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as KlineDataPoint;
        return (
            <div className="bg-white dark:bg-gray-900 border border-border p-4 rounded-2xl shadow-xl min-w-[220px] max-w-[280px]">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${data.isBull ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <p className="font-bold text-lg">{data.age} 岁</p>
                    <span className={`text-xs font-medium ml-auto ${data.isBull ? 'text-emerald-600' : 'text-red-500'}`}>
                        {data.isBull ? '上升期' : '调整期'}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="text-muted-foreground">开局: <span className="text-foreground font-medium">{data.open}</span></div>
                    <div className="text-muted-foreground">结果: <span className="text-foreground font-medium">{data.close}</span></div>
                    <div className="text-muted-foreground">高点: <span className="text-foreground font-medium">{data.high}</span></div>
                    <div className="text-muted-foreground">低点: <span className="text-foreground font-medium">{data.low}</span></div>
                </div>
                {data.milestone && (
                    <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-primary font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {data.milestone}
                        </p>
                    </div>
                )}
                {data.story && (
                    <div className={`mt-2 ${data.milestone ? '' : 'pt-2 border-t border-border'}`}>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {data.story}
                        </p>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export default function LifeKlineChart({ onBack, onCalculatePartner }: { onBack: () => void, onCalculatePartner: () => void }) {
    const { userData } = useLifeStore()
    const [data, setData] = useState<KlineDataPoint[]>([])
    const [isGenerating, setIsGenerating] = useState(true)

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setIsGenerating(true);
            try {
                const generated = await generateLifeData(userData);
                if (mounted) {
                    setData(generated);
                    setIsGenerating(false);
                }
            } catch (e) {
                console.error("Error generating data", e);
                if (mounted) setIsGenerating(false);
            }
        };
        fetchData();
        return () => { mounted = false; };
    }, [userData])

    if (isGenerating) {
        return (
            <div className="w-full max-w-4xl mx-auto h-[600px] glass rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div>
                    <h3 className="text-2xl font-bold mb-2">正在推演命运轨迹...</h3>
                    <p className="text-muted-foreground animate-pulse">结合命理结构与选择节点，构建专属您的K线图</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between px-4 gap-4">
                <button
                    onClick={onBack}
                    className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground flex items-center gap-2 text-sm font-medium"
                >
                    <ArrowLeft size={18} /> 重新测算
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={onCalculatePartner}
                        className="px-5 py-3 rounded-full bg-border hover:bg-black/10 dark:hover:bg-white/20 transition-all flex items-center gap-2 text-sm font-medium text-foreground"
                    >
                        <RefreshCw size={18} /> 测算另一半
                    </button>
                    <button className="px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all flex items-center gap-2 text-sm font-medium">
                        <Share size={18} /> 分享轨迹
                    </button>
                </div>
            </div>

            <div className="glass rounded-[2.5rem] p-6 md:p-10 shadow-2xl bg-white/40 dark:bg-black/40">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold tracking-tight mb-2">
                        {userData.name ? `${userData.name}的人生 K 线` : '您的人生 K 线'}
                    </h2>
                    <p className="text-muted-foreground">这里是 0 - 80 岁的运势起伏流年</p>
                </div>

                <div className="w-full h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} barCategoryGap="20%">
                            <XAxis
                                dataKey="age"
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={[0, 100]}
                                hide
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'var(--border)', opacity: 0.3 }}
                            />
                            <Bar dataKey="close" shape={<Candlestick />} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Milestone legend */}
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    {data.filter(d => d.milestone).map((d, i) => (
                        <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                            {d.age}岁 · {d.milestone}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
