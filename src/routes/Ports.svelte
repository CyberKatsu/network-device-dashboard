<script>
  import { PORTS } from '$lib/data/mockDevice.js'
  import { snapshot } from '$lib/stores/telemetry.js'

  let expandedPort = null

  function togglePort(id) {
    expandedPort = expandedPort === id ? null : id
  }

  function rxClass(dBm) {
    if (dBm == null) return 'text-gray-500'
    if (dBm > -20)  return 'text-status-up'
    if (dBm > -24)  return 'text-status-ranging'
    return 'text-status-down'
  }

  // Merge live Rx power from telemetry snapshot into static port data
  $: livePorts = PORTS.map(port => {
    const livePort = $snapshot?.ports.find(p => p.portId === port.id)
    return { ...port, liveRx: livePort?.rxPower, liveStatus: livePort?.status }
  })
</script>

<div class="p-4 space-y-3 animate-fade-in">

  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-sm font-medium text-gray-200">PON Port Manager</h2>
      <p class="text-2xs font-mono text-gray-500 mt-0.5">
        NX-8800 · 8 × XGS-PON · Click a port to expand ONUs
      </p>
    </div>
  </div>

  <div class="panel overflow-hidden">
    {#each livePorts as port (port.id)}
      <!-- Port row -->
      <div>
        <button
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-600/40
                 border-b border-surface-500/60 transition-colors text-left"
          on:click={() => togglePort(port.id)}
        >
          <!-- Expand chevron -->
          <svg
            class="w-3.5 h-3.5 text-gray-500 transition-transform duration-150 flex-shrink-0"
            class:rotate-90={expandedPort === port.id}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <path d="M9 18l6-6-6-6"/>
          </svg>

          <!-- Port label -->
          <span class="text-sm font-mono text-gray-200 w-28 flex-shrink-0">{port.label}</span>

          <!-- Status pill -->
          <span class:pill-up={port.liveStatus === 'up'}
                class:pill-down={port.liveStatus === 'down'}
                class:pill-warn={port.liveStatus === 'ranging'}
                class="pill capitalize flex-shrink-0">
            <span class="w-1.5 h-1.5 rounded-full"
                  class:bg-status-up={port.liveStatus === 'up'}
                  class:bg-status-down={port.liveStatus === 'down'}
                  class:bg-status-ranging={port.liveStatus === 'ranging'}>
            </span>
            {port.liveStatus ?? '—'}
          </span>

          <!-- Live Rx power -->
          <span class="text-xs font-mono ml-2 tabular-nums {rxClass(port.liveRx)}">
            {port.liveRx != null ? `${port.liveRx} dBm` : '—'}
          </span>

          <!-- ONU count -->
          <span class="ml-auto text-2xs font-mono text-gray-500">
            {port.onus.filter(o => o.status === 'up').length}/{port.onus.length} ONUs up
          </span>
        </button>

        <!-- ONU list (expanded) -->
        {#if expandedPort === port.id}
          <div class="bg-surface-900/60 border-b border-surface-500/60">
            <!-- ONU table header -->
            <div class="grid text-2xs font-mono text-gray-500 px-10 py-1.5 border-b border-surface-500/40"
                 style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr">
              <span>Serial / Vendor</span>
              <span class="text-right">Status</span>
              <span class="text-right">Rx (dBm)</span>
              <span class="text-right hidden md:block">Distance</span>
              <span class="text-right hidden md:block">Profile</span>
              <span class="text-right hidden lg:block">Firmware</span>
            </div>

            {#each port.onus as onu (onu.id)}
              <div class="grid items-center px-10 py-2 hover:bg-surface-700/30 transition-colors
                          border-b border-surface-500/20 last:border-0"
                   style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr">

                <!-- Serial + vendor -->
                <div>
                  <p class="text-xs font-mono text-gray-200">{onu.serial}</p>
                  <p class="text-2xs font-mono text-gray-500">{onu.vendor}</p>
                </div>

                <!-- Status -->
                <div class="text-right">
                  <span class:pill-up={onu.status === 'up'}
                        class:pill-down={onu.status === 'down'}
                        class:pill-warn={onu.status === 'ranging'}
                        class="pill capitalize">
                    {onu.status}
                  </span>
                </div>

                <!-- Rx power -->
                <p class="text-right text-xs font-mono tabular-nums {rxClass(onu.rxPower)}">
                  {onu.rxPower != null ? onu.rxPower : 'N/A'}
                </p>

                <!-- Distance -->
                <p class="text-right text-xs font-mono text-gray-400 hidden md:block">
                  {onu.distance != null ? `${onu.distance}m` : '—'}
                </p>

                <!-- Profile -->
                <p class="text-right text-xs font-mono text-gray-400 hidden md:block">{onu.profile}</p>

                <!-- Firmware -->
                <p class="text-right text-xs font-mono text-gray-500 hidden lg:block">{onu.firmware}</p>

              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

</div>
