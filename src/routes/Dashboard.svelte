<script lang="ts">
  import { snapshot, throughputHistory, alarms } from '$lib/stores/telemetry'
  import { deviceInfo } from '$lib/stores/device'
  import { TOTAL_ONUS, ACTIVE_ONUS } from '$lib/data/mockDevice'
  import type { AlarmSeverity } from '$lib/types'
  import ThroughputChart from '$lib/components/charts/ThroughputChart.svelte'
  import SignalBars from '$lib/components/charts/SignalBars.svelte'

  // Recent critical alarms for the summary widget
  $: recentAlarms = $alarms
    .filter(a => a.severity === 'critical' || a.severity === 'major')
    .slice(0, 4)

  function severityColor(s: AlarmSeverity): string {
    return s === 'critical' ? 'text-status-down' :
           s === 'major'    ? 'text-status-warn' :
           s === 'minor'    ? 'text-status-ranging' : 'text-gray-400'
  }
</script>

<div class="p-4 space-y-4 animate-fade-in">

  <!-- ── KPI strip ─────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">

    <!-- Total upstream -->
    <div class="panel p-4">
      <p class="section-label mb-1">Upstream</p>
      <p class="text-2xl font-mono font-semibold text-status-up tabular-nums">
        {$snapshot ? $snapshot.totalUp : '—'} <span class="text-sm text-gray-500">Mbps</span>
      </p>
      <p class="text-2xs text-gray-500 mt-1 font-mono">Aggregate all ports</p>
    </div>

    <!-- Total downstream -->
    <div class="panel p-4">
      <p class="section-label mb-1">Downstream</p>
      <p class="text-2xl font-mono font-semibold text-cyan-DEFAULT tabular-nums">
        {$snapshot ? $snapshot.totalDown : '—'} <span class="text-sm text-gray-500">Mbps</span>
      </p>
      <p class="text-2xs text-gray-500 mt-1 font-mono">Aggregate all ports</p>
    </div>

    <!-- Active ONUs -->
    <div class="panel p-4">
      <p class="section-label mb-1">Active ONUs</p>
      <p class="text-2xl font-mono font-semibold text-gray-100 tabular-nums">
        {ACTIVE_ONUS} <span class="text-sm text-gray-500">/ {TOTAL_ONUS}</span>
      </p>
      <p class="text-2xs text-gray-500 mt-1 font-mono">{$deviceInfo.technology}</p>
    </div>

    <!-- Ports status -->
    <div class="panel p-4">
      <p class="section-label mb-1">PON Ports</p>
      <p class="text-2xl font-mono font-semibold text-gray-100 tabular-nums">
        {$snapshot ? $snapshot.activePorts : '—'} <span class="text-sm text-gray-500">/ 8 up</span>
      </p>
      <p class="text-2xs text-gray-500 mt-1 font-mono">XGS-PON / GPON</p>
    </div>
  </div>

  <!-- ── Charts row ─────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">

    <!-- Throughput (takes 2 cols) -->
    <div class="panel p-4 lg:col-span-2">
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-sm font-medium text-gray-200">Throughput</p>
          <p class="text-2xs font-mono text-gray-500">60-second rolling window · 1 Hz</p>
        </div>
        <span class="pill-info">LIVE</span>
      </div>
      <ThroughputChart history={$throughputHistory} />
    </div>

    <!-- Rx Signal levels -->
    <div class="panel p-4">
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-sm font-medium text-gray-200">Rx Power</p>
          <p class="text-2xs font-mono text-gray-500">Per-port · dBm</p>
        </div>
      </div>
      {#if $snapshot}
        <SignalBars ports={$snapshot.ports} />
      {:else}
        <div class="h-24 flex items-center justify-center text-gray-600 text-sm font-mono">
          Waiting for data…
        </div>
      {/if}
    </div>
  </div>

  <!-- ── Port health table + recent alarms ─────────────────────────────────── -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">

    <!-- Per-port summary table -->
    <div class="panel overflow-hidden">
      <div class="px-4 py-3 border-b border-surface-500">
        <p class="text-sm font-medium text-gray-200">Port Summary</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs font-mono">
          <thead>
            <tr class="border-b border-surface-500">
              <th class="text-left px-4 py-2 text-gray-500 font-medium">Port</th>
              <th class="text-right px-3 py-2 text-gray-500 font-medium">Rx Power</th>
              <th class="text-right px-3 py-2 text-gray-500 font-medium hidden sm:table-cell">↑ Mbps</th>
              <th class="text-right px-3 py-2 text-gray-500 font-medium hidden sm:table-cell">↓ Mbps</th>
              <th class="text-center px-4 py-2 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {#if $snapshot}
              {#each $snapshot.ports as port (port.portId)}
                <tr class="border-b border-surface-500/50 hover:bg-surface-600/30 transition-colors">
                  <td class="px-4 py-2 text-gray-300">PON-1/0/{port.portId}</td>
                  <td class="px-3 py-2 text-right tabular-nums"
                      class:text-status-up={port.rxPower > -20}
                      class:text-status-ranging={port.rxPower <= -20 && port.rxPower > -24}
                      class:text-status-down={port.rxPower <= -24}>
                    {port.rxPower} dBm
                  </td>
                  <td class="px-3 py-2 text-right text-status-up tabular-nums hidden sm:table-cell">{port.upMbps}</td>
                  <td class="px-3 py-2 text-right text-cyan-DEFAULT tabular-nums hidden sm:table-cell">{port.downMbps}</td>
                  <td class="px-4 py-2 text-center">
                    <span class:pill-up={port.status === 'up'}
                          class:pill-down={port.status === 'down'}
                          class:pill-warn={port.status === 'ranging'}
                          class="pill capitalize">
                      <span class="w-1.5 h-1.5 rounded-full"
                            class:bg-status-up={port.status === 'up'}
                            class:bg-status-down={port.status === 'down'}
                            class:bg-status-ranging={port.status === 'ranging'}>
                      </span>
                      {port.status}
                    </span>
                  </td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td colspan="5" class="px-4 py-8 text-center text-gray-600">
                  Connecting to device…
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent critical alarms -->
    <div class="panel overflow-hidden">
      <div class="px-4 py-3 border-b border-surface-500 flex items-center justify-between">
        <p class="text-sm font-medium text-gray-200">Recent Alarms</p>
        <span class="text-2xs font-mono text-gray-500">Critical / Major only</span>
      </div>
      <div class="divide-y divide-surface-500/50">
        {#if recentAlarms.length === 0}
          <div class="px-4 py-6 text-center text-sm text-gray-600 font-mono">
            No active critical alarms
          </div>
        {:else}
          {#each recentAlarms as alarm (alarm.id)}
            <div class="px-4 py-3 flex items-start gap-3 animate-slide-in">
              <span class="text-2xs font-mono mt-0.5 w-14 flex-shrink-0 {severityColor(alarm.severity)} uppercase">
                {alarm.severity}
              </span>
              <p class="text-xs font-mono text-gray-300 leading-relaxed">{alarm.message}</p>
            </div>
          {/each}
        {/if}
      </div>
    </div>

  </div>

  <!-- Device info footer -->
  <div class="panel px-4 py-3 flex flex-wrap gap-x-6 gap-y-1">
    {#each [
      ['Model',    $deviceInfo.model],
      ['Serial',   $deviceInfo.serialNumber],
      ['Firmware', $deviceInfo.firmware],
      ['Location', $deviceInfo.location],
      ['Uptime',   $deviceInfo.uptime],
    ] as [label, value]}
      <div class="flex items-center gap-2">
        <span class="section-label">{label}</span>
        <span class="text-xs font-mono text-gray-300">{value}</span>
      </div>
    {/each}
  </div>

</div>
