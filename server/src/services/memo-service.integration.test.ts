import { container } from "@/test-utils/inversify.config";
import { TYPES } from '@/types';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MemoService } from "./memo-service";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";

describe("MemoService integration test", () => {
  let memoService: MemoService;
  let db: LibSQLDatabase<typeof schema>;

  beforeAll(async () => {
    db = container.get<LibSQLDatabase<typeof schema>>(TYPES.LibSQLDatabase);
    await db.insert(schema.users).values({
      id: "user1",
      name: "Test User",
    });
    await db.insert(schema.users).values({
      id: "user2",
      name: "Another User",
    });
  });

  beforeEach(async () => {
    memoService = container.get<MemoService>(TYPES.MemoService);
    await db.delete(schema.memos);
  });

  afterAll(async () => {
    await db.delete(schema.memos);
  });

  it("should create a memo", async () => {
    const memo = await memoService.createMemo({
      userId: "user1",
      content: "test content",
    });
    expect(memo).toBeDefined();
    expect(memo.content).toBe("test content");
    expect(memo.userId).toBe("user1");
  });

  it("should get a memo by id and userId", async () => {
    const memo = await memoService.createMemo({
      userId: "user1",
      content: "test content",
    });
    const memo2 = await memoService.getMemoByIdAndUserId(memo.id, "user1");
    expect(memo2).toBeDefined();
    expect(memo2?.id).toBe(memo.id);
  });

  it("should not get a memo by id if userId does not match", async () => {
    const memo = await memoService.createMemo({
      userId: "user1",
      content: "test content",
    });
    const memo2 = await memoService.getMemoByIdAndUserId(memo.id, "user2");
    expect(memo2).toBeNull();
  });

  it("should get all memos", async () => {
    await memoService.createMemo({
      userId: "user1",
      content: "test content 1",
    });
    await memoService.createMemo({
      userId: "user1",
      content: "test content 2",
    });
    await memoService.createMemo({
      userId: "user2",
      content: "test content 2",
    });
    const memos = await memoService.getMemosByUserId("user1");
    expect(memos).toBeDefined();
    expect(memos).toBeDefined();
    expect(memos?.length).toBe(2);
  });

  it("should update a memo", async () => {
    const memo = await memoService.createMemo({
      userId: "user1",
      content: "test content",
    });
    const updatedMemo = await memoService.updateMemo(memo.id, {
      content: "updated content",
    }, "user1");
    expect(updatedMemo).toBeDefined();
    expect(updatedMemo?.content).toBe("updated content");
  });

  it("should not update a memo if userId does not match", async () => {
    const memo = await memoService.createMemo({
      userId: "user1",
      content: "test content",
    });
    const updatedMemo = await memoService.updateMemo(memo.id, {
      content: "updated content",
    }, "user2");
    expect(updatedMemo).toBeNull();
  });

  it("should delete a memo", async () => {
    const memo = await memoService.createMemo({
      userId: "user1",
      content: "test content",
    });
    const deleted = await memoService.deleteMemo(memo.id, "user1");
    expect(deleted).not.toBeNull();
    const memo2 = await memoService.getMemoByIdAndUserId(memo.id, "user1");
    expect(memo2).toBeNull();
  });

  it("should not delete a memo if userId does not match", async () => {
    const memo = await memoService.createMemo({
      userId: "user1",
      content: "test content",
    });
    const deleted = await memoService.deleteMemo(memo.id, "user2");
    expect(deleted).toBeNull();
    const memo2 = await memoService.getMemoByIdAndUserId(memo.id, "user1");
    expect(memo2).toBeDefined();
  });
});