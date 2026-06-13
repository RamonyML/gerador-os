/// <reference types="vitest/config" />
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const dir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(dir, '..')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, dir, '')
  const projectId =
    env.VITE_FIREBASE_PROJECT_ID ?? 'gerador-de-os-3ba02'
  const region =
    env.VITE_FIREBASE_FUNCTIONS_REGION ?? 'southamerica-east1'
  const functionsOrigin = `https://${region}-${projectId}.cloudfunctions.net`

  return {
    plugins: [react()],
    server: {
      // Permite que os testes de paridade importem os HTML legados (fora de /web) via `?raw`.
      fs: { allow: [dir, repoRoot] },
      proxy: {
        // Chamadas callable via mesma origem em dev (evita “CORS” quando o Cloud Run retorna 403 sem headers).
        '/__fbfunctions': {
          target: functionsOrigin,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/__fbfunctions/, ''),
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'e2e'],
      coverage: {
        provider: 'v8',
        reportsDirectory: './coverage',
        exclude: ['e2e/**', '**/*.config.*', 'src/test/**'],
      },
    },
  }
})
