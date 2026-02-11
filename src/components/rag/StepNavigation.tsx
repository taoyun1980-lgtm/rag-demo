'use client';

import React from 'react';
import { useRAGStore } from '@/store/ragStore';
import { STEP_NAMES, type Step } from '@/types/rag';

export function StepNavigation() {
  const currentStep = useRAGStore((state) => state.currentStep);
  const setCurrentStep = useRAGStore((state) => state.setCurrentStep);

  const steps = Object.entries(STEP_NAMES) as [string, string][];

  return (
    <nav className="w-64 bg-card border-r border-border p-6 sticky top-0 h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">RAG 流程</h2>
      <ul className="space-y-2">
        {steps.map(([stepNum, stepName]) => {
          const step = Number(stepNum) as Step;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <li key={step}>
              <button
                onClick={() => setCurrentStep(step)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : isCompleted
                    ? 'bg-secondary hover:bg-secondary/80'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      isActive
                        ? 'bg-primary-foreground text-primary'
                        : isCompleted
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? '✓' : step}
                  </span>
                  <span className="text-sm">{stepName}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
