// 文件解析工具

export async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // 检查文件类型
  const validTypes = ['.txt', '.md'];
  const fileName = file.name.toLowerCase();
  const isValidType = validTypes.some((type) => fileName.endsWith(type));

  if (!isValidType) {
    return {
      valid: false,
      error: '仅支持 .txt 和 .md 文件',
    };
  }

  // 检查文件大小（最大 5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '文件大小不能超过 5MB',
    };
  }

  return { valid: true };
}

export function getFileStats(text: string) {
  return {
    characters: text.length,
    words: text.split(/\s+/).filter(Boolean).length,
    lines: text.split('\n').length,
  };
}
