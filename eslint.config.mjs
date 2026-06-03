import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  // Desactivar formatters en el hook (prettier ya los maneja)
  formatters: false,
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'ts/no-explicit-any': 'error',
    'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
  },
  ignores: [
    'node_modules/**',
    '.nuxt/**',
    '.output/**',
    'dist/**',
    'coverage/**',
    'test-results/**',
  ],
})
