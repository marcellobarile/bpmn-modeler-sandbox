import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.bpmn'],
  optimizeDeps: {
    include: [
      'bpmnlint-plugin-camunda-compat',
      '@camunda/linting',
      'bpmnlint'
    ]
  },
  define: {
    global: 'globalThis'
  }
})