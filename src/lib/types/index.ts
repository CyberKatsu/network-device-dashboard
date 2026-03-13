/**
 * types/index.ts — Domain model for the OLT management dashboard
 *
 * These interfaces mirror what a real device management API would return
 * (RESTCONF/NETCONF JSON, or WebSocket telemetry stream).
 *
 * Keeping all types in one file makes the domain model readable at a glance —
 * a deliberate choice for a portfolio project where code legibility matters.
 */

// ─── Telemetry (live data from device agent / WebSocket) ─────────────────────

/** Status of a single PON port, updated at 1 Hz */
export interface PortTelemetry {
  portId:   number
  upMbps:   number        // Upstream throughput, Mbps
  downMbps: number        // Downstream throughput, Mbps
  rxPower:  number        // Optical Rx power at OLT, dBm
  ber:      number        // Bit Error Rate (e.g. 1.2e-9)
  status:   PortStatus
}

/** Aggregate snapshot for all ports, posted by the telemetry worker each tick */
export interface TelemetrySnapshot {
  timestamp:   number         // Unix ms
  totalUp:     number         // Sum of upstream Mbps across all ports
  totalDown:   number         // Sum of downstream Mbps across all ports
  activePorts: number         // Ports with status === 'up'
  ports:       PortTelemetry[]
}

/** A single point in the rolling throughput history used by the chart */
export interface ThroughputPoint {
  t:    number   // Unix ms
  up:   number   // Mbps
  down: number   // Mbps
}

export type PortStatus = 'up' | 'down' | 'ranging'

// ─── Alarms ──────────────────────────────────────────────────────────────────

export type AlarmSeverity = 'critical' | 'major' | 'minor' | 'warning' | 'info'

/**
 * Alarm event — maps to standard SNMP trap / OMCI alarm types.
 * Codes are a subset of ITU-T G.984 OMCI alarm IDs.
 */
export interface AlarmEvent {
  id:           number
  timestamp:    number         // Unix ms
  severity:     AlarmSeverity
  code:         AlarmCode
  message:      string
  port:         number         // PON port number, 1-based
  acknowledged: boolean
}

export type AlarmCode =
  | 'LOS'             // Loss of Signal
  | 'RANGE_TIMEOUT'   // ONU failed to complete ranging
  | 'HIGH_BER'        // Bit error rate above threshold
  | 'LOW_RX_PWR'      // Rx power below threshold
  | 'ONU_REG'         // ONU registered
  | 'ONU_DEREG'       // ONU deregistered

// ─── ONUs ────────────────────────────────────────────────────────────────────

export type OnuStatus = 'up' | 'down' | 'ranging'

/**
 * ONU (Optical Network Unit) — subscriber-side device on a PON port.
 * Serial format: ITU-T G.984 — 4-char vendor ID + 8 hex digits.
 * e.g. COMS0000001A
 */
export interface Onu {
  id:           number
  serial:       string       // ITU-T G.984 format
  vendor:       string       // Resolved vendor name
  status:       OnuStatus
  rxPower:      number       // Rx power at OLT, dBm
  txPower:      number       // ONU transmit power, dBm
  distance:     number | null  // Calculated ranging distance, metres; null while ranging
  firmware:     string
  profile:      string       // Bandwidth profile, e.g. "100/50"
  registeredAt: string       // ISO 8601
}

/** A PON port with its associated ONUs */
export interface PonPort {
  id:    number
  label: string              // e.g. "PON-1/0/1"
  onus:  Onu[]
}

/** PonPort enriched with live telemetry data from the worker */
export interface LivePonPort extends PonPort {
  liveRx:     number | undefined
  liveStatus: PortStatus | undefined
}

// ─── Device configuration ────────────────────────────────────────────────────

/**
 * The editable configuration state — maps to a PUT /api/device/config payload.
 * Field names follow TR-385 (ITU-T PON management) naming conventions where
 * applicable, simplified for readability.
 */
export interface DeviceConfig {
  // Management
  hostname:           string
  snmpCommunity:      string
  snmpTrapHost:       string
  syslogHost:         string
  // VLAN
  managementVlan:     number | string   // string during form editing
  defaultServiceVlan: number | string
  igmpVlan:           number | string
  // Bandwidth profiles
  defaultUsProfile:   string
  premiumUsProfile:   string
  // IGMP
  igmpEnabled:        boolean
  igmpVersion:        'IGMPv2' | 'IGMPv3'
  maxMulticastGroups: number | string
  // ONU provisioning
  autoProvision:      boolean
  zerotouch:          boolean
}

/** Static device identity — read-only in the UI */
export interface DeviceInfo {
  model:        string
  serialNumber: string
  firmware:     string
  uptime:       string
  managementIp: string
  location:     string
  vendor:       string
  ponPorts:     number
  maxOnus:      number
  technology:   string
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light'

// ─── Worker connection ───────────────────────────────────────────────────────

export type WorkerStatus = 'connecting' | 'live' | 'error'

// ─── Worker message protocol ─────────────────────────────────────────────────

/** Discriminated union of all messages the telemetry worker can post */
export type WorkerMessage =
  | { type: 'telemetry'; payload: TelemetrySnapshot }
  | { type: 'alarm';     payload: AlarmEvent }
