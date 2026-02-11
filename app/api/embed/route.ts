import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { texts } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: '请提供有效的文本数组' },
        { status: 400 }
      );
    }

    const apiKey = process.env.QWEN_API_KEY;
    const baseUrl = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    const model = process.env.QWEN_EMBEDDING_MODEL || 'text-embedding-v3';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key 未配置' },
        { status: 500 }
      );
    }

    const embeddings: number[][] = [];

    // 批量处理，每次最多 10 个文本
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const response = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          input: batch,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Qwen API 错误:', errorText);
        return NextResponse.json(
          { error: `Qwen API 错误: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      // 提取每个文本的向量
      const batchEmbeddings = data.data.map((item: any) => item.embedding);
      embeddings.push(...batchEmbeddings);
    }

    return NextResponse.json({
      embeddings,
      model,
      dimension: embeddings[0]?.length || 0,
    });
  } catch (error) {
    console.error('Embedding 错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
