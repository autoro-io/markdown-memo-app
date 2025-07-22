import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { MemoService } from '@/server/services/memo-service';
import { CreateMemoSchema, UpdateMemoSchema, SelectMemoSchema } from '@/server/db/types';
import { HonoVariables } from '@/server/index';
import { container } from '@/server/inversify.config';
import { TYPES } from '@/server/types';
import { logger } from 'hono/logger';

const memoService = container.get<MemoService>(TYPES.MemoService);

export const ParamIdSchema = z.object({
  id: z.string(),
});

export const memoRoute = new Hono<{ Variables: HonoVariables }>()
  .get(
    '/',
    async (c) => {
      console.log('Fetching memos for user...');
      const userId = c.get('jwtPayload')?.sub;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      try {
        const memos = await memoService.getMemosByUserId(userId);
        console.log('Fetched memos:', memos);
        return c.json(memos);
      } catch (error: any) {
        console.error('Error fetching memos:', JSON.stringify(error, null, 2));
        return c.json({ error: `${userId}: Failed to fetch memos: ${error}` }, 500);
      }
    }
  )
  .get(
    '/:id',
    zValidator('param', ParamIdSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const userId = c.get('jwtPayload')?.sub;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const memo = await memoService.getMemoByIdAndUserId(id, userId);
      if (!memo) return c.json({ error: 'Memo not found or unauthorized' }, 404);
      return c.json(memo);
    }
  )
  .post(
    '/',
    // User id is extracted from JWT payload
    zValidator('json', CreateMemoSchema.omit({ userId: true })),
    async (c) => {
      const { content } = c.req.valid('json');
      const userId = c.get('jwtPayload')?.sub;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const memo = await memoService.createMemo({ content, userId });
      return c.json(memo, 201);
    }
  )
  .patch(
    '/:id',
    zValidator('param', ParamIdSchema),
    zValidator('json', UpdateMemoSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');
      const userId = c.get('jwtPayload')?.sub;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const updated = await memoService.updateMemo(id, input, userId);
      if (!updated) {
        return c.json({ error: 'Memo not found or unauthorized to update' }, 404);
      }
      return c.json(updated);
    }
  )
  .delete(
    '/:id',
    zValidator('param', ParamIdSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const userId = c.get('jwtPayload')?.sub;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const deleted = await memoService.deleteMemo(id, userId);
      if (!deleted) {
        return c.json({ error: 'Memo not found or unauthorized to delete' }, 404);
      }
      return c.json({ status: 'deleted' });
    }
);

