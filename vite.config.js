import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/three-optimized.js',
      output: {
        entryFileNames: 'assets/[name].js',
        format: 'es'
      }
    }
  },
  base: './'
})
