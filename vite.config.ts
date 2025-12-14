import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Base path for GitHub Pages project site
  // Change to '/' if using a custom domain or organization site
  base: '/frcseasonplanbuilder.github.io/',
})
