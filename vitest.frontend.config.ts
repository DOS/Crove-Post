import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Frontend unit test baseline (minimal batch 2026-09-21).
// Backend keeps its own jest suites (tests/bootstrap*.spec.ts, root jest.config.ts).
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/frontend/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/frontend/setup.ts'],
  },
  resolve: {
    alias: {
      '@gitroom/helpers': resolve(__dirname, 'libraries/helpers/src'),
      '@gitroom/react': resolve(
        __dirname,
        'libraries/react-shared-libraries/src'
      ),
      '@gitroom/nestjs-libraries': resolve(
        __dirname,
        'libraries/nestjs-libraries/src'
      ),
    },
  },
});
