import { useState, useEffect } from "react";
import { memos as stubMemos } from "@/lib/data";
import { Memo } from "@/type/type";

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchMemos = () => {
      setMemos(stubMemos);
      setLoading(false);
    };

    fetchMemos();
  }, []);

  return { memos, setMemos, loading };
};
