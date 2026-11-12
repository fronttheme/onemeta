import {defineConfig} from 'vite';
import path from 'path';

export default defineConfig({
  // Base public path
  base: './',

  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,

    rolldownOptions: {
      input: {
        admin: path.resolve(import.meta.dirname, 'src/js/admin/main.js'),
        frontend: path.resolve(import.meta.dirname, 'src/js/frontend/main.js'),
      },

      output: {
        entryFileNames: 'js/[name].min.js',

        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop();

          if (ext === 'css') {
            return `css/${assetInfo.name}`;
          }

          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(assetInfo.name)) {
            return 'images/[name][extname]';
          }

          return 'files/[name][extname]';
        },

        chunkFileNames: 'js/chunks/[name]-[hash].js',
        globals: {jquery: 'jQuery'},
      },
      external: ['jquery'],
    },
    minify: 'terser',
    terserOptions: {compress: {drop_console: true}},
    sourcemap: false,
  },

  css: {
    preprocessorOptions: {
      scss: {}
    },
    devSourcemap: true
  },

  // Development server (for HMR during development)
  server: {
    port: 3000,
    open: false,
    cors: true,
  },

  // Resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@scss': path.resolve(import.meta.dirname, 'src/scss'),
      '@js': path.resolve(import.meta.dirname, 'src/js'),
      '@images': path.resolve(import.meta.dirname, 'src/images'),
    }
  }
});