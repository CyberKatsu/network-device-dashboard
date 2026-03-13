import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath, URL } from 'node:url'

// Set base to your repo name when deploying to GitHub Pages
// e.g. if repo is github.com/yourname/olt-dashboard → base: '/olt-dashboard/'
const base = process.env.GITHUB_PAGES ? '/network-device-dashboard/' : '/'

export default defineConfig({
  plugins: [svelte()],
  base,
  resolve: {
    alias: {
      // $lib alias — mirrors SvelteKit convention for portability
      '$lib': fileURLToPath(new URL('./src/lib', import.meta.url))
    }
  },
  worker: {
    format: 'es'
  },
  build: {
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
