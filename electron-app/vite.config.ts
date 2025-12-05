import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { resolve } from 'path'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Map Vite mode to environment file
  const envFileMap: Record<string, string> = {
    development: '.env.local',
    preprod: '.env.preprod',
    production: '.env.production',
  }

  // Load env file based on mode
  const envFile = envFileMap[mode] || '.env.local'
  const envPath = resolve(process.cwd(), envFile)

  // Load and expand environment variables
  const result = dotenv.config({ path: envPath })
  if (result.parsed) {
    dotenvExpand.expand(result)
  }

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
    // Make environment variables available to the renderer
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        process.env.VITE_API_BASE_URL || 'http://localhost:8080'
      ),
      'import.meta.env.VITE_API_TIMEOUT': JSON.stringify(
        process.env.VITE_API_TIMEOUT || '10000'
      ),
    },
    // Specify which .env file to use based on mode
    envDir: process.cwd(),
    envPrefix: 'VITE_',
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
