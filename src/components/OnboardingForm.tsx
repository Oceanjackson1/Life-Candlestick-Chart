"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLifeStore } from '@/store/useLifeStore'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

const traitOptions = [
    '乐观', '坚韧', '敏感', '冒险', '稳重', '内向',
    '外向', '创意', '理性', '感性', '自律', '有野心',
    '善良', '幽默', '独立', '务实', '浪漫', '强势',
]

const steps = [
    { id: 'start', title: '开启人生测算' },
    { id: 'gender', title: '您的性别' },
    { id: 'birth', title: '出生信息' },
    { id: 'background', title: '原生家庭' },
    { id: 'traits', title: '你的特质' },
    { id: 'education', title: '教育背景' },
    { id: 'career', title: '当前事业' },
]

export default function OnboardingForm({ onComplete }: { onComplete: () => void }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState(1)
    const { userData, setUserData } = useLifeStore()

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setDirection(1)
            setCurrentStep(prev => prev + 1)
        } else {
            onComplete()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setDirection(-1)
            setCurrentStep(prev => prev - 1)
        }
    }

    const variants = {
        initial: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        animate: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const }
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -50 : 50,
            opacity: 0,
            transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] as const }
        })
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Progress indicators */}
            <div className="flex justify-center space-x-2 mb-8">
                {steps.map((step, idx) => (
                    <div
                        key={step.id}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            idx === currentStep ? "w-8 bg-black dark:bg-white" : "w-2 bg-black/10 dark:bg-white/20"
                        )}
                    />
                ))}
            </div>

            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-0 w-full glass p-8 rounded-3xl flex flex-col"
                    >
                        <h2 className="text-2xl font-bold mb-6 tracking-tight">{steps[currentStep].title}</h2>

                        <div className="flex-1">
                            {currentStep === 0 && (
                                <div className="text-muted-foreground text-sm lg:text-base leading-relaxed space-y-4">
                                    <p>欢迎体验「人生K线图」。</p>
                                    <p>我们将结合大语言模型分析与现代金融可视化技术，将您的人生起伏抽象为股票 K 线。</p>
                                    <p>只需要输入几个关键节点信息，即可预见你的牛熊转换周期。</p>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">你的名字</label>
                                        <input
                                            type="text"
                                            placeholder="输入你的名字或昵称"
                                            value={userData.name}
                                            onChange={e => setUserData({ name: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">性别</label>
                                        <div className="flex gap-4">
                                            {['male', 'female'].map(g => (
                                                <button
                                                    key={g}
                                                    onClick={() => setUserData({ gender: g as any })}
                                                    className={cn(
                                                        "flex-1 py-4 rounded-2xl border-2 transition-all text-lg font-medium",
                                                        userData.gender === g
                                                            ? "border-black bg-black/5 dark:border-white dark:bg-white/10"
                                                            : "border-border hover:border-black/30 dark:hover:border-white/30"
                                                    )}
                                                >
                                                    {g === 'male' ? '男' : '女'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">出生年份</label>
                                        <input
                                            type="number"
                                            placeholder="例如: 1995"
                                            value={userData.birthYear}
                                            onChange={e => setUserData({ birthYear: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">出生城市</label>
                                        <input
                                            type="text"
                                            placeholder="例如: 北京"
                                            value={userData.birthCity}
                                            onChange={e => setUserData({ birthCity: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">父母的职业或是家庭主基调</label>
                                    <textarea
                                        rows={4}
                                        placeholder="例如: 父母都是普通的工薪阶层，或者做点小生意..."
                                        value={userData.parentBackground}
                                        onChange={e => setUserData({ parentBackground: e.target.value })}
                                        className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base resize-none"
                                    />
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-3 text-muted-foreground">选择最符合你的标签（可多选）</label>
                                        <div className="flex flex-wrap gap-2">
                                            {traitOptions.map(trait => {
                                                const selected = (userData.traits || '').split('，').filter(Boolean).includes(trait);
                                                return (
                                                    <button
                                                        key={trait}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = (userData.traits || '').split('，').filter(Boolean);
                                                            const next = selected
                                                                ? current.filter(t => t !== trait)
                                                                : [...current, trait];
                                                            setUserData({ traits: next.join('，') });
                                                        }}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                                                            selected
                                                                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                                                : "border-border hover:border-black/30 dark:hover:border-white/30 text-foreground"
                                                        )}
                                                    >
                                                        {trait}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">
                                            {userData.name ? `${userData.name}还有什么特质？` : '你还有什么特质？'}
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="用你自己的话描述，例如：做事比较执着，喜欢钻研技术，有点社恐但对朋友很真诚..."
                                            value={userData.traits}
                                            onChange={e => setUserData({ traits: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">大学所在城市</label>
                                        <input
                                            type="text"
                                            placeholder="例如: 上海"
                                            value={userData.universityCity}
                                            onChange={e => setUserData({ universityCity: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">所学专业</label>
                                        <input
                                            type="text"
                                            placeholder="例如: 计算机科学"
                                            value={userData.universityMajor}
                                            onChange={e => setUserData({ universityMajor: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 6 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">当前工作城市</label>
                                        <input
                                            type="text"
                                            placeholder="例如: 深圳"
                                            value={userData.currentCity}
                                            onChange={e => setUserData({ currentCity: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">当前职业</label>
                                        <input
                                            type="text"
                                            placeholder="例如: 产品经理"
                                            value={userData.currentOccupation}
                                            onChange={e => setUserData({ currentOccupation: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-between items-center">
                            {currentStep > 0 ? (
                                <button
                                    onClick={prevStep}
                                    className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            ) : (
                                <div />
                            )}

                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {currentStep === steps.length - 1 ? (
                                    <>生成生命 K 线 <CheckCircle2 size={18} /></>
                                ) : currentStep === 0 ? (
                                    <>开始 <ArrowRight size={18} /></>
                                ) : (
                                    <>下一步 <ArrowRight size={18} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Made By Ocean Signature */}
            <div className="mt-12 text-center text-sm font-medium text-muted-foreground tracking-widest opacity-60">
                MADE BY OCEAN
            </div>
        </div>
    )
}
