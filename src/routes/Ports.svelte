<script lang="ts">
  import { PORTS } from '$lib/data/mockDevice'
  import { snapshot } from '$lib/stores/telemetry'
  import OnuDetailModal from '$lib/components/panels/OnuDetailModal.svelte'

  let expandedPort = null
  let selectedOnu  = null   // { onu, portId } — drives the modal
  let modalOpen    = false

  function togglePort(id) {
    expandedPort = expandedPort === id ? null : id
  }

  function openOnu(onu, portId) {
    selectedOnu = { onu, portId }
    modalOpen   = true
  }

  function closeModal() {
    modalOpen   = false
    selectedOnu = null
  }

  function rxClass(dBm) {
    if (dBm == null) return 'text-gray-500'
    if (dBm > -20)   return 'text-status-up'
    if (dBm > -24)   return 'text-status-ranging'
    return 'text-status-down'
  }

  $: livePorts = PORTS.map(port => {
    const lp = $snapshot?.ports.find(p => p.portId === port.id)
    return { ...port, liveRx: lp?.rxPower, liveStatus: lp?.status }
  })
</script>

<div class="p-4 space-y-3 animate-fade-in">

  <div>
    <h2 class="text-sm font-medium text-gray-200">PON Port Manager</h2>
    <p class="text-2xs font-mono text-gray-500 mt-0.5">
      NX-8800 · 8 × XGS-PON · Expand a port, then click an ONU row for full detail
    </p>
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
          <svg class="w-3.5 h-3.5 text-gray-500 transition-transform duration-150 flex-shrink-0"
               class:rotate-90={expandedPort === port.id}
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>

          <span class="text-sm font-mono text-gray-200 w-28 flex-shrink-0">{port.label}</span>

          <span class="pill capitalize flex-shrink-0"
                class:pill-up={port.liveStatus === 'up'}
                class:pill-down={port.liveStatus === 'down'}
                class:pill-warn={port.liveStatus === 'ranging'}>
            <span class="w-1.5 h-1.5 rounded-full"
                  class:bg-status-up={port.liveStatus === 'up'}
                  class:bg-status-down={port.liveStatus === 'down'}
                  class:bg-status-ranging={port.liveStatus === 'ranging'}>
            </span>
            {port.liveStatus ?? '—'}
          </span>

          <span class="text-xs font-mono ml-2 tabular-nums {rxClass(port.liveRx)}">
            {port.liveRx != null ? `${port.liveRx} dBm` : '—'}
          </span>

          <span class="ml-auto text-2xs font-mono text-gray-500">
            {port.onus.filter(o => o.status === 'up').length}/{port.onus.length} ONUs up
          </span>
        </button>

        <!-- ONU list -->
        {#if expandedPort === port.id}
          <div class="bg-surface-900/60 border-b border-surface-500/60">
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
              <!-- ONU row — clickable, opens modal -->
              <button
                class="w-full grid items-center px-10 py-2.5 text-left
                       hover:bg-surface-700/50 active:bg-surface-600/50
                       border-b border-surface-500/20 last:border-0
                       transition-colors cursor-pointer group"
                style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr"
                on:click={() => openOnu(onu, port.id)}
                title="Click to view ONU detail"
              >
                <div>
                  <p class="text-xs font-mono text-gray-200 group-hover:text-cyan-DEFAULT transition-colors">
                    {onu.serial}
                    <svg class="inline w-2.5 h-2.5 ml-1 opacity-0 group-hover:opacity-60 transition-opacity"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M7 17L17 7M7 7h10v10"/>
                    </svg>
                  </p>
                  <p class="text-2xs font-mono text-gray-500">{onu.vendor}</p>
                </div>

                <div class="text-right">
                  <span class="pill capitalize"
                        class:pill-up={onu.status === 'up'}
                        class:pill-down={onu.status === 'down'}
                        class:pill-warn={onu.status === 'ranging'}>
                    {onu.status}
                  </span>
                </div>

                <p class="text-right text-xs font-mono tabular-nums {rxClass(onu.rxPower)}">
                  {onu.rxPower ?? 'N/A'}
                </p>
                <p class="text-right text-xs font-mono text-gray-400 hidden md:block">
                  {onu.distance != null ? `${onu.distance} m` : '—'}
                </p>
                <p class="text-right text-xs font-mono text-gray-400 hidden md:block">{onu.profile}</p>
                <p class="text-right text-xs font-mono text-gray-500 hidden lg:block">{onu.firmware}</p>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<!-- ONU detail modal -->
{#if modalOpen && selectedOnu}
  <OnuDetailModal
    onu={selectedOnu.onu}
    portId={selectedOnu.portId}
    onClose={closeModal}
  />
{/if}
