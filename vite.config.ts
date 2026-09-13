import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project at https://ahnaf181419.github.io/luna-web/
  base: '/luna-web/',
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
});
