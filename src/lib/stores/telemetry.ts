/**
 * telemetry.ts — Svelte reactive stores for real-time device data
 */

import { writable, derived, type Writable } from 'svelte/store'
import type {
  TelemetrySnapshot,
  ThroughputPoint,
  AlarmEvent,
  WorkerMessage,
  WorkerStatus,
} from '$lib/types'

// ─── Stores ───────────────────────────────────────────────────────────────────

export const snapshot = writable<TelemetrySnapshot | null>(null)

const HISTORY_LEN = 60
export const throughputHistory = writable<ThroughputPoint[]>([])

export const alarms = writable<AlarmEvent[]>([])

export const unackAlarmCount = derived(
  alarms,
  $alarms => $alarms.filter(a => !a.acknowledged).length
)

/** Fires true for 2 s when a critical/major alarm arrives — drives badge animation */
export const newCriticalAlarm: Writable<boolean> = writable(false)
let criticalPulseTimer: ReturnType<typeof setTimeout> | null = null

export const workerStatus = writable<WorkerStatus>('connecting')

// ─── Worker bootstrap ─────────────────────────────────────────────────────────

let worker: Worker | null = null

export function startTelemetry(): void {
  if (worker) return

  try {
    worker = new Worker(
      new URL('../workers/telemetry.worker.js', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
      switch (data.type) {
        case 'telemetry':
          snapshot.set(data.payload)
          workerStatus.set('live')
          throughputHistory.update(history => {
            const point: ThroughputPoint = {
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
          if (data.payload.severity === 'critical' || data.payload.severity === 'major') {
            newCriticalAlarm.set(true)
            if (criticalPulseTimer) clearTimeout(criticalPulseTimer)
            criticalPulseTimer = setTimeout(() => newCriticalAlarm.set(false), 2000)
          }
          break
      }
    }

    worker.onerror = (err: ErrorEvent) => {
      console.error('Telemetry worker error:', err)
      workerStatus.set('error')
    }
  } catch (err) {
    console.error('Failed to start telemetry worker:', err)
    workerStatus.set('error')
  }
}

export function acknowledgeAlarm(id: number): void {
  alarms.update(list =>
    list.map(a => a.id === id ? { ...a, acknowledged: true } : a)
  )
}

export function clearAcknowledged(): void {
  alarms.update(list => list.filter(a => !a.acknowledged))
}

export function stopTelemetry(): void {
  worker?.terminate()
  worker = null
  workerStatus.set('connecting')
  if (criticalPulseTimer) clearTimeout(criticalPulseTimer)
}
