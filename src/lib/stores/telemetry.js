/**
 * telemetry.js — Svelte reactive stores for real-time device data
 *
 * Starts the Web Worker and pipes messages into stores.
 * Components subscribe to these stores; they never touch the Worker directly.
 */

import { writable, derived } from 'svelte/store'

// ─── Stores ───────────────────────────────────────────────────────────────────

/** Latest single telemetry snapshot */
export const snapshot = writable(null)

/** Rolling history of throughput for chart (last N points) */
const HISTORY_LEN = 60
export const throughputHistory = writable([])

/** Alarm event log (newest first) */
export const alarms = writable([])

/** Unacknowledged alarm count — derived, used in nav badge */
export const unackAlarmCount = derived(
  alarms,
  $alarms => $alarms.filter(a => !a.acknowledged).length
)

/** Worker connection state */
export const workerStatus = writable('connecting')  // 'connecting' | 'live' | 'error'

// ─── Worker bootstrap ─────────────────────────────────────────────────────────

let worker = null

export function startTelemetry() {
  if (worker) return  // idempotent

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

          // Append to rolling history
          throughputHistory.update(history => {
            const point = {
              t:    data.payload.timestamp,
              up:   data.payload.totalUp,
              down: data.payload.totalDown,
            }
            const next = [...history, point]
            return next.length > HISTORY_LEN ? next.slice(-HISTORY_LEN) : next
          })
          break

        case 'alarm':
          alarms.update(list => [data.payload, ...list].slice(0, 200))
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

/** Acknowledge an alarm by id */
export function acknowledgeAlarm(id) {
  alarms.update(list =>
    list.map(a => a.id === id ? { ...a, acknowledged: true } : a)
  )
}

/** Clear all acknowledged alarms */
export function clearAcknowledged() {
  alarms.update(list => list.filter(a => !a.acknowledged))
}

export function stopTelemetry() {
  worker?.terminate()
  worker = null
  workerStatus.set('connecting')
}
