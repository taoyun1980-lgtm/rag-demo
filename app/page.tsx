'use client';

import React from 'react';
import { useRAGStore } from '@/store/ragStore';
import { StepNavigation } from '@/components/rag/StepNavigation';
import { ProgressBar } from '@/components/rag/ProgressBar';
import { Step1Upload } from '@/components/rag/Step1Upload';
import { Step2Chunking } from '@/components/rag/Step2Chunking';
import { Step3Embedding } from '@/components/rag/Step3Embedding';
import { Step4Storage } from '@/components/rag/Step4Storage';
import { Step5Query } from '@/components/rag/Step5Query';
import { Step6Retrieval } from '@/components/rag/Step6Retrieval';
import { Step7Context } from '@/components/rag/Step7Context';
import { Step8Generate } from '@/components/rag/Step8Generate';
import { STEP_NAMES } from '@/types/rag';

export default function Home() {
  const currentStep = useRAGStore((state) => state.currentStep);

  const stepComponents = {
    1: <Step1Upload />,
    2: <Step2Chunking />,
    3: <Step3Embedding />,
    4: <Step4Storage />,
    5: <Step5Query />,
    6: <Step6Retrieval />,
    7: <Step7Context />,
    8: <Step8Generate />,
  };

  return (
    <div className="flex min-h-screen">
      {/* 左侧导航 */}
      <StepNavigation />

      {/* 右侧主内容区 */}
      <main className="flex-1 overflow-y-auto">
        {/* 顶栏 */}
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
          <div className="max-w-5xl mx-auto px-8 py-6">
            <h1 className="text-3xl font-bold mb-2">RAG 演示系统</h1>
            <p className="text-muted-foreground mb-4">
              当前步骤：{STEP_NAMES[currentStep]}
            </p>
            <ProgressBar />
          </div>
        </header>

        {/* 步骤内容 */}
        <div className="max-w-5xl mx-auto px-8 py-8">
          {stepComponents[currentStep]}
        </div>
      </main>
    </div>
  );
}
