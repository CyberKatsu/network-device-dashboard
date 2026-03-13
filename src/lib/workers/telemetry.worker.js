/**
 * telemetry.worker.js
 *
 * Simulates the real-time data stream you'd receive from an OLT device
 * management agent over WebSocket (e.g., ws://device-ip/api/telemetry).
 *
 * In production this Worker would be replaced by a real WebSocket client:
 *   const ws = new WebSocket('ws://192.168.1.1/api/telemetry')
 *   ws.onmessage = (e) => self.postMessage(JSON.parse(e.data))
 *
 * Message types posted to main thread:
 *   { type: 'telemetry',  payload: TelemetrySnapshot }
 *   { type: 'alarm',      payload: AlarmEvent }
 */

// ─── Simulation state ─────────────────────────────────────────────────────────

const NUM_PORTS = 8

// Starting throughput per port (Mbps) — realistic PON loading
const portLoad = Array.from({ length: NUM_PORTS }, (_, i) => ({
  upMbps:   8  + Math.random() * 20,
  downMbps: 30 + Math.random() * 80,
}))

// Per-port Rx power baselines (dBm) — typical GPON range: -8 to -27 dBm
const rxPowerBase = Array.from({ length: NUM_PORTS }, () =>
  -(14 + Math.random() * 10)
)

// Alarm templates — realistic OLT/ONU fault conditions
const ALARM_TEMPLATES = [
  { severity: 'critical', message: 'LOS on PON port {port} — signal lost', code: 'LOS' },
  { severity: 'major',    message: 'ONU {onu} on port {port} ranging timeout', code: 'RANGE_TIMEOUT' },
  { severity: 'minor',    message: 'High BER on port {port}: 1.2e-4', code: 'HIGH_BER' },
  { severity: 'warning',  message: 'Rx power low on port {port}: {power} dBm', code: 'LOW_RX_PWR' },
  { severity: 'info',     message: 'ONU {onu} on port {port} registered', code: 'ONU_REG' },
  { severity: 'info',     message: 'ONU {onu} on port {port} deregistered', code: 'ONU_DEREG' },
]

let tickCount = 0
let alarmSeq  = 1

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp a random walk within bounds */
function walk(value, step, min, max) {
  const next = value + (Math.random() - 0.5) * step
  return Math.min(max, Math.max(min, next))
}

/** Format to fixed decimal — avoids floating point noise in UI */
function fmt(n, d = 2) { return parseFloat(n.toFixed(d)) }

/** Compute BER from Rx power — simplified model */
function berFromPower(dBm) {
  if (dBm > -20) return fmt(Math.random() * 1e-9, 12)
  if (dBm > -24) return fmt(1e-8 + Math.random() * 1e-7, 12)
  return fmt(1e-6 + Math.random() * 1e-5, 12)
}

/** Build a telemetry snapshot for all ports */
function buildSnapshot() {
  const ports = portLoad.map((load, i) => {
    // Random walk throughput
    load.upMbps   = walk(load.upMbps,   3, 1, 60)
    load.downMbps = walk(load.downMbps, 8, 5, 200)

    // Rx power drifts slowly
    rxPowerBase[i] = walk(rxPowerBase[i], 0.3, -28, -7)

    return {
      portId:    i + 1,
      upMbps:    fmt(load.upMbps),
      downMbps:  fmt(load.downMbps),
      rxPower:   fmt(rxPowerBase[i]),  // dBm
      ber:       berFromPower(rxPowerBase[i]),
      // Simulate occasional port going down (port 6 more flaky)
      status:    (i === 5 && Math.random() < 0.08) ? 'down' :
                 rxPowerBase[i] < -26              ? 'ranging' : 'up',
    }
  })

  // Aggregate totals
  const totalUp   = fmt(ports.reduce((s, p) => s + p.upMbps,   0))
  const totalDown = fmt(ports.reduce((s, p) => s + p.downMbps, 0))
  const activePorts = ports.filter(p => p.status === 'up').length

  return { timestamp: Date.now(), totalUp, totalDown, activePorts, ports }
}

/** Maybe emit a random alarm (low probability per tick) */
function maybeAlarm() {
  if (Math.random() > 0.04) return   // ~4% chance per tick → realistic drip

  const tmpl  = ALARM_TEMPLATES[Math.floor(Math.random() * ALARM_TEMPLATES.length)]
  const port  = Math.ceil(Math.random() * NUM_PORTS)
  const onu   = Math.floor(Math.random() * 32) + 1
  const power = fmt(rxPowerBase[port - 1])

  const message = tmpl.message
    .replace('{port}',  port)
    .replace('{onu}',   onu)
    .replace('{power}', power)

  self.postMessage({
    type: 'alarm',
    payload: {
      id:        alarmSeq++,
      timestamp: Date.now(),
      severity:  tmpl.severity,
      code:      tmpl.code,
      message,
      port,
      acknowledged: false,
    }
  })
}

// ─── Tick loop ────────────────────────────────────────────────────────────────

const TELEMETRY_INTERVAL_MS = 1000  // 1 Hz — matches typical SNMP polling rate

setInterval(() => {
  tickCount++

  // Telemetry snapshot every tick
  self.postMessage({ type: 'telemetry', payload: buildSnapshot() })

  // Alarms on odd ticks (avoids same-ms collision with telemetry)
  if (tickCount % 2 === 1) maybeAlarm()
}, TELEMETRY_INTERVAL_MS)
