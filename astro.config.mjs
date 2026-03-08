// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // View Transitions se activan directamente en el Layout vía CSS @view-transition
  vite: {
    plugins: [tailwindcss()],
    envPrefix: ['PUBLIC_', 'VITE_'],
    server: {
      host: true,
      port: 4321,
    },
  },
  integrations: [react()],
});
