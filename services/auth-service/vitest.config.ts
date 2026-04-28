import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/utils/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts',
        'src/seed.ts',
        'src/lib/prisma.ts',
        'src/utils/vitest.setup.ts',
        'src/routes/**',
        'src/controllers/**',
      ],
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
});
