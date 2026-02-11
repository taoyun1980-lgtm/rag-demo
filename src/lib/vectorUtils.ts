// 向量计算工具 - RAG 系统的核心算法

import type { VectorChunk, RetrievedChunk } from '@/types/rag';

/**
 * 计算两个向量的余弦相似度
 * 公式：similarity = dot(v1, v2) / (norm(v1) * norm(v2))
 * 结果范围：[-1, 1]，1 表示完全相同，0 表示正交，-1 表示完全相反
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    throw new Error('向量维度不匹配');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    norm1 += v1[i] * v1[i];
    norm2 += v2[i] * v2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);

  // 避免除以零
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * 查找相似度最高的 Top-K 个文档块
 * @param queryVector 查询向量
 * @param vectorChunks 向量库中的所有文档块
 * @param k 返回的结果数量
 * @returns 按相似度从高到低排序的结果
 */
export function findTopK(
  queryVector: number[],
  vectorChunks: VectorChunk[],
  k: number
): RetrievedChunk[] {
  // 计算每个文档块与查询的相似度
  const results: RetrievedChunk[] = vectorChunks.map((chunk) => ({
    chunk,
    similarity: cosineSimilarity(queryVector, chunk.vector),
  }));

  // 按相似度从高到低排序，并取前 k 个
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}

/**
 * 获取所有块的相似度分数（用于可视化）
 */
export function getAllSimilarities(
  queryVector: number[],
  vectorChunks: VectorChunk[]
): Array<{ id: string; similarity: number }> {
  return vectorChunks.map((chunk) => ({
    id: chunk.id,
    similarity: cosineSimilarity(queryVector, chunk.vector),
  }));
}

/**
 * 计算向量的模（长度）
 */
export function vectorNorm(v: number[]): number {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
}

/**
 * 计算两个向量的点积
 */
export function dotProduct(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    throw new Error('向量维度不匹配');
  }
  return v1.reduce((sum, val, i) => sum + val * v2[i], 0);
}

/**
 * 格式化相似度分数（百分比）
 */
export function formatSimilarity(similarity: number): string {
  return `${(similarity * 100).toFixed(2)}%`;
}
