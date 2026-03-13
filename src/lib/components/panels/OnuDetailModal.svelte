<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { snapshot } from '$lib/stores/telemetry'
  import type { Onu, TelemetrySnapshot } from '$lib/types'

  export let onu:     Onu
  export let portId:  number
  export let onClose: () => void = () => {}

  interface OmciCounters {
    rxFrames:     number
    txFrames:     number
    rxErrors:     number
    txErrors:     number
    crcErrors:    number
    fecCorrected: number
    omciTxCount:  number
    omciRxCount:  number
  }

  const omci: OmciCounters = {
    rxFrames:     Math.floor(Math.random() * 9_000_000) + 1_000_000,
    txFrames:     Math.floor(Math.random() * 9_000_000) + 1_000_000,
    rxErrors:     Math.floor(Math.random() * 200),
    txErrors:     Math.floor(Math.random() * 50),
    crcErrors:    Math.floor(Math.random() * 30),
    fecCorrected: Math.floor(Math.random() * 1000),
    omciTxCount:  Math.floor(Math.random() * 500) + 100,
    omciRxCount:  Math.floor(Math.random() * 500) + 100,
  }

  let rxHistory: number[] = Array.from({ length: 30 }, () =>
    onu.rxPower + (Math.random() - 0.5) * 1.5
  )

  let unsub: (() => void) | undefined
  onMount(() => {
    unsub = snapshot.subscribe((s: TelemetrySnapshot | null) => {
      if (!s) return
      const livePort = s.ports.find(p => p.portId === portId)
      if (livePort) rxHistory = [...rxHistory.slice(1), livePort.rxPower]
    })
  })
  onDestroy(() => unsub?.())

  const W = 240, H = 48, MIN = -28, MAX = -7

  function sparkPath(data: number[]): string {
    return 'M' + data.map((v, i) => {
      const x = (i / (data.length - 1)) * W
      const y = H - ((Math.max(MIN, Math.min(MAX, v)) - MIN) / (MAX - MIN)) * H
      return `${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' L')
  }

  function rxColor(dBm: number): string {
    if (dBm > -20) return '#22d3a0'
    if (dBm > -24) return '#f59e0b'
    return '#ef4444'
  }

  $: currentRx = rxHistory[rxHistory.length - 1]
  $: pathD     = sparkPath(rxHistory)
  $: lineColor = rxColor(currentRx)
  $: y20 = H - (((-20) - MIN) / (MAX - MIN)) * H
  $: y24 = H - (((-24) - MIN) / (MAX - MIN)) * H

  // Typed row helpers — explicit arrays avoid #each destructuring complexity with TS
  $: identityRows: Array<[string, string]> = [
    ['Serial',     onu.serial],
    ['Vendor',     onu.vendor],
    ['Firmware',   onu.firmware],
    ['Profile',    onu.profile],
    ['Tx Power',   `${onu.txPower} dBm`],
    ['Distance',   onu.distance != null ? `${onu.distance} m` : 'Ranging…'],
    ['Registered', new Date(onu.registeredAt).toLocaleDateString('en-GB')],
  ]

  $: omciRows: Array<[string, string, string]> = [
    ['Rx Frames',     omci.rxFrames.toLocaleString(),     'text-status-up'],
    ['Tx Frames',     omci.txFrames.toLocaleString(),     'text-cyan-DEFAULT'],
    ['Rx Errors',     omci.rxErrors.toLocaleString(),     omci.rxErrors > 100 ? 'text-status-down' : 'text-gray-300'],
    ['Tx Errors',     omci.txErrors.toLocaleString(),     omci.txErrors > 10  ? 'text-status-warn' : 'text-gray-300'],
    ['CRC Errors',    omci.crcErrors.toLocaleString(),    omci.crcErrors > 5  ? 'text-status-warn' : 'text-gray-300'],
    ['FEC Corrected', omci.fecCorrected.toLocaleString(), 'text-gray-300'],
    ['OMCI Tx',       omci.omciTxCount.toLocaleString(),  'text-gray-300'],
    ['OMCI Rx',       omci.omciRxCount.toLocaleString(),  'text-gray-300'],
  ]

  function statusClass(s: string): string {
    return s === 'up' ? 'pill-up' : s === 'down' ? 'pill-down' : 'pill-warn'
  }

  function onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') onClose()
  }
</script>

<svelte:window on:keydown={onKeydown} />

<div class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
     role="button" tabindex="-1" aria-label="Close modal"
     on:click={onClose} on:keydown={(e) => e.key === 'Enter' && onClose()}>
</div>

<div class="fixed z-50 bottom-0 left-0 right-0 md:inset-0 md:flex md:items-center md:justify-center pointer-events-none">
  <div class="pointer-events-auto w-full md:w-[640px] md:max-h-[88vh]
              bg-surface-800 border border-surface-500 md:rounded-xl rounded-t-2xl
              shadow-2xl overflow-y-auto modal-enter">

    <div class="flex items-start justify-between px-5 py-4 border-b border-surface-500 sticky top-0 bg-surface-800 z-10">
      <div>
        <div class="flex items-center gap-2 mb-0.5">
          <span class="text-base font-mono font-semibold text-gray-100">{onu.serial}</span>
          <span class="{statusClass(onu.status)} pill capitalize">{onu.status}</span>
        </div>
        <p class="text-2xs font-mono text-gray-500">{onu.vendor} · PON-1/0/{portId} · {onu.profile}</p>
      </div>
      <button class="text-gray-500 hover:text-gray-200 transition-colors p-1"
              aria-label="Close detail panel" on:click={onClose}>
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div class="p-5 space-y-4">

      <!-- Live Rx sparkline -->
      <div class="panel p-4">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-medium text-gray-200">Rx Power · Live</p>
          <span class="text-xl font-mono font-semibold tabular-nums" style="color:{lineColor}">
            {currentRx?.toFixed(1)} <span class="text-sm font-normal text-gray-500">dBm</span>
          </span>
        </div>
        <svg viewBox="0 0 {W} {H}" class="w-full h-12" preserveAspectRatio="none">
          <line x1="0" y1={y20} x2={W} y2={y20} stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="3 3" opacity="0.5"/>
          <line x1="0" y1={y24} x2={W} y2={y24} stroke="#ef4444" stroke-width="0.5" stroke-dasharray="3 3" opacity="0.5"/>
          <path d="{pathD} L{W},{H} L0,{H} Z" fill={lineColor} opacity="0.1"/>
          <path d={pathD} fill="none" stroke={lineColor} stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <div class="flex justify-between mt-1 text-2xs font-mono text-gray-600">
          <span>30 s ago</span><span>now</span>
        </div>
      </div>

      <!-- Identity -->
      <div class="panel p-4">
        <p class="text-xs font-medium text-gray-400 mb-3">Identity</p>
        <div class="grid grid-cols-2 gap-x-6 gap-y-2.5">
          {#each identityRows as [label, value]}
            <div>
              <p class="text-2xs font-mono text-gray-500 mb-0.5">{label}</p>
              <p class="text-xs font-mono text-gray-200 break-all">{value}</p>
            </div>
          {/each}
        </div>
      </div>

      <!-- OMCI counters -->
      <div class="panel p-4">
        <p class="text-xs font-medium text-gray-400 mb-3">
          OMCI Counters <span class="text-gray-600 font-normal">(since last reset)</span>
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {#each omciRows as [label, value, cls]}
            <div class="bg-surface-900 rounded p-2.5">
              <p class="text-2xs font-mono text-gray-500 mb-1">{label}</p>
              <p class="text-sm font-mono font-semibold tabular-nums {cls}">{value}</p>
            </div>
          {/each}
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center gap-2 pt-1">
        <button class="btn-primary text-xs"
                on:click={() => alert('In production: sends OMCI MIB reset to reboot ONU')}>
          Reboot ONU
        </button>
        <button class="btn-primary text-xs"
                on:click={() => alert('In production: re-applies bandwidth profile via OMCI set-request')}>
          Re-provision
        </button>
        <button class="btn-ghost text-xs ml-auto" on:click={onClose}>Close</button>
      </div>

    </div>
  </div>
</div>

<style>
  @keyframes modalEnter {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .modal-enter { animation: modalEnter 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
