/**
 * telemetry.js — Svelte reactive stores for real-time device data
 */

import { writable, derived } from 'svelte/store'

// ─── Stores ───────────────────────────────────────────────────────────────────

export const snapshot         = writable(null)
export const throughputHistory = writable([])
export const alarms           = writable([])

export const unackAlarmCount = derived(
  alarms,
  $alarms => $alarms.filter(a => !a.acknowledged).length
)

/**
 * Fires true for 2 s whenever a critical/major alarm arrives.
 * Used to drive the badge pulse animation in the sidebar.
 */
export const newCriticalAlarm = writable(false)
let criticalPulseTimer = null

export const workerStatus = writable('connecting')

const HISTORY_LEN = 60
let worker = null

// ─── Worker bootstrap ─────────────────────────────────────────────────────────

export function startTelemetry() {
  if (worker) return

  try {
    worker = new Worker(
      new URL('../workers/telemetry.worker.js', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = ({ data }) => {
      switch (data.type) {
        case 'telemetry':
          snapshot.set(data.payload)
          workerStatus.set('live')
          throughputHistory.update(history => {
            const point = { t: data.payload.timestamp, up: data.payload.totalUp, down: data.payload.totalDown }
            const next = [...history, point]
            return next.length > HISTORY_LEN ? next.slice(-HISTORY_LEN) : next
          })
          break

        case 'alarm':
          alarms.update(list => [data.payload, ...list].slice(0, 200))
          // Trigger badge pulse for critical/major alarms
          if (data.payload.severity === 'critical' || data.payload.severity === 'major') {
            newCriticalAlarm.set(true)
            clearTimeout(criticalPulseTimer)
            criticalPulseTimer = setTimeout(() => newCriticalAlarm.set(false), 2000)
          }
          break
      }
    }

    worker.onerror = (err) => {
      console.error('Telemetry worker error:', err)
      workerStatus.set('error')
    }
  } catch (err) {
    console.error('Failed to start telemetry worker:', err)
    workerStatus.set('error')
  }
}

export function acknowledgeAlarm(id) {
  alarms.update(list => list.map(a => a.id === id ? { ...a, acknowledged: true } : a))
}

export function clearAcknowledged() {
  alarms.update(list => list.filter(a => !a.acknowledged))
}

export function stopTelemetry() {
  worker?.terminate()
  worker = null
  workerStatus.set('connecting')
  clearTimeout(criticalPulseTimer)
}
