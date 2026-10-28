import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: { include: ['src/domain/**', 'src/services/**', 'src/lib/csv.ts'], reporter: ['text', 'html'] },
  },
});
