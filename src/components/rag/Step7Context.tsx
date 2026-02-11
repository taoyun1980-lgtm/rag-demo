'use client';

import React, { useState, useEffect } from 'react';
import { useRAGStore } from '@/store/ragStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function Step7Context() {
  const {
    retrievedChunks,
    currentQuery,
    setCurrentStep,
  } = useRAGStore();

  const [showFullPrompt, setShowFullPrompt] = useState(false);

  // 构建上下文
  const context = retrievedChunks
    .map((result, index) => `[文档 ${index + 1}]:\n${result.chunk.text}`)
    .join('\n\n');

  const prompt = `基于以下参考资料回答问题：

参考资料：
${context}

问题：${currentQuery}

请根据参考资料提供准确、简洁的回答。如果参考资料中没有相关信息，请说明"参考资料中没有找到相关信息"。`;

  // 统计 Token（粗略估算：中文 1 字约 2 token，英文 1 词约 1 token）
  const estimatedTokens = Math.ceil(prompt.length * 1.5);
  const maxContextWindow = 8000; // qwen-plus 的上下文窗口
  const usage = (estimatedTokens / maxContextWindow) * 100;

  if (retrievedChunks.length === 0) {
    return (
      <Card title="⚠️ 请先完成检索">
        <p className="text-muted-foreground">
          请返回步骤 6 完成相似度检索后再构建上下文。
        </p>
        <Button onClick={() => setCurrentStep(6)} className="mt-4">
          返回步骤 6
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="📝 步骤 7：上下文构建">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            将检索到的文档块与用户查询组合成完整的 prompt，发送给 LLM。
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted p-3 rounded">
              <p className="text-sm text-muted-foreground mb-1">检索文档数</p>
              <p className="text-2xl font-bold">{retrievedChunks.length}</p>
            </div>
            <div className="bg-muted p-3 rounded">
              <p className="text-sm text-muted-foreground mb-1">预计 Token</p>
              <p className="text-2xl font-bold">{estimatedTokens.toLocaleString()}</p>
            </div>
            <div className="bg-muted p-3 rounded">
              <p className="text-sm text-muted-foreground mb-1">窗口使用率</p>
              <p className="text-2xl font-bold">{usage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="🔍 参考资料">
        <div className="space-y-3">
          {retrievedChunks.map((result, index) => (
            <div key={result.chunk.id} className="p-3 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">文档 {index + 1}</span>
                <span className="text-xs text-muted-foreground">
                  相似度：{(result.similarity * 100).toFixed(2)}%
                </span>
              </div>
              <p className="text-sm">{result.chunk.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="📄 完整 Prompt">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {showFullPrompt ? '完整内容' : '预览'}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFullPrompt(!showFullPrompt)}
            >
              {showFullPrompt ? '收起' : '展开'}
            </Button>
          </div>

          <div className="bg-muted p-4 rounded font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap">
            {showFullPrompt ? prompt : `${prompt.slice(0, 500)}...\n\n(共 ${prompt.length} 字符)`}
          </div>
        </div>
      </Card>

      <Card title="📝 学习要点">
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>为什么需要构建上下文？</strong></p>
          <p>
            LLM 本身不包含你的私有数据。通过 RAG，我们将检索到的相关文档
            作为上下文传入 prompt，让 LLM 基于这些信息回答问题。
          </p>
          <p><strong>上下文窗口限制</strong></p>
          <p>
            每个模型都有最大上下文长度限制。这就是为什么我们只传入 Top-K
            最相关的文档，而不是所有文档。
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setCurrentStep(8)}>
          下一步：LLM 生成 →
        </Button>
      </div>
    </div>
  );
}
