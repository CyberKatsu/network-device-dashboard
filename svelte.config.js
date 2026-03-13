import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Legacy compatibility mode: allows Svelte 4 patterns (on: directives,
    // $: reactive declarations, writable stores) to work unchanged in Svelte 5.
    // This is the correct setting when migrating an existing codebase gradually.
    compatibility: {
      componentApi: 4
    }
  }
}
