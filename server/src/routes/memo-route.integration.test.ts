import { Hono } from 'hono';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { container } from '@/test-utils/inversify.config'
import type { MemoService } from '@/services/memo-service';
import { TYPES } from '@/types';
import { users, memos } from '@/db/schema';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { testClient } from 'hono/testing';
import { MyJwtPayload } from '@/libs/jwt';
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

  afterAll(async () => {
    // Clean up the database after tests
    await db.delete(users);
    await db.delete(memos);
  });

  it('should return all memos for a user', async () => {
    const response = await client.memos.$get({},
      {
        headers: {
          // Currently auth is skipped, so we can use any token
          // TODO: Implement proper auth in tests
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
});
