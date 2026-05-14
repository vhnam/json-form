import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (id.includes('@rjsf')) {
            return 'vendor-rjsf';
          }
          if (/[/\\]node_modules[/\\]ajv[/\\]/.test(id)) {
            return 'vendor-ajv';
          }
          if (id.includes('react-day-picker') || id.includes('/date-fns/')) {
            return 'vendor-datetime';
          }
          return undefined;
        },
      },
    },
  },
});

export default config;
