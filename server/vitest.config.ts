import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    printConsoleTrace: true,
    setupFiles: ['./src/test-utils/setup.ts'],
    deps: {
      optimizer: {
        ssr: {
          include: ['@hono/node-server', '@hono/node-server/test'],
        },
      },
    },
  },
});
