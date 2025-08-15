import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      writeBundle() {
        // Copy manifest.json and icons to dist
        try {
          copyFileSync('public/manifest.json', 'dist/manifest.json')
          copyFileSync('public/icon16.png', 'dist/icon16.png')
          copyFileSync('public/icon48.png', 'dist/icon48.png')
          copyFileSync('public/icon128.png', 'dist/icon128.png')
          console.log('Extension files copied successfully')
        } catch (error) {
          console.error('Error copying extension files:', error)
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'service-worker': resolve(__dirname, 'src/service-worker.js'),
        content: resolve(__dirname, 'src/content.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') {
            return 'service-worker.js'
          }
          if (chunkInfo.name === 'content') {
            return 'content.js'
          }
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})