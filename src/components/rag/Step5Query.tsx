'use client';

import React, { useState } from 'react';
import { useRAGStore } from '@/store/ragStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { embedTexts } from '@/lib/apiClient';

export function Step5Query() {
  const {
    vectorChunks,
    currentQuery,
    setCurrentQuery,
    setQueryVector,
    setRetrievedChunks,
    setCurrentStep,
    queryHistory,
  } = useRAGStore();

  const [inputQuery, setInputQuery] = useState(currentQuery || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuerySubmit = async () => {
    if (!inputQuery.trim()) {
      setError('请输入查询内容');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 向量化查询
      const [queryVector] = await embedTexts([inputQuery.trim()]);

      setCurrentQuery(inputQuery.trim());
      setQueryVector(queryVector);

      // 清空之前的检索结果
      setRetrievedChunks([]);

      setTimeout(() => {
        if (window.confirm('查询向量化完成！是否前往下一步进行相似度检索？')) {
          setCurrentStep(6);
        }
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '向量化失败');
    } finally {
      setLoading(false);
    }
  };

  if (vectorChunks.length === 0) {
    return (
      <Card title="⚠️ 请先完成向量存储">
        <p className="text-muted-foreground">
          请返回步骤 4 完成向量存储后再进行查询。
        </p>
        <Button onClick={() => setCurrentStep(4)} className="mt-4">
          返回步骤 4
        </Button>
      </Card>
    );
  }

  const exampleQueries = [
    'RAG 是什么？',
    '如何优化检索效果？',
    '向量数据库的作用是什么？',
    '相似度计算的原理',
  ];

  return (
    <div className="space-y-6">
      <Card title="❓ 步骤 5：查询输入">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            输入你的问题，系统会将其向量化并在向量库中检索相关文档。
          </p>

          <div>
            <label className="block text-sm font-medium mb-2">
              你的问题
            </label>
            <textarea
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="例如：什么是 RAG？"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              disabled={loading}
            />
          </div>

          <Button onClick={handleQuerySubmit} disabled={loading || !inputQuery.trim()}>
            {loading ? '向量化中...' : '提交查询'}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ❌ {error}
            </div>
          )}
        </div>
      </Card>

      <Card title="💡 示例查询">
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => setInputQuery(query)}
              className="px-3 py-1.5 text-sm border border-border rounded-full hover:bg-secondary transition-colors"
              disabled={loading}
            >
              {query}
            </button>
          ))}
        </div>
      </Card>

      {currentQuery && (
        <Card title="✅ 当前查询">
          <div className="bg-muted p-3 rounded text-sm">
            {currentQuery}
          </div>
        </Card>
      )}

      {queryHistory.length > 0 && (
        <Card title="📜 历史查询">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {queryHistory.slice(0, 5).map((history) => (
              <button
                key={history.id}
                onClick={() => setInputQuery(history.query)}
                className="w-full text-left p-3 rounded border border-border hover:border-primary/50 transition-colors"
                disabled={loading}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">{history.query}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(history.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {history.answer}
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {currentQuery && (
        <div className="flex justify-end">
          <Button onClick={() => setCurrentStep(6)}>
            下一步：相似度检索 →
          </Button>
        </div>
      )}
    </div>
  );
}
