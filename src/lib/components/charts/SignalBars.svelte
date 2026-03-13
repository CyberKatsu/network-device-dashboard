<script lang="ts">
  /**
   * SignalBars.svelte
   *
   * Pure SVG bargraph for per-port Rx power levels (dBm).
   * No chart library — 60 lines of Svelte is cleaner and faster for this use case.
   * This is the kind of component you'd write for an embedded device UI.
   *
   * dBm reference for XGS-PON:
   *   Good:     > -20 dBm  (green)
   *   Marginal: -20 to -24 (amber)
   *   Critical: < -24 dBm  (red)
   */

  export let ports = []  // Array of { portId, rxPower, status }

  // dBm display range
  const MIN_DBM = -30
  const MAX_DBM = -7

  function barHeight(dBm) {
    const clamped = Math.max(MIN_DBM, Math.min(MAX_DBM, dBm ?? MIN_DBM))
    return ((clamped - MIN_DBM) / (MAX_DBM - MIN_DBM)) * 100
  }

  function barColor(dBm, status) {
    if (status === 'down')    return '#ef4444'
    if (status === 'ranging') return '#f59e0b'
    if (dBm >= -20) return '#22d3a0'
    if (dBm >= -24) return '#f59e0b'
    return '#ef4444'
  }

  function fmt(dBm) {
    if (dBm == null) return 'N/A'
    return `${dBm.toFixed(1)} dBm`
  }
</script>

<div class="w-full">
  <!-- Bar graph -->
  <div class="flex items-end gap-1.5 h-24 px-1">
    {#each ports as port (port.portId)}
      {@const h = barHeight(port.rxPower)}
      {@const color = barColor(port.rxPower, port.status)}
      <div class="flex-1 flex flex-col items-center gap-1 group relative">
        <!-- Tooltip -->
        <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10
                    bg-surface-600 border border-surface-500 rounded px-2 py-1
                    text-2xs font-mono whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p class="text-gray-300">P{port.portId} · {fmt(port.rxPower)}</p>
          <p style="color: {color}" class="capitalize">{port.status}</p>
        </div>

        <!-- Bar container (full height) -->
        <div class="relative w-full h-full bg-surface-900 rounded-sm overflow-hidden" style="height: 80px;">
          <!-- Reference line at -24 dBm (crit threshold) -->
          <div
            class="absolute w-full border-t border-status-down/30 border-dashed z-10"
            style="bottom: {barHeight(-24)}%"
          ></div>
          <!-- Reference line at -20 dBm (warn threshold) -->
          <div
            class="absolute w-full border-t border-status-ranging/30 border-dashed z-10"
            style="bottom: {barHeight(-20)}%"
          ></div>

          <!-- Actual bar -->
          <div
            class="absolute bottom-0 w-full rounded-sm transition-all duration-500"
            style="height: {h}%; background-color: {color}; opacity: {port.status === 'down' ? 0.4 : 0.85};"
          ></div>
        </div>

        <!-- Port label -->
        <span class="text-2xs font-mono text-gray-500">P{port.portId}</span>
      </div>
    {/each}
  </div>

  <!-- Legend -->
  <div class="flex items-center gap-4 mt-2 px-1">
    <div class="flex items-center gap-1">
      <div class="w-3 h-0.5 bg-status-up"></div>
      <span class="text-2xs font-mono text-gray-500">&gt; −20 dBm</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-0.5 bg-status-ranging"></div>
      <span class="text-2xs font-mono text-gray-500">−20 to −24</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-0.5 bg-status-down"></div>
      <span class="text-2xs font-mono text-gray-500">&lt; −24 dBm</span>
    </div>
  </div>
</div>
