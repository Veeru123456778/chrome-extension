import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: 'index.html',
        'service-worker': 'src/service-worker.ts',
        content: 'src/content.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') {
            return 'service-worker.js'
          }
          if (chunkInfo.name === 'content') {
            return 'content.js'
          }
          return 'assets/[name].[hash].js'
        }
      }
    }
  },
  define: {
    global: 'globalThis'
  }
})
