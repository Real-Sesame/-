import { defineConfig } from 'vite';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

// GitHub Pages 주소: https://real-sesame.github.io/-/
export default defineConfig({
  base: '/-/',
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500
  },
  plugins: [{
    // 없는 주소(/-/characters 등)로 들어와도 앱이 열리도록 index.html을 404.html로도 복사
    name: 'spa-404',
    closeBundle() { copyFileSync(resolve('dist/index.html'), resolve('dist/404.html')); }
  }]
});
