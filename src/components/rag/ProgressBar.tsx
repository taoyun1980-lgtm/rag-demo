'use client';

import React from 'react';
import { useRAGStore } from '@/store/ragStore';

export function ProgressBar() {
  const currentStep = useRAGStore((state) => state.currentStep);
  const progress = (currentStep / 8) * 100;

  return (
    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
      <div
        className="bg-primary h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
