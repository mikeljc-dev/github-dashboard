import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['app/composables/**', 'app/utils/**'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
      },
    },
  },
})
