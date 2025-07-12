import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { MemoService } from '@/services/memo-service';
import { CreateMemoSchema, UpdateMemoSchema, SelectMemoSchema } from '@/db/types';
import { HonoVariables } from '@/index';
import { container } from '@/inversify.config';
import { TYPES } from '@/types';

const memoService = container.get<MemoService>(TYPES.MemoService);

export const ParamIdSchema = z.object({
  id: z.string(),
});

export const memoRoute = new Hono<{ Variables: HonoVariables }>()
  .get(
    '/',
    async (c) => {
      const userId = c.get('jwtPayload')?.sub;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const memos = await memoService.getMemosByUserId(userId);
      return c.json(memos);
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

