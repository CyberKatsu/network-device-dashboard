/**
 * device.js — Device identity and configuration state
 *
 * Simulates what would be fetched from GET /api/device/config on a real OLT.
 * The save() action would be a PUT /api/device/config in production.
 */

import { writable, derived } from 'svelte/store'

// ─── Device identity (read-only in UI) ───────────────────────────────────────

export const deviceInfo = writable({
  model:        'NX-8800 OLT',
  serialNumber: 'NX8800-UK-002847',
  firmware:     'v4.2.1-r19843',
  uptime:       '14d 07h 22m',
  managementIp: '192.168.100.1',
  location:     'Worthing DC, Rack 3A, U12',
  vendor:       'Technetix',
  // Capabilities
  ponPorts:     8,
  maxOnus:      512,
  technology:   'XGS-PON / GPON',
})

// ─── Editable configuration ───────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  // Management
  hostname:           'olt-worthing-01',
  snmpCommunity:      'public',
  snmpTrapHost:       '10.0.0.50',
  syslogHost:         '10.0.0.51',

  // VLAN
  managementVlan:     100,
  defaultServiceVlan: 200,
  igmpVlan:          300,

  // Bandwidth profiles
  defaultUsProfile:  '100/50',   // up/down Mbps
  premiumUsProfile:  '1000/500',

  // IGMP
  igmpEnabled:        true,
  igmpVersion:        'IGMPv3',
  maxMulticastGroups: 256,

  // ONU auto-provision
  autoProvision:      true,
  zerotouch:          false,
}

/** Committed (saved) configuration */
export const savedConfig  = writable({ ...DEFAULT_CONFIG })

/** Working copy — edited in the form */
export const workingConfig = writable({ ...DEFAULT_CONFIG })

/** True when working copy differs from saved */
export const isDirty = derived(
  [savedConfig, workingConfig],
  ([$saved, $working]) => JSON.stringify($saved) !== JSON.stringify($working)
)

/** Simulate async save (PUT /api/device/config) */
export async function saveConfig() {
  // In production: await fetch('/api/device/config', { method: 'PUT', body: ... })
  return new Promise((resolve) => {
    setTimeout(() => {
      workingConfig.subscribe(cfg => {
        savedConfig.set({ ...cfg })
      })()
      resolve({ ok: true })
    }, 600)  // realistic network round-trip
  })
}

/** Discard working changes */
export function discardChanges() {
  savedConfig.subscribe(cfg => {
    workingConfig.set({ ...cfg })
  })()
}
