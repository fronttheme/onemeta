import {defineConfig} from 'vite';
import path from 'path';

export default defineConfig({
  // Base public path
  base: './',

  // Build configuration
  build: {
    outDir: 'assets',
    emptyOutDir: false, // Don't delete existing files

    rollupOptions: {
      input: {
        // Admin bundle
        'admin': path.resolve(__dirname, 'src/js/admin/main.js'),
        // Frontend bundle
        'frontend': path.resolve(__dirname, 'src/js/frontend/main.js'),
        // Admin styles
        'admin-styles': path.resolve(__dirname, 'src/scss/admin/admin.scss'),
        // Frontend styles
        'frontend-styles': path.resolve(__dirname, 'src/scss/frontend/frontend.scss'),
      },

      output: {
        // JS output naming
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name.includes('styles')) {
            return 'css/[name].js'; // Temporary, will be removed
          }
          return 'js/[name].min.js';
        },

        // CSS output naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];

          if (ext === 'css') {
            // Remove '-styles' suffix from CSS files
            const name = assetInfo.name.replace('-styles', '');
            return `css/${name}`;
          }

          // Images and other assets
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(assetInfo.name)) {
            return 'images/[name][extname]';
          }

          return 'assets/[name][extname]';
        },

        // Code splitting
        chunkFileNames: 'js/chunks/[name]-[hash].js',

        // External dependencies (jQuery is provided by WordPress)
        globals: {
          jquery: 'jQuery'
        }
      },

      // Externalize jQuery (WordPress provides it)
      external: ['jquery']
    },

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },

    // Source maps for debugging
    sourcemap: false, // Disable sourcemaps in build
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      }
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
      '@': path.resolve(__dirname, 'src'),
      '@scss': path.resolve(__dirname, 'src/scss'),
      '@js': path.resolve(__dirname, 'src/js'),
      '@images': path.resolve(__dirname, 'src/images'),
    }
  }
});