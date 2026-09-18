import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readdirSync, readFileSync } from 'fs';

// Custom plugin to copy manifest and icons
function copyManifestPlugin() {
  return {
    name: 'copy-manifest',
    generateBundle() {
      const manifest = readFileSync(resolve(__dirname, 'manifest.json'));
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: manifest,
      });

      // Copy all logos/icons from src/logo
      const logoDir = resolve(__dirname, 'src/logo');
      try {
        const files = readdirSync(logoDir);
        for (const file of files) {
          const content = readFileSync(resolve(logoDir, file));
          this.emitFile({
            type: 'asset',
            fileName: `logo/${file}`,
            source: content,
          });
        }
      } catch (e) {
        // Ignore if logo dir doesn't exist
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), copyManifestPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        content: resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
