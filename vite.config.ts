import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, readFileSync } from 'fs';

// Custom plugin to copy manifest and icons
function copyManifestPlugin() {
  return {
    name: 'copy-manifest',
    generateBundle() {
      const manifest = readFileSync(resolve(__dirname, 'manifest.json'));
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: manifest
      });
      // Try copying icon if it exists
      try {
        const icon = readFileSync(resolve(__dirname, 'icon.png'));
        this.emitFile({
          type: 'asset',
          fileName: 'icon.png',
          source: icon
        });
      } catch (e) {
        // Ignore if icon doesn't exist
      }
    }
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
