/**
 * device.ts — Device identity and configuration state
 */

import { writable, derived } from 'svelte/store'
import type { DeviceConfig, DeviceInfo } from '$lib/types'

// ─── Device identity (read-only in UI) ───────────────────────────────────────

export const deviceInfo = writable<DeviceInfo>({
  model:        'NX-8800 OLT',
  serialNumber: 'NX8800-UK-002847',
  firmware:     'v4.2.1-r19843',
  uptime:       '14d 07h 22m',
  managementIp: '192.168.100.1',
  location:     'Worthing DC, Rack 3A, U12',
  vendor:       'Technetix',
  ponPorts:     8,
  maxOnus:      512,
  technology:   'XGS-PON / GPON',
})

// ─── Editable configuration ───────────────────────────────────────────────────

const DEFAULT_CONFIG: DeviceConfig = {
  hostname:           'olt-worthing-01',
  snmpCommunity:      'public',
  snmpTrapHost:       '10.0.0.50',
  syslogHost:         '10.0.0.51',
  managementVlan:     100,
  defaultServiceVlan: 200,
  igmpVlan:           300,
  defaultUsProfile:   '100/50',
  premiumUsProfile:   '1000/500',
  igmpEnabled:        true,
  igmpVersion:        'IGMPv3',
  maxMulticastGroups: 256,
  autoProvision:      true,
  zerotouch:          false,
}

export const savedConfig   = writable<DeviceConfig>({ ...DEFAULT_CONFIG })
export const workingConfig = writable<DeviceConfig>({ ...DEFAULT_CONFIG })

export const isDirty = derived(
  [savedConfig, workingConfig],
  ([$saved, $working]) => JSON.stringify($saved) !== JSON.stringify($working)
)

/** Simulate async save — in production: PUT /api/device/config */
export async function saveConfig(): Promise<{ ok: boolean }> {
  return new Promise(resolve => {
    setTimeout(() => {
      workingConfig.subscribe(cfg => savedConfig.set({ ...cfg }))()
      resolve({ ok: true })
    }, 600)
  })
}

export function discardChanges(): void {
  savedConfig.subscribe(cfg => workingConfig.set({ ...cfg }))()
}
