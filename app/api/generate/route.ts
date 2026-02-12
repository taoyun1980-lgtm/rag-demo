import { NextRequest } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { context, query } = await req.json();

    if (!context || !query) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400 }
      );
    }

    const apiKey = process.env.QWEN_API_KEY;
    const baseUrl = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    const model = process.env.QWEN_MODEL || 'qwen-plus';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API Key 未配置' }),
        { status: 500 }
      );
    }

    // 构建 prompt
    const prompt = `基于以下参考资料回答问题：

参考资料：
${context}

问题：${query}

请根据参考资料提供准确、简洁的回答。如果参考资料中没有相关信息，请说明"参考资料中没有找到相关信息"。`;

    // 创建流式响应
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // 发送 SSE 事件
    async function sendEvent(type: string, data: any) {
      const message = `data: ${JSON.stringify({ type, ...data })}\n\n`;
      await writer.write(encoder.encode(message));
    }

    // 异步处理
    (async () => {
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            stream: true,
          }),
        });

        if (!response.ok) {
          await sendEvent('error', { message: `API 错误: ${response.status}` });
          await writer.close();
          return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          await sendEvent('error', { message: '无法读取响应' });
          await writer.close();
          return;
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
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  await sendEvent('token', { text: content });
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }

        await sendEvent('done', {});
      } catch (error) {
        console.error('生成错误:', error);
        await sendEvent('error', {
          message: error instanceof Error ? error.message : '生成失败',
        });
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API 错误:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : '未知错误' }),
      { status: 500 }
    );
  }
}
