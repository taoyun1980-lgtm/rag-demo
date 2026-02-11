// RAG 系统核心类型定义

export interface Chunk {
  id: string;
  text: string;
  chunkIndex: number;
}

export interface VectorChunk extends Chunk {
  vector: number[];
  metadata?: Record<string, any>;
}

export interface RetrievedChunk {
  chunk: VectorChunk;
  similarity: number;
}

export interface QueryHistory {
  id: string;
  query: string;
  timestamp: number;
  answer: string;
  retrievedChunks: RetrievedChunk[];
}

export interface DocumentInfo {
  fileName: string;
  rawText: string;
  uploadTime: number;
}

export interface ChunkParams {
  chunkSize: number;
  overlap: number;
}

// 8 个步骤的枚举
export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const STEP_NAMES: Record<Step, string> = {
  1: '文档上传',
  2: '文档分块',
  3: '向量化',
  4: '向量存储',
  5: '查询输入',
  6: '相似度检索',
  7: '上下文构建',
  8: 'LLM 生成',
};
