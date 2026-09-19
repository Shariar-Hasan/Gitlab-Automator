import { defineConfig, build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readdirSync, readFileSync } from 'fs';

let isBuildingContent = false;

// Custom plugin to copy manifest, icons, and build standalone content script
function chromeExtensionPlugin() {
  return {
    name: 'chrome-extension-plugin',
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
    async closeBundle() {
      if (isBuildingContent) return;
      isBuildingContent = true;

      // Build content script as standalone IIFE to prevent "import statement outside a module" error in Chrome
      await build({
        configFile: false,
        plugins: [],
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          lib: {
            entry: resolve(__dirname, 'src/content/index.ts'),
            name: 'GitLabAutomatorContent',
            formats: ['iife'],
            fileName: () => 'content.js',
          },
        },
      });

      isBuildingContent = false;
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), chromeExtensionPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
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
