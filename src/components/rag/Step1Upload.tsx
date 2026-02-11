'use client';

import React, { useState, useRef } from 'react';
import { useRAGStore } from '@/store/ragStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { parseTextFile, validateFile, getFileStats } from '@/lib/fileParser';

export function Step1Upload() {
  const { document, uploadDocument, setCurrentStep } = useRAGStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 验证文件
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || '文件无效');
      return;
    }

    setLoading(true);

    try {
      // 解析文件
      const text = await parseTextFile(file);

      if (!text.trim()) {
        setError('文件内容为空');
        setLoading(false);
        return;
      }

      // 上传到 store
      uploadDocument(file.name, text);

      // 提示用户可以进入下一步
      setTimeout(() => {
        if (window.confirm('文档上传成功！是否前往下一步进行分块？')) {
          setCurrentStep(2);
        }
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件读取失败');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const stats = document ? getFileStats(document.rawText) : null;

  return (
    <div className="space-y-6">
      <Card title="📄 步骤 1：文档上传">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            上传 .txt 或 .md 文件，作为 RAG 系统的知识库。
          </p>

          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              type="button"
              className="rounded-lg font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '读取中...' : '选择文件'}
            </button>
            {document && (
              <span className="text-sm text-muted-foreground">
                已上传：{document.fileName}
              </span>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ❌ {error}
            </div>
          )}
        </div>
      </Card>

      {document && stats && (
        <Card title="📊 文档统计">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">字符数</p>
              <p className="text-2xl font-bold">{stats.characters.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">词数</p>
              <p className="text-2xl font-bold">{stats.words.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">行数</p>
              <p className="text-2xl font-bold">{stats.lines.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}

      {document && (
        <Card title="📝 原始文本预览">
          <div className="bg-muted p-4 rounded text-sm max-h-96 overflow-y-auto whitespace-pre-wrap font-mono">
            {document.rawText.slice(0, 2000)}
            {document.rawText.length > 2000 && '\n\n... (仅显示前 2000 字符)'}
          </div>
        </Card>
      )}

      {document && (
        <div className="flex justify-end">
          <Button onClick={() => setCurrentStep(2)}>
            下一步：文档分块 →
          </Button>
        </div>
      )}
    </div>
  );
}
