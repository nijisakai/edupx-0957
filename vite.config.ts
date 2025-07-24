// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 输出目录，默认为 'dist'
    outDir: 'dist',
    // 如果静态资源（如图片、locales）不在 public 目录下，需要配置
    assetsDir: 'assets',
  }
})
