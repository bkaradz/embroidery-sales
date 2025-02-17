import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite";
import { bundleStats } from 'rollup-plugin-bundle-stats';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    sveltekit(),
    tailwindcss(),
    bundleStats({
      baselineFilepath: join(currentDir, "node_modules", ".cache", "bundle-stats", "baseline.json"),
      silent: true,
    }),
  ],
  test: {
    workspace: [
      {
        extends: './vite.config.ts',
        plugins: [svelteTesting()],

        test: {
          name: 'client',
          environment: 'jsdom',
          clearMocks: true,
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**'],
          setupFiles: ['./vitest-setup-client.ts']
        },
      },
      {
        extends: './vite.config.ts',

        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
        }
      },

    ]
  },
  server: {
    host: true
  },
  optimizeDeps: {
    exclude: ["@node-rs/argon2", "@node-rs/bcrypt"]
  }
});
