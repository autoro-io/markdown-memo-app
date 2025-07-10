import "reflect-metadata";

import { handle } from 'hono/vercel'
import { app } from '../../../../server/src/index';

// change the base path to /api
app.basePath('/api');

// Use type assertion to avoid version mismatch issues
export const GET = handle(app as any)
export const POST = handle(app as any)
export const PATCH = handle(app as any)
export const DELETE = handle(app as any)

export type AppType = typeof app;
