/**
 * theme.ts — Dark/light mode store
 */

import { writable } from 'svelte/store'
import type { Theme } from '$lib/types'

const stored =
  typeof localStorage !== 'undefined'
    ? (localStorage.getItem('olt-theme') as Theme | null)
    : null

export const theme = writable<Theme>(stored ?? 'dark')

theme.subscribe((t: Theme) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark',  t === 'dark')
  root.classList.toggle('light', t === 'light')
  localStorage.setItem('olt-theme', t)
})

export function toggleTheme(): void {
  theme.update(t => (t === 'dark' ? 'light' : 'dark'))
}
