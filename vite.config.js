import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Set base to your repo name when deploying to GitHub Pages
// e.g. if repo is github.com/yourname/olt-dashboard → base: '/olt-dashboard/'
const base = process.env.GITHUB_PAGES ? '/olt-dashboard/' : '/'

export default defineConfig({
  plugins: [svelte()],
  base,
  worker: {
    format: 'es'
  },
  build: {
    // Report bundle size — keep this number in your README
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: undefined // Single bundle — intentional for embedded device context
      }
    }
  }
})
