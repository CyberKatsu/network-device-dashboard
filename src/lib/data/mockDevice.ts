/**
 * mockDevice.ts — Static seed data for ONU population
 *
 * Represents what would be returned by GET /api/ports/{id}/onus
 * via RESTCONF or NETCONF on a real OLT.
 *
 * ONU serial numbers follow ITU-T G.984:
 *   4-char vendor ID + 8 uppercase hex digits
 *   e.g. COMS0000001A
 */

import type { Onu, PonPort, OnuStatus } from '$lib/types'

type VendorCode = 'COMS' | 'ADTN' | 'HWTC' | 'ZTED' | 'BRCM'

const VENDOR_NAMES: Record<VendorCode, string> = {
  COMS: 'CommScope',
  ADTN: 'ADTRAN',
  HWTC: 'Huawei',
  ZTED: 'ZTE',
  BRCM: 'Broadcom OEM',
}

function onu(
  id:       number,
  vendor:   VendorCode,
  status:   OnuStatus,
  rxPower:  number,
  distance: number | null,
  firmware: string,
  profile:  string,
): Onu {
  return {
    id,
    serial:       `${vendor}${id.toString(16).padStart(8, '0').toUpperCase()}`,
    vendor:       VENDOR_NAMES[vendor],
    status,
    rxPower,
    txPower:      2.0,
    distance,
    firmware,
    profile,
    registeredAt: new Date(Date.now() - Math.random() * 86_400_000 * 30).toISOString(),
  }
}

export const PORTS: PonPort[] = [
  {
    id: 1, label: 'PON-1/0/1',
    onus: [
      onu(1,  'COMS', 'up',      -16.2, 1840, 'R4.1.2', '100/50'),
      onu(2,  'COMS', 'up',      -18.5, 2310, 'R4.1.2', '100/50'),
      onu(3,  'ADTN', 'up',      -14.1,  920, 'fw2.3',  '1000/500'),
      onu(4,  'ADTN', 'up',      -22.7, 4100, 'fw2.3',  '100/50'),
      onu(5,  'HWTC', 'up',      -19.3, 2890, 'V8R2',   '250/100'),
    ]
  },
  {
    id: 2, label: 'PON-1/0/2',
    onus: [
      onu(6,  'COMS', 'up',      -15.8, 1520, 'R4.1.2', '100/50'),
      onu(7,  'ZTED', 'up',      -20.4, 3200, 'V6.1',   '100/50'),
      onu(8,  'ZTED', 'up',      -17.9, 2100, 'V6.1',   '100/50'),
      onu(9,  'HWTC', 'ranging', -25.1, null, 'V8R2',   '100/50'),
    ]
  },
  {
    id: 3, label: 'PON-1/0/3',
    onus: [
      onu(10, 'ADTN', 'up',      -13.6,  780, 'fw2.4',  '1000/500'),
      onu(11, 'ADTN', 'up',      -16.0, 1650, 'fw2.4',  '1000/500'),
      onu(12, 'COMS', 'up',      -21.2, 3600, 'R4.1.1', '100/50'),
      onu(13, 'BRCM', 'up',      -18.0, 2240, 'B3.2',   '250/100'),
      onu(14, 'BRCM', 'up',      -19.7, 2800, 'B3.2',   '250/100'),
      onu(15, 'BRCM', 'up',      -23.5, 4400, 'B3.2',   '100/50'),
    ]
  },
  {
    id: 4, label: 'PON-1/0/4',
    onus: [
      onu(16, 'HWTC', 'up',      -14.8, 1100, 'V8R2',   '100/50'),
      onu(17, 'HWTC', 'up',      -17.3, 2000, 'V8R2',   '100/50'),
      onu(18, 'ZTED', 'up',      -20.8, 3400, 'V6.2',   '100/50'),
    ]
  },
  {
    id: 5, label: 'PON-1/0/5',
    onus: [
      onu(19, 'COMS', 'up',      -15.1, 1300, 'R4.2.0', '1000/500'),
      onu(20, 'COMS', 'up',      -16.9, 1900, 'R4.2.0', '1000/500'),
      onu(21, 'ADTN', 'up',      -22.1, 3900, 'fw2.3',  '250/100'),
      onu(22, 'ADTN', 'up',      -19.0, 2600, 'fw2.3',  '100/50'),
      onu(23, 'BRCM', 'up',      -24.8, 4800, 'B3.1',   '100/50'),
    ]
  },
  {
    id: 6, label: 'PON-1/0/6',
    onus: [
      onu(24, 'HWTC', 'down',    -27.4, 5200, 'V8R1',   '100/50'),
      onu(25, 'ZTED', 'up',      -18.6, 2350, 'V6.1',   '100/50'),
    ]
  },
  {
    id: 7, label: 'PON-1/0/7',
    onus: [
      onu(26, 'COMS', 'up',      -13.2,  690, 'R4.2.0', '1000/500'),
      onu(27, 'COMS', 'up',      -15.6, 1480, 'R4.2.0', '250/100'),
      onu(28, 'ADTN', 'up',      -20.0, 3050, 'fw2.4',  '100/50'),
      onu(29, 'BRCM', 'up',      -17.5, 2160, 'B3.2',   '100/50'),
    ]
  },
  {
    id: 8, label: 'PON-1/0/8',
    onus: [
      onu(30, 'HWTC', 'up',      -16.4, 1720, 'V8R2',   '1000/500'),
      onu(31, 'ZTED', 'up',      -21.6, 3700, 'V6.2',   '100/50'),
      onu(32, 'ZTED', 'ranging', -24.3, null, 'V6.2',   '100/50'),
    ]
  },
]

export const TOTAL_ONUS  = PORTS.reduce((s, p) => s + p.onus.length, 0)
export const ACTIVE_ONUS = PORTS.reduce(
  (s, p) => s + p.onus.filter(o => o.status === 'up').length,
  0
)
