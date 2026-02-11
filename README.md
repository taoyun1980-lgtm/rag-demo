# RAG 演示系统

一个教学型的 RAG（检索增强生成）演示系统，用于可视化展示 RAG 的完整工作流程。

## 🎯 项目目标

帮助学习者深入理解 RAG 技术的工作原理，通过可视化的方式展示从文档到答案的完整数据流。

## ✨ 核心特性

- **8 个完整步骤**：从文档上传到答案生成的全流程可视化
- **教学重点**：详细展示余弦相似度计算过程
- **实时交互**：每个步骤都有可操作的演示
- **数据持久化**：使用 localStorage 保存进度
- **流式输出**：真实感受 LLM 生成过程

## 🏗️ 技术栈

- **框架**：Next.js 16 + React 19 + TypeScript
- **样式**：Tailwind CSS 4（暖色系教育风格）
- **状态管理**：Zustand + localStorage
- **AI 服务**：
  - Embedding：Qwen text-embedding-v3
  - 生成：Qwen qwen-plus
  - 流式传输：SSE (Server-Sent Events)
- **向量存储**：浏览器内存（纯 TypeScript 实现）

## 📦 安装与运行

### 1. 克隆项目

```bash
cd /Users/yuntao/工作/My_AI_App/rag-demo
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
QWEN_API_KEY=your_api_key_here
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
QWEN_EMBEDDING_MODEL=text-embedding-v3
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 🎓 使用指南

### 完整流程演示

1. **步骤 1：文档上传**
   - 上传 `.txt` 或 `.md` 文件（最大 5MB）
   - 查看文档统计和原始文本预览
   - 推荐使用项目根目录的 `test-document.txt`

2. **步骤 2：文档分块**
   - 调整块大小（建议 300-800 字符）
   - 设置重叠字符数（建议 50-100）
   - 查看分块结果和统计信息

3. **步骤 3：向量化**
   - 批量处理文本块（每批 10 个）
   - 实时显示处理进度
   - 查看向量维度和数值预览

4. **步骤 4：向量存储**
   - 浏览向量库概览表格
   - 查看单个向量的完整数据
   - 理解向量存储方案

5. **步骤 5：查询输入**
   - 输入你的问题
   - 使用示例查询快速测试
   - 查看历史查询记录

6. **步骤 6：相似度检索（教学核心）**
   - **学习余弦相似度公式**
   - 查看所有文档块的相似度分布
   - 理解 Top-K 检索原理
   - 查看排名前 K 的文档块

7. **步骤 7：上下文构建**
   - 查看完整的 prompt 结构
   - 了解 Token 统计
   - 理解上下文窗口限制

8. **步骤 8：LLM 生成**
   - 实时流式答案生成
   - 查看引用来源
   - 统计生成速度

## 📚 学习要点

### 什么是 RAG？

RAG (Retrieval-Augmented Generation) 是一种结合检索和生成的技术，让 LLM 能够基于外部知识库回答问题。

### 核心概念

1. **文本分块（Chunking）**：将长文档切分为小块，便于检索和处理
2. **向量化（Embedding）**：将文本转换为高维向量，捕捉语义信息
3. **余弦相似度**：衡量两个向量方向的接近程度，值越接近 1 越相似
4. **Top-K 检索**：只保留相似度最高的 K 个结果
5. **上下文窗口**：LLM 能处理的最大 token 数量

### 为什么不用独立向量数据库？

本项目采用浏览器内存方案，原因：
- **教学目的**：直观、透明，易于理解算法
- **轻量级**：无需安装额外服务
- **可追溯**：可以直接查看向量数据
- **算法清晰**：余弦相似度用 TypeScript 实现，便于学习

## 🔧 项目结构

```
rag-demo/
├── app/                    # Next.js 应用
│   ├── api/               # API 路由
│   │   ├── embed/         # Embedding 接口
│   │   └── generate/      # SSE 流式生成接口
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
│
├── src/
│   ├── components/
│   │   ├── rag/          # 8 个步骤组件
│   │   └── ui/           # 通用 UI 组件
│   ├── store/
│   │   └── ragStore.ts   # Zustand 状态管理
│   ├── lib/
│   │   ├── chunking.ts      # 文本分块算法
│   │   ├── vectorUtils.ts   # 余弦相似度等
│   │   ├── fileParser.ts    # 文件解析
│   │   └── apiClient.ts     # API 调用封装
│   └── types/
│       └── rag.ts        # TypeScript 类型定义
│
├── test-document.txt      # 测试文档
└── README.md             # 本文件
```

## 🚀 后续扩展

项目可以向以下方向扩展：
1. **多文档支持**：构建多文档知识库
2. **高级检索**：混合检索（关键词 + 向量）
3. **评估模块**：检索质量评估
4. **本地 Embedding**：使用 @xenova/transformers
5. **对话历史**：支持多轮对话

## 🤝 贡献

欢迎提出改进建议和问题！

## 📄 许可证

MIT License

## 👨‍💻 作者

Jimmy - AI 学习者，希望通过这个项目深入理解 RAG 技术
