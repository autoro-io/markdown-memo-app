import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import { Hono, Next } from "hono";
import { cors } from "hono/cors";
import { serve } from '@hono/node-server';

import { logger } from 'hono/logger';
import { container } from './inversify.config';
import { TYPES } from './types';
import { verifyJwt } from "./libs/jwt";
import { MyJwtPayload } from "./libs/jwt";
import { createMemoRoute } from "./routes/memo-route";
import { MemoService } from "./services/memo-service";

export type HonoVariables = {
  jwtPayload: MyJwtPayload
}

export const app = new Hono<{ Variables: HonoVariables }>()
  .use(logger())
  .use(cors())
  .use(async (c, next: Next) => {
    // Skip authentication for the root path
    if (c.req.path === '/' && c.req.method === 'GET') {
      return next();
    }

    if (false) { // skip authentication for now      
      const authHeader = c.req.header('Authorization');
      if (!authHeader) {
        // If the Authorization header is missing, return 401
        return c.json({ error: 'Unauthorized: Missing token' }, 401);
      }

      // If the Authorization header is missing or does not start with 'Bearer ', return 401
      if (!authHeader || !authHeader!.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
      }

      const token = authHeader!.substring(7);
      const payload = verifyJwt(token);

      if (!payload) {
        return c.json({ error: 'Unauthorized: Invalid token' }, 401);
      }
    }

    c.set('jwtPayload', {
      sub: 'user1', // always user1      
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
      iat: Math.floor(Date.now() / 1000),
      role: 'user',
    } as MyJwtPayload);
    await next();
  })
  .get('/', (c) => {
    return c.json({
      message: 'Hello it\'s working!',
    });
  })
  .route('/memos', createMemoRoute(container.get<MemoService>(TYPES.MemoService)))

export type AppType = typeof app;
const port = parseInt(process.env.PORT ?? "", 10) || 5432;

const server = serve({
  fetch: app.fetch,
  port: port,
});

console.log(`Server is running on http://localhost:${port}`);
server.setTimeout(60 * 1000); // Set timeout to 60 seconds