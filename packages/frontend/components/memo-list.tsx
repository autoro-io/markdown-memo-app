"use client";

import { useMemos } from "@/frontend/hooks/use-memos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import Link from "next/link";

export function MemoList() {
  const { memos, loading } = useMemos();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memos
        .filter((memo) => memo.id)
        .map((memo) => (
          <Link href={`/memo/${memo.id!}`} key={memo.id}>
            <Card>
              <CardHeader>
                <CardTitle>{memo.title}</CardTitle>
                {memo.updatedAt && (
                  <CardDescription>
                    Last updated:{" "}
                    {new Date(memo.updatedAt).toLocaleDateString()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="truncate">{memo.content}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
    </div>
  );
}
