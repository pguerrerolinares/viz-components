import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VizComponents',
      formats: ['es', 'umd'],
      fileName: (format) => `viz-components.${format}.js`,
    },
    rollupOptions: {
      external: ['lit', 'highcharts'],
      output: {
        globals: {
          lit: 'Lit',
          highcharts: 'Highcharts',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
});
