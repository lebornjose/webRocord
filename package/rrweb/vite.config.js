import { terser } from 'rollup-plugin-terser';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'rrweb',
      fileName: (format) => `rrweb.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['rrweb'],
      output: {
        globals: {
          rrweb: 'rrweb'
        },
        plugins: [terser()]
      }
    },
    minify: 'terser',
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  plugins: [
    {
      name: 'typescript',
      transform(code, id) {
        if (!/\.[jt]s$/.test(id)) return;
        return code;
      }
    }
  ]
});
