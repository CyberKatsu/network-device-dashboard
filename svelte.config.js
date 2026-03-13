import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Svelte 5 runes mode is opt-in per component
    // We're using Svelte 4 API (stores, reactive declarations)
    // which is fully supported in Svelte 5 compatibility mode
  }
}
