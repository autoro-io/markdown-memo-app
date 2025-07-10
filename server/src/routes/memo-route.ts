import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { MemoService } from '@/services/memo-service';
import { CreateMemoSchema, UpdateMemoSchema } from '@/db/types';
import { HonoVariables } from '@/index';

export const ParamIdSchema = z.object({
  id: z.string(),
});

export const createMemoRoute = (memoService: MemoService) => {
  const app = new Hono<{ Variables: HonoVariables }>()
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
      const memo = await memoService.getMemoById(id);
      if (!memo) return c.json({ error: 'Memo not found' }, 404);
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
      // Ensure the memo belongs to the user
      if (input.userId && input.userId !== userId) {
        return c.json({ error: 'Unauthorized to update this memo' }, 403);
      }
      const updated = await memoService.updateMemo(id, input);
      return c.json(updated);
    }
  )

  .delete(
    '/:id',
    zValidator('param', ParamIdSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const userId = c.get('jwtPayload')?.sub;
      // Ensure the memo belongs to the user
      const memo = await memoService.getMemoById(id);
      if (!memo) return c.json({ error: 'Memo not found' }, 404);
      if (memo.userId !== userId) {
        return c.json({ error: 'Unauthorized to delete this memo' }, 403);
      }
      // Proceed to delete the memo
      await memoService.deleteMemo(id);
      return c.json({ status: 'deleted' });
    }
  )

  return app;
};

