'use client';

import React, { useState } from 'react';
import { useRAGStore } from '@/store/ragStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { embedTexts } from '@/lib/apiClient';

export function Step3Embedding() {
  const { chunks, vectorChunks, setVectorChunks, setCurrentStep } = useRAGStore();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleEmbed = async () => {
    if (chunks.length === 0) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // 准备文本
      const texts = chunks.map((chunk) => chunk.text);

      // 批量处理，每次 10 个
      const batchSize = 10;
      const allEmbeddings: number[][] = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const embeddings = await embedTexts(batch);
        allEmbeddings.push(...embeddings);

        setProgress(Math.round(((i + batch.length) / texts.length) * 100));
      }

      // 构建向量块
      const newVectorChunks = chunks.map((chunk, index) => ({
        ...chunk,
        vector: allEmbeddings[index],
        metadata: {
          embeddedAt: Date.now(),
        },
      }));

      setVectorChunks(newVectorChunks);

      setTimeout(() => {
        if (window.confirm('向量化完成！是否前往下一步查看向量存储？')) {
          setCurrentStep(4);
        }
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '向量化失败');
    } finally {
      setLoading(false);
    }
  };

  if (chunks.length === 0) {
    return (
      <Card title="⚠️ 请先进行分块">
        <p className="text-muted-foreground">
          请返回步骤 2 完成文档分块后再进行向量化。
        </p>
        <Button onClick={() => setCurrentStep(2)} className="mt-4">
          返回步骤 2
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="🔢 步骤 3：向量化">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            将每个文本块转换为高维向量，用于后续的相似度计算。
          </p>

          <div className="bg-muted p-4 rounded">
            <h4 className="font-medium mb-2">向量化配置</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 模型：{process.env.NEXT_PUBLIC_QWEN_EMBEDDING_MODEL || 'text-embedding-v3'}</li>
              <li>• 待处理块数：{chunks.length}</li>
              <li>• 批处理大小：10 块/批次</li>
            </ul>
          </div>

          {!loading && vectorChunks.length === 0 && (
            <Button onClick={handleEmbed}>
              开始向量化
            </Button>
          )}

          {!loading && vectorChunks.length > 0 && (
            <div className="flex items-center gap-4">
              <Button onClick={handleEmbed} variant="secondary">
                重新向量化
              </Button>
              <span className="text-sm text-green-600">
                ✓ 已完成向量化
              </span>
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>处理中...</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ❌ {error}
            </div>
          )}
        </div>
      </Card>

      {vectorChunks.length > 0 && (
        <>
          <Card title="✅ 向量化结果">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">向量块数量</p>
                <p className="text-2xl font-bold">{vectorChunks.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">向量维度</p>
                <p className="text-2xl font-bold">
                  {vectorChunks[0]?.vector.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总向量数</p>
                <p className="text-2xl font-bold">
                  {(vectorChunks.length * (vectorChunks[0]?.vector.length || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card title="🔍 向量预览">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                第一个块的向量（前 10 维）：
              </p>
              <div className="bg-muted p-3 rounded font-mono text-xs overflow-x-auto">
                [{vectorChunks[0].vector.slice(0, 10).map(v => v.toFixed(6)).join(', ')}, ...]
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setCurrentStep(4)}>
              下一步：向量存储 →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
