import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    printConsoleTrace: true,
    setupFiles: ['./src/test-utils/setup.ts'],
  },
});
