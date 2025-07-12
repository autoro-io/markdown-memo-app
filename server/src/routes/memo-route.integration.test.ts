import { Hono } from 'hono';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { container } from '@/test-utils/inversify.config'
import type { MemoService } from '@/services/memo-service';
import { TYPES } from '@/types';
import { users, memos } from '@/db/schema';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { testClient } from 'hono/testing';
import { MyJwtPayload } from '@/libs/jwt';

// Import order matters for the test client to work correctly
import { memoRoute } from './memo-route';

const db = container.get<LibSQLDatabase>(TYPES.LibSQLDatabase);
const mockApp = new Hono<{ Variables: MyJwtPayload }>()
  .use('*', (c, next) => {
    c.set('jwtPayload', { sub: 'user1' }); // Mock JWT payload
    return next();
  })
  .route('/memos', memoRoute);

const client = testClient(mockApp);

describe('Memo Route Tests', () => {

  beforeAll(async () => {
    await db.insert(users).values([
      { id: 'user1', name: 'Test User 1' },
      { id: 'user2', name: 'Test User 2' },
    ]);
    const memoService = container.get<MemoService>(TYPES.MemoService);
    // Assuming you have a method to initialize the memo service or database
    await memoService.createMemo({
      userId: 'user1',
      content: 'Initial memo for user1',
    });
    await memoService.createMemo({
      userId: 'user2',
      content: 'Initial memo for user2',
    });
    await memoService.createMemo({
      userId: 'user1',
      content: 'Another memo for user1',
    });
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await db.delete(users);
    await db.delete(memos);
    await db.insert(users).values([
      { id: 'user1', name: 'Test User 1' },
      { id: 'user2', name: 'Test User 2' },
    ]);
    const memoService = container.get<MemoService>(TYPES.MemoService);
    await memoService.createMemo({
      userId: 'user1',
      content: 'Initial memo for user1',
    });
    await memoService.createMemo({
      userId: 'user2',
      content: 'Initial memo for user2',
    });
    await memoService.createMemo({
      userId: 'user1',
      content: 'Another memo for user1',
    });
  });

  afterAll(async () => {
    // Clean up the database after all tests
    await db.delete(users);
    await db.delete(memos);
  });

  it('should return all memos for a user', async () => {
    const response = await client.memos.$get({},
      {
        headers: {
          Authorization: 'Bearer token-for-user1',
        },
      }
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        content: 'Another memo for user1',
        userId: 'user1',
      }),
      expect.objectContaining({
        content: 'Initial memo for user1',
        userId: 'user1',
      }),
    ]));
  });

  it('should return a specific memo for a user', async () => {
    const memoService = container.get<MemoService>(TYPES.MemoService);
    const newMemo = await memoService.createMemo({
      userId: 'user1',
      content: 'Memo to be fetched',
    });

    const response = await client.memos[':id'].$get({ param: { id: newMemo.id } },
      {
        headers: {
          Authorization: 'Bearer token-for-user1',
        },
      }
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({
      id: newMemo.id,
      content: 'Memo to be fetched',
      userId: 'user1',
    }));
  });

  it('should return 404 if memo not found for GET /:id', async () => {
    const response = await client.memos[':id'].$get({ param: { id: 'non-existent-id' } },
      {
        headers: {
          Authorization: 'Bearer token-for-user1',
        },
      }
    );
    expect(response.status).toBe(404);
  });

  it('should create a new memo', async () => {
    const response = await client.memos.$post({ json: { content: 'New memo content' } },
      {
        headers: {
          Authorization: 'Bearer token-for-user1',
        },
      }
    );
    expect(response.status).toBe(201);
    const createdMemo = await response.json();
    expect(createdMemo).toEqual(expect.objectContaining({
      content: 'New memo content',
      userId: 'user1',
    }));

    if ('error' in createdMemo) {
      throw new Error(`Failed to create memo: ${createdMemo.error}`);
    }

    // Verify it's in the database
    const memoService = container.get<MemoService>(TYPES.MemoService);
    const fetchedMemo = await memoService.getMemoByIdAndUserId(createdMemo.id, 'user1');
    expect(fetchedMemo).toEqual(expect.objectContaining({
      content: 'New memo content',
      userId: 'user1',
    }));
  });

  it('should update an existing memo', async () => {
    const memoService = container.get<MemoService>(TYPES.MemoService);
    const memoToUpdate = await memoService.createMemo({
      userId: 'user1',
      content: 'Original content',
    });

    const response = await client.memos[':id'].$patch({ param: { id: memoToUpdate.id }, json: { content: 'Updated content' } },
      {
        headers: {
          Authorization: 'Bearer token-for-user1',
        },
      }
    );
    expect(response.status).toBe(200);
    const updatedMemo = await response.json();
    expect(updatedMemo).toEqual(expect.objectContaining({
      id: memoToUpdate.id,
      content: 'Updated content',
      userId: 'user1',
    }));

    // Verify it's updated in the database
    const fetchedMemo = await memoService.getMemoByIdAndUserId(memoToUpdate.id, 'user1');
    expect(fetchedMemo?.content).toBe('Updated content');
  });

  it('should return 404 if memo not found for PATCH /:id', async () => {
    const response = await client.memos[':id'].$patch({ param: { id: 'non-existent-id' }, json: { content: 'Attempt to update' } },
      {
        headers: {
          Authorization: 'Bearer token-for-user1',
        },
      }
    );
    expect(response.status).toBe(404);
  });

  it('should delete a memo', async () => {
    const memoService = container.get<MemoService>(TYPES.MemoService);
    const memoToDelete = await memoService.createMemo({
      userId: 'user1',
      content: 'Memo to be deleted',
    });

    const response = await client.memos[':id'].$delete({ param: { id: memoToDelete.id } },
      {
        headers: {
          Authorization: 'Bearer token-for-user1',
        },
      }
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'deleted' });

    // Verify it's deleted from the database
    const fetchedMemo = await memoService.getMemoByIdAndUserId(memoToDelete.id, 'user1');
    expect(fetchedMemo).toBeNull();
  });

  it('should return 404 if memo not found for DELETE /:id', async () => {
    const response = await client.memos[':id'].$delete({ param: { id: 'non-existent-id' } },
      {
        headers: {
          Authorization: 'Bearer token-for-user1',
        },
      }
    );
    expect(response.status).toBe(404);
  });
});
