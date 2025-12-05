import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
import { resolve } from 'path'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load the appropriate .env file based on mode
  const envFiles: Record<string, string> = {
    development: '.env.local',
    preprod: '.env.preprod',
    production: '.env.production',
  }

  const envPath = resolve(process.cwd(), envFiles[mode] || '.env.local')
  dotenv.config({ path: envPath })

  return {
    plugins: [
      devtools(),
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        routesDirectory: 'src/renderer/routes',
        generatedRouteTree: 'src/renderer/routeTree.gen.ts',
      }),
      viteReact(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@renderer': fileURLToPath(new URL('./src/renderer', import.meta.url)),
        '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
        '@electron': fileURLToPath(new URL('./src/electron', import.meta.url)),
      },
    },
    base: './',
    publicDir: 'src/renderer/assets',
    build: {
      outDir: 'dist-react',
    },
    server: {
      port: 5123,
      strictPort: true,
    },
  }
})
