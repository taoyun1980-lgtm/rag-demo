// API 调用封装

// GitHub Pages 静态部署时，API 请求走 Cloudflare 隧道后端
// 本地开发时走同源 Next.js API routes
const TUNNEL_URL = 'https://partition-counters-speeds-suggests.trycloudflare.com';

function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal ? '' : TUNNEL_URL;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await fetch(`${getApiBase()}/api/embed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texts }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '向量化失败');
  }

  const data = await response.json();
  return data.embeddings;
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

  try {
    const response = await fetch(`${getApiBase()}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context, query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'token' && parsed.text) {
              onToken(parsed.text);
            } else if (parsed.type === 'error') {
              onError(parsed.message || '生成错误');
              return;
            } else if (parsed.type === 'done') {
              onDone();
              return;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : '未知错误');
  }
}
