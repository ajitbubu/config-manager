import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['server/**/*.test.js', 'sdk/**/*.test.js'],
    environment: 'node',
    setupFiles: ['./test/setup.js'],
  },
});
