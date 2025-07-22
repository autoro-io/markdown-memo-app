import "reflect-metadata";
import { container } from "@/server/test-utils/inversify.config";
import { TYPES } from '@/server/types';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MemoRepository } from "./memo-repository.interface";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "@/server/db/schema";

describe("MemoRepository integration test", () => {
  let memoRepository: MemoRepository;
  let db: LibSQLDatabase<typeof schema>;

  beforeAll(async () => {
    db = container.get<LibSQLDatabase<typeof schema>>(TYPES.LibSQLDatabase);
  });

  beforeEach(async () => {
    memoRepository = container.get<MemoRepository>(TYPES.MemoRepository);
    await db.delete(schema.memos);
  });

  afterAll(async () => {
    await db.delete(schema.memos);
  });

  it("should create a memo", async () => {
    const newMemo = await memoRepository.createMemo({
      content: "This is a test memo.",
    });

    expect(newMemo).toBeDefined();
    expect(newMemo.id).toBeDefined();
    expect(newMemo.content).toBe("This is a test memo.");
    expect(newMemo.createdAt).toBeDefined();
    expect(newMemo.updatedAt).toBeDefined();

    const memoInDb = await db
      .select()
      .from(schema.memos)
      .where(eq(schema.memos.id, newMemo.id));
    expect(memoInDb).toHaveLength(1);
    expect(memoInDb[0].content).toBe("This is a test memo.");
  });

  it("should find all memos", async () => {
    await memoRepository.createMemo({ content: "Content 1" });
    await memoRepository.createMemo({ content: "Content 2" });

    const memos = await memoRepository.getAllMemos();
    expect(memos).toHaveLength(2);
  });

  it("should find a memo by id", async () => {
    const newMemo = await memoRepository.createMemo({
      content: "Content",
    });

    const foundMemo = await memoRepository.getMemoById(newMemo.id);
    expect(foundMemo).toBeDefined();
    expect(foundMemo?.id).toBe(newMemo.id);
    expect(foundMemo?.content).toBe("Content");
  });

  it("should return null when memo not found by id", async () => {
    const foundMemo = await memoRepository.getMemoById("non-existent-id");
    expect(foundMemo).toBeNull();
  });

  it("should update a memo", async () => {
    const newMemo = await memoRepository.createMemo({
      content: "Original Content",
    });

    const updatedMemo = await memoRepository.updateMemo(newMemo.id, {
      content: "Updated Content",
    });

    expect(updatedMemo).toBeDefined();
    expect(updatedMemo?.id).toBe(newMemo.id);
    expect(updatedMemo?.content).toBe("Updated Content");

    const memoInDb = await db
      .select()
      .from(schema.memos)
      .where(eq(schema.memos.id, newMemo.id));
    expect(memoInDb[0].content).toBe("Updated Content");
  });

  it("should throw when trying to update a non-existent memo", async () => {
     await expect(memoRepository.updateMemo("non-existent-id", {
        content: "Updated Content",
      })).rejects.toThrowError("Memo not found");
  });

  it("should delete a memo", async () => {
    const newMemo = await memoRepository.createMemo({
      content: "To Be Deleted",
    });

    await memoRepository.deleteMemo(newMemo.id);

    const memoInDb = await db
      .select()
      .from(schema.memos)
      .where(eq(schema.memos.id, newMemo.id));
    expect(memoInDb).toHaveLength(0);
  });
});
