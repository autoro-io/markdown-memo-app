import { hc } from 'hono/client'
import type { AppType } from '@/../server/src/index'

// frontendとserverのHono version mismatchがあるとエラーが出るので注意
// https://hono.dev/docs/guides/rpc#hono-version-mismatch
export const client = hc<AppType>(process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5432')
