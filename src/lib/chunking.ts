// 文本分块算法

import type { Chunk, ChunkParams } from '@/types/rag';

export function chunkText(text: string, params: ChunkParams): Chunk[] {
  const { chunkSize, overlap } = params;
  const chunks: Chunk[] = [];

  // 移除多余的空白字符
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    // 计算当前块的结束位置
    const end = Math.min(start + chunkSize, cleanedText.length);

    // 提取文本块
    let chunkText = cleanedText.slice(start, end);

    // 如果不是最后一块，尝试在合适的位置断开（句号、换行等）
    if (end < cleanedText.length) {
      const breakPoints = ['. ', '。', '\n', '! ', '！', '? ', '？'];
      let bestBreak = -1;

      // 从后往前查找最佳断点
      for (let i = chunkText.length - 1; i >= Math.max(0, chunkText.length - 50); i--) {
        if (breakPoints.some(bp => chunkText.slice(i, i + bp.length) === bp)) {
          bestBreak = i + 1;
          break;
        }
      }

      if (bestBreak > 0) {
        chunkText = chunkText.slice(0, bestBreak).trim();
      }
    }

    chunks.push({
      id: `chunk-${chunkIndex}`,
      text: chunkText.trim(),
      chunkIndex,
    });

    // 计算下一块的起始位置（考虑重叠）
    start += chunkText.length - overlap;

    // 确保 start 至少前进一定距离，避免无限循环
    if (start <= chunks[chunkIndex].text.length + chunks.map(c => c.text.length).slice(0, -1).reduce((a, b) => a + b, 0) - overlap * chunkIndex) {
      start = chunks.map(c => c.text.length).reduce((a, b) => a + b, 0) - overlap * chunkIndex;
    }

    chunkIndex++;

    // 安全限制：最多 1000 个块
    if (chunkIndex >= 1000) {
      break;
    }
  }

  return chunks;
}

export function getChunkStats(chunks: Chunk[]) {
  const sizes = chunks.map(c => c.text.length);

  return {
    count: chunks.length,
    avgSize: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
    minSize: Math.min(...sizes),
    maxSize: Math.max(...sizes),
  };
}

export function highlightOverlap(prevChunk: string, currentChunk: string, overlap: number): {
  prevOverlap: string;
  currentOverlap: string;
} {
  // 简化版：取后 overlap 字符
  const prevOverlap = prevChunk.slice(-Math.min(overlap, prevChunk.length));
  const currentOverlap = currentChunk.slice(0, Math.min(overlap, currentChunk.length));

  return { prevOverlap, currentOverlap };
}
