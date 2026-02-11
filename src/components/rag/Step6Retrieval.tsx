'use client';

import React, { useEffect, useState } from 'react';
import { useRAGStore } from '@/store/ragStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  findTopK,
  getAllSimilarities,
  formatSimilarity,
} from '@/lib/vectorUtils';

export function Step6Retrieval() {
  const {
    vectorChunks,
    queryVector,
    currentQuery,
    retrievedChunks,
    setRetrievedChunks,
    setCurrentStep,
  } = useRAGStore();

  const [topK, setTopK] = useState(3);
  const [allSimilarities, setAllSimilarities] = useState<
    Array<{ id: string; similarity: number }>
  >([]);

  useEffect(() => {
    if (queryVector && vectorChunks.length > 0) {
      handleRetrieve();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryVector, vectorChunks, topK]);

  const handleRetrieve = () => {
    if (!queryVector) return;

    // 执行检索
    const results = findTopK(queryVector, vectorChunks, topK);
    setRetrievedChunks(results);

    // 获取所有相似度（用于可视化）
    const allScores = getAllSimilarities(queryVector, vectorChunks);
    setAllSimilarities(allScores.sort((a, b) => b.similarity - a.similarity));
  };

  if (!queryVector || !currentQuery) {
    return (
      <Card title="⚠️ 请先输入查询">
        <p className="text-muted-foreground">
          请返回步骤 5 输入查询并完成向量化。
        </p>
        <Button onClick={() => setCurrentStep(5)} className="mt-4">
          返回步骤 5
        </Button>
      </Card>
    );
  }

  const maxSimilarity = Math.max(...allSimilarities.map((s) => s.similarity));

  return (
    <div className="space-y-6">
      <Card title="🔍 步骤 6：相似度检索（教学核心）">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            使用余弦相似度算法，计算查询向量与每个文档块向量的相似程度。
          </p>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <h4 className="font-semibold mb-2 text-blue-900">
              📐 余弦相似度公式
            </h4>
            <div className="bg-white p-3 rounded font-mono text-sm overflow-x-auto">
              similarity = dot(query, doc) / (norm(query) × norm(doc))
            </div>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• dot(query, doc)：两个向量的点积</li>
              <li>• norm(v)：向量的模长（√(v₁² + v₂² + ... + vₙ²)）</li>
              <li>• 结果范围：[-1, 1]，值越接近 1 表示越相似</li>
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">返回 Top-K 结果：</label>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[1, 2, 3, 4, 5].map((k) => (
                <option key={k} value={k}>
                  Top-{k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="📊 相似度分布（所有文档块）">
        <div className="space-y-3">
          {allSimilarities.map((item, index) => (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-mono text-xs">{item.id}</span>
                <span className={`font-semibold ${index < topK ? 'text-primary' : ''}`}>
                  {formatSimilarity(item.similarity)}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    index < topK ? 'bg-primary' : 'bg-muted-foreground'
                  }`}
                  style={{
                    width: `${(item.similarity / maxSimilarity) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {retrievedChunks.length > 0 && (
        <Card title={`🏆 Top-${topK} 检索结果`}>
          <div className="space-y-4">
            {retrievedChunks.map((result, index) => (
              <div
                key={result.chunk.id}
                className="p-4 rounded border-2 border-primary/30 bg-primary/5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-bold">
                      #{index + 1}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {result.chunk.id}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatSimilarity(result.similarity)}
                    </div>
                    <div className="text-xs text-muted-foreground">相似度</div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded text-sm whitespace-pre-wrap">
                  {result.chunk.text}
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  字符数：{result.chunk.text.length}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="📝 学习要点">
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>为什么使用余弦相似度？</strong></p>
          <p>
            余弦相似度关注向量的方向而非大小，适合衡量文本语义相似度。
            即使两个文本长度不同，只要语义相似，其向量方向就会相近。
          </p>
          <p><strong>Top-K 的作用</strong></p>
          <p>
            只取相似度最高的 K 个结果，避免将不相关的文档传递给 LLM，
            既提高了答案质量，又节省了 token 成本。
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setCurrentStep(7)}>
          下一步：上下文构建 →
        </Button>
      </div>
    </div>
  );
}
