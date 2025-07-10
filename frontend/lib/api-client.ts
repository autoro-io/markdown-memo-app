import { hc } from 'hono/client'
import type { AppType } from '../../server/src/index'

export const appClient = hc<AppType>(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5432')
