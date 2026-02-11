'use client';

import React, { useState } from 'react';
import { useRAGStore } from '@/store/ragStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function Step4Storage() {
  const { vectorChunks, setCurrentStep } = useRAGStore();
  const [selectedChunk, setSelectedChunk] = useState(0);
  const [showFullVector, setShowFullVector] = useState(false);

  if (vectorChunks.length === 0) {
    return (
      <Card title="⚠️ 请先进行向量化">
        <p className="text-muted-foreground">
          请返回步骤 3 完成向量化后再查看存储。
        </p>
        <Button onClick={() => setCurrentStep(3)} className="mt-4">
          返回步骤 3
        </Button>
      </Card>
    );
  }

  const chunk = vectorChunks[selectedChunk];

  return (
    <div className="space-y-6">
      <Card title="💾 步骤 4：向量存储">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            向量已存储在浏览器内存中，可以随时用于相似度检索。
          </p>

          <div className="bg-muted p-4 rounded">
            <h4 className="font-medium mb-2">存储方案</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 类型：浏览器内存（RAM）</li>
              <li>• 持久化：localStorage（刷新页面数据不丢失）</li>
              <li>• 检索算法：余弦相似度（纯 TypeScript 实现）</li>
              <li>• 优点：透明、易于理解、适合教学</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="📊 向量库概览">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">文本预览</th>
                <th className="text-right p-2">向量维度</th>
                <th className="text-center p-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {vectorChunks.map((chunk, index) => (
                <tr
                  key={chunk.id}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${
                    index === selectedChunk ? 'bg-primary/10' : ''
                  }`}
                >
                  <td className="p-2 font-mono text-xs">{chunk.id}</td>
                  <td className="p-2 max-w-md truncate">{chunk.text}</td>
                  <td className="p-2 text-right">{chunk.vector.length}</td>
                  <td className="p-2 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedChunk(index)}
                    >
                      查看
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {chunk && (
        <Card title={`🔍 详细信息：${chunk.id}`}>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">原始文本</h4>
              <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                {chunk.text}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">向量数据</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFullVector(!showFullVector)}
                >
                  {showFullVector ? '收起' : '展开全部'}
                </Button>
              </div>
              <div className="bg-muted p-3 rounded font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
                {showFullVector ? (
                  <div className="whitespace-pre-wrap break-all">
                    {JSON.stringify(chunk.vector, null, 2)}
                  </div>
                ) : (
                  <div>
                    [
                    {chunk.vector.slice(0, 20).map(v => v.toFixed(6)).join(', ')}
                    , ... (共 {chunk.vector.length} 维)]
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">元数据</h4>
              <div className="bg-muted p-3 rounded text-sm">
                <pre className="font-mono text-xs">
                  {JSON.stringify(chunk.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card title="📝 学习笔记">
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>什么是向量？</strong></p>
          <p>
            向量是文本的数学表示，相似的文本在向量空间中距离更近。
          </p>
          <p><strong>为什么需要向量化？</strong></p>
          <p>
            计算机无法直接理解文本语义，但可以通过向量之间的数学运算（如余弦相似度）
            来判断文本的相似程度。
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setCurrentStep(5)}>
          下一步：查询输入 →
        </Button>
      </div>
    </div>
  );
}
