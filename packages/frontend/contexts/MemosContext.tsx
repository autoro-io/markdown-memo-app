"use client"

import { createContext, ReactNode, useState, useEffect } from "react";
import { Memo } from "@/frontend/type/type";
import { memoService } from "@/frontend/services/memo/memo-service-factory";

interface MemosContextType {
  memos: Memo[];
  setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
  loading: boolean;
  error: string | null;
  updateMemo: (id: string, updates: Partial<Memo>) => Promise<Memo>;
  createMemo: (memo: Omit<Memo, 'id'>) => Promise<Memo>;
  deleteMemo: (id: string) => Promise<void>;
}

export const MemosContext = createContext<MemosContextType | undefined>(undefined);

export const MemosProvider = ({ children }: { children: ReactNode }) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemos = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedMemos = await memoService.getMemos();
        setMemos(fetchedMemos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching memos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemos();
  }, []);

  const updateMemo = async (id: string, updates: Partial<Memo>) => {
    try {
      const updatedMemo = await memoService.updateMemo(id, updates);
      setMemos(prevMemos =>
        prevMemos.map(memo =>
          memo.id === id ? updatedMemo : memo
        )
      );
      return updatedMemo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating memo:', err);
      throw err;
    }
  };

  const createMemo = async (memo: Omit<Memo, 'id'>) => {
    try {
      const newMemo = await memoService.createMemo(memo);
      setMemos(prevMemos => [...prevMemos, newMemo]);
      return newMemo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating memo:', err);
      throw err;
    }
  };

  const deleteMemo = async (id: string) => {
    try {
      await memoService.deleteMemo(id);
      setMemos(prevMemos => prevMemos.filter(memo => memo.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting memo:', err);
      throw err;
    }
  };

  const value = {
    memos,
    setMemos,
    loading,
    error,
    updateMemo,
    createMemo,
    deleteMemo
  };

  return (
    <MemosContext.Provider value={value}>
      {children}
    </MemosContext.Provider>
  );
};
