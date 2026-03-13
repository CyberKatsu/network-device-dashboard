/**
 * theme.js — Dark/light mode store
 *
 * Persists preference to localStorage. Toggles the `dark` class on <html>.
 * Defaults to dark (appropriate for a field-engineer network management tool).
 */

import { writable } from 'svelte/store'

const stored = typeof localStorage !== 'undefined'
  ? localStorage.getItem('olt-theme')
  : null

export const theme = writable(stored ?? 'dark')

theme.subscribe(t => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (t === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
  localStorage.setItem('olt-theme', t)
})

export function toggleTheme() {
  theme.update(t => t === 'dark' ? 'light' : 'dark')
}
