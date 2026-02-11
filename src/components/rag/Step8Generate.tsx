'use client';

import React, { useState } from 'react';
import { useRAGStore } from '@/store/ragStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateStream } from '@/lib/apiClient';

export function Step8Generate() {
  const {
    retrievedChunks,
    currentQuery,
    generatedAnswer,
    setGeneratedAnswer,
    addQueryHistory,
  } = useRAGStore();

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (retrievedChunks.length === 0 || !currentQuery) return;

    setGenerating(true);
    setError(null);
    setGeneratedAnswer('');
    setStartTime(Date.now());
    setEndTime(null);

    // 构建上下文
    const context = retrievedChunks
      .map((result, index) => `[文档 ${index + 1}]:\n${result.chunk.text}`)
      .join('\n\n');

    await generateStream({
      context,
      query: currentQuery,
      onToken: (token) => {
        setGeneratedAnswer((prev) => prev + token);
      },
      onDone: () => {
        setGenerating(false);
        setEndTime(Date.now());

        // 保存到历史
        addQueryHistory({
          id: Date.now().toString(),
          query: currentQuery,
          timestamp: Date.now(),
          answer: generatedAnswer,
          retrievedChunks,
        });
      },
      onError: (err) => {
        setError(err);
        setGenerating(false);
        setEndTime(Date.now());
      },
    });
  };

  if (retrievedChunks.length === 0) {
    return (
      <Card title="⚠️ 请先完成检索">
        <p className="text-muted-foreground">
          请返回步骤 6 完成相似度检索后再生成答案。
        </p>
        <Button onClick={() => {}}>返回步骤 6</Button>
      </Card>
    );
  }

  const duration = startTime && endTime ? ((endTime - startTime) / 1000).toFixed(2) : null;
  const tokensPerSecond = duration && generatedAnswer
    ? Math.round(generatedAnswer.length / parseFloat(duration))
    : null;

  return (
    <div className="space-y-6">
      <Card title="🤖 步骤 8：LLM 生成">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            将构建好的 prompt 发送给 Qwen 模型，获取基于检索文档的答案。
          </p>

          <div className="bg-muted p-4 rounded">
            <h4 className="font-medium mb-2">生成配置</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 模型：{process.env.NEXT_PUBLIC_QWEN_MODEL || 'qwen-plus'}</li>
              <li>• 流式输出：是</li>
              <li>• 参考文档数：{retrievedChunks.length}</li>
            </ul>
          </div>

          {!generating && !generatedAnswer && (
            <Button onClick={handleGenerate}>
              🚀 开始生成答案
            </Button>
          )}

          {!generating && generatedAnswer && (
            <Button onClick={handleGenerate} variant="secondary">
              🔄 重新生成
            </Button>
          )}

          {generating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              生成中...
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ❌ {error}
            </div>
          )}
        </div>
      </Card>

      {generatedAnswer && (
        <>
          <Card title="✨ 生成的答案">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {generatedAnswer}
                </p>
              </div>
            </div>
          </Card>

          {duration && (
            <Card title="📊 生成统计">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">生成时间</p>
                  <p className="text-2xl font-bold">{duration}s</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">字符数</p>
                  <p className="text-2xl font-bold">{generatedAnswer.length}</p>
                </div>
                {tokensPerSecond && (
                  <div>
                    <p className="text-sm text-muted-foreground">生成速度</p>
                    <p className="text-2xl font-bold">{tokensPerSecond} 字/秒</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card title="📚 引用来源">
            <div className="space-y-3">
              {retrievedChunks.map((result, index) => (
                <div key={result.chunk.id} className="p-3 bg-muted rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">
                      文档 {index + 1} ({result.chunk.id})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      相似度：{(result.similarity * 100).toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-sm line-clamp-3">{result.chunk.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="🎓 学习总结">
            <div className="text-sm text-muted-foreground space-y-3">
              <p><strong>恭喜！你已经完成了完整的 RAG 流程：</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li><strong>文档上传</strong> - 准备知识库</li>
                <li><strong>文档分块</strong> - 切分为可管理的小块</li>
                <li><strong>向量化</strong> - 转换为数学表示</li>
                <li><strong>向量存储</strong> - 构建检索索引</li>
                <li><strong>查询输入</strong> - 接收用户问题</li>
                <li><strong>相似度检索</strong> - 找到最相关的文档</li>
                <li><strong>上下文构建</strong> - 组装 prompt</li>
                <li><strong>LLM 生成</strong> - 基于检索结果回答问题</li>
              </ol>
              <p className="mt-4">
                <strong>RAG 的核心价值：</strong>让 LLM 能够基于你的私有数据回答问题，
                避免幻觉，提供可追溯的答案来源。
              </p>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button onClick={() => window.location.reload()} variant="outline">
              🔄 开始新的查询
            </Button>
            <Button onClick={() => console.log('导出数据')} variant="secondary">
              💾 导出数据
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
