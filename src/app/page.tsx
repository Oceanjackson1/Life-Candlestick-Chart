"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OnboardingForm from '@/components/OnboardingForm'
import LifeKlineChart from '@/components/LifeKlineChart'
import PartnerOnboarding from '@/components/PartnerOnboarding'
import MatchChart from '@/components/MatchChart'

type ViewMode = 'onboarding' | 'personal-kline' | 'partner-onboarding' | 'match-chart';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('onboarding')

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Ambient gradient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {viewMode === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                  人生 K 线图
                </h1>
                <p className="text-muted-foreground text-lg">
                  遇见你的波段周期，洞察生命的轨迹。
                </p>
              </div>

              <OnboardingForm onComplete={() => setViewMode('personal-kline')} />
            </motion.div>
          )}

          {viewMode === 'personal-kline' && (
            <motion.div
              key="personal-kline"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <LifeKlineChart
                onBack={() => setViewMode('onboarding')}
                onCalculatePartner={() => setViewMode('partner-onboarding')}
              />
            </motion.div>
          )}

          {viewMode === 'partner-onboarding' && (
            <motion.div
              key="partner-onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                  双生命运交汇
                </h1>
              </div>

              <PartnerOnboarding
                onComplete={() => setViewMode('match-chart')}
                onCancel={() => setViewMode('personal-kline')}
              />
            </motion.div>
          )}

          {viewMode === 'match-chart' && (
            <motion.div
              key="match-chart"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <MatchChart onBack={() => setViewMode('personal-kline')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
