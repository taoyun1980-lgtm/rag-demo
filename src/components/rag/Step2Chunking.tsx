'use client';

import React, { useState, useEffect } from 'react';
import { useRAGStore } from '@/store/ragStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { chunkText, getChunkStats } from '@/lib/chunking';

export function Step2Chunking() {
  const {
    document,
    chunks,
    chunkParams,
    setChunks,
    setChunkParams,
    setCurrentStep,
  } = useRAGStore();

  const [previewChunk, setPreviewChunk] = useState<number>(0);

  useEffect(() => {
    // 如果文档存在但还没有分块，自动分块
    if (document && chunks.length === 0) {
      handleChunk();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document]);

  const handleChunk = () => {
    if (!document) return;

    const newChunks = chunkText(document.rawText, chunkParams);
    setChunks(newChunks);
    setPreviewChunk(0);
  };

  const stats = chunks.length > 0 ? getChunkStats(chunks) : null;

  if (!document) {
    return (
      <Card title="⚠️ 请先上传文档">
        <p className="text-muted-foreground">
          请返回步骤 1 上传文档后再进行分块。
        </p>
        <Button onClick={() => setCurrentStep(1)} className="mt-4">
          返回步骤 1
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="✂️ 步骤 2：文档分块">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            将文档切分成小块，每块都会被独立向量化并存储。
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                块大小（字符数）
              </label>
              <input
                type="number"
                value={chunkParams.chunkSize}
                onChange={(e) =>
                  setChunkParams({ chunkSize: Number(e.target.value) })
                }
                min={100}
                max={2000}
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                建议：300-800 字符
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                重叠字符数
              </label>
              <input
                type="number"
                value={chunkParams.overlap}
                onChange={(e) =>
                  setChunkParams({ overlap: Number(e.target.value) })
                }
                min={0}
                max={200}
                className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                建议：50-100 字符
              </p>
            </div>
          </div>

          <Button onClick={handleChunk}>
            {chunks.length > 0 ? '重新分块' : '开始分块'}
          </Button>
        </div>
      </Card>

      {stats && (
        <Card title="📊 分块统计">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">分块数量</p>
              <p className="text-2xl font-bold">{stats.count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">平均大小</p>
              <p className="text-2xl font-bold">{stats.avgSize}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">最小大小</p>
              <p className="text-2xl font-bold">{stats.minSize}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">最大大小</p>
              <p className="text-2xl font-bold">{stats.maxSize}</p>
            </div>
          </div>
        </Card>
      )}

      {chunks.length > 0 && (
        <>
          <Card title="📦 分块预览">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setPreviewChunk(Math.max(0, previewChunk - 1))}
                  disabled={previewChunk === 0}
                  size="sm"
                >
                  ← 上一块
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {previewChunk + 1} / {chunks.length} 块
                </span>
                <Button
                  onClick={() =>
                    setPreviewChunk(Math.min(chunks.length - 1, previewChunk + 1))
                  }
                  disabled={previewChunk === chunks.length - 1}
                  size="sm"
                >
                  下一块 →
                </Button>
              </div>

              <div className="bg-muted p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {chunks[previewChunk].id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {chunks[previewChunk].text.length} 字符
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {chunks[previewChunk].text}
                </div>
              </div>
            </div>
          </Card>

          <Card title="📋 所有分块">
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {chunks.map((chunk, index) => (
                <button
                  key={chunk.id}
                  onClick={() => setPreviewChunk(index)}
                  className={`text-left p-3 rounded border transition-colors ${
                    index === previewChunk
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {chunk.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {chunk.text.length} 字符
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{chunk.text}</p>
                </button>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setCurrentStep(3)}>
              下一步：向量化 →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
