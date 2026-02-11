import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Chunk,
  VectorChunk,
  RetrievedChunk,
  QueryHistory,
  DocumentInfo,
  ChunkParams,
  Step,
} from '@/types/rag';

interface RAGStore {
  // 当前步骤
  currentStep: Step;
  setCurrentStep: (step: Step) => void;

  // 文档与分块
  document: DocumentInfo | null;
  chunks: Chunk[];
  chunkParams: ChunkParams;
  uploadDocument: (fileName: string, rawText: string) => void;
  setChunks: (chunks: Chunk[]) => void;
  setChunkParams: (params: Partial<ChunkParams>) => void;

  // 向量数据
  vectorChunks: VectorChunk[];
  setVectorChunks: (vectorChunks: VectorChunk[]) => void;

  // 查询流程
  currentQuery: string;
  queryVector: number[] | null;
  retrievedChunks: RetrievedChunk[];
  generatedAnswer: string;
  setCurrentQuery: (query: string) => void;
  setQueryVector: (vector: number[]) => void;
  setRetrievedChunks: (chunks: RetrievedChunk[]) => void;
  setGeneratedAnswer: (answer: string) => void;

  // 历史与笔记
  queryHistory: QueryHistory[];
  addQueryHistory: (history: QueryHistory) => void;
  stepNotes: Record<Step, string>;
  updateStepNote: (step: Step, note: string) => void;

  // 重置
  reset: () => void;
}

const initialState = {
  currentStep: 1 as Step,
  document: null,
  chunks: [],
  chunkParams: {
    chunkSize: 500,
    overlap: 50,
  },
  vectorChunks: [],
  currentQuery: '',
  queryVector: null,
  retrievedChunks: [],
  generatedAnswer: '',
  queryHistory: [],
  stepNotes: {} as Record<Step, string>,
};

export const useRAGStore = create<RAGStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      uploadDocument: (fileName, rawText) =>
        set({
          document: {
            fileName,
            rawText,
            uploadTime: Date.now(),
          },
          // 重置后续步骤的数据
          chunks: [],
          vectorChunks: [],
          currentQuery: '',
          queryVector: null,
          retrievedChunks: [],
          generatedAnswer: '',
        }),

      setChunks: (chunks) => set({ chunks }),

      setChunkParams: (params) =>
        set((state) => ({
          chunkParams: { ...state.chunkParams, ...params },
        })),

      setVectorChunks: (vectorChunks) => set({ vectorChunks }),

      setCurrentQuery: (query) => set({ currentQuery: query }),

      setQueryVector: (vector) => set({ queryVector: vector }),

      setRetrievedChunks: (chunks) => set({ retrievedChunks: chunks }),

      setGeneratedAnswer: (answer) => set({ generatedAnswer: answer }),

      addQueryHistory: (history) =>
        set((state) => ({
          queryHistory: [history, ...state.queryHistory],
        })),

      updateStepNote: (step, note) =>
        set((state) => ({
          stepNotes: { ...state.stepNotes, [step]: note },
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'rag-store',
      partialize: (state) => ({
        // 只持久化必要的数据（向量数据太大，不持久化）
        document: state.document,
        chunks: state.chunks,
        chunkParams: state.chunkParams,
        // vectorChunks 不持久化，避免 localStorage 配额超限
        currentStep: state.currentStep,
        stepNotes: state.stepNotes,
        // 查询历史也不持久化，避免数据过大
      }),
    }
  )
);
