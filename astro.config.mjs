// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true, // Escucha en 0.0.0.0 para acceso desde la red local
      port: 4321,
    },
  },

  integrations: [react()]
});