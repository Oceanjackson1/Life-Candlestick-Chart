"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLifeStore } from '@/store/useLifeStore'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

const steps = [
    { id: 'intro', title: '缘分探索' },
    { id: 'basic', title: 'TA的基础信息' },
    { id: 'career', title: 'TA的事业轨迹' },
]

export default function PartnerOnboarding({ onComplete, onCancel }: { onComplete: () => void, onCancel: () => void }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState(1)
    const { partnerData, setPartnerData } = useLifeStore()

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
        } else {
            onCancel()
        }
    }

    const variants = {
        initial: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const } },
        exit: (direction: number) => ({ x: direction > 0 ? -50 : 50, opacity: 0, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] as const } })
    }

    return (
        <div className="w-full max-w-md mx-auto">
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
                                <div className="text-muted-foreground leading-relaxed space-y-4">
                                    <p>只需输入您知道的关键信息就行，不知道的信息可以留空。</p>
                                    <p>我们将把你们的命运抛物线放在同一个坐标系内碰撞。</p>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">出生的年份 (可选)</label>
                                        <input
                                            type="number"
                                            placeholder="例如: 1996"
                                            value={partnerData.birthYear || ''}
                                            onChange={e => setPartnerData({ birthYear: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">成长的城市 (可选)</label>
                                        <input
                                            type="text"
                                            placeholder="例如: 杭州"
                                            value={partnerData.birthCity || ''}
                                            onChange={e => setPartnerData({ birthCity: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">当前城市</label>
                                        <input
                                            type="text"
                                            placeholder="例如: 深圳"
                                            value={partnerData.currentCity || ''}
                                            onChange={e => setPartnerData({ currentCity: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">TA 的职业</label>
                                        <input
                                            type="text"
                                            placeholder="例如: 设计师"
                                            value={partnerData.currentOccupation || ''}
                                            onChange={e => setPartnerData({ currentOccupation: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-black/50 border border-border rounded-xl px-4 py-3 outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-between items-center">
                            <button
                                onClick={prevStep}
                                className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium"
                            >
                                {currentStep === steps.length - 1 ? (
                                    <>对比走势 <CheckCircle2 size={18} /></>
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
