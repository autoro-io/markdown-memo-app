import { useContext } from "react";
import { MemosContext } from "@/contexts/MemosContext";

export const useMemos = () => {
  const context = useContext(MemosContext);
  if (context === undefined) {
    throw new Error('useMemos must be used within a MemosProvider');
  }
  return context;
};

