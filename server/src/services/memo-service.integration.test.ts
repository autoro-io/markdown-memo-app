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
      content: "test content",
    });
    expect(memo).toBeDefined();
    expect(memo.content).toBe("test content");
  });

  it("should get a memo by id", async () => {
    const memo = await memoService.createMemo({
      content: "test content",
    });
    const memo2 = await memoService.getMemoById(memo.id);
    expect(memo2).toBeDefined();
    expect(memo2?.id).toBe(memo.id);
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
      content: "test content",
    });
    const updatedMemo = await memoService.updateMemo(memo.id, {
      content: "updated content",
    });
    expect(updatedMemo).toBeDefined();
    expect(updatedMemo.content).toBe("updated content");
  });

  it("should delete a memo", async () => {
    const memo = await memoService.createMemo({
      content: "test content",
    });
    await memoService.deleteMemo(memo.id);
    const memo2 = await memoService.getMemoById(memo.id);
    expect(memo2).toBeNull();
  });
});