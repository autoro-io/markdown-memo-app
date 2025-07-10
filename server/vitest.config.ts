import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    printConsoleTrace: true,
    setupFiles: ['./src/test-utils/setup.ts'],
  },
});