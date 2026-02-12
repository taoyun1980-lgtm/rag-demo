// API 调用封装 - 直接从浏览器调用 Qwen API（无需后端）

const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const EMBEDDING_MODEL = 'text-embedding-v3';
const CHAT_MODEL = 'qwen-plus';

// 预置 API Key（演示用）
const DEFAULT_KEY = 'sk-735f922fe7ff4294a3f23cf4901423f1';

function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('qwen_api_key') || DEFAULT_KEY;
}

export function setApiKey(key: string) {
  localStorage.setItem('qwen_api_key', key);
}

export function hasApiKey(): boolean {
  return true;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const apiKey = getApiKey();
  const embeddings: number[][] = [];

  // 批量处理，每次最多 10 个文本
  const batchSize = 10;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const response = await fetch(`${BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`向量化失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const batchEmbeddings = data.data.map((item: any) => item.embedding);
    embeddings.push(...batchEmbeddings);
  }

  return embeddings;
}

export interface GenerateStreamOptions {
  context: string;
  query: string;
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function generateStream(options: GenerateStreamOptions) {
  const { context, query, onToken, onDone, onError } = options;
  const apiKey = getApiKey();

  const prompt = `基于以下参考资料回答问题：

参考资料：
${context}

问题：${query}

请根据参考资料提供准确、简洁的回答。如果参考资料中没有相关信息，请说明"参考资料中没有找到相关信息"。`;

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: 'user', content: prompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 错误: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              onToken(content);
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error.message : '未知错误');
  }
}
